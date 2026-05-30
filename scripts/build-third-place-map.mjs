import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractConst(name) {
  const start = appSource.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;
  for (let index = valueStart; index < appSource.length; index += 1) {
    const char = appSource[index];
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
    if (depth === 0 && char === ";") return appSource.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

const matches = vm.runInNewContext(`(${extractConst("KNOCKOUT_MATCHES")})`, {});
const thirdSlots = matches
  .filter((match) => match.round === "32强")
  .flatMap((match) => match.slots.map((slot) => ({ match: match.match, slot })))
  .filter((item) => item.slot.startsWith("3"));
const slotNames = thirdSlots.map((item) => item.slot);

function solve(combo) {
  const available = new Set(combo);
  const bySlot = thirdSlots.map((item) => ({
    ...item,
    candidates: item.slot.slice(1).split("").filter((group) => available.has(group)),
  }));
  const ordered = [...bySlot].sort((a, b) => a.candidates.length - b.candidates.length || a.match - b.match);
  const output = new Map();

  function fill(index, usedGroups) {
    if (index === ordered.length) return true;
    const current = ordered[index];
    for (const group of current.candidates) {
      if (usedGroups.has(group)) continue;
      output.set(current.slot, group);
      usedGroups.add(group);
      if (fill(index + 1, usedGroups)) return true;
      usedGroups.delete(group);
      output.delete(current.slot);
    }
    return false;
  }

  if (!fill(0, new Set())) throw new Error(`No third-place mapping for ${combo.join("")}`);
  return output;
}

const rows = combinations("ABCDEFGHIJKL".split(""), 8).map((combo) => {
  const assignment = solve(combo);
  return {
    advancing_third_groups: combo.join(""),
    ...Object.fromEntries(slotNames.map((slot) => [slot, assignment.get(slot)])),
    assignment_source: "generated_from_fifa_candidate_slots",
  };
});

const csvHeaders = ["advancing_third_groups", ...slotNames, "assignment_source"];
await writeFile(
  new URL("../data/third_place_assignment_map.csv", import.meta.url),
  [
    csvHeaders.join(","),
    ...rows.map((row) => csvHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const jsRows = rows
  .map((row) => {
    const mapping = Object.fromEntries(slotNames.map((slot) => [slot, row[slot]]));
    return `  ${JSON.stringify(row.advancing_third_groups)}: ${JSON.stringify(mapping)}`;
  })
  .join(",\n");

await writeFile(
  new URL("../data/third_place_assignment_map.js", import.meta.url),
  `const THIRD_PLACE_ASSIGNMENT_TABLE = {\n${jsRows}\n};\n`,
);

console.log(`Generated ${rows.length} third-place assignment rows for ${slotNames.length} slots.`);
