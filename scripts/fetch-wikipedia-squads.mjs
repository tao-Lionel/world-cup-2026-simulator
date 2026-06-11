import { writeFile, readFile } from "node:fs/promises";
import vm from "node:vm";

const API_URL = "https://en.wikipedia.org/w/api.php";
const PAGE = "2026 FIFA World Cup squads";
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);

const wikiTeamNames = new Map([
  ["South Korea", "Korea Republic"],
  ["Turkey", "Türkiye"],
  ["Ivory Coast", "Cote d'Ivoire"],
  ["Iran", "IR Iran"],
  ["Cape Verde", "Cabo Verde"],
  ["DR Congo", "Congo DR"],
  ["Czech Republic", "Czechia"],
  ["United States", "USA"],
  ["Curaçao", "Curacao"],
]);

const clubNatLeague = new Map([
  ["ENG", "Premier League"],
  ["ESP", "La Liga"],
  ["ITA", "Serie A"],
  ["GER", "Bundesliga"],
  ["FRA", "Ligue 1"],
  ["NED", "Eredivisie"],
  ["POR", "Primeira Liga"],
  ["BRA", "Brasileirao"],
  ["ARG", "Argentine Primera Division"],
  ["USA", "MLS"],
  ["CAN", "MLS"],
  ["MEX", "Liga MX"],
  ["KSA", "Saudi Pro League"],
  ["QAT", "Qatar Stars League"],
  ["JPN", "J1 League"],
  ["KOR", "K League 1"],
  ["AUS", "A-League"],
]);

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

function stripWiki(value = "") {
  return value
    .replace(/\{\{sortname\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}\}/g, "$1 $2")
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/<ref[\s\S]*?<\/ref>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseTemplateFields(line) {
  const body = line.replace(/^\{\{nat fs g player\|/, "").replace(/\}\}\s*$/, "");
  const fields = {};
  let current = "";
  let depth = 0;
  let linkDepth = 0;
  const parts = [];
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "{" && body[index + 1] === "{") {
      depth += 1;
      current += char;
    } else if (char === "}" && body[index + 1] === "}") {
      depth -= 1;
      current += char;
    } else if (char === "[" && body[index + 1] === "[") {
      linkDepth += 1;
      current += char;
    } else if (char === "]" && body[index + 1] === "]") {
      linkDepth -= 1;
      current += char;
    } else if (char === "|" && depth === 0 && linkDepth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  for (const part of parts) {
    const equals = part.indexOf("=");
    if (equals === -1) continue;
    fields[part.slice(0, equals).trim()] = part.slice(equals + 1).trim();
  }
  return fields;
}

function ageFromField(value) {
  const age2 = value.match(/\{\{birth date and age2\|(\d{4})\|(\d{1,2})\|(\d{1,2})\|(\d{4})\|(\d{1,2})\|(\d{1,2})/);
  if (age2) {
    const [, refYear, refMonth, refDay, birthYear, birthMonth, birthDay] = age2.map(Number);
    let age = refYear - birthYear;
    if (refMonth < birthMonth || (refMonth === birthMonth && refDay < birthDay)) age -= 1;
    return age;
  }
  const number = stripWiki(value).match(/\d+/);
  return number ? Number(number[0]) : "";
}

function expectedRole(positionIndex, position) {
  if (position === "GK") return positionIndex <= 1 ? "starter" : "reserve";
  if (positionIndex <= 4) return "starter";
  if (positionIndex <= 8) return "rotation";
  return "squad";
}

function parseSections(wikitext) {
  const matches = [...wikitext.matchAll(/^===([^=\n]+)===$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? wikitext.length;
    return {
      title: match[1].trim(),
      text: wikitext.slice(start, end),
    };
  });
}

async function fetchWikitext() {
  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    titles: PAGE,
    rvprop: "content",
    rvslots: "main",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`${API_URL}?${params}`, {
    headers: { "user-agent": "world-cup-2026-simulator/0.1 (local research)" },
  });
  if (!response.ok) throw new Error(`Wikipedia API failed: ${response.status}`);
  const data = await response.json();
  return data.query.pages[0].revisions[0].slots.main.content;
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const announcementRows = parseCsv(await readFile(new URL("../data/squad_announcement_status.csv", import.meta.url), "utf8"));
const announced26 = new Set(announcementRows.filter((row) => row.announced_26_available === "true").map((row) => row.team));
const officialFinal = new Set(announcementRows.filter((row) => row.fifa_final_26_available === "true").map((row) => row.team));
const sourceByTeam = new Map(announcementRows.map((row) => [row.team, row.source_url]));
const validTeams = new Set(baseTeams.map((team) => team.en));
const wikitext = await fetchWikitext();
const sections = parseSections(wikitext);
const playerRows = [];
const statusRows = [];

for (const section of sections) {
  const team = wikiTeamNames.get(section.title) || section.title;
  if (!validTeams.has(team)) continue;
  const playerLines = section.text.split(/\r?\n/).filter((line) => line.startsWith("{{nat fs g player|"));
  const sourceUrl = sourceByTeam.get(team) || `https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads#${encodeURIComponent(section.title.replaceAll(" ", "_"))}`;
  const include = announced26.has(team) && playerLines.length >= 23 && playerLines.length <= 26;
  statusRows.push({
    team,
    wiki_section: section.title,
    announced_26_available: announced26.has(team),
    parsed_players: playerLines.length,
    imported_players: include ? playerLines.length : 0,
    import_status: include ? "imported" : "skipped_not_confirmed_26",
    source_url: sourceUrl,
  });
  if (!include) continue;

  const positionCounts = new Map();
  playerLines.forEach((line, index) => {
    const fields = parseTemplateFields(line);
    const position = stripWiki(fields.pos || "");
    positionCounts.set(position, (positionCounts.get(position) || 0) + 1);
    const clubNat = stripWiki(fields.clubnat || "");
    playerRows.push({
      team,
      slot: index + 1,
      player: stripWiki(fields.name || ""),
      position,
      age: ageFromField(fields.age || ""),
      club: stripWiki(fields.club || ""),
      league: clubNatLeague.get(clubNat) || clubNat,
      market_value_m: "",
      caps: stripWiki(fields.caps || ""),
      goals: stripWiki(fields.goals || ""),
      injury_status: "unknown",
      expected_role: expectedRole(positionCounts.get(position), position),
      list_status: officialFinal.has(team) ? "official_final" : "association_final",
      source_url: sourceUrl,
      snapshot_date: SNAPSHOT_DATE,
    });
  });
}

const squadHeaders = [
  "team",
  "slot",
  "player",
  "position",
  "age",
  "club",
  "league",
  "market_value_m",
  "caps",
  "goals",
  "injury_status",
  "expected_role",
  "list_status",
  "source_url",
  "snapshot_date",
];

const statusHeaders = [
  "team",
  "wiki_section",
  "announced_26_available",
  "parsed_players",
  "imported_players",
  "import_status",
  "source_url",
];

await writeFile(
  new URL("../data/squads_2026.csv", import.meta.url),
  [
    squadHeaders.join(","),
    ...playerRows.map((row) => squadHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL("../data/squad_collection_status.csv", import.meta.url),
  [
    statusHeaders.join(","),
    ...statusRows.map((row) => statusHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Imported ${playerRows.length} player rows for ${new Set(playerRows.map((row) => row.team)).size} teams.`);
