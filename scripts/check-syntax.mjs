import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = new URL("../scripts/", import.meta.url);
const files = (await readdir(scriptDir))
  .filter((file) => file.endsWith(".mjs"))
  .sort();

async function check(file) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--check", fileURLToPath(new URL(file, scriptDir))], {
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Syntax check failed for ${file}`));
    });
  });
}

for (const file of files) {
  await check(file);
}

await check("../app.js");
await check("../data/third_place_assignment_map.js");
await check("../data/squads_2026.js");
await check("../data/sporttery_football_odds_snapshot.js");

console.log(`Checked syntax for ${files.length} scripts, app.js, third-place map, squad browser data and Sporttery World Cup odds data.`);
