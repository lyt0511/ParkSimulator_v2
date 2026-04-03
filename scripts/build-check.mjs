import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = [join(process.cwd(), "src"), join(process.cwd(), "tests")];

function collectTsFiles(dir) {
  const out = [];
  const entries = readdirSync(dir);

  for (const name of entries) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...collectTsFiles(full));
      continue;
    }

    if (name.endsWith(".ts")) {
      out.push(full);
    }
  }

  return out;
}

const files = roots.flatMap((root) => collectTsFiles(root)).sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  console.error("No TypeScript files found under src/ or tests/.");
  process.exit(1);
}

for (const file of files) {
  const result = spawnSync("node", ["--experimental-strip-types", "--check", file], {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Build check passed (${files.length} files).`);
