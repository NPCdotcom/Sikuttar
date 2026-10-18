/**
 * Post playbook stories. DEFAULT = dry-run (no network write).
 *
 * Usage:
 *   node scripts/seed-stories/post.mjs                  # dry-run
 *   node scripts/seed-stories/post.mjs --target local   # http://127.0.0.1:8787
 *   node scripts/seed-stories/post.mjs --target prod --i-understand-prod
 *
 * Env:
 *   SIKUTTAR_AUTHOR_KEY  cookie author_key (required for non-dry-run)
 *   SIKUTTAR_BASE_URL    override base URL
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const target = args.has("--target")
  ? process.argv[process.argv.indexOf("--target") + 1]
  : "dry-run";
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : Infinity;
const offsetIdx = process.argv.indexOf("--offset");
const offset = offsetIdx >= 0 ? Number(process.argv[offsetIdx + 1]) : 0;
const onlyFidelity = args.has("--fidelity")
  ? process.argv[process.argv.indexOf("--fidelity") + 1]
  : null;
const skipCurated = args.has("--skip-curated");
const delayMs = Number(process.env.SIKUTTAR_POST_DELAY_MS || "300");

const BASE =
  process.env.SIKUTTAR_BASE_URL ||
  (target === "prod"
    ? "https://sikuttar.npcdotcom.workers.dev"
    : target === "local"
      ? "http://127.0.0.1:8787"
      : null);

const playbook = JSON.parse(readFileSync(join(__dirname, "playbook.json"), "utf8"));
let stories = playbook.stories;
if (skipCurated) stories = stories.filter((s) => !String(s.id).startsWith("c"));
if (onlyFidelity) stories = stories.filter((s) => s.fidelity === onlyFidelity);
stories = stories.slice(
  offset,
  offset + (Number.isFinite(limit) ? limit : stories.length),
);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (target === "dry-run" || !BASE) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          count: stories.length,
          sample: stories.slice(0, 3).map((s) => ({
            id: s.id,
            fidelity: s.fidelity,
            tags: s.tags,
            title: s.source_title,
          })),
          hint: "Local first: wrangler dev + --target local. Prod requires --target prod --i-understand-prod",
        },
        null,
        2,
      ),
    );
    return;
  }

  if (target === "prod" && !args.has("--i-understand-prod")) {
    console.error("Refuse prod without --i-understand-prod (traffic / Free plan safety).");
    process.exit(1);
  }

  const author = process.env.SIKUTTAR_AUTHOR_KEY;
  if (!author) {
    console.error("Set SIKUTTAR_AUTHOR_KEY to the linked author_key cookie value.");
    process.exit(1);
  }

  const results = [];
  for (const s of stories) {
    const payload = {
      body: `${s.body}\n出典の学び: ${s.source}`,
      situation: s.situation,
      cause: s.cause,
      tags: s.tags,
    };
    const res = await fetch(`${BASE}/stories`, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        cookie: `author_key=${author}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    results.push({ playbook_id: s.id, status: res.status, id: json.id, error: json.error });
    await sleep(delayMs);
  }
  console.log(JSON.stringify({ target: BASE, posted: results.length, results }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
