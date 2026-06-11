import { cp, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const backupRoot = await mkdtemp(join(tmpdir(), "world-cup-refresh-"));
const steps = [
  ["刷新最终名单", "fetch-wikipedia-squads.mjs"],
  ["生成名单候选审计", "build-squad-import-candidates.mjs"],
  ["应用 FIFA 官方名单覆盖", "apply-fifa-official-squad-overrides.mjs"],
  ["刷新 Transfermarkt 身价", "fetch-transfermarkt-market-values.mjs"],
  ["应用球员可用性", "apply-player-availability.mjs"],
  ["生成浏览器名单数据", "build-squad-browser-data.mjs"],
  ["聚合阵容画像", "aggregate-squads.mjs"],
  ["写回阵容画像", "apply-squad-profiles.mjs"],
  ["刷新 Elo", "fetch-elo-snapshot.mjs"],
  ["写回 Elo", "apply-elo-snapshot.mjs"],
  ["刷新近期状态", "fetch-recent-form.mjs"],
  ["写回近期状态", "apply-form-snapshot.mjs"],
  ["刷新夺冠赔率", "fetch-odds-snapshot.mjs"],
  ["生成赔率快照", "build-odds-snapshot.mjs"],
  ["写回赔率", "apply-odds-snapshot.mjs"],
  ["刷新中国竞彩网赔率", "fetch-sporttery-football-odds.mjs"],
  ["刷新比赛日天气", "fetch-weather-snapshot.mjs"],
  ["写回赛程环境", "apply-schedule-factors.mjs"],
  ["重建球队上下文", "build-team-context-snapshot.mjs"],
  ["写回球队上下文", "apply-team-context-snapshot.mjs"],
  ["导出审计快照", "export-data-snapshots.mjs"],
];

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function restoreBackup() {
  await rm(new URL("../data/", import.meta.url), { recursive: true, force: true });
  await cp(join(backupRoot, "data"), new URL("../data/", import.meta.url), { recursive: true });
  await cp(join(backupRoot, "app.js"), new URL("../app.js", import.meta.url));
}

await cp(new URL("../data/", import.meta.url), join(backupRoot, "data"), { recursive: true });
await cp(new URL("../app.js", import.meta.url), join(backupRoot, "app.js"));

try {
  for (let index = 0; index < steps.length; index += 1) {
    const [label, script] = steps[index];
    console.log(`[${index + 1}/${steps.length + 1}] ${label}`);
    await run(process.execPath, [join(projectRoot, "scripts", script)]);
  }
  console.log(`[${steps.length + 1}/${steps.length + 1}] 完整校验`);
  await run("npm", ["test"]);
  console.log("数据刷新完成。");
} catch (error) {
  console.error(`数据刷新失败：${error.message}`);
  console.error("正在恢复刷新前的数据...");
  await restoreBackup();
  console.error("已恢复刷新前的数据。");
  process.exitCode = 1;
} finally {
  await rm(backupRoot, { recursive: true, force: true });
}
