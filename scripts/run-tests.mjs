import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const testDir = join(process.cwd(), "tests", "parking-contract");

const specFiles = readdirSync(testDir)
  .filter((name) => name.endsWith(".spec.ts"))
  .sort((a, b) => a.localeCompare(b))
  .map((name) => join(testDir, name));

if (specFiles.length === 0) {
  console.error("No test files found under tests/parking-contract.");
  process.exit(1);
}

for (const file of specFiles) {
  console.log(`RUN ${file}`);
  const result = spawnSync("node", ["--experimental-strip-types", file], {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("All tests passed.");
