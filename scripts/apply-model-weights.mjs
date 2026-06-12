import { readFile, writeFile } from "node:fs/promises";

const FACTORS = ["fifa", "elo", "odds", "form", "squad", "wcPath", "health", "club", "atmosphere", "schedule"];

const text = await readFile(new URL("../data/model_weights_fitted.csv", import.meta.url), "utf8");
const weights = {};
for (const line of text.trim().split(/\r?\n/).slice(1)) {
  const [factor, weight] = line.split(",");
  weights[factor] = Number(weight);
}
for (const factor of FACTORS) {
  if (!Number.isFinite(weights[factor])) throw new Error(`Missing fitted weight for ${factor}`);
}
const total = FACTORS.reduce((sum, factor) => sum + weights[factor], 0);
if (Math.abs(total - 1) > 0.005) throw new Error(`Fitted weights sum to ${total}, expected 1`);

let app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const block = `const MODEL_WEIGHTS = {\n${FACTORS.map((factor) => `  ${factor}: ${weights[factor]},`).join("\n")}\n};`;
const pattern = /const MODEL_WEIGHTS = \{[\s\S]*?\};/;
if (!pattern.test(app)) throw new Error("Could not locate MODEL_WEIGHTS block in app.js");
app = app.replace(pattern, block);
await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied fitted model weights: ${FACTORS.map((factor) => `${factor}=${weights[factor]}`).join(", ")}`);
