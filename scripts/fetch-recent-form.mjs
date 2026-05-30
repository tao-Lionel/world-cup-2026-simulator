import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractConst(name) {
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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function parseDate(text) {
  const match = text.match(/([A-Za-z]+)\s+([0-9]{1,2})(?:st|nd|rd|th),\s+([0-9]{4})/);
  if (!match) return "";
  const month = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
  }[match[1]];
  return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}

function stripTags(html) {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "-")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(name) {
  return name
    .replace(/&&nbsp;/g, " and ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^Bosnia\s*&\s*Herzegovina$/, "Bosnia and Herzegovina")
    .replace(/^Curaçao$/, "Curacao")
    .replace(/^Dem\. Rep\. of Congo$/, "Congo DR")
    .replace(/^Ivory Coast$/, "Cote d'Ivoire")
    .replace(/^United States$/, "USA")
    .replace(/^South Korea$/, "Korea Republic")
    .replace(/^Czech Republic$/, "Czechia")
    .replace(/^Cape Verde$/, "Cabo Verde")
    .replace(/^Turkey$/, "Türkiye")
    .replace(/^Iran$/, "IR Iran");
}

const eloNames = {
  "Korea Republic": "South Korea",
  Czechia: "Czech Republic",
  USA: "United States",
  "Cote d'Ivoire": "Ivory Coast",
  "IR Iran": "Iran",
  "Cabo Verde": "Cape Verde",
  "Türkiye": "Turkey",
  "Congo DR": "Dem. Rep. of Congo",
};

const baseTeams = vm.runInNewContext(`(${extractConst("baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});

function parseMatches(team, html) {
  const sectionStart = html.indexOf(`${eloNames[team.en] || team.en} last international games`);
  if (sectionStart === -1) throw new Error(`${team.en}: last games section not found`);
  const tableStart = html.indexOf("<table", sectionStart);
  const tableEnd = html.indexOf("</table>", tableStart);
  const table = html.slice(tableStart, tableEnd);
  const rowHtml = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  const rows = [];

  for (const row of rowHtml) {
    const result = row.match(/<strong>([WDL])<\/strong>/)?.[1];
    const dateText = row.match(/<td class="desktop">([\s\S]*?)<\/td>/)?.[1];
    const score = row.match(/<span class="opensans">([0-9]+)\s*(?:&nbsp;|\s)-(?:&nbsp;|\s)\s*([0-9]+)<\/span>/)?.slice(1, 3);
    const titles = [...row.matchAll(/title="([^"]+)"/g)]
      .map((match) => normalizeName(match[1]))
      .filter((name) => !/^[0-9]{4} /.test(name));
    const uniqueTeams = titles.filter((name, index) => titles.indexOf(name) === index);
    if (!result || !dateText || !score || uniqueTeams.length < 2) continue;

    const date = parseDate(stripTags(dateText));
    if (!date || date < "2024-01-01" || date > "2026-03-31") continue;
    const teamIndex = uniqueTeams.indexOf(team.en);
    if (teamIndex === -1) continue;
    const opponent = uniqueTeams.find((name) => name !== team.en);
    const goalsFor = Number(score[teamIndex]);
    const goalsAgainst = Number(score[teamIndex === 0 ? 1 : 0]);
    rows.push({
      team: team.en,
      date,
      result,
      opponent,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      sourceUrl: `https://www.international-football.net/country?team=${encodeURIComponent(eloNames[team.en] || team.en)}`,
    });
  }
  return rows;
}

function computeForm(team, matches) {
  if (!matches.length) return { form: teamFactors[team.en].form, pointsPerGame: 0, avgGoalDiff: 0, matches: 0 };
  const latest = new Date("2026-03-31");
  let weightedPoints = 0;
  let weightSum = 0;
  let weightedGoalDiff = 0;
  for (const match of matches) {
    const ageDays = (latest - new Date(match.date)) / 86400000;
    const recency = Math.max(0.45, 1 - (ageDays / 820) * 0.55);
    const resultPoints = match.result === "W" ? 3 : match.result === "D" ? 1 : 0;
    weightedPoints += resultPoints * recency;
    weightedGoalDiff += Math.max(-3, Math.min(3, match.goalDiff)) * recency;
    weightSum += recency;
  }
  const pointsPerGame = weightedPoints / weightSum;
  const avgGoalDiff = weightedGoalDiff / weightSum;
  const score = Math.round(Math.max(42, Math.min(84, 44 + pointsPerGame * 11 + avgGoalDiff * 3)));
  return {
    form: score,
    pointsPerGame: Number(pointsPerGame.toFixed(2)),
    avgGoalDiff: Number(avgGoalDiff.toFixed(2)),
    matches: matches.length,
  };
}

const allMatches = [];
const summaries = [];
for (const team of baseTeams) {
  const eloTeam = eloNames[team.en] || team.en;
  const url = `https://www.international-football.net/country?team=${encodeURIComponent(eloTeam)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${team.en}: HTTP ${response.status}`);
  const html = await response.text();
  const matches = parseMatches(team, html);
  allMatches.push(...matches);
  const summary = computeForm(team, matches);
  summaries.push({
    team: team.en,
    snapshot_date: "2026-03-31",
    form: summary.form,
    previous_model_form: teamFactors[team.en].form,
    delta: summary.form - teamFactors[team.en].form,
    matches: summary.matches,
    weighted_points_per_game: summary.pointsPerGame,
    weighted_goal_diff: summary.avgGoalDiff,
    source_url: url,
  });
  console.log(`${team.en}: ${teamFactors[team.en].form} -> ${summary.form} (${summary.matches} matches)`);
}

await writeFile(
  new URL("../data/recent_matches_2024_2026.csv", import.meta.url),
  [
    ["team", "date", "result", "opponent", "goals_for", "goals_against", "goal_diff", "source_url"].join(","),
    ...allMatches.map((row) => [
      row.team,
      row.date,
      row.result,
      row.opponent,
      row.goalsFor,
      row.goalsAgainst,
      row.goalDiff,
      row.sourceUrl,
    ].map(csvEscape).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL("../data/form_snapshot.csv", import.meta.url),
  [
    ["team", "snapshot_date", "form", "previous_model_form", "delta", "matches", "weighted_points_per_game", "weighted_goal_diff", "source_url"].join(","),
    ...summaries.map((row) => [
      row.team,
      row.snapshot_date,
      row.form,
      row.previous_model_form,
      row.delta,
      row.matches,
      row.weighted_points_per_game,
      row.weighted_goal_diff,
      row.source_url,
    ].map(csvEscape).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched ${allMatches.length} recent matches for ${summaries.length} teams.`);
