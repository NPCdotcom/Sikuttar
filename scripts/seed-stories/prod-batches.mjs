/**
 * Prod small-batch poster: skip already-on-prod curated (c01–c08),
 * post c09–c16 then r* in --limit chunks. Requires env + flags.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const author = process.env.SIKUTTAR_AUTHOR_KEY;
const batch = Number(process.env.SIKUTTAR_BATCH || "10");
const delay = process.env.SIKUTTAR_POST_DELAY_MS || "350";

if (!author) {
  console.error("SIKUTTAR_AUTHOR_KEY required");
  process.exit(1);
}

function run(extraArgs) {
  const r = spawnSync(
    process.execPath,
    [join(__dirname, "post.mjs"), "--target", "prod", "--i-understand-prod", ...extraArgs],
    {
      cwd: root,
      env: { ...process.env, SIKUTTAR_AUTHOR_KEY: author, SIKUTTAR_POST_DELAY_MS: delay },
      encoding: "utf8",
    },
  );
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status ?? 1);
  const j = JSON.parse(r.stdout || "{}");
  const bad = (j.results || []).filter((x) => x.status !== 201);
  if (bad.length) {
    console.error("batch had failures", bad.slice(0, 5));
    process.exit(1);
  }
  return j;
}

const before = await fetch("https://sikuttar.npcdotcom.workers.dev/stories").then((r) =>
  r.json(),
);
console.log(JSON.stringify({ before: before.items?.length }, null, 2));

// New curated (c09–c16) = playbook offset 8, limit 8
run(["--offset", "8", "--limit", "8"]);

// r* stories: skip-curated, batch by 10
for (let offset = 0; offset < 84; offset += batch) {
  console.log(`\n--- skip-curated offset=${offset} limit=${batch} ---`);
  run(["--skip-curated", "--offset", String(offset), "--limit", String(batch)]);
}

const after = await fetch("https://sikuttar.npcdotcom.workers.dev/stories").then((r) =>
  r.json(),
);
// list API may cap; also query D1 via note
console.log(JSON.stringify({ after_list_api: after.items?.length }, null, 2));
