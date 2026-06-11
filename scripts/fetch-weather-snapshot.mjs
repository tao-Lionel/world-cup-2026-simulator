import { readFile, writeFile } from "node:fs/promises";

const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);
const WEATHER_SOURCE = "Open-Meteo forecast API";

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

function weatherLoad(baseLoad, weather) {
  if (!weather) return Number(baseLoad);
  const apparent = Number(weather.apparent_temperature_max);
  const wind = Number(weather.wind_speed_10m_max);
  const precipitation = Number(weather.precipitation_sum);
  const heatPenalty = Math.max(0, apparent - 27) * 2.2;
  const coldPenalty = Math.max(0, 8 - apparent) * 1.4;
  const rainPenalty = Math.min(16, precipitation * 2.5);
  const windPenalty = Math.max(0, wind - 22) * 0.45;
  return Math.max(0, Math.min(100, Math.round(Number(baseLoad) * 0.55 + heatPenalty + coldPenalty + rainPenalty + windPenalty)));
}

async function fetchVenueWeather(venue, dates) {
  const params = new URLSearchParams({
    latitude: venue.lat,
    longitude: venue.lon,
    daily: "temperature_2m_max,apparent_temperature_max,precipitation_sum,wind_speed_10m_max",
    forecast_days: "16",
    timezone: "auto",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo failed ${response.status}: ${url}`);
  const data = await response.json();
  const byDate = new Map();
  const times = data.daily?.time || [];
  times.forEach((date, index) => {
    byDate.set(date, {
      temperature_2m_max: data.daily.temperature_2m_max[index],
      apparent_temperature_max: data.daily.apparent_temperature_max[index],
      precipitation_sum: data.daily.precipitation_sum[index],
      wind_speed_10m_max: data.daily.wind_speed_10m_max[index],
    });
  });
  return { byDate, url };
}

const scheduleRows = parseCsv(await readFile(new URL("../data/group_stage_schedule.csv", import.meta.url), "utf8"));
const venueRows = parseCsv(await readFile(new URL("../data/venues.csv", import.meta.url), "utf8"));
const travelRows = parseCsv(await readFile(new URL("../data/schedule_travel.csv", import.meta.url), "utf8"));
const venues = new Map(venueRows.map((row) => [row.venue, row]));
const datesByVenue = new Map();

for (const match of scheduleRows) {
  if (!datesByVenue.has(match.venue)) datesByVenue.set(match.venue, new Set());
  datesByVenue.get(match.venue).add(match.date);
}

const weatherByVenue = new Map();
for (const [venueName, dateSet] of datesByVenue.entries()) {
  const dates = [...dateSet].sort();
  weatherByVenue.set(venueName, await fetchVenueWeather(venues.get(venueName), dates));
}

const matchRows = scheduleRows.map((match, index) => {
  const venue = venues.get(match.venue);
  const weatherResult = weatherByVenue.get(match.venue);
  const weather = weatherResult.byDate.get(match.date);
  return {
    match_index: index + 1,
    date: match.date,
    group: match.group,
    team_a: match.team_a,
    team_b: match.team_b,
    venue: match.venue,
    temperature_2m_max_c: weather?.temperature_2m_max ?? "",
    apparent_temperature_max_c: weather?.apparent_temperature_max ?? "",
    precipitation_sum_mm: weather?.precipitation_sum ?? "",
    wind_speed_10m_max_kmh: weather?.wind_speed_10m_max ?? "",
    venue_environment_load: venue.environment_load,
    weather_load: weatherLoad(venue.environment_load, weather),
    forecast_status: weather ? "forecast" : "forecast_unavailable_venue_baseline",
    source_url: weatherResult.url,
    snapshot_date: SNAPSHOT_DATE,
  };
});

const weatherByTeam = new Map();
for (const row of matchRows) {
  for (const team of [row.team_a, row.team_b]) {
    if (!weatherByTeam.has(team)) weatherByTeam.set(team, []);
    weatherByTeam.get(team).push(row);
  }
}

const teamRows = [...weatherByTeam.entries()].map(([team, rows]) => ({
  team,
  matches: rows.length,
  avg_weather_load: Math.round(rows.reduce((sum, row) => sum + Number(row.weather_load), 0) / rows.length),
  forecast_matches: rows.filter((row) => row.forecast_status === "forecast").length,
  baseline_matches: rows.filter((row) => row.forecast_status !== "forecast").length,
  source: WEATHER_SOURCE,
  snapshot_date: SNAPSHOT_DATE,
})).sort((a, b) => a.team.localeCompare(b.team));

const travelByTeam = new Map(travelRows.map((row) => [row.team, row]));
for (const row of teamRows) {
  const travel = travelByTeam.get(row.team);
  if (!travel) throw new Error(`Missing schedule_travel row for ${row.team}`);
  travel.avg_environment_load = row.avg_weather_load;
  travel.weather_forecast_matches = row.forecast_matches;
  travel.weather_baseline_matches = row.baseline_matches;
  travel.weather_snapshot_date = row.snapshot_date;
}

const matchHeaders = ["match_index", "date", "group", "team_a", "team_b", "venue", "temperature_2m_max_c", "apparent_temperature_max_c", "precipitation_sum_mm", "wind_speed_10m_max_kmh", "venue_environment_load", "weather_load", "forecast_status", "source_url", "snapshot_date"];
await writeFile(
  new URL("../data/match_weather_snapshot.csv", import.meta.url),
  [
    matchHeaders.join(","),
    ...matchRows.map((row) => matchHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const teamHeaders = ["team", "matches", "avg_weather_load", "forecast_matches", "baseline_matches", "source", "snapshot_date"];
await writeFile(
  new URL("../data/schedule_weather.csv", import.meta.url),
  [
    teamHeaders.join(","),
    ...teamRows.map((row) => teamHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const travelHeaders = Object.keys(travelRows[0]);
for (const optionalHeader of ["weather_forecast_matches", "weather_baseline_matches", "weather_snapshot_date"]) {
  if (!travelHeaders.includes(optionalHeader)) travelHeaders.push(optionalHeader);
}
await writeFile(
  new URL("../data/schedule_travel.csv", import.meta.url),
  [
    travelHeaders.join(","),
    ...travelRows.map((row) => travelHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched weather snapshot for ${matchRows.length} group-stage matches and ${teamRows.length} teams.`);
