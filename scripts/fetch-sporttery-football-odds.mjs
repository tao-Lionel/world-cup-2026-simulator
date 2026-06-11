import { writeFile } from "node:fs/promises";

const apiBase = "https://webapi.sporttery.cn";
const sourcePage = "https://www.sporttery.cn/jc/zqszsc/";
const clientCode = "3001";
const windowDays = Number(process.env.SPORTTERY_WINDOW_DAYS) || 7;
const leagueKeywords = (process.env.SPORTTERY_LEAGUE_KEYWORDS || "世界杯")
  .split(",")
  .map((keyword) => keyword.trim())
  .filter(Boolean);

function formatDateInShanghai(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00+08:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateInShanghai(date);
}

async function getJson(url, referer = sourcePage) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      origin: "https://www.sporttery.cn",
      referer,
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${url} did not return JSON: ${text.slice(0, 80)}`);
  }
}

function odd(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Number(number.toFixed(2)) : null;
}

function singleLabel(singleByCode, code) {
  if (!singleByCode.has(code)) return "未知";
  return singleByCode.get(code) === 1 ? "支持单关" : "需过关";
}

function isWorldCupMatch(match) {
  const leagueText = [
    match.leagueName,
    match.leagueNameAbbr,
    match.leagueAllName,
    match.leagueAbbName,
    match.leagueNameAbbr,
  ]
    .filter(Boolean)
    .join(" ");
  return leagueKeywords.some((keyword) => leagueText.includes(keyword));
}

function latest(rows) {
  return Array.isArray(rows) && rows.length ? rows.at(-1) : null;
}

function inWindow(match, startDate, endDate) {
  const date = match.businessDate || match.matchDate || "";
  return date >= startDate && date <= endDate;
}

function saleStatusLabel(value) {
  if (String(value) === "1") return "已开售";
  if (String(value) === "2") return "暂停销售";
  return "待开售";
}

function threeWayPool(code, label, row, singleByCode) {
  if (!row) return null;
  const options = [
    { key: "h", label: code === "HHAD" ? "让胜" : "主胜", odds: odd(row.h) },
    { key: "d", label: code === "HHAD" ? "让平" : "平", odds: odd(row.d) },
    { key: "a", label: code === "HHAD" ? "让负" : "客胜", odds: odd(row.a) },
  ].filter((option) => option.odds);
  if (!options.length) return null;
  return {
    code,
    label,
    single: singleLabel(singleByCode, code),
    goalLine: row.goalLine || "",
    updateAt: [row.updateDate, row.updateTime].filter(Boolean).join(" "),
    options,
  };
}

function totalGoalsPool(row, singleByCode) {
  if (!row) return null;
  const options = Array.from({ length: 8 }, (_, index) => ({
    key: `s${index}`,
    label: index === 7 ? "7+球" : `${index}球`,
    odds: odd(row[`s${index}`]),
  })).filter((option) => option.odds);
  if (!options.length) return null;
  return {
    code: "TTG",
    label: "总进球",
    single: singleLabel(singleByCode, "TTG"),
    goalLine: "",
    updateAt: [row.updateDate, row.updateTime].filter(Boolean).join(" "),
    options,
  };
}

function scoreLabel(key) {
  if (key === "s-1sh") return "胜其他";
  if (key === "s-1sd") return "平其他";
  if (key === "s-1sa") return "负其他";
  const match = key.match(/^s(\d{2})s(\d{2})$/);
  if (!match) return key;
  return `${Number(match[1])}:${Number(match[2])}`;
}

function halfFullLabel(key) {
  const map = { h: "胜", d: "平", a: "负" };
  return key.length === 2 && map[key[0]] && map[key[1]] ? `${map[key[0]]}/${map[key[1]]}` : key;
}

function compactPool(code, label, row, singleByCode, labeler = (key) => key) {
  if (!row) return null;
  const options = Object.entries(row)
    .filter(([key, value]) => !key.endsWith("f") && odd(value))
    .map(([key, value]) => ({ key, label: labeler(key), odds: odd(value) }));
  if (!options.length) return null;
  return {
    code,
    label,
    single: singleLabel(singleByCode, code),
    goalLine: row.goalLine || "",
    updateAt: [row.updateDate, row.updateTime].filter(Boolean).join(" "),
    optionCount: options.length,
    options: options.slice(0, 8),
  };
}

function normalizeOdds(match, oddsHistory) {
  const singleByCode = new Map((oddsHistory.singleList || []).map((row) => [row.poolCode, Number(row.single)]));
  const pools = [
    threeWayPool("HAD", "胜平负", latest(oddsHistory.hadList), singleByCode),
    threeWayPool("HHAD", "让球胜平负", latest(oddsHistory.hhadList), singleByCode),
    totalGoalsPool(latest(oddsHistory.ttgList), singleByCode),
    compactPool("CRS", "比分", latest(oddsHistory.crsList), singleByCode, scoreLabel),
    compactPool("HAFU", "半全场", latest(oddsHistory.hafuList), singleByCode, halfFullLabel),
  ].filter(Boolean);

  return {
    matchId: String(match.matchId),
    matchNum: match.matchNumStr || match.matchNum || "",
    matchDate: [match.matchDate, match.matchTime].filter(Boolean).join(" "),
    league: oddsHistory.leagueAbbName || match.leagueAbbName || match.leagueName || "",
    homeTeam: oddsHistory.homeTeamAllName || oddsHistory.homeTeamAbbName || match.homeTeamAllName || match.homeTeamAbbName || "",
    awayTeam: oddsHistory.awayTeamAllName || oddsHistory.awayTeamAbbName || match.awayTeamAllName || match.awayTeamAbbName || "",
    goalLine: match.goalLine || "",
    status: saleStatusLabel(match.sellStatus),
    matchStatus: match.matchStatus || "",
    remark: match.remark || "",
    sourceUrl: `https://www.sporttery.cn/jc/zqdz/index.html?showType=3&mid=${match.matchId}`,
    pools,
  };
}

