import { readFile } from "node:fs/promises";
import vm from "node:vm";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map((line) => {
    const values = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === "\"" && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

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

function extractConst(source, name) {
  const start = source.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === stringQuote) inString = false;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    if (char === "}" || char === "]") depth -= 1;
    if (depth === 0 && char === ";") return source.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertRows(name, rows, expected) {
  assert(rows.length === expected, `${name} expected ${expected} rows, got ${rows.length}`);
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const thirdPlaceMapSource = await readFile(new URL("../data/third_place_assignment_map.js", import.meta.url), "utf8");
const squadBrowserDataSource = await readFile(new URL("../data/squads_2026.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst(appSource, "teamFactors")})`, {});
const dataFields = vm.runInNewContext(`(${extractConst(appSource, "DATA_FIELDS")})`, {});
const thirdPlaceContext = {};
vm.createContext(thirdPlaceContext);
vm.runInContext(`${thirdPlaceMapSource}; globalThis.table = THIRD_PLACE_ASSIGNMENT_TABLE;`, thirdPlaceContext);
const squadBrowserContext = {};
vm.createContext(squadBrowserContext);
vm.runInContext(squadBrowserDataSource, squadBrowserContext);

const teamFactorRows = parseCsv(await readFile(new URL("../data/team_factors_snapshot.csv", import.meta.url), "utf8"));
const sourceRows = parseCsv(await readFile(new URL("../data/source_manifest.csv", import.meta.url), "utf8"));
const groupRows = parseCsv(await readFile(new URL("../data/group_stage_schedule.csv", import.meta.url), "utf8"));
const knockoutRows = parseCsv(await readFile(new URL("../data/knockout_schedule.csv", import.meta.url), "utf8"));
const thirdMapRows = parseCsv(await readFile(new URL("../data/third_place_assignment_map.csv", import.meta.url), "utf8"));
const squadRows = parseCsv(await readFile(new URL("../data/squads_2026.csv", import.meta.url), "utf8"));
const squadProfileRows = parseCsv(await readFile(new URL("../data/squad_profile_snapshot.csv", import.meta.url), "utf8"));
const squadImportCandidateRows = parseCsv(await readFile(new URL("../data/squad_import_candidates.csv", import.meta.url), "utf8"));
const availabilityRows = parseCsv(await readFile(new URL("../data/player_availability_watchlist.csv", import.meta.url), "utf8"));
const availabilityAuditRows = parseCsv(await readFile(new URL("../data/player_availability_audit.csv", import.meta.url), "utf8"));
const teamNames = new Set(baseTeams.map((team) => team.en));
const squadBrowserRows = squadBrowserContext.SQUAD_ROWS;

assertRows("baseTeams", baseTeams, 48);
assertRows("team_factors_snapshot.csv", teamFactorRows, 48);
assertRows("squad_profile_snapshot.csv", squadProfileRows, 48);
assertRows("group_stage_schedule.csv", groupRows, 72);
assertRows("knockout_schedule.csv", knockoutRows, 31);
assertRows("third_place_assignment_map.csv", thirdMapRows, 495);
assertRows("squads_2026.js", squadBrowserRows, squadRows.length);
assertRows("player_availability_audit.csv", availabilityAuditRows, availabilityRows.length);
assert(squadImportCandidateRows.every((row) => teamNames.has(row.team)), "squad_import_candidates.csv contains unknown team.");
assert(sourceRows.length === dataFields.length, `source_manifest.csv expected ${dataFields.length} rows, got ${sourceRows.length}`);

assert(baseTeams.every((team) => teamFactors[team.en]), "Every base team must have teamFactors.");
assert(teamFactorRows.every((row) => teamNames.has(row.team)), "team_factors_snapshot.csv contains unknown team.");
assert(squadProfileRows.every((row) => teamNames.has(row.team)), "squad_profile_snapshot.csv contains unknown team.");
assert(squadRows.every((row) => teamNames.has(row.team)), "squads_2026.csv contains unknown team.");
assert(squadBrowserRows.every((row) => teamNames.has(row.team)), "squads_2026.js contains unknown team.");
assert(squadRows.every((row, index) => row.team === squadBrowserRows[index].team && row.player === squadBrowserRows[index].player), "squads_2026.csv/js row order mismatch.");

const squadsByTeam = new Map();
for (const row of squadRows) {
  if (!squadsByTeam.has(row.team)) squadsByTeam.set(row.team, []);
  squadsByTeam.get(row.team).push(row);
}
assert(squadsByTeam.size === 48, `squads_2026.csv expected 48 teams, got ${squadsByTeam.size}`);
for (const team of baseTeams) {
  const players = squadsByTeam.get(team.en) || [];
  assert(players.length >= 23 && players.length <= 26, `${team.en} expected 23-26 squad rows, got ${players.length}`);
  const goalkeepers = players.filter((row) => /^(gk|goalkeeper)$/i.test(row.position.trim())).length;
  assert(goalkeepers >= 3, `${team.en} expected at least 3 goalkeepers, got ${goalkeepers}`);
}

const thirdSlotNames = ["3ABCDF", "3CDFGH", "3CEFHI", "3EHIJK", "3BEFIJ", "3AEHIJ", "3EFGIJ", "3DEIJL"];
const table = thirdPlaceContext.table;
assert(Object.keys(table).length === 495, `third_place_assignment_map.js expected 495 keys, got ${Object.keys(table).length}`);

for (const combo of combinations("ABCDEFGHIJKL".split(""), 8)) {
  const comboKey = combo.join("");
  const csvRow = thirdMapRows.find((row) => row.advancing_third_groups === comboKey);
  const jsRow = table[comboKey];
  assert(csvRow, `Missing CSV third-place mapping for ${comboKey}`);
  assert(jsRow, `Missing JS third-place mapping for ${comboKey}`);
  const assigned = thirdSlotNames.map((slot) => csvRow[slot]);
  assert(new Set(assigned).size === 8, `CSV third-place mapping has duplicate assignment for ${comboKey}`);
  assert(assigned.every((group) => combo.includes(group)), `CSV third-place mapping assigns outside combo for ${comboKey}`);
  for (const slot of thirdSlotNames) {
    assert(csvRow[slot] === jsRow[slot], `CSV/JS third-place mapping mismatch for ${comboKey} ${slot}`);
  }
}

const availabilityMatched = availabilityAuditRows.filter((row) => row.matched === "true").length;
assert(availabilityMatched >= 1, "Availability watchlist should match at least one current squad row.");

console.log("Data integrity checks passed for teams, schedules, squads, availability and third-place map.");
