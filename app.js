const STORAGE_KEY = "world-cup-2026-sim-settings";

const baseTeams = [
  { group: "A", name: "墨西哥", en: "Mexico", flag: "🇲🇽", confed: "CONCACAF", rating: 1825, host: true },
  { group: "A", name: "南非", en: "South Africa", flag: "🇿🇦", confed: "CAF", rating: 1695 },
  { group: "A", name: "韩国", en: "Korea Republic", flag: "🇰🇷", confed: "AFC", rating: 1810 },
  { group: "A", name: "捷克", en: "Czechia", flag: "🇨🇿", confed: "UEFA", rating: 1780 },
  { group: "B", name: "加拿大", en: "Canada", flag: "🇨🇦", confed: "CONCACAF", rating: 1740, host: true },
  { group: "B", name: "波黑", en: "Bosnia and Herzegovina", flag: "🇧🇦", confed: "UEFA", rating: 1725 },
  { group: "B", name: "卡塔尔", en: "Qatar", flag: "🇶🇦", confed: "AFC", rating: 1670 },
  { group: "B", name: "瑞士", en: "Switzerland", flag: "🇨🇭", confed: "UEFA", rating: 1830 },
  { group: "C", name: "巴西", en: "Brazil", flag: "🇧🇷", confed: "CONMEBOL", rating: 2040 },
  { group: "C", name: "摩洛哥", en: "Morocco", flag: "🇲🇦", confed: "CAF", rating: 1885 },
  { group: "C", name: "海地", en: "Haiti", flag: "🇭🇹", confed: "CONCACAF", rating: 1585 },
  { group: "C", name: "苏格兰", en: "Scotland", flag: "🏴", confed: "UEFA", rating: 1765 },
  { group: "D", name: "美国", en: "USA", flag: "🇺🇸", confed: "CONCACAF", rating: 1835, host: true },
  { group: "D", name: "巴拉圭", en: "Paraguay", flag: "🇵🇾", confed: "CONMEBOL", rating: 1760 },
  { group: "D", name: "澳大利亚", en: "Australia", flag: "🇦🇺", confed: "AFC", rating: 1745 },
  { group: "D", name: "土耳其", en: "Türkiye", flag: "🇹🇷", confed: "UEFA", rating: 1815 },
  { group: "E", name: "德国", en: "Germany", flag: "🇩🇪", confed: "UEFA", rating: 1970 },
  { group: "E", name: "库拉索", en: "Curacao", flag: "🇨🇼", confed: "CONCACAF", rating: 1590 },
  { group: "E", name: "科特迪瓦", en: "Cote d'Ivoire", flag: "🇨🇮", confed: "CAF", rating: 1770 },
  { group: "E", name: "厄瓜多尔", en: "Ecuador", flag: "🇪🇨", confed: "CONMEBOL", rating: 1840 },
  { group: "F", name: "荷兰", en: "Netherlands", flag: "🇳🇱", confed: "UEFA", rating: 1990 },
  { group: "F", name: "日本", en: "Japan", flag: "🇯🇵", confed: "AFC", rating: 1850 },
  { group: "F", name: "瑞典", en: "Sweden", flag: "🇸🇪", confed: "UEFA", rating: 1805 },
  { group: "F", name: "突尼斯", en: "Tunisia", flag: "🇹🇳", confed: "CAF", rating: 1710 },
  { group: "G", name: "比利时", en: "Belgium", flag: "🇧🇪", confed: "UEFA", rating: 1940 },
  { group: "G", name: "埃及", en: "Egypt", flag: "🇪🇬", confed: "CAF", rating: 1785 },
  { group: "G", name: "伊朗", en: "IR Iran", flag: "🇮🇷", confed: "AFC", rating: 1780 },
  { group: "G", name: "新西兰", en: "New Zealand", flag: "🇳🇿", confed: "OFC", rating: 1595 },
  { group: "H", name: "西班牙", en: "Spain", flag: "🇪🇸", confed: "UEFA", rating: 2105 },
  { group: "H", name: "佛得角", en: "Cabo Verde", flag: "🇨🇻", confed: "CAF", rating: 1615 },
  { group: "H", name: "沙特", en: "Saudi Arabia", flag: "🇸🇦", confed: "AFC", rating: 1700 },
  { group: "H", name: "乌拉圭", en: "Uruguay", flag: "🇺🇾", confed: "CONMEBOL", rating: 1910 },
  { group: "I", name: "法国", en: "France", flag: "🇫🇷", confed: "UEFA", rating: 2080 },
  { group: "I", name: "塞内加尔", en: "Senegal", flag: "🇸🇳", confed: "CAF", rating: 1820 },
  { group: "I", name: "伊拉克", en: "Iraq", flag: "🇮🇶", confed: "AFC", rating: 1665 },
  { group: "I", name: "挪威", en: "Norway", flag: "🇳🇴", confed: "UEFA", rating: 1845 },
  { group: "J", name: "阿根廷", en: "Argentina", flag: "🇦🇷", confed: "CONMEBOL", rating: 2090 },
  { group: "J", name: "阿尔及利亚", en: "Algeria", flag: "🇩🇿", confed: "CAF", rating: 1755 },
  { group: "J", name: "奥地利", en: "Austria", flag: "🇦🇹", confed: "UEFA", rating: 1815 },
  { group: "J", name: "约旦", en: "Jordan", flag: "🇯🇴", confed: "AFC", rating: 1640 },
  { group: "K", name: "葡萄牙", en: "Portugal", flag: "🇵🇹", confed: "UEFA", rating: 2005 },
  { group: "K", name: "刚果（金）", en: "Congo DR", flag: "🇨🇩", confed: "CAF", rating: 1705 },
  { group: "K", name: "乌兹别克斯坦", en: "Uzbekistan", flag: "🇺🇿", confed: "AFC", rating: 1720 },
  { group: "K", name: "哥伦比亚", en: "Colombia", flag: "🇨🇴", confed: "CONMEBOL", rating: 1890 },
  { group: "L", name: "英格兰", en: "England", flag: "🏴", confed: "UEFA", rating: 2030 },
  { group: "L", name: "克罗地亚", en: "Croatia", flag: "🇭🇷", confed: "UEFA", rating: 1900 },
  { group: "L", name: "加纳", en: "Ghana", flag: "🇬🇭", confed: "CAF", rating: 1645 },
  { group: "L", name: "巴拿马", en: "Panama", flag: "🇵🇦", confed: "CONCACAF", rating: 1660 },
];

const factorSources = [
  { label: "FIFA 排名", value: "2026-04-01 官方快照" },
  { label: "Elo", value: "2026-03-31 快照" },
  { label: "赔率", value: "2026-05-15 四机构快照" },
  { label: "阵容", value: "暂定名单代理" },
  { label: "赛程", value: "旅行/休息/时区/环境快照" },
  { label: "淘汰赛", value: "FIFA 固定赛程树" },
  { label: "氛围", value: "结构化上下文快照" },
];

const SOURCE_TIERS = {
  verified: { label: "权威快照", weight: 1 },
  market: { label: "市场快照", weight: 0.82 },
  research: { label: "研究快照", weight: 0.72 },
  snapshot: { label: "可替换快照", weight: 0.62 },
  proxy: { label: "代理估计", weight: 0.36 },
  manual: { label: "人工量化", weight: 0.26 },
};

const DATA_FIELDS = [
  { key: "group", label: "2026 分组", tier: "verified", source: "FIFA Final Draw" },
  { key: "host", label: "主办国身份", tier: "verified", source: "FIFA hosts" },
  { key: "fifaRank", label: "FIFA 排名", tier: "verified", source: "FIFA/Coca-Cola ranking 2026-04-01" },
  { key: "fifaPoints", label: "FIFA 积分", tier: "verified", source: "FIFA/Coca-Cola ranking 2026-04-01" },
  { key: "odds", label: "夺冠赔率", tier: "market", source: "TheGameDay four-book consensus 2026-05-15" },
  { key: "elo", label: "Elo 强度", tier: "snapshot", source: "International-football.net / eloratings.net 2026-03-31" },
  { key: "form", label: "近两年战绩", tier: "snapshot", source: "International-football.net last games 2024-2026" },
  { key: "wcPath", label: "历史路径难度", tier: "research", source: "Football365 records + champion path summary" },
  { key: "squadValue", label: "阵容身价", tier: "proxy", source: "市场身价代理" },
  { key: "avgAge", label: "平均年龄", tier: "proxy", source: "暂定名单结构代理" },
  { key: "injuryRisk", label: "伤病风险", tier: "snapshot", source: "球员可用性 watchlist + 赛前健康代理" },
  { key: "clubScore", label: "俱乐部分布", tier: "proxy", source: "顶级联赛集中度代理" },
  { key: "atmosphere", label: "球队氛围", tier: "manual", source: "team_context_snapshot.csv 2026-05-30" },
  { key: "travelKm", label: "小组赛场馆移动", tier: "snapshot", source: "FIFA schedule + venue coordinates" },
  { key: "restDays", label: "小组赛休息天数", tier: "snapshot", source: "FIFA schedule dates" },
  { key: "timezoneShift", label: "组赛时区跨度", tier: "snapshot", source: "venue UTC offsets" },
  { key: "entryTravelKm", label: "入境旅行距离", tier: "snapshot", source: "team origins + first venue coordinates" },
  { key: "entryTimezoneShift", label: "入境时区差", tier: "snapshot", source: "origin UTC offset + first venue UTC offset" },
  { key: "borderCrossings", label: "组赛跨境次数", tier: "snapshot", source: "venue country sequence" },
  { key: "altitudeLoad", label: "最高场馆海拔", tier: "snapshot", source: "venue altitude snapshot" },
  { key: "climateLoad", label: "场馆环境负担", tier: "snapshot", source: "venue heat/humidity/altitude estimate" },
  { key: "squadAnnouncementStatus", label: "名单公告状态", tier: "snapshot", source: "federation/FIFA squad announcement tracker" },
  { key: "squadAnnouncementDate", label: "名单公告日期", tier: "snapshot", source: "federation/FIFA squad announcement tracker" },
  { key: "squadStatus", label: "名单状态", tier: "proxy", source: "26 人名单待官方公布" },
];