async function fetchMatches(startDate, endDate) {
  const params = new URLSearchParams({ clientCode });
  const result = await getJson(`${apiBase}/gateway/uniform/football/getMatchListV1.qry?${params}`);
  if (result.errorCode !== "0") throw new Error(`Sporttery match list failed: ${result.errorMessage || result.errorCode}`);
  const matches = (result.value?.matchInfoList || [])
    .flatMap((day) => day.subMatchList || [])
    .filter((match) => inWindow(match, startDate, endDate));
  return {
    lastUpdateTime: result.value?.lastUpdateTime || "",
    matches,
  };
}

async function fetchOdds(matchId) {
  const params = new URLSearchParams({ clientCode, matchId: String(matchId) });
  const detailPage = `https://www.sporttery.cn/jc/zqdz/index.html?showType=3&mid=${matchId}`;
  const result = await getJson(`${apiBase}/gateway/uniform/football/getFixedBonusV1.qry?${params}`, detailPage);
  if (result.errorCode !== "0") throw new Error(`Sporttery odds failed for ${matchId}: ${result.errorMessage || result.errorCode}`);
  return result.value?.oddsHistory || {};
}

const startDate = process.env.SPORTTERY_START_DATE || formatDateInShanghai();
const endDate = process.env.SPORTTERY_END_DATE || addDays(startDate, windowDays);
const listed = await fetchMatches(startDate, endDate);
const worldCupMatches = listed.matches.filter(isWorldCupMatch);
const matches = [];

for (const match of worldCupMatches) {
  const oddsHistory = await fetchOdds(match.matchId);
  const normalized = normalizeOdds(match, oddsHistory);
  if (normalized.pools.length) matches.push(normalized);
}

const snapshot = {
  snapshotAt: new Date().toISOString(),
  source: "中国竞彩网固定奖金接口",
  sourceUrl: sourcePage,
  api: `${apiBase}/gateway/uniform/football`,
  window: { startDate, endDate },
  leagueKeywords,
  lastUpdateTime: listed.lastUpdateTime,
  matches,
};

await writeFile(new URL("../data/sporttery_football_odds_snapshot.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
await writeFile(
  new URL("../data/sporttery_football_odds_snapshot.js", import.meta.url),
  `// Generated by scripts/fetch-sporttery-football-odds.mjs from China Sporttery fixed-bonus APIs; filtered to World Cup matches.\n` +
    `globalThis.SPORTTERY_FOOTBALL_ODDS_SNAPSHOT = Object.freeze(${JSON.stringify(snapshot)});\n`,
);

console.log(
  `Fetched China Sporttery World Cup odds for ${matches.length}/${worldCupMatches.length} matches ` +
    `(${startDate} to ${endDate}); filtered ${listed.matches.length - worldCupMatches.length} non-World-Cup matches.`,
);
