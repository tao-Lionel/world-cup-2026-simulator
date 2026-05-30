import { readFile, writeFile } from "node:fs/promises";

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

const scheduleRows = parseCsv(await readFile(new URL("../data/schedule_travel.csv", import.meta.url), "utf8"));
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of scheduleRows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)travelKm: [0-9.]+, restDays: [0-9.]+(?:, timezoneShift: [0-9.]+, borderCrossings: [0-9.]+, altitudeLoad: [0-9.]+, climateLoad: [0-9.]+(?:, entryTravelKm: [0-9.]+, entryTimezoneShift: [0-9.]+)?)?`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update schedule factors for ${row.team}`);
  app = app.replace(
    teamPattern,
    `$1travelKm: ${row.group_stage_travel_km}, restDays: ${row.avg_rest_days}, timezoneShift: ${row.max_timezone_shift_hours}, borderCrossings: ${row.border_crossings}, altitudeLoad: ${row.max_altitude_m}, climateLoad: ${row.avg_environment_load}, entryTravelKm: ${row.entry_travel_km}, entryTimezoneShift: ${row.entry_timezone_shift_hours}`,
  );
}

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied schedule factors for ${scheduleRows.length} teams.`);
