import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const thirdPlaceMapSource = await readFile(new URL("../data/third_place_assignment_map.js", import.meta.url), "utf8");
const runtimeSource = source.slice(0, source.indexOf("document.addEventListener"));

const context = { console, Math };
vm.createContext(context);

vm.runInContext(`${thirdPlaceMapSource}
${runtimeSource}
const settings = { count: 1000, randomness: 1, hostBoost: 80, penaltyWeight: 0.65 };
let missingChampion = 0;
let missingMatches = 0;
let missingR32 = 0;
let invalidThirdCombos = 0;
let missingThirdTableRows = 0;
let invalidThirdTableRows = 0;
function combinations(items, size) {
  const output = [];
  function walk(start, picked) {
    if (picked.length === size) {
      output.push([...picked]);
      return;
    }
    for (let index = start; index <= items.length - (size - picked.length); index += 1) {
      picked.push(items[index]);
      walk(index + 1, picked);
      picked.pop();
    }
  }
  walk(0, []);
  return output;
}
for (const combo of combinations("ABCDEFGHIJKL".split(""), 8)) {
  const comboKey = combo.join("");
  const mapped = THIRD_PLACE_ASSIGNMENT_TABLE[comboKey];
  if (!mapped) missingThirdTableRows += 1;
  if (mapped) {
    const values = Object.values(mapped);
    const unique = new Set(values);
    const withinCombo = values.every((group) => combo.includes(group));
    if (unique.size !== 8 || !withinCombo) invalidThirdTableRows += 1;
  }
  const rows = combo.map((group, index) => ({
    team: { group, id: index },
    pts: 3,
    gd: 0,
    gf: 1,
  }));
  if (thirdPlaceAssignments(rows, settings).size !== 8) invalidThirdCombos += 1;
}
for (let index = 0; index < 500; index += 1) {
  const tournament = simulateTournament(settings, true);
  if (!tournament.champion) missingChampion += 1;
  const matches = tournament.rounds.flatMap((round) => round.matches);
  if (matches.length !== 31) missingMatches += 1;
  if (tournament.stageWinners.r16.length !== 16) missingR32 += 1;
}
globalThis.validation = {
  teams: teams.length,
  simulations: 500,
  missingChampion,
  missingMatches,
  missingR32,
  invalidThirdCombos,
  missingThirdTableRows,
  invalidThirdTableRows,
};
`, context);

const result = context.validation;
if (
  result.teams !== 48 ||
  result.missingChampion ||
  result.missingMatches ||
  result.missingR32 ||
  result.invalidThirdCombos ||
  result.missingThirdTableRows ||
  result.invalidThirdTableRows
) {
  throw new Error(`Simulator validation failed: ${JSON.stringify(result)}`);
}

console.log(`Validated ${result.simulations} tournaments, ${result.teams} teams, 495 third-place table rows, fixed knockout bracket complete.`);