const teamFactors = {
  Mexico: { fifaRank: 15, fifaPoints: 1681, elo: 1858, form: 60, wcPath: 58, odds: 7213, squadValue: 215, avgAge: 27.7, injuryRisk: 24, clubScore: 58, atmosphere: 56, travelKm: 952, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 2240, climateLoad: 71, entryTravelKm: 15, entryTimezoneShift: 0, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-23", squadStatus: "暂定/初选名单" },
  "South Africa": { fifaRank: 54, fifaPoints: 1453, elo: 1524, form: 61, wcPath: 27, odds: 79161, squadValue: 43, avgAge: 26.4, injuryRisk: 22, clubScore: 56, atmosphere: 55, travelKm: 3943, restDays: 6.5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 2240, climateLoad: 63, entryTravelKm: 14582, entryTimezoneShift: 8, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-27", squadStatus: "已公布26人名单" },
  "Korea Republic": { fifaRank: 23, fifaPoints: 1585, elo: 1752, form: 61, wcPath: 60, odds: 34964, squadValue: 205, avgAge: 27.7, injuryRisk: 22, clubScore: 66, atmosphere: 57, travelKm: 645, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 1566, climateLoad: 61, entryTravelKm: 11663, entryTimezoneShift: 15, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Czechia: { fifaRank: 39, fifaPoints: 1490, elo: 1726, form: 63, wcPath: 63, odds: 27253, squadValue: 185, avgAge: 26.8, injuryRisk: 19, clubScore: 61, atmosphere: 57, travelKm: 4544, restDays: 6.5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 2240, climateLoad: 60, entryTravelKm: 10072, entryTimezoneShift: 8, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-21", squadStatus: "暂定/初选名单" },
  Canada: { fifaRank: 26, fifaPoints: 1554, elo: 1784, form: 64, wcPath: 27, odds: 21416, squadValue: 230, avgAge: 26.4, injuryRisk: 22, clubScore: 73, atmosphere: 59, travelKm: 3357, restDays: 6, timezoneShift: 3, borderCrossings: 0, altitudeLoad: 76, climateLoad: 25, entryTravelKm: 4, entryTimezoneShift: 0, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-29", squadStatus: "已公布26人名单" },
  "Bosnia and Herzegovina": { fifaRank: 77, fifaPoints: 1320, elo: 1594, form: 64, wcPath: 27, odds: 23508, squadValue: 95, avgAge: 26.4, injuryRisk: 22, clubScore: 71, atmosphere: 56, travelKm: 5058, restDays: 6, timezoneShift: 3, borderCrossings: 1, altitudeLoad: 76, climateLoad: 28, entryTravelKm: 7337, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-11", squadStatus: "已公布26人名单" },
  Qatar: { fifaRank: 53, fifaPoints: 1454, elo: 1427, form: 47, wcPath: 26, odds: 146077, squadValue: 21, avgAge: 28.2, injuryRisk: 19, clubScore: 30, atmosphere: 48, travelKm: 1519, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 13, climateLoad: 25, entryTravelKm: 13011, entryTimezoneShift: 10, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-25", squadStatus: "暂定/初选名单" },
  Switzerland: { fifaRank: 18, fifaPoints: 1636, elo: 1889, form: 71, wcPath: 59, odds: 6134, squadValue: 305, avgAge: 27.8, injuryRisk: 22, clubScore: 87, atmosphere: 61, travelKm: 2253, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 29, entryTravelKm: 9372, entryTimezoneShift: 9, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-20", squadStatus: "已公布26人名单" },
  Brazil: { fifaRank: 6, fifaPoints: 1761, elo: 1984, form: 65, wcPath: 98, odds: 823, squadValue: 1120, avgAge: 28.7, injuryRisk: 22, clubScore: 81, atmosphere: 61, travelKm: 1758, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 12, climateLoad: 49, entryTravelKm: 7772, entryTimezoneShift: 1, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  Morocco: { fifaRank: 11, fifaPoints: 1706, elo: 1821, form: 70, wcPath: 61, odds: 4968, squadValue: 370, avgAge: 25.9, injuryRisk: 22, clubScore: 78, atmosphere: 57, travelKm: 1750, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 320, climateLoad: 37, entryTravelKm: 5840, entryTimezoneShift: 5, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-26", squadStatus: "已公布26人名单" },
  Haiti: { fifaRank: 86, fifaPoints: 1281, elo: 1532, form: 59, wcPath: 17, odds: 267183, squadValue: 28, avgAge: 27.1, injuryRisk: 22, clubScore: 67, atmosphere: 53, travelKm: 1476, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 320, climateLoad: 38, entryTravelKm: 2615, entryTimezoneShift: 0, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Scotland: { fifaRank: 48, fifaPoints: 1474, elo: 1767, form: 63, wcPath: 27, odds: 11988, squadValue: 245, avgAge: 29, injuryRisk: 22, clubScore: 78, atmosphere: 54, travelKm: 1973, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 45, entryTravelKm: 4910, entryTimezoneShift: 5, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-19", squadStatus: "已公布26人名单" },
  USA: { fifaRank: 14, fifaPoints: 1682, elo: 1721, form: 61, wcPath: 61, odds: 5965, squadValue: 330, avgAge: 26.4, injuryRisk: 22, clubScore: 79, atmosphere: 60, travelKm: 3106, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 30, entryTravelKm: 3948, entryTimezoneShift: 3, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-26", squadStatus: "已公布26人名单" },
  Paraguay: { fifaRank: 37, fifaPoints: 1501, elo: 1833, form: 59, wcPath: 45, odds: 14975, squadValue: 160, avgAge: 27.7, injuryRisk: 20, clubScore: 57, atmosphere: 54, travelKm: 505, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 30, entryTravelKm: 9190, entryTimezoneShift: 3, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-12", squadStatus: "暂定/初选名单" },
  Australia: { fifaRank: 25, fifaPoints: 1558, elo: 1783, form: 69, wcPath: 46, odds: 42845, squadValue: 55, avgAge: 28.4, injuryRisk: 18, clubScore: 49, atmosphere: 58, travelKm: 1329, restDays: 6, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 13, climateLoad: 25, entryTravelKm: 12502, entryTimezoneShift: 17, squadAnnouncementStatus: "训练营名单", squadAnnouncementDate: "2026-05-04", squadStatus: "训练营名单" },
  "Türkiye": { fifaRank: 28, fifaPoints: 1537, elo: 1902, form: 71, wcPath: 48, odds: 7953, squadValue: 470, avgAge: 26.3, injuryRisk: 24, clubScore: 73, atmosphere: 55, travelKm: 1828, restDays: 6, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 29, entryTravelKm: 9611, entryTimezoneShift: 10, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-18", squadStatus: "暂定/初选名单" },
  Germany: { fifaRank: 9, fifaPoints: 1716, elo: 1923, form: 70, wcPath: 98, odds: 1245, squadValue: 865, avgAge: 27.5, injuryRisk: 22, clubScore: 89, atmosphere: 64, travelKm: 2640, restDays: 5.5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 76, climateLoad: 41, entryTravelKm: 8435, entryTimezoneShift: 7, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-21", squadStatus: "已公布26人名单" },
  Curacao: { fifaRank: 82, fifaPoints: 1294, elo: 1436, form: 58, wcPath: 13, odds: 222193, squadValue: 36, avgAge: 27.5, injuryRisk: 22, clubScore: 70, atmosphere: 53, travelKm: 2702, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 264, climateLoad: 48, entryTravelKm: 3362, entryTimezoneShift: 1, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  "Cote d'Ivoire": { fifaRank: 42, fifaPoints: 1486, elo: 1676, form: 72, wcPath: 29, odds: 23988, squadValue: 260, avgAge: 25.4, injuryRisk: 22, clubScore: 74, atmosphere: 58, travelKm: 1089, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 76, climateLoad: 35, entryTravelKm: 8022, entryTimezoneShift: 4, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Ecuador: { fifaRank: 24, fifaPoints: 1577, elo: 1933, form: 60, wcPath: 43, odds: 7575, squadValue: 285, avgAge: 25.7, injuryRisk: 17, clubScore: 66, atmosphere: 54, travelKm: 3405, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 264, climateLoad: 41, entryTravelKm: 4469, entryTimezoneShift: 1, squadAnnouncementStatus: "已公布名单待核26人", squadAnnouncementDate: "2026-05-19", squadStatus: "已公布名单待核26人" },
  Netherlands: { fifaRank: 7, fifaPoints: 1759, elo: 1961, form: 75, wcPath: 86, odds: 2047, squadValue: 790, avgAge: 27.3, injuryRisk: 22, clubScore: 89, atmosphere: 68, travelKm: 1421, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 264, climateLoad: 53, entryTravelKm: 7921, entryTimezoneShift: 7, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-27", squadStatus: "已公布26人名单" },
  Japan: { fifaRank: 19, fifaPoints: 1633, elo: 1904, form: 72, wcPath: 48, odds: 4975, squadValue: 330, avgAge: 27.2, injuryRisk: 29, clubScore: 78, atmosphere: 58, travelKm: 1689, restDays: 5.5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 540, climateLoad: 58, entryTravelKm: 10385, entryTimezoneShift: 14, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Sweden: { fifaRank: 40, fifaPoints: 1490, elo: 1719, form: 59, wcPath: 66, odds: 7953, squadValue: 345, avgAge: 27, injuryRisk: 22, clubScore: 82, atmosphere: 57, travelKm: 1029, restDays: 5.5, timezoneShift: 1, borderCrossings: 1, altitudeLoad: 540, climateLoad: 59, entryTravelKm: 9019, entryTimezoneShift: 8, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-12", squadStatus: "已公布26人名单" },
  Tunisia: { fifaRank: 41, fifaPoints: 1488, elo: 1636, form: 63, wcPath: 34, odds: 49975, squadValue: 65, avgAge: 26.2, injuryRisk: 22, clubScore: 66, atmosphere: 56, travelKm: 1582, restDays: 5.5, timezoneShift: 1, borderCrossings: 1, altitudeLoad: 540, climateLoad: 60, entryTravelKm: 9959, entryTimezoneShift: 7, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Belgium: { fifaRank: 8, fifaPoints: 1736, elo: 1866, form: 73, wcPath: 64, odds: 3324, squadValue: 530, avgAge: 27.1, injuryRisk: 22, clubScore: 84, atmosphere: 63, travelKm: 3302, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 27, entryTravelKm: 7944, entryTimezoneShift: 9, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-15", squadStatus: "已公布26人名单" },
  Egypt: { fifaRank: 32, fifaPoints: 1519, elo: 1689, form: 69, wcPath: 33, odds: 33721, squadValue: 150, avgAge: 28.4, injuryRisk: 24, clubScore: 60, atmosphere: 54, travelKm: 391, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 13, climateLoad: 23, entryTravelKm: 10986, entryTimezoneShift: 10, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-20", squadStatus: "暂定/初选名单" },
  "IR Iran": { fifaRank: 20, fifaPoints: 1620, elo: 1760, form: 63, wcPath: 33, odds: 42845, squadValue: 60, avgAge: 29.2, injuryRisk: 20, clubScore: 44, atmosphere: 52, travelKm: 1553, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 30, entryTravelKm: 12198, entryTimezoneShift: 10.5, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-17", squadStatus: "暂定/初选名单" },
  "New Zealand": { fifaRank: 83, fifaPoints: 1290, elo: 1585, form: 50, wcPath: 23, odds: 109087, squadValue: 32, avgAge: 27.6, injuryRisk: 22, clubScore: 65, atmosphere: 50, travelKm: 1749, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 27, entryTravelKm: 10483, entryTimezoneShift: 19, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-14", squadStatus: "已公布26人名单" },
  Spain: { fifaRank: 2, fifaPoints: 1876, elo: 2165, form: 76, wcPath: 92, odds: 498, squadValue: 1260, avgAge: 26.2, injuryRisk: 22, clubScore: 92, atmosphere: 67, travelKm: 2373, restDays: 5.5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 1566, climateLoad: 49, entryTravelKm: 6944, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-25", squadStatus: "已公布26人名单" },
  "Cabo Verde": { fifaRank: 67, fifaPoints: 1360, elo: 1549, form: 64, wcPath: 13, odds: 92288, squadValue: 58, avgAge: 29.2, injuryRisk: 22, clubScore: 62, atmosphere: 52, travelKm: 2502, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 320, climateLoad: 58, entryTravelKm: 6418, entryTimezoneShift: 3, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  "Saudi Arabia": { fifaRank: 60, fifaPoints: 1390, elo: 1568, form: 57, wcPath: 42, odds: 133317, squadValue: 36, avgAge: 28.4, injuryRisk: 20, clubScore: 36, atmosphere: 52, travelKm: 2090, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 320, climateLoad: 58, entryTravelKm: 11999, entryTimezoneShift: 7, squadAnnouncementStatus: "训练营名单", squadAnnouncementDate: "2026-05-23", squadStatus: "训练营名单" },
  Uruguay: { fifaRank: 17, fifaPoints: 1640, elo: 1892, form: 62, wcPath: 98, odds: 6175, squadValue: 505, avgAge: 26.4, injuryRisk: 19, clubScore: 78, atmosphere: 62, travelKm: 2439, restDays: 5.5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 1566, climateLoad: 67, entryTravelKm: 7226, entryTimezoneShift: 1, squadAnnouncementStatus: "待公布", squadAnnouncementDate: "2026-06-01", squadStatus: "待公布" },
  France: { fifaRank: 1, fifaPoints: 1877, elo: 2082, form: 76, wcPath: 98, odds: 452, squadValue: 1370, avgAge: 26.6, injuryRisk: 22, clubScore: 86, atmosphere: 67, travelKm: 545, restDays: 5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 35, entryTravelKm: 5835, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-14", squadStatus: "已公布26人名单" },
  Senegal: { fifaRank: 22, fifaPoints: 1591, elo: 1879, form: 80, wcPath: 53, odds: 9787, squadValue: 255, avgAge: 27.5, injuryRisk: 18, clubScore: 64, atmosphere: 63, travelKm: 540, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 76, climateLoad: 33, entryTravelKm: 6152, entryTimezoneShift: 4, squadAnnouncementStatus: "已公布名单待核26人", squadAnnouncementDate: "2026-05-21", squadStatus: "已公布名单待核26人" },
  Iraq: { fifaRank: 58, fifaPoints: 1421, elo: 1607, form: 67, wcPath: 18, odds: 119988, squadValue: 24, avgAge: 27.4, injuryRisk: 19, clubScore: 34, atmosphere: 55, travelKm: 953, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 88, climateLoad: 33, entryTravelKm: 9370, entryTimezoneShift: 7, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-20", squadStatus: "暂定/初选名单" },
  Norway: { fifaRank: 29, fifaPoints: 1534, elo: 1912, form: 73, wcPath: 32, odds: 2758, squadValue: 610, avgAge: 26.3, injuryRisk: 22, clubScore: 85, atmosphere: 62, travelKm: 548, restDays: 5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 33, entryTravelKm: 5652, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-21", squadStatus: "已公布26人名单" },
  Argentina: { fifaRank: 3, fifaPoints: 1875, elo: 2113, form: 77, wcPath: 98, odds: 800, squadValue: 910, avgAge: 28.6, injuryRisk: 22, clubScore: 84, atmosphere: 66, travelKm: 739, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 264, climateLoad: 52, entryTravelKm: 8992, entryTimezoneShift: 2, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-28", squadStatus: "已公布26人名单" },
  Algeria: { fifaRank: 38, fifaPoints: 1490, elo: 1743, form: 73, wcPath: 36, odds: 32420, squadValue: 170, avgAge: 27.6, injuryRisk: 22, clubScore: 58, atmosphere: 60, travelKm: 4798, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 264, climateLoad: 41, entryTravelKm: 8098, entryTimezoneShift: 6, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-11", squadStatus: "暂定/初选名单" },
  Austria: { fifaRank: 27, fifaPoints: 1548, elo: 1827, form: 76, wcPath: 49, odds: 14975, squadValue: 310, avgAge: 28.1, injuryRisk: 22, clubScore: 81, atmosphere: 63, travelKm: 3054, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 264, climateLoad: 43, entryTravelKm: 9642, entryTimezoneShift: 9, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  Jordan: { fifaRank: 64, fifaPoints: 1373, elo: 1690, form: 65, wcPath: 13, odds: 159294, squadValue: 18, avgAge: 28, injuryRisk: 18, clubScore: 30, atmosphere: 54, travelKm: 2315, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 184, climateLoad: 37, entryTravelKm: 11968, entryTimezoneShift: 10, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-17", squadStatus: "暂定/初选名单" },
  Portugal: { fifaRank: 5, fifaPoints: 1764, elo: 1984, form: 70, wcPath: 65, odds: 1048, squadValue: 1060, avgAge: 27.5, injuryRisk: 22, clubScore: 83, atmosphere: 59, travelKm: 1547, restDays: 5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 13, climateLoad: 63, entryTravelKm: 7703, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-19", squadStatus: "已公布26人名单" },
  "Congo DR": { fifaRank: 56, fifaPoints: 1429, elo: 1655, form: 72, wcPath: 17, odds: 66651, squadValue: 120, avgAge: 28.5, injuryRisk: 22, clubScore: 72, atmosphere: 59, travelKm: 3660, restDays: 5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 1566, climateLoad: 53, entryTravelKm: 12246, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  Uzbekistan: { fifaRank: 50, fifaPoints: 1460, elo: 1727, form: 70, wcPath: 13, odds: 79996, squadValue: 48, avgAge: 27.1, injuryRisk: 17, clubScore: 39, atmosphere: 56, travelKm: 2349, restDays: 5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 2240, climateLoad: 60, entryTravelKm: 13171, entryTimezoneShift: 11, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-24", squadStatus: "暂定/初选名单" },
  Colombia: { fifaRank: 13, fifaPoints: 1692, elo: 1975, form: 66, wcPath: 47, odds: 3822, squadValue: 340, avgAge: 29.6, injuryRisk: 22, clubScore: 75, atmosphere: 54, travelKm: 2915, restDays: 5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 2240, climateLoad: 69, entryTravelKm: 3166, entryTimezoneShift: 1, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-25", squadStatus: "已公布26人名单" },
  England: { fifaRank: 4, fifaPoints: 1835, elo: 2020, form: 72, wcPath: 94, odds: 629, squadValue: 1640, avgAge: 26.6, injuryRisk: 22, clubScore: 93, atmosphere: 66, travelKm: 2768, restDays: 5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 184, climateLoad: 41, entryTravelKm: 7662, entryTimezoneShift: 6, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-22", squadStatus: "已公布26人名单" },
  Croatia: { fifaRank: 10, fifaPoints: 1714, elo: 1930, form: 75, wcPath: 76, odds: 7575, squadValue: 320, avgAge: 27.9, injuryRisk: 22, clubScore: 82, atmosphere: 66, travelKm: 2500, restDays: 5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 184, climateLoad: 40, entryTravelKm: 8996, entryTimezoneShift: 7, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-18", squadStatus: "已公布26人名单" },
  Ghana: { fifaRank: 72, fifaPoints: 1335, elo: 1505, form: 58, wcPath: 48, odds: 25517, squadValue: 180, avgAge: 26.5, injuryRisk: 23, clubScore: 60, atmosphere: 51, travelKm: 1094, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 88, climateLoad: 33, entryTravelKm: 8712, entryTimezoneShift: 4, squadAnnouncementStatus: "暂定/初选名单", squadAnnouncementDate: "2026-05-23", squadStatus: "暂定/初选名单" },
  Panama: { fifaRank: 31, fifaPoints: 1521, elo: 1737, form: 64, wcPath: 23, odds: 133317, squadValue: 24, avgAge: 30, injuryRisk: 22, clubScore: 53, atmosphere: 52, travelKm: 540, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 76, climateLoad: 31, entryTravelKm: 3853, entryTimezoneShift: 1, squadAnnouncementStatus: "已公布26人名单", squadAnnouncementDate: "2026-05-27", squadStatus: "已公布26人名单" },
};

const MODEL_WEIGHTS = {
  fifa: 0.23,
  elo: 0.22,
  odds: 0.14,
  form: 0.11,
  squad: 0.11,
  wcPath: 0.07,
  health: 0.05,
  club: 0.04,
  atmosphere: 0.02,
  schedule: 0.01,
};

const KNOCKOUT_MATCHES = [
  { match: 73, round: "32强", date: "2026-06-28", venue: "Los Angeles Stadium", slots: ["2A", "2B"] },
  { match: 74, round: "32强", date: "2026-06-29", venue: "Boston Stadium", slots: ["1E", "3ABCDF"] },
  { match: 75, round: "32强", date: "2026-06-29", venue: "Estadio Monterrey", slots: ["1F", "2C"] },
  { match: 76, round: "32强", date: "2026-06-29", venue: "Houston Stadium", slots: ["1C", "2F"] },
  { match: 77, round: "32强", date: "2026-06-30", venue: "New York New Jersey Stadium", slots: ["1I", "3CDFGH"] },
  { match: 78, round: "32强", date: "2026-06-30", venue: "Dallas Stadium", slots: ["2E", "2I"] },
  { match: 79, round: "32强", date: "2026-06-30", venue: "Mexico City Stadium", slots: ["1A", "3CEFHI"] },
  { match: 80, round: "32强", date: "2026-07-01", venue: "Atlanta Stadium", slots: ["1L", "3EHIJK"] },
  { match: 81, round: "32强", date: "2026-07-01", venue: "San Francisco Bay Area Stadium", slots: ["1D", "3BEFIJ"] },
  { match: 82, round: "32强", date: "2026-07-01", venue: "Seattle Stadium", slots: ["1G", "3AEHIJ"] },
  { match: 83, round: "32强", date: "2026-07-02", venue: "Toronto Stadium", slots: ["2K", "2L"] },
  { match: 84, round: "32强", date: "2026-07-02", venue: "Los Angeles Stadium", slots: ["1H", "2J"] },
  { match: 85, round: "32强", date: "2026-07-03", venue: "BC Place Vancouver", slots: ["1B", "3EFGIJ"] },
  { match: 86, round: "32强", date: "2026-07-03", venue: "Miami Stadium", slots: ["1J", "2H"] },
  { match: 87, round: "32强", date: "2026-07-03", venue: "Kansas City Stadium", slots: ["1K", "3DEIJL"] },
  { match: 88, round: "32强", date: "2026-07-03", venue: "Dallas Stadium", slots: ["2D", "2G"] },
  { match: 89, round: "16强", date: "2026-07-04", venue: "Philadelphia Stadium", slots: ["W74", "W77"] },
  { match: 90, round: "16强", date: "2026-07-04", venue: "Houston Stadium", slots: ["W73", "W75"] },
  { match: 91, round: "16强", date: "2026-07-05", venue: "New York New Jersey Stadium", slots: ["W76", "W78"] },
  { match: 92, round: "16强", date: "2026-07-05", venue: "Mexico City Stadium", slots: ["W79", "W80"] },
  { match: 93, round: "16强", date: "2026-07-06", venue: "Dallas Stadium", slots: ["W83", "W84"] },
  { match: 94, round: "16强", date: "2026-07-06", venue: "Seattle Stadium", slots: ["W81", "W82"] },
  { match: 95, round: "16强", date: "2026-07-07", venue: "Atlanta Stadium", slots: ["W86", "W88"] },
  { match: 96, round: "16强", date: "2026-07-07", venue: "BC Place Vancouver", slots: ["W85", "W87"] },
  { match: 97, round: "8强", date: "2026-07-09", venue: "Boston Stadium", slots: ["W89", "W90"] },
  { match: 98, round: "8强", date: "2026-07-10", venue: "Los Angeles Stadium", slots: ["W93", "W94"] },
  { match: 99, round: "8强", date: "2026-07-11", venue: "Miami Stadium", slots: ["W91", "W92"] },
  { match: 100, round: "8强", date: "2026-07-11", venue: "Kansas City Stadium", slots: ["W95", "W96"] },
  { match: 101, round: "4强", date: "2026-07-14", venue: "Dallas Stadium", slots: ["W97", "W98"] },
  { match: 102, round: "4强", date: "2026-07-15", venue: "Atlanta Stadium", slots: ["W99", "W100"] },
  { match: 104, round: "决赛", date: "2026-07-19", venue: "New York New Jersey Stadium", slots: ["W101", "W102"] },
];

const VENUE_CONTEXT = {
  "Mexico City Stadium": { lat: 19.3029, lon: -99.1505, tz: -6, climate: 78, altitude: 2240 },
  "Estadio Guadalajara": { lat: 20.6819, lon: -103.4622, tz: -6, climate: 58, altitude: 1566 },
  "Estadio Monterrey": { lat: 25.6683, lon: -100.2447, tz: -6, climate: 66, altitude: 540 },
  "Toronto Stadium": { lat: 43.6332, lon: -79.4186, tz: -4, climate: 28, altitude: 76 },
  "BC Place Vancouver": { lat: 49.2768, lon: -123.1119, tz: -7, climate: 24, altitude: 13 },
  "Los Angeles Stadium": { lat: 33.9535, lon: -118.3392, tz: -7, climate: 34, altitude: 38 },
  "San Francisco Bay Area Stadium": { lat: 37.403, lon: -121.97, tz: -7, climate: 28, altitude: 12 },
  "Seattle Stadium": { lat: 47.5952, lon: -122.3316, tz: -7, climate: 22, altitude: 8 },
  "New York New Jersey Stadium": { lat: 40.8135, lon: -74.0745, tz: -4, climate: 36, altitude: 3 },
  "Boston Stadium": { lat: 42.0909, lon: -71.2643, tz: -4, climate: 32, altitude: 88 },
  "Philadelphia Stadium": { lat: 39.9008, lon: -75.1675, tz: -4, climate: 38, altitude: 12 },
  "Atlanta Stadium": { lat: 33.7554, lon: -84.4008, tz: -4, climate: 44, altitude: 320 },
  "Miami Stadium": { lat: 25.958, lon: -80.2389, tz: -4, climate: 72, altitude: 2 },
  "Kansas City Stadium": { lat: 39.0489, lon: -94.4839, tz: -5, climate: 48, altitude: 264 },
  "Houston Stadium": { lat: 29.6847, lon: -95.4107, tz: -5, climate: 58, altitude: 13 },
  "Dallas Stadium": { lat: 32.7473, lon: -97.0945, tz: -5, climate: 54, altitude: 184 },
};

const TEAM_PATH_CONTEXT = {
  Algeria: { lastVenue: "Kansas City Stadium", lastDate: "2026-06-27", lastTimezone: -5 },
  Argentina: { lastVenue: "Dallas Stadium", lastDate: "2026-06-27", lastTimezone: -5 },
  Australia: { lastVenue: "San Francisco Bay Area Stadium", lastDate: "2026-06-25", lastTimezone: -7 },
  Austria: { lastVenue: "Kansas City Stadium", lastDate: "2026-06-27", lastTimezone: -5 },
  Belgium: { lastVenue: "BC Place Vancouver", lastDate: "2026-06-26", lastTimezone: -7 },
  "Bosnia and Herzegovina": { lastVenue: "Seattle Stadium", lastDate: "2026-06-24", lastTimezone: -7 },
  Brazil: { lastVenue: "Miami Stadium", lastDate: "2026-06-24", lastTimezone: -4 },
  "Cabo Verde": { lastVenue: "Houston Stadium", lastDate: "2026-06-26", lastTimezone: -5 },
  Canada: { lastVenue: "BC Place Vancouver", lastDate: "2026-06-24", lastTimezone: -7 },
  Colombia: { lastVenue: "Miami Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  "Congo DR": { lastVenue: "Atlanta Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  "Cote d'Ivoire": { lastVenue: "Philadelphia Stadium", lastDate: "2026-06-25", lastTimezone: -4 },
  Croatia: { lastVenue: "Philadelphia Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  Curacao: { lastVenue: "Philadelphia Stadium", lastDate: "2026-06-25", lastTimezone: -4 },
  Czechia: { lastVenue: "Mexico City Stadium", lastDate: "2026-06-24", lastTimezone: -6 },
  Ecuador: { lastVenue: "New York New Jersey Stadium", lastDate: "2026-06-25", lastTimezone: -4 },
  Egypt: { lastVenue: "Seattle Stadium", lastDate: "2026-06-26", lastTimezone: -7 },
  England: { lastVenue: "New York New Jersey Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  France: { lastVenue: "Boston Stadium", lastDate: "2026-06-26", lastTimezone: -4 },
  Germany: { lastVenue: "New York New Jersey Stadium", lastDate: "2026-06-25", lastTimezone: -4 },
  Ghana: { lastVenue: "Philadelphia Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  Haiti: { lastVenue: "Atlanta Stadium", lastDate: "2026-06-24", lastTimezone: -4 },
  "IR Iran": { lastVenue: "Seattle Stadium", lastDate: "2026-06-26", lastTimezone: -7 },
  Iraq: { lastVenue: "Toronto Stadium", lastDate: "2026-06-26", lastTimezone: -4 },
  Japan: { lastVenue: "Dallas Stadium", lastDate: "2026-06-25", lastTimezone: -5 },
  Jordan: { lastVenue: "Dallas Stadium", lastDate: "2026-06-27", lastTimezone: -5 },
  "Korea Republic": { lastVenue: "Estadio Monterrey", lastDate: "2026-06-24", lastTimezone: -6 },
  Mexico: { lastVenue: "Mexico City Stadium", lastDate: "2026-06-24", lastTimezone: -6 },
  Morocco: { lastVenue: "Atlanta Stadium", lastDate: "2026-06-24", lastTimezone: -4 },
  Netherlands: { lastVenue: "Kansas City Stadium", lastDate: "2026-06-25", lastTimezone: -5 },
  "New Zealand": { lastVenue: "BC Place Vancouver", lastDate: "2026-06-26", lastTimezone: -7 },
  Norway: { lastVenue: "Boston Stadium", lastDate: "2026-06-26", lastTimezone: -4 },
  Panama: { lastVenue: "New York New Jersey Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  Paraguay: { lastVenue: "San Francisco Bay Area Stadium", lastDate: "2026-06-25", lastTimezone: -7 },
  Portugal: { lastVenue: "Miami Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
  Qatar: { lastVenue: "Seattle Stadium", lastDate: "2026-06-24", lastTimezone: -7 },
  "Saudi Arabia": { lastVenue: "Houston Stadium", lastDate: "2026-06-26", lastTimezone: -5 },
  Scotland: { lastVenue: "Miami Stadium", lastDate: "2026-06-24", lastTimezone: -4 },
  Senegal: { lastVenue: "Toronto Stadium", lastDate: "2026-06-26", lastTimezone: -4 },
  "South Africa": { lastVenue: "Estadio Monterrey", lastDate: "2026-06-24", lastTimezone: -6 },
  Spain: { lastVenue: "Estadio Guadalajara", lastDate: "2026-06-26", lastTimezone: -6 },
  Sweden: { lastVenue: "Dallas Stadium", lastDate: "2026-06-25", lastTimezone: -5 },
  Switzerland: { lastVenue: "BC Place Vancouver", lastDate: "2026-06-24", lastTimezone: -7 },
  Tunisia: { lastVenue: "Kansas City Stadium", lastDate: "2026-06-25", lastTimezone: -5 },
  "Türkiye": { lastVenue: "Los Angeles Stadium", lastDate: "2026-06-25", lastTimezone: -7 },
  Uruguay: { lastVenue: "Estadio Guadalajara", lastDate: "2026-06-26", lastTimezone: -6 },
  USA: { lastVenue: "Los Angeles Stadium", lastDate: "2026-06-25", lastTimezone: -7 },
  Uzbekistan: { lastVenue: "Atlanta Stadium", lastDate: "2026-06-27", lastTimezone: -4 },
};

function normalize(value, min, max) {
  return clamp((value - min) / (max - min), 0, 1);
}

function oddsProbability(odds) {
  if (!odds) return 0.002;
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}

function scheduleScore(factors) {
  const travelScore = 1 - normalize(factors.travelKm, 0, 5500);
  const restScore = normalize(factors.restDays, 4.8, 6.6);
  const timezoneScore = 1 - normalize(factors.timezoneShift ?? 0, 0, 3);
  const entryTravelScore = 1 - normalize(factors.entryTravelKm ?? 0, 0, 15000);
  const entryTimezoneScore = 1 - normalize(factors.entryTimezoneShift ?? 0, 0, 19);
  const borderScore = 1 - normalize(factors.borderCrossings ?? 0, 0, 2);
  const altitudeScore = 1 - normalize(factors.altitudeLoad ?? 0, 0, 2240);
  const climateScore = 1 - normalize(factors.climateLoad ?? 0, 20, 80);
  return (
    travelScore * 0.32 +
    restScore * 0.22 +
    timezoneScore * 0.1 +
    entryTravelScore * 0.1 +
    entryTimezoneScore * 0.07 +
    borderScore * 0.07 +
    altitudeScore * 0.06 +
    climateScore * 0.06
  );
}

function fieldValue(team, field) {
  if (field.key === "group") return team.group;
  if (field.key === "host") return team.host === true || team.host === undefined ? team.host === true : false;
  return team.factors[field.key];
}

function dataCoverage(team) {
  const filled = DATA_FIELDS.filter((field) => {
    const value = fieldValue(team, field);
    return value !== undefined && value !== null && value !== "";
  }).length;
  return Math.round((filled / DATA_FIELDS.length) * 100);
}

function dataReliability(team) {
  const filledFields = DATA_FIELDS.filter((field) => {
    const value = fieldValue(team, field);
    return value !== undefined && value !== null && value !== "";
  });
  const maxScore = DATA_FIELDS.length;
  const score = filledFields.reduce((sum, field) => sum + SOURCE_TIERS[field.tier].weight, 0);
  const reliableCount = filledFields.filter((field) => ["verified", "market", "research", "snapshot"].includes(field.tier)).length;
  const proxyCount = filledFields.length - reliableCount;
  return {
    score: Math.round((score / maxScore) * 100),
    reliableCount,
    proxyCount,
    total: DATA_FIELDS.length,
  };
}

function computeModelRating(team) {
  const factors = team.factors;
  const score =
    MODEL_WEIGHTS.fifa * normalize(factors.fifaPoints, 1280, 1877) +
    MODEL_WEIGHTS.elo * normalize(factors.elo, 1420, 2170) +
    MODEL_WEIGHTS.odds * normalize(Math.sqrt(oddsProbability(factors.odds)), 0.03, 0.43) +
    MODEL_WEIGHTS.form * normalize(factors.form, 45, 82) +
    MODEL_WEIGHTS.squad * normalize(Math.log10(factors.squadValue + 30), 1.45, 3.25) +
    MODEL_WEIGHTS.wcPath * normalize(factors.wcPath, 12, 96) +
    MODEL_WEIGHTS.health * (1 - normalize(factors.injuryRisk, 15, 28)) +
    MODEL_WEIGHTS.club * normalize(factors.clubScore, 30, 94) +
    MODEL_WEIGHTS.atmosphere * normalize(factors.atmosphere, 48, 86) +
    MODEL_WEIGHTS.schedule * scheduleScore(factors);
  return Math.round(1375 + (score * 760));
}

function prepareTeam(team, index) {
  const factors = teamFactors[team.en] || {};
  const prepared = {
    ...team,
    id: index,
    factors,
  };
  prepared.coverage = dataCoverage(prepared);
  prepared.reliability = dataReliability(prepared);
  prepared.modelRating = computeModelRating(prepared);
  prepared.manualRating = team.manualRating ?? null;
  return prepared;
}

function createTeams(savedTeams = []) {
  return baseTeams.map((team, index) => {
    const saved = savedTeams.find((item) => item.en === team.en) || {};
    return prepareTeam({ ...team, manualRating: saved.manualRating ?? saved.rating ?? null }, index);
  });
}

let teams = createTeams();
let latestResults = null;
let latestSample = null;
let latestSampleIndex = 0;

const $ = (selector) => document.querySelector(selector);

function percent(value, total) {
  if (!total) return "0.00%";
  return `${((value / total) * 100).toFixed(2)}%`;
}

function probabilityInterval(value, total) {
  if (!total) return { rate: 0, lower: 0, upper: 0, label: "0.00%-0.00%" };
  const rate = value / total;
  const margin = 1.96 * Math.sqrt((rate * (1 - rate)) / total);
  const lower = clamp(rate - margin, 0, 1);
  const upper = clamp(rate + margin, 0, 1);
  return {
    rate,
    lower,
    upper,
    label: `${(lower * 100).toFixed(2)}%-${(upper * 100).toFixed(2)}%`,
  };
}

function csvCell(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function seedHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  let state = seedHash(seed || "2026-world-cup") || 1;
  return () => {
    state = Math.imul(state + 0x6D2B79F5, 1);
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(lambda, rng) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= rng();
  } while (product > limit);
  return count - 1;
}

function getTeamRating(team) {
  return team.manualRating ?? team.modelRating;
}

function effectiveRating(team, settings) {
  return getTeamRating(team) + (team.host ? settings.hostBoost : 0);
}

function distanceKm(a, b) {
  if (!a || !b) return 0;
  const toRad = (degrees) => degrees * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function dateDiffDays(from, to) {
  if (!from || !to) return 5;
  return Math.round((new Date(`${to}T12:00:00Z`) - new Date(`${from}T12:00:00Z`)) / 86400000);
}

function pathLoad(team, matchContext, pathState) {
  if (!matchContext || !pathState) return { adjustment: 0, travelKm: 0, restDays: 5, timezoneShift: 0, climateShift: 0 };
  const previous = pathState.get(team.id) || TEAM_PATH_CONTEXT[team.en];
  const currentVenue = VENUE_CONTEXT[matchContext.venue];
  const previousVenue = VENUE_CONTEXT[previous?.lastVenue];
  const travel = distanceKm(previousVenue, currentVenue);
  const rest = dateDiffDays(previous?.lastDate, matchContext.date);
  const timezone = Math.abs((previous?.lastTimezone ?? currentVenue?.tz ?? 0) - (currentVenue?.tz ?? 0));
  const climate = Math.max(0, (currentVenue?.climate ?? 45) - (previousVenue?.climate ?? 45));
  const travelPenalty = normalize(travel, 0, 4200) * 26;
  const shortRestPenalty = Math.max(0, 4 - rest) * 16;
  const timezonePenalty = timezone * 5;
  const climatePenalty = normalize(climate, 0, 50) * 12;
  return {
    adjustment: -(travelPenalty + shortRestPenalty + timezonePenalty + climatePenalty),
    travelKm: Math.round(travel),
    restDays: rest,
    timezoneShift: timezone,
    climateShift: Math.round(climate),
  };
}

function simulateMatch(a, b, settings, knockout = false, matchContext = null, pathState = null, rng = Math.random) {
  const aPath = pathLoad(a, matchContext, pathState);
  const bPath = pathLoad(b, matchContext, pathState);
  const aRating = effectiveRating(a, settings) + aPath.adjustment;
  const bRating = effectiveRating(b, settings) + bPath.adjustment;
  const diff = (aRating - bRating) / (settings.randomness * 420);
  const aLambda = clamp(1.22 + diff, 0.25, 3.3);
  const bLambda = clamp(1.22 - diff, 0.25, 3.3);
  let aGoals = poisson(aLambda, rng);
  let bGoals = poisson(bLambda, rng);
  let penalty = false;

  if (knockout && aGoals === bGoals) {
    const extraDiff = (aRating - bRating) / (settings.randomness * 650);
    aGoals += poisson(clamp(0.32 + extraDiff, 0.05, 0.9), rng);
    bGoals += poisson(clamp(0.32 - extraDiff, 0.05, 0.9), rng);
  }

  let winner = null;
  if (aGoals > bGoals) winner = a;
  if (bGoals > aGoals) winner = b;
  if (knockout && !winner) {
    penalty = true;
    const chance = 1 / (1 + Math.exp(-((aRating - bRating) / 280) * settings.penaltyWeight));
    winner = rng() < chance ? a : b;
  }

  return { a, b, aGoals, bGoals, winner, penalty, pathLoads: new Map([[a.id, aPath], [b.id, bPath]]) };
}

function groupRankMap(rows) {
  const map = new Map();
  rows.forEach((row) => {
    if (!map.has(row.team.group)) map.set(row.team.group, new Map());
    map.get(row.team.group).set(row.position, row);
  });
  return map;
}

function thirdPlaceAssignments(bestThirds, settings) {
  const thirdRows = new Map(bestThirds.map((row) => [row.team.group, row]));
  const placeholders = KNOCKOUT_MATCHES
    .filter((match) => match.round === "32强")
    .flatMap((match) => match.slots)
    .filter((slot) => slot.startsWith("3"));
  const assignments = new Map();
  const comboKey = [...thirdRows.keys()].sort().join("");
  const table = typeof THIRD_PLACE_ASSIGNMENT_TABLE !== "undefined" ? THIRD_PLACE_ASSIGNMENT_TABLE : null;
  const mapped = table?.[comboKey];

  if (mapped) {
    for (const slot of placeholders) {
      const group = mapped[slot];
      if (thirdRows.has(group)) assignments.set(slot, thirdRows.get(group));
    }
    if (assignments.size === placeholders.length) return assignments;
    assignments.clear();
  }

  function fill(index, usedGroups) {
    if (index === placeholders.length) return true;
    const slot = placeholders[index];
    const candidates = slot.slice(1).split("")
      .filter((group) => thirdRows.has(group) && !usedGroups.has(group))
      .sort((a, b) => {
        const rowA = thirdRows.get(a);
        const rowB = thirdRows.get(b);
        return (
          rowB.pts - rowA.pts ||
          rowB.gd - rowA.gd ||
          rowB.gf - rowA.gf ||
          effectiveRating(rowB.team, settings) - effectiveRating(rowA.team, settings)
        );
      });
    for (const group of candidates) {
      assignments.set(slot, thirdRows.get(group));
      usedGroups.add(group);
      if (fill(index + 1, usedGroups)) return true;
      usedGroups.delete(group);
      assignments.delete(slot);
    }
    return false;
  }

  fill(0, new Set());
  return assignments;
}

function resolveBracketSlot(slot, rankMap, thirdAssignments, winners) {
  if (slot.startsWith("W")) return winners.get(Number(slot.slice(1)));
  if (slot.startsWith("3")) return thirdAssignments.get(slot)?.team;
  const position = Number(slot[0]);
  const group = slot[1];
  return rankMap.get(group)?.get(position)?.team;
}

function groupTable(groupTeams, settings, rng = Math.random) {
  const table = groupTeams.map((team) => ({
    team,
    pts: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    position: 0,
  }));

  for (let i = 0; i < groupTeams.length; i += 1) {
    for (let j = i + 1; j < groupTeams.length; j += 1) {
      const result = simulateMatch(groupTeams[i], groupTeams[j], settings, false, null, null, rng);
      const rowA = table.find((row) => row.team.id === groupTeams[i].id);
      const rowB = table.find((row) => row.team.id === groupTeams[j].id);
      rowA.gf += result.aGoals;
      rowA.ga += result.bGoals;
      rowB.gf += result.bGoals;
      rowB.ga += result.aGoals;
      if (result.aGoals > result.bGoals) rowA.pts += 3;
      else if (result.bGoals > result.aGoals) rowB.pts += 3;
      else {
        rowA.pts += 1;
        rowB.pts += 1;
      }
    }
  }

  table.forEach((row) => {
    row.gd = row.gf - row.ga;
  });

  table.sort((a, b) => (
    b.pts - a.pts ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    effectiveRating(b.team, settings) - effectiveRating(a.team, settings) ||
    rng() - 0.5
  ));

  table.forEach((row, index) => {
    row.position = index + 1;
  });

  return table;
}

function simulateTournament(settings, capturePath = false, rng = Math.random) {
  const groups = new Map();
  teams.forEach((team) => {
    if (!groups.has(team.group)) groups.set(team.group, []);
    groups.get(team.group).push(team);
  });

  const allGroupRows = [];
  const qualified = [];
  const thirds = [];
  let totalGoals = 0;

  groups.forEach((groupTeams) => {
    const table = groupTable(groupTeams, settings, rng);
    allGroupRows.push(...table);
    table.forEach((row) => {
      totalGoals += row.gf;
      if (row.position <= 2) qualified.push(row);
      if (row.position === 3) thirds.push(row);
    });
  });

  thirds.sort((a, b) => (
    b.pts - a.pts ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    effectiveRating(b.team, settings) - effectiveRating(a.team, settings)
  ));
  const bestThirds = thirds.slice(0, 8);
  qualified.push(...bestThirds);

  let penalties = 0;
  const rounds = [];
  const stageWinners = { r16: [], qf: [], sf: [], final: [], champion: null };
  const rankMap = groupRankMap(allGroupRows);
  const thirdAssignments = thirdPlaceAssignments(bestThirds, settings);
  const winners = new Map();
  const pathState = new Map(teams.map((team) => {
    const state = TEAM_PATH_CONTEXT[team.en];
    return [team.id, state ? { ...state } : null];
  }));

  KNOCKOUT_MATCHES.forEach((match) => {
    const a = resolveBracketSlot(match.slots[0], rankMap, thirdAssignments, winners);
    const b = resolveBracketSlot(match.slots[1], rankMap, thirdAssignments, winners);
    const result = simulateMatch(a, b, settings, true, match, pathState, rng);
    result.match = match.match;
    result.venue = match.venue;
    result.date = match.date;
    result.slots = match.slots;
    if (result.penalty) penalties += 1;
    totalGoals += result.aGoals + result.bGoals;
    winners.set(match.match, result.winner);
    pathState.set(result.winner.id, {
      lastVenue: match.venue,
      lastDate: match.date,
      lastTimezone: VENUE_CONTEXT[match.venue]?.tz ?? 0,
    });
    if (capturePath) {
      let round = rounds.find((item) => item.name === match.round);
      if (!round) {
        round = { name: match.round, matches: [] };
        rounds.push(round);
      }
      round.matches.push(result);
    }
    if (match.round === "32强") stageWinners.r16.push(result.winner);
    if (match.round === "16强") stageWinners.qf.push(result.winner);
    if (match.round === "8强") stageWinners.sf.push(result.winner);
    if (match.round === "4强") stageWinners.final.push(result.winner);
    if (match.round === "决赛") stageWinners.champion = result.winner;
  });

  return {
    allGroupRows,
    qualified: qualified.map((row) => row.team),
    bestThirds: bestThirds.map((row) => row.team),
    stageWinners,
    champion: stageWinners.champion,
    totalGoals,
    penalties,
    rounds: capturePath ? rounds : null,
  };
}

function emptyCounters() {
  const counters = new Map();
  teams.forEach((team) => {
    counters.set(team.id, { team, r32: 0, r16: 0, qf: 0, sf: 0, final: 0, champion: 0 });
  });
  return counters;
}

function currentSettings() {
  return {
    count: clamp(Number($("#simCount").value) || 100000, 1000, 1000000),
    seed: ($("#seedInput").value || "2026-world-cup").trim() || "2026-world-cup",
    randomness: Number($("#randomness").value),
    hostBoost: Number($("#hostBoost").value),
    penaltyWeight: Number($("#penaltyWeight").value),
  };
}

async function runSimulation() {
  const settings = currentSettings();
  const rng = createRng(settings.seed);
  const counters = emptyCounters();
  let goals = 0;
  let pens = 0;
  let thirds = 0;
  const chunkSize = 1000;
  $("#runBtn").disabled = true;
  $("#statusLabel").textContent = "运行中";

  for (let done = 0; done < settings.count; done += chunkSize) {
    const limit = Math.min(chunkSize, settings.count - done);
    for (let i = 0; i < limit; i += 1) {
      const tournament = simulateTournament(settings, false, rng);
      goals += tournament.totalGoals;
      pens += tournament.penalties;
      thirds += tournament.bestThirds.length;
      tournament.qualified.forEach((team) => counters.get(team.id).r32 += 1);
      tournament.stageWinners.r16.forEach((team) => counters.get(team.id).r16 += 1);
      tournament.stageWinners.qf.forEach((team) => counters.get(team.id).qf += 1);
      tournament.stageWinners.sf.forEach((team) => counters.get(team.id).sf += 1);
      tournament.stageWinners.final.forEach((team) => counters.get(team.id).final += 1);
      counters.get(tournament.champion.id).champion += 1;
    }
    $("#statusLabel").textContent = `${Math.min(done + limit, settings.count).toLocaleString()} / ${settings.count.toLocaleString()}`;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  latestResults = {
    settings,
    counters: [...counters.values()].sort((a, b) => b.champion - a.champion || getTeamRating(b.team) - getTeamRating(a.team)),
    avgGoals: goals / settings.count,
    avgPens: pens / settings.count,
    thirdRate: thirds / (settings.count * 32),
  };
  latestSampleIndex = 0;
  latestSample = simulateTournament(settings, true, createRng(`${settings.seed}:sample:${latestSampleIndex}`));
  $("#runBtn").disabled = false;
  $("#statusLabel").textContent = "已完成";
  renderResults();
}

function renderInitial() {
  renderFocusOptions();
  renderRatingEditor();
  renderDataCoverage();
  renderGroups();
  renderRanking(emptyCounters(), 1);
  renderStageBars(null);
}

function renderFocusOptions() {
  const select = $("#focusTeam");
  select.innerHTML = teams
    .slice()
    .sort((a, b) => getTeamRating(b) - getTeamRating(a))
    .map((team) => `<option value="${team.id}">${team.flag} ${team.name}</option>`)
    .join("");
  select.value = teams.find((team) => team.name === "阿根廷").id;
}

function renderRatingEditor() {
  $("#ratingEditor").innerHTML = teams
    .slice()
    .sort((a, b) => getTeamRating(b) - getTeamRating(a))
    .map((team) => `
      <label class="rating-row">
        <span>${team.flag} ${team.name} <small>${team.group}组 / 模型 ${team.modelRating}</small></span>
        <input type="number" min="1300" max="2200" step="5" value="${getTeamRating(team)}" data-team-rating="${team.id}" />
      </label>
    `)
    .join("");
}

function renderDataCoverage() {
  const avgCoverage = Math.round(teams.reduce((sum, team) => sum + team.coverage, 0) / teams.length);
  const avgReliability = Math.round(teams.reduce((sum, team) => sum + team.reliability.score, 0) / teams.length);
  const reliableFields = teams[0].reliability.reliableCount;
  const proxyFields = teams[0].reliability.proxyCount;
  const avgRating = Math.round(teams.reduce((sum, team) => sum + getTeamRating(team), 0) / teams.length);
  $("#dataCoverage").innerHTML = `
    <div><strong>${avgCoverage}%</strong><span>字段覆盖</span></div>
    <div><strong>${avgReliability}%</strong><span>平均可信度</span></div>
    <div><strong>${reliableFields}/${DATA_FIELDS.length}</strong><span>可核验字段</span></div>
    <div><strong>${proxyFields}</strong><span>代理/人工字段</span></div>
    <div><strong>${factorSources.length}</strong><span>来源类型</span></div>
    <div><strong>${avgRating}</strong><span>平均强度</span></div>
  `;
}

function renderGroups() {
  const groupNames = [...new Set(teams.map((team) => team.group))];
  $("#groupsGrid").innerHTML = groupNames.map((group) => {
    const groupTeams = teams.filter((team) => team.group === group);
    return `
      <article class="group-card">
        <h3>${group}组</h3>
        ${groupTeams.map((team) => {
          const counter = latestResults?.counters.find((item) => item.team.id === team.id);
          const chance = counter ? percent(counter.r32, latestResults.settings.count) : "-";
          return `
            <div class="group-team">
              <span>${team.flag} ${team.name}</span>
              <span class="pill">${chance}</span>
            </div>
          `;
        }).join("")}
      </article>
    `;
  }).join("");
}

function renderRanking(counters, count) {
  const rows = Array.isArray(counters) ? counters : [...counters.values()].sort((a, b) => b.champion - a.champion || getTeamRating(b.team) - getTeamRating(a.team));
  const maxChampion = Math.max(...rows.map((row) => row.champion), 1);
  $("#rankingBody").innerHTML = rows.map((row, index) => {
    const championInterval = probabilityInterval(row.champion, count);
    return `
      <tr>
        <td>${index + 1}</td>
        <td><span class="team-cell">${row.team.flag} ${row.team.name}</span></td>
        <td>${getTeamRating(row.team)}</td>
        <td>
          <span class="prob-cell">
            <span>${percent(row.champion, count)}<small>95% ${championInterval.label}</small></span>
            <span class="spark"><span style="width:${(row.champion / maxChampion) * 100}%"></span></span>
          </span>
        </td>
        <td>${percent(row.final, count)}</td>
        <td>${percent(row.sf, count)}</td>
        <td>${percent(row.qf, count)}</td>
        <td>${percent(row.r32, count)}</td>
      </tr>
    `;
  }).join("");
}

function renderStageBars(counter) {
  const total = latestResults?.settings.count || 1;
  const fallbackTeam = teams.find((team) => team.id === Number($("#focusTeam").value));
  const selected = counter || latestResults?.counters.find((row) => row.team.id === Number($("#focusTeam").value)) || {
    team: fallbackTeam,
    r32: 0,
    r16: 0,
    qf: 0,
    sf: 0,
    final: 0,
    champion: 0,
  };
  const stages = selected ? [
    ["小组出线", selected.r32],
    ["进入16强", selected.r16],
    ["进入8强", selected.qf],
    ["进入4强", selected.sf],
    ["进入决赛", selected.final],
    ["夺得冠军", selected.champion],
  ] : [
    ["小组出线", 0],
    ["进入16强", 0],
    ["进入8强", 0],
    ["进入4强", 0],
    ["进入决赛", 0],
    ["夺得冠军", 0],
  ];

  if (selected) $("#focusTitle").textContent = `${selected.team.flag} ${selected.team.name} 阶段概率`;
  if (selected) renderTeamProfile(selected.team);
  $("#stageBars").innerHTML = stages.map(([label, value]) => {
    const interval = probabilityInterval(value, total);
    return `
      <div class="stage-row">
        <span>${label}</span>
        <span class="bar"><span style="width:${(value / total) * 100}%"></span></span>
        <strong>${percent(value, total)}<small>95% ${interval.label}</small></strong>
      </div>
    `;
  }).join("");
}

function renderTeamProfile(team) {
  const f = team.factors;
  const quality = team.reliability;
  $("#teamProfile").innerHTML = `
    <div class="profile-grid">
      <div><span>FIFA</span><strong>#${f.fifaRank}</strong><small>${f.fifaPoints} 分</small></div>
      <div><span>Elo</span><strong>${f.elo}</strong><small>2026-03-31</small></div>
      <div><span>赔率</span><strong>${f.odds >= 100000 ? "长赔" : `+${f.odds}`}</strong><small>${(oddsProbability(f.odds) * 100).toFixed(1)}%</small></div>
      <div><span>阵容价值</span><strong>€${f.squadValue}m</strong><small>${f.avgAge} 岁</small></div>
      <div><span>伤病风险</span><strong>${f.injuryRisk}</strong><small>越低越好</small></div>
      <div><span>组赛移动</span><strong>${Math.round(f.travelKm / 100) / 10}k km</strong><small>${f.restDays} 天休息</small></div>
      <div><span>入境旅程</span><strong>${Math.round((f.entryTravelKm ?? 0) / 100) / 10}k km</strong><small>${f.entryTimezoneShift ?? 0}h 时区差</small></div>
      <div><span>地理负担</span><strong>${f.timezoneShift ?? 0}h</strong><small>组赛时区 / 环境 ${f.climateLoad ?? 0}</small></div>
    </div>
    <p class="profile-note">名单状态：${f.squadStatus}；公告：${f.squadAnnouncementStatus ?? "待核"}（${f.squadAnnouncementDate ?? "未定"}）。氛围 ${f.atmosphere}/100，俱乐部分布 ${f.clubScore}/100，世界杯路径经验 ${f.wcPath}/100。数据可信度 ${quality.score}%，可核验字段 ${quality.reliableCount}/${quality.total}。</p>
  `;
}

function renderSamplePath() {
  if (!latestSample) {
    $("#samplePath").innerHTML = "<p class='muted'>运行后显示一条随机路径。</p>";
    return;
  }

  $("#samplePath").innerHTML = latestSample.rounds.map((round) => `
    <div class="round-card">
      <h3>${round.name}</h3>
      ${round.matches.map((match) => `
        <div class="match-chip ${round.name === "决赛" ? "winner-chip" : ""}">
          <div>M${match.match} · ${match.venue}</div>
          <div>${match.a.flag} ${match.a.name} ${match.aGoals} - ${match.bGoals} ${match.b.name} ${match.b.flag}</div>
          <small>${match.a.name}: ${match.pathLoads.get(match.a.id).travelKm}km / ${match.pathLoads.get(match.a.id).restDays}天；${match.b.name}: ${match.pathLoads.get(match.b.id).travelKm}km / ${match.pathLoads.get(match.b.id).restDays}天</small>
          <strong>晋级：${match.winner.flag} ${match.winner.name}${match.penalty ? "（点球）" : ""}</strong>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderResults() {
  renderRanking(latestResults.counters, latestResults.settings.count);
  renderGroups();
  renderStageBars();
  renderSamplePath();
  $("#runMeta").textContent = `模拟 ${latestResults.settings.count.toLocaleString()} 次 · seed ${latestResults.settings.seed}`;
  $("#avgGoals").textContent = latestResults.avgGoals.toFixed(2);
  $("#avgPens").textContent = latestResults.avgPens.toFixed(2);
  $("#thirdRate").textContent = `${(latestResults.thirdRate * 100).toFixed(1)}%`;
}

function syncControlLabels() {
  $("#randomnessValue").textContent = Number($("#randomness").value).toFixed(2);
  $("#hostValue").textContent = $("#hostBoost").value;
  $("#penaltyValue").textContent = Number($("#penaltyWeight").value).toFixed(2);
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: currentSettings(), teams }));
  $("#statusLabel").textContent = "已保存";
}

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    $("#statusLabel").textContent = "无保存";
    return;
  }
  const parsed = JSON.parse(stored);
  teams = createTeams(parsed.teams || []);
  $("#simCount").value = parsed.settings.count;
  $("#seedInput").value = parsed.settings.seed || "2026-world-cup";
  $("#randomness").value = parsed.settings.randomness;
  $("#hostBoost").value = parsed.settings.hostBoost;
  $("#penaltyWeight").value = parsed.settings.penaltyWeight;
  syncControlLabels();
  renderInitial();
  $("#statusLabel").textContent = "已加载";
}

function resetSettings() {
  teams = createTeams();
  latestResults = null;
  latestSample = null;
  latestSampleIndex = 0;
  $("#simCount").value = 100000;
  $("#seedInput").value = "2026-world-cup";
  $("#randomness").value = 1;
  $("#hostBoost").value = 80;
  $("#penaltyWeight").value = 0.65;
  syncControlLabels();
  renderInitial();
  $("#runMeta").textContent = "尚未模拟";
  $("#avgGoals").textContent = "-";
  $("#avgPens").textContent = "-";
  $("#thirdRate").textContent = "-";
  $("#samplePath").innerHTML = "<p class='muted'>运行后显示一条随机路径。</p>";
  $("#statusLabel").textContent = "已重置";
}

function exportCsv() {
  if (!latestResults) return;
  const stages = [
    ["champion", "champion"],
    ["final", "final"],
    ["semi", "sf"],
    ["quarter", "qf"],
    ["qualified", "r32"],
  ];
  const probabilityHeaders = stages.flatMap(([label]) => [
    label,
    `${label}_ci95_low`,
    `${label}_ci95_high`,
  ]);
  const lines = [[
    "rank",
    "team",
    "group",
    "simulation_seed",
    "simulation_count",
    "model_rating",
    "data_quality",
    "source_backed_fields",
    "proxy_fields",
    "fifa_rank",
    "fifa_points",
    "elo",
    "form",
    "wc_path",
    "odds",
    "squad_status",
    "squad_value_m",
    "avg_age",
    "injury_risk",
    "club_score",
    "atmosphere",
    "travel_km",
    "rest_days",
    ...probabilityHeaders,
  ].join(",")];
  latestResults.counters.forEach((row, index) => {
    const total = latestResults.settings.count;
    const stageValues = stages.flatMap(([, key]) => {
      const interval = probabilityInterval(row[key], total);
      return [
        interval.rate.toFixed(5),
        interval.lower.toFixed(5),
        interval.upper.toFixed(5),
      ];
    });
    lines.push([
      index + 1,
      row.team.en,
      row.team.group,
      latestResults.settings.seed,
      total,
      getTeamRating(row.team),
      row.team.reliability.score,
      row.team.reliability.reliableCount,
      row.team.reliability.proxyCount,
      row.team.factors.fifaRank,
      row.team.factors.fifaPoints,
      row.team.factors.elo,
      row.team.factors.form,
      row.team.factors.wcPath,
      row.team.factors.odds,
      row.team.factors.squadStatus,
      row.team.factors.squadValue,
      row.team.factors.avgAge,
      row.team.factors.injuryRisk,
      row.team.factors.clubScore,
      row.team.factors.atmosphere,
      row.team.factors.travelKm,
      row.team.factors.restDays,
      ...stageValues,
    ].map(csvCell).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "world-cup-2026-simulation.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("input", (event) => {
  if (event.target.matches("#randomness, #hostBoost, #penaltyWeight")) syncControlLabels();
  if (event.target.matches("[data-team-rating]")) {
    const team = teams.find((item) => item.id === Number(event.target.dataset.teamRating));
    team.manualRating = Number(event.target.value);
    latestResults = null;
    renderDataCoverage();
    renderGroups();
  }
});

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-count]")) $("#simCount").value = event.target.dataset.count;
});

$("#runBtn").addEventListener("click", runSimulation);
$("#saveBtn").addEventListener("click", saveSettings);
$("#loadBtn").addEventListener("click", loadSettings);
$("#resetBtn").addEventListener("click", resetSettings);
$("#exportBtn").addEventListener("click", exportCsv);
$("#sampleBtn").addEventListener("click", () => {
  latestSampleIndex += 1;
  const settings = latestResults?.settings || currentSettings();
  latestSample = simulateTournament(settings, true, createRng(`${settings.seed}:sample:${latestSampleIndex}`));
  renderSamplePath();
});
$("#focusTeam").addEventListener("change", () => renderStageBars());

syncControlLabels();
renderInitial();
