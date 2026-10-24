/**
 * Backfill Vectorize embeddings for existing D1 failure_stories (remote).
 * Uses wrangler OAuth config + Workers AI bge-m3 + Vectorize upsert API.
 *
 * Usage: node scripts/backfill-embeddings.mjs [--limit N] [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ACCOUNT_ID = "f7d30902319d5d700aac1130d9ec758a";
const DATABASE_ID = "32bc066b-aa26-43e0-8d4d-3de566915ed3";
const INDEX = "sikuttar-stories";
const MODEL = "@cf/baai/bge-m3";
const EXPECTED_DIMS = 1024;
const BATCH = 10;

function parseArgs(argv) {
  let limit = Infinity;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") limit = Number(argv[++i]);
    if (argv[i] === "--dry-run") dryRun = true;
  }
  return { limit, dryRun };
}

function loadWranglerOauthToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  const candidates = [
    join(homedir(), "AppData", "Roaming", "xdg.config", ".wrangler", "config", "default.toml"),
    join(homedir(), ".config", ".wrangler", "config", "default.toml"),
    join(homedir(), ".wrangler", "config", "default.toml"),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    const m = text.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (m) return m[1];
  }
  throw new Error(
    "No CLOUDFLARE_API_TOKEN and no wrangler oauth_token found. Run wrangler login.",
  );
}

async function d1Stories(token) {
  const sql =
    "SELECT id, body, situation, cause FROM failure_stories ORDER BY created_at ASC";
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`D1 query failed: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  }
  const results = json.result?.[0]?.results ?? json.result?.results ?? [];
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("D1 returned no story rows");
  }
  return results;
}

function storyText(row) {
  return [row.body, row.situation ?? "", row.cause ?? ""]
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ");
}

async function embedBatch(token, texts) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`embed failed: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  }
  const data = json.result?.data;
  if (!Array.isArray(data) || data.length !== texts.length) {
    throw new Error(`embed shape unexpected: ${JSON.stringify(json.result)?.slice(0, 200)}`);
  }
  return data;
}

async function upsertVectors(token, vectors) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${INDEX}/upsert`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-ndjson",
      },
      body: vectors.map((v) => JSON.stringify(v)).join("\n"),
    },
  );
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(`upsert failed: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  }
  return json;
}

async function main() {
  const { limit, dryRun } = parseArgs(process.argv.slice(2));
  const token = loadWranglerOauthToken();
  let stories = await d1Stories(token);
  if (Number.isFinite(limit)) {
    stories = stories.slice(0, limit);
  }
  console.log(`stories=${stories.length} dryRun=${dryRun}`);

  // Dimension probe
  const probe = await embedBatch(token, ["dimension probe"]);
  const dims = probe[0]?.length;
  console.log(`embedding dims=${dims}`);
  if (dims !== EXPECTED_DIMS) {
    throw new Error(
      `Expected ${EXPECTED_DIMS} dims for index ${INDEX}, got ${dims}. Recreate index.`,
    );
  }

  if (dryRun) {
    console.log("dry-run ok");
    return;
  }

  let done = 0;
  for (let i = 0; i < stories.length; i += BATCH) {
    const chunk = stories.slice(i, i + BATCH);
    const texts = chunk.map(storyText);
    const vectors = await embedBatch(token, texts);
    const payload = chunk.map((row, j) => ({
      id: row.id,
      values: vectors[j],
    }));
    await upsertVectors(token, payload);
    done += chunk.length;
    console.log(`upserted ${done}/${stories.length}`);
    // light throttle for Neurons
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log("backfill complete");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
