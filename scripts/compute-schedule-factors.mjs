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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function distanceKm(a, b) {
  const earthKm = 6371;
  const dLat = toRadians(b.lat) - toRadians(a.lat);
  const dLon = toRadians(b.lon) - toRadians(a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

const schedule = parseCsv(await readFile(new URL("../data/group_stage_schedule.csv", import.meta.url), "utf8"));
const venues = new Map(parseCsv(await readFile(new URL("../data/venues.csv", import.meta.url), "utf8")).map((venue) => [venue.venue, venue]));
const origins = new Map(parseCsv(await readFile(new URL("../data/team_travel_origins.csv", import.meta.url), "utf8")).map((origin) => [origin.team, origin]));

const byTeam = new Map();
for (const match of schedule) {
  if (!venues.has(match.venue)) throw new Error(`Missing venue coordinates: ${match.venue}`);
  for (const team of [match.team_a, match.team_b]) {
    if (!byTeam.has(team)) byTeam.set(team, []);
    byTeam.get(team).push(match);
  }
}

const rows = [...byTeam.entries()].map(([team, matches]) => {
  matches.sort((a, b) => a.date.localeCompare(b.date));
  if (!origins.has(team)) throw new Error(`Missing travel origin: ${team}`);
  const origin = origins.get(team);
  const firstVenue = venues.get(matches[0].venue);
  let travelKm = 0;
  let borderCrossings = 0;
  const restDays = [];
  const timezoneOffsets = matches.map((match) => Number(venues.get(match.venue).utc_offset_june));
  const altitudeValues = matches.map((match) => Number(venues.get(match.venue).altitude_m));
  const environmentLoads = matches.map((match) => Number(venues.get(match.venue).environment_load));
  for (let index = 1; index < matches.length; index += 1) {
    const previousVenue = venues.get(matches[index - 1].venue);
    const nextVenue = venues.get(matches[index].venue);
    travelKm += distanceKm(previousVenue, nextVenue);
    if (previousVenue.country !== nextVenue.country) borderCrossings += 1;
    restDays.push((new Date(matches[index].date) - new Date(matches[index - 1].date)) / 86400000);
  }
  const maxTimezoneShift = timezoneOffsets.length ? Math.max(...timezoneOffsets) - Math.min(...timezoneOffsets) : 0;
  const entryTravelKm = distanceKm(origin, firstVenue);
  const entryTimezoneShift = Math.abs(Number(firstVenue.utc_offset_june) - Number(origin.utc_offset_june));
  const maxAltitudeM = altitudeValues.length ? Math.max(...altitudeValues) : 0;
  const avgAltitudeM = altitudeValues.reduce((sum, value) => sum + value, 0) / altitudeValues.length;
  const avgEnvironmentLoad = environmentLoads.reduce((sum, value) => sum + value, 0) / environmentLoads.length;
  return {
    team,
    matches: matches.length,
    first_date: matches[0].date,
    last_date: matches[matches.length - 1].date,
    origin_city: origin.origin_city,
    origin_country: origin.origin_country,
    venue_sequence: matches.map((match) => match.venue).join(" > "),
    country_sequence: matches.map((match) => venues.get(match.venue).country).join(" > "),
    timezone_sequence: timezoneOffsets.join("|"),
    entry_travel_km: Math.round(entryTravelKm),
    entry_timezone_shift_hours: Number(entryTimezoneShift.toFixed(1)),
    group_stage_travel_km: Math.round(travelKm),
    avg_rest_days: Number((restDays.reduce((sum, value) => sum + value, 0) / restDays.length).toFixed(1)),
    rest_sequence_days: restDays.join("|"),
    max_timezone_shift_hours: maxTimezoneShift,
    border_crossings: borderCrossings,
    avg_altitude_m: Math.round(avgAltitudeM),
    max_altitude_m: Math.round(maxAltitudeM),
    avg_environment_load: Math.round(avgEnvironmentLoad),
  };
}).sort((a, b) => a.team.localeCompare(b.team));

const headers = [
  "team",
  "matches",
  "first_date",
  "last_date",
  "origin_city",
  "origin_country",
  "venue_sequence",
  "country_sequence",
  "timezone_sequence",
  "entry_travel_km",
  "entry_timezone_shift_hours",
  "group_stage_travel_km",
  "avg_rest_days",
  "rest_sequence_days",
  "max_timezone_shift_hours",
  "border_crossings",
  "avg_altitude_m",
  "max_altitude_m",
  "avg_environment_load",
];

await writeFile(
  new URL("../data/schedule_travel.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Computed schedule factors for ${rows.length} teams from ${schedule.length} group-stage matches.`);
