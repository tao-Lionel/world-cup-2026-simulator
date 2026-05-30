import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const runtimeSource = source.slice(0, source.indexOf("document.addEventListener"));

const context = { console, Math };
vm.createContext(context);

vm.runInContext(`${runtimeSource}
const settings = { count: 1000, randomness: 1, hostBoost: 80, penaltyWeight: 0.65 };
let missingChampion = 0;
let missingMatches = 0;
let missingR32 = 0;
let invalidThirdCombos = 0;
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
};
`, context);

const result = context.validation;
if (result.teams !== 48 || result.missingChampion || result.missingMatches || result.missingR32 || result.invalidThirdCombos) {
  throw new Error(`Simulator validation failed: ${JSON.stringify(result)}`);
}

console.log(`Validated ${result.simulations} tournaments, ${result.teams} teams, 495 third-place combinations, fixed knockout bracket complete.`);
