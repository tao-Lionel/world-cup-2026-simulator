const STORAGE_KEY = "world-cup-2026-sim-settings";

const SHOOTING_SCENES = [
  { id: "ranking", label: "夺冠概率榜" },
  { id: "group", label: "死亡小组" },
  { id: "team", label: "球队体检" },
  { id: "data", label: "数据可信度" },
];

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
  { label: "FIFA 排名", value: "2026-06-11 官方快照" },
  { label: "Elo", value: "2026-06-12 快照" },
  { label: "赔率", value: "2026-06-12 市场快照" },
  { label: "阵容", value: "FIFA 最终名单 2026-06-12" },
  { label: "赛程", value: "旅行/休息/时区/天气 2026-06-12" },
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
  { key: "fifaRank", label: "FIFA 排名", tier: "verified", source: "FIFA/Coca-Cola ranking 2026-06-11" },
  { key: "fifaPoints", label: "FIFA 积分", tier: "verified", source: "FIFA/Coca-Cola ranking 2026-06-11" },
  { key: "odds", label: "夺冠赔率", tier: "market", source: "BetMGM (power de-vig) + Polymarket consensus 2026-06-12" },
  { key: "elo", label: "Elo 强度", tier: "snapshot", source: "International-football.net / eloratings.net 2026-06-12" },
  { key: "form", label: "近两年战绩", tier: "snapshot", source: "International-football.net last games through 2026-06-12" },
  { key: "wcPath", label: "历史路径难度", tier: "research", source: "Football365 records + champion path summary" },
  { key: "squadValue", label: "阵容身价", tier: "snapshot", source: "Transfermarkt team/player market values 2026-06-12" },
  { key: "avgAge", label: "平均年龄", tier: "snapshot", source: "FIFA final squad player ages 2026-06-12" },
  { key: "injuryRisk", label: "伤病风险", tier: "snapshot", source: "player availability watchlist 2026-06-12 + health proxy" },
  { key: "clubScore", label: "俱乐部分布", tier: "proxy", source: "顶级联赛集中度代理" },
  { key: "atmosphere", label: "球队氛围", tier: "manual", source: "structured context snapshot 2026-06-12" },
  { key: "travelKm", label: "小组赛场馆移动", tier: "snapshot", source: "FIFA schedule + venue coordinates" },
  { key: "restDays", label: "小组赛休息天数", tier: "snapshot", source: "FIFA schedule dates" },
  { key: "timezoneShift", label: "组赛时区跨度", tier: "snapshot", source: "venue UTC offsets" },
  { key: "entryTravelKm", label: "入境旅行距离", tier: "snapshot", source: "team origins + first venue coordinates" },
  { key: "entryTimezoneShift", label: "入境时区差", tier: "snapshot", source: "origin UTC offset + first venue UTC offset" },
  { key: "borderCrossings", label: "组赛跨境次数", tier: "snapshot", source: "venue country sequence" },
  { key: "altitudeLoad", label: "最高场馆海拔", tier: "snapshot", source: "venue altitude snapshot" },
  { key: "climateLoad", label: "比赛日天气/场馆环境负担", tier: "snapshot", source: "Open-Meteo forecast + venue baseline 2026-06-12" },
  { key: "squadAnnouncementStatus", label: "名单公告状态", tier: "snapshot", source: "federation/FIFA squad announcement tracker" },
  { key: "squadAnnouncementDate", label: "名单公告日期", tier: "snapshot", source: "federation/FIFA squad announcement tracker" },
  { key: "squadStatus", label: "名单状态", tier: "snapshot", source: "FIFA final squad lists + Wikipedia squad tracker 2026-06-12" },
];

const teamFactors = {
  Mexico: { fifaRank: 14, fifaPoints: 1687, elo: 1875, form: 71, wcPath: 58, odds: 8301, squadValue: 192, avgAge: 27.5, injuryRisk: 22, clubScore: 60, atmosphere: 62, travelKm: 952, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 2240, climateLoad: 48, entryTravelKm: 15, entryTimezoneShift: 0, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "South Africa": { fifaRank: 60, fifaPoints: 1428, elo: 1528, form: 64, wcPath: 27, odds: 203025, squadValue: 49, avgAge: 26.3, injuryRisk: 22, clubScore: 55, atmosphere: 56, travelKm: 3943, restDays: 6.5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 2240, climateLoad: 49, entryTravelKm: 14582, entryTimezoneShift: 8, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Korea Republic": { fifaRank: 25, fifaPoints: 1592, elo: 1758, form: 66, wcPath: 60, odds: 35145, squadValue: 139, avgAge: 27.5, injuryRisk: 22, clubScore: 64, atmosphere: 58, travelKm: 645, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 1566, climateLoad: 41, entryTravelKm: 11663, entryTimezoneShift: 15, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Czechia: { fifaRank: 40, fifaPoints: 1506, elo: 1740, form: 68, wcPath: 63, odds: 58418, squadValue: 188, avgAge: 27.2, injuryRisk: 22, clubScore: 63, atmosphere: 59, travelKm: 4544, restDays: 6.5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 2240, climateLoad: 45, entryTravelKm: 10072, entryTimezoneShift: 8, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Canada: { fifaRank: 30, fifaPoints: 1559, elo: 1788, form: 64, wcPath: 27, odds: 26943, squadValue: 199, avgAge: 26.5, injuryRisk: 22, clubScore: 72, atmosphere: 59, travelKm: 3357, restDays: 6, timezoneShift: 3, borderCrossings: 0, altitudeLoad: 76, climateLoad: 15, entryTravelKm: 4, entryTimezoneShift: 0, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Bosnia and Herzegovina": { fifaRank: 64, fifaPoints: 1387, elo: 1595, form: 62, wcPath: 27, odds: 53292, squadValue: 152, avgAge: 26, injuryRisk: 22, clubScore: 68, atmosphere: 55, travelKm: 5058, restDays: 6, timezoneShift: 3, borderCrossings: 1, altitudeLoad: 76, climateLoad: 17, entryTravelKm: 7337, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Qatar: { fifaRank: 56, fifaPoints: 1450, elo: 1421, form: 49, wcPath: 26, odds: 203025, squadValue: 20, avgAge: 28.9, injuryRisk: 22, clubScore: 44, atmosphere: 48, travelKm: 1519, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 13, climateLoad: 18, entryTravelKm: 13011, entryTimezoneShift: 10, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Switzerland: { fifaRank: 19, fifaPoints: 1650, elo: 1891, form: 68, wcPath: 59, odds: 8656, squadValue: 333, avgAge: 27.8, injuryRisk: 22, clubScore: 86, atmosphere: 60, travelKm: 2253, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 20, entryTravelKm: 9372, entryTimezoneShift: 9, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Brazil: { fifaRank: 6, fifaPoints: 1766, elo: 1991, form: 69, wcPath: 98, odds: 1065, squadValue: 928, avgAge: 28.8, injuryRisk: 22, clubScore: 80, atmosphere: 62, travelKm: 1758, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 12, climateLoad: 38, entryTravelKm: 7772, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Morocco: { fifaRank: 7, fifaPoints: 1755, elo: 1824, form: 71, wcPath: 61, odds: 6188, squadValue: 448, avgAge: 26.1, injuryRisk: 22, clubScore: 75, atmosphere: 59, travelKm: 1750, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 320, climateLoad: 34, entryTravelKm: 5840, entryTimezoneShift: 5, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Haiti: { fifaRank: 83, fifaPoints: 1293, elo: 1548, form: 62, wcPath: 17, odds: 300311, squadValue: 56, avgAge: 27, injuryRisk: 22, clubScore: 64, atmosphere: 55, travelKm: 1476, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 320, climateLoad: 34, entryTravelKm: 2615, entryTimezoneShift: 0, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Scotland: { fifaRank: 42, fifaPoints: 1503, elo: 1782, form: 68, wcPath: 27, odds: 42361, squadValue: 170, avgAge: 28.7, injuryRisk: 22, clubScore: 78, atmosphere: 55, travelKm: 1973, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 35, entryTravelKm: 4910, entryTimezoneShift: 5, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  USA: { fifaRank: 17, fifaPoints: 1671, elo: 1726, form: 61, wcPath: 61, odds: 7056, squadValue: 386, avgAge: 26.4, injuryRisk: 21, clubScore: 77, atmosphere: 60, travelKm: 3106, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 17, entryTravelKm: 3948, entryTimezoneShift: 3, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Paraguay: { fifaRank: 41, fifaPoints: 1505, elo: 1833, form: 60, wcPath: 45, odds: 36484, squadValue: 154, avgAge: 28.5, injuryRisk: 22, clubScore: 69, atmosphere: 56, travelKm: 505, restDays: 6.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 21, entryTravelKm: 9190, entryTimezoneShift: 3, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Australia: { fifaRank: 27, fifaPoints: 1579, elo: 1777, form: 62, wcPath: 46, odds: 79204, squadValue: 77, avgAge: 26.9, injuryRisk: 22, clubScore: 69, atmosphere: 57, travelKm: 1329, restDays: 6, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 13, climateLoad: 17, entryTravelKm: 12502, entryTimezoneShift: 17, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Türkiye": { fifaRank: 22, fifaPoints: 1606, elo: 1911, form: 76, wcPath: 48, odds: 9926, squadValue: 474, avgAge: 27.2, injuryRisk: 22, clubScore: 65, atmosphere: 62, travelKm: 1828, restDays: 6, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 16, entryTravelKm: 9611, entryTimezoneShift: 10, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Germany: { fifaRank: 10, fifaPoints: 1736, elo: 1932, form: 79, wcPath: 98, odds: 1888, squadValue: 947, avgAge: 27.6, injuryRisk: 29, clubScore: 88, atmosphere: 65, travelKm: 2640, restDays: 5.5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 76, climateLoad: 31, entryTravelKm: 8435, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Curacao: { fifaRank: 82, fifaPoints: 1295, elo: 1434, form: 60, wcPath: 13, odds: 300311, squadValue: 26, avgAge: 27.5, injuryRisk: 22, clubScore: 68, atmosphere: 54, travelKm: 2702, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 264, climateLoad: 48, entryTravelKm: 3362, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Cote d'Ivoire": { fifaRank: 33, fifaPoints: 1541, elo: 1695, form: 72, wcPath: 29, odds: 31592, squadValue: 522, avgAge: 25.3, injuryRisk: 22, clubScore: 72, atmosphere: 58, travelKm: 1089, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 76, climateLoad: 31, entryTravelKm: 8022, entryTimezoneShift: 4, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Ecuador: { fifaRank: 23, fifaPoints: 1599, elo: 1935, form: 63, wcPath: 43, odds: 10998, squadValue: 369, avgAge: 25.6, injuryRisk: 22, clubScore: 68, atmosphere: 55, travelKm: 3405, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 264, climateLoad: 43, entryTravelKm: 4469, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Netherlands: { fifaRank: 8, fifaPoints: 1754, elo: 1944, form: 70, wcPath: 86, odds: 2461, squadValue: 754, avgAge: 27.3, injuryRisk: 22, clubScore: 89, atmosphere: 65, travelKm: 1421, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 264, climateLoad: 59, entryTravelKm: 7921, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Japan: { fifaRank: 18, fifaPoints: 1662, elo: 1906, form: 72, wcPath: 48, odds: 5955, squadValue: 271, avgAge: 26.9, injuryRisk: 29, clubScore: 76, atmosphere: 58, travelKm: 1689, restDays: 5.5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 540, climateLoad: 61, entryTravelKm: 10385, entryTimezoneShift: 14, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Sweden: { fifaRank: 38, fifaPoints: 1510, elo: 1712, form: 52, wcPath: 66, odds: 15053, squadValue: 406, avgAge: 27, injuryRisk: 22, clubScore: 80, atmosphere: 54, travelKm: 1029, restDays: 5.5, timezoneShift: 1, borderCrossings: 1, altitudeLoad: 540, climateLoad: 62, entryTravelKm: 9019, entryTimezoneShift: 8, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Tunisia: { fifaRank: 45, fifaPoints: 1476, elo: 1628, form: 61, wcPath: 34, odds: 128300, squadValue: 70, avgAge: 26.2, injuryRisk: 22, clubScore: 65, atmosphere: 56, travelKm: 1582, restDays: 5.5, timezoneShift: 1, borderCrossings: 1, altitudeLoad: 540, climateLoad: 59, entryTravelKm: 9959, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Belgium: { fifaRank: 9, fifaPoints: 1742, elo: 1893, form: 76, wcPath: 64, odds: 4841, squadValue: 548, avgAge: 27.1, injuryRisk: 22, clubScore: 82, atmosphere: 64, travelKm: 3302, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 20, entryTravelKm: 7944, entryTimezoneShift: 9, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Egypt: { fifaRank: 29, fifaPoints: 1562, elo: 1696, form: 66, wcPath: 33, odds: 42361, squadValue: 116, avgAge: 28.7, injuryRisk: 22, clubScore: 58, atmosphere: 55, travelKm: 391, restDays: 5.5, timezoneShift: 0, borderCrossings: 2, altitudeLoad: 13, climateLoad: 19, entryTravelKm: 10986, entryTimezoneShift: 10, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "IR Iran": { fifaRank: 20, fifaPoints: 1620, elo: 1772, form: 63, wcPath: 33, odds: 79204, squadValue: 32, avgAge: 29.8, injuryRisk: 22, clubScore: 50, atmosphere: 53, travelKm: 1553, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 38, climateLoad: 18, entryTravelKm: 12198, entryTimezoneShift: 10.5, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "New Zealand": { fifaRank: 85, fifaPoints: 1276, elo: 1562, form: 46, wcPath: 23, odds: 203025, squadValue: 34, avgAge: 27.6, injuryRisk: 22, clubScore: 64, atmosphere: 49, travelKm: 1749, restDays: 5.5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 38, climateLoad: 15, entryTravelKm: 10483, entryTimezoneShift: 19, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Spain: { fifaRank: 2, fifaPoints: 1875, elo: 2155, form: 73, wcPath: 92, odds: 531, squadValue: 1220, avgAge: 26.2, injuryRisk: 22, clubScore: 92, atmosphere: 66, travelKm: 2373, restDays: 5.5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 1566, climateLoad: 46, entryTravelKm: 6944, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Cabo Verde": { fifaRank: 67, fifaPoints: 1371, elo: 1578, form: 68, wcPath: 13, odds: 203025, squadValue: 55, avgAge: 29.2, injuryRisk: 22, clubScore: 61, atmosphere: 53, travelKm: 2502, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 320, climateLoad: 54, entryTravelKm: 6418, entryTimezoneShift: 3, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Saudi Arabia": { fifaRank: 61, fifaPoints: 1424, elo: 1569, form: 58, wcPath: 42, odds: 203025, squadValue: 41, avgAge: 28, injuryRisk: 22, clubScore: 57, atmosphere: 54, travelKm: 2090, restDays: 5.5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 320, climateLoad: 60, entryTravelKm: 11999, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Uruguay: { fifaRank: 16, fifaPoints: 1673, elo: 1892, form: 62, wcPath: 98, odds: 8820, squadValue: 359, avgAge: 28.2, injuryRisk: 22, clubScore: 73, atmosphere: 62, travelKm: 2439, restDays: 5.5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 1566, climateLoad: 61, entryTravelKm: 7226, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  France: { fifaRank: 3, fifaPoints: 1871, elo: 2062, form: 75, wcPath: 98, odds: 549, squadValue: 1520, avgAge: 26.6, injuryRisk: 22, clubScore: 85, atmosphere: 67, travelKm: 545, restDays: 5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 25, entryTravelKm: 5835, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Senegal: { fifaRank: 15, fifaPoints: 1684, elo: 1867, form: 75, wcPath: 53, odds: 12329, squadValue: 478, avgAge: 26.6, injuryRisk: 22, clubScore: 80, atmosphere: 63, travelKm: 540, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 76, climateLoad: 28, entryTravelKm: 6152, entryTimezoneShift: 4, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Iraq: { fifaRank: 57, fifaPoints: 1446, elo: 1618, form: 65, wcPath: 18, odds: 203025, squadValue: 21, avgAge: 26.4, injuryRisk: 22, clubScore: 55, atmosphere: 56, travelKm: 953, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 88, climateLoad: 27, entryTravelKm: 9370, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Norway: { fifaRank: 31, fifaPoints: 1557, elo: 1917, form: 73, wcPath: 32, odds: 3788, squadValue: 590, avgAge: 26.3, injuryRisk: 22, clubScore: 83, atmosphere: 62, travelKm: 548, restDays: 5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 88, climateLoad: 23, entryTravelKm: 5652, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Argentina: { fifaRank: 1, fifaPoints: 1877, elo: 2114, form: 77, wcPath: 98, odds: 1045, squadValue: 808, avgAge: 28.7, injuryRisk: 29, clubScore: 84, atmosphere: 63, travelKm: 739, restDays: 5.5, timezoneShift: 0, borderCrossings: 0, altitudeLoad: 264, climateLoad: 49, entryTravelKm: 8992, entryTimezoneShift: 2, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Algeria: { fifaRank: 28, fifaPoints: 1571, elo: 1760, form: 73, wcPath: 36, odds: 53292, squadValue: 257, avgAge: 26.5, injuryRisk: 22, clubScore: 69, atmosphere: 60, travelKm: 4798, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 264, climateLoad: 33, entryTravelKm: 8098, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Austria: { fifaRank: 24, fifaPoints: 1597, elo: 1830, form: 76, wcPath: 49, odds: 18776, squadValue: 245, avgAge: 28.2, injuryRisk: 22, clubScore: 80, atmosphere: 63, travelKm: 3054, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 264, climateLoad: 45, entryTravelKm: 9642, entryTimezoneShift: 9, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Jordan: { fifaRank: 63, fifaPoints: 1388, elo: 1685, form: 64, wcPath: 13, odds: 203025, squadValue: 20, avgAge: 28.1, injuryRisk: 22, clubScore: 51, atmosphere: 55, travelKm: 2315, restDays: 5.5, timezoneShift: 2, borderCrossings: 0, altitudeLoad: 184, climateLoad: 34, entryTravelKm: 11968, entryTimezoneShift: 10, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Portugal: { fifaRank: 5, fifaPoints: 1768, elo: 1986, form: 70, wcPath: 65, odds: 975, squadValue: 1010, avgAge: 27.5, injuryRisk: 22, clubScore: 81, atmosphere: 59, travelKm: 1547, restDays: 5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 13, climateLoad: 59, entryTravelKm: 7703, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  "Congo DR": { fifaRank: 46, fifaPoints: 1474, elo: 1661, form: 70, wcPath: 17, odds: 93550, squadValue: 144, avgAge: 28.5, injuryRisk: 22, clubScore: 70, atmosphere: 57, travelKm: 3660, restDays: 5, timezoneShift: 2, borderCrossings: 2, altitudeLoad: 1566, climateLoad: 46, entryTravelKm: 12246, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Uzbekistan: { fifaRank: 50, fifaPoints: 1459, elo: 1718, form: 65, wcPath: 13, odds: 203025, squadValue: 85, avgAge: 28, injuryRisk: 22, clubScore: 52, atmosphere: 55, travelKm: 2349, restDays: 5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 2240, climateLoad: 52, entryTravelKm: 13171, entryTimezoneShift: 11, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Colombia: { fifaRank: 13, fifaPoints: 1698, elo: 1977, form: 69, wcPath: 47, odds: 5406, squadValue: 302, avgAge: 29.6, injuryRisk: 22, clubScore: 74, atmosphere: 55, travelKm: 2915, restDays: 5, timezoneShift: 2, borderCrossings: 1, altitudeLoad: 2240, climateLoad: 58, entryTravelKm: 3166, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  England: { fifaRank: 4, fifaPoints: 1828, elo: 2021, form: 72, wcPath: 94, odds: 853, squadValue: 1360, avgAge: 26.6, injuryRisk: 22, clubScore: 93, atmosphere: 66, travelKm: 2768, restDays: 5, timezoneShift: 1, borderCrossings: 0, altitudeLoad: 184, climateLoad: 37, entryTravelKm: 7662, entryTimezoneShift: 6, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Croatia: { fifaRank: 11, fifaPoints: 1715, elo: 1908, form: 70, wcPath: 76, odds: 10998, squadValue: 387, avgAge: 27.9, injuryRisk: 22, clubScore: 81, atmosphere: 63, travelKm: 2500, restDays: 5, timezoneShift: 1, borderCrossings: 2, altitudeLoad: 184, climateLoad: 37, entryTravelKm: 8996, entryTimezoneShift: 7, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Ghana: { fifaRank: 73, fifaPoints: 1347, elo: 1510, form: 54, wcPath: 48, odds: 53292, squadValue: 235, avgAge: 26.4, injuryRisk: 22, clubScore: 76, atmosphere: 52, travelKm: 1094, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 88, climateLoad: 26, entryTravelKm: 8712, entryTimezoneShift: 4, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
  Panama: { fifaRank: 34, fifaPoints: 1539, elo: 1730, form: 62, wcPath: 23, odds: 203025, squadValue: 35, avgAge: 30, injuryRisk: 22, clubScore: 53, atmosphere: 52, travelKm: 540, restDays: 5, timezoneShift: 0, borderCrossings: 1, altitudeLoad: 76, climateLoad: 24, entryTravelKm: 3853, entryTimezoneShift: 1, squadAnnouncementStatus: "FIFA最终名单", squadAnnouncementDate: "2026-06-02", squadStatus: "26人官方最终名单" },
};

const MODEL_WEIGHTS = {
  fifa: 0.22,
  elo: 0.17,
  odds: 0.06,
  form: 0.01,
  squad: 0.44,
  wcPath: 0.01,
  health: 0.05,
  club: 0.01,
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

const GROUP_SCHEDULE = [
  { date: "2026-06-11", group: "A", a: "Mexico", b: "South Africa", venue: "Mexico City Stadium" },
  { date: "2026-06-11", group: "A", a: "Korea Republic", b: "Czechia", venue: "Estadio Guadalajara" },
  { date: "2026-06-12", group: "B", a: "Canada", b: "Bosnia and Herzegovina", venue: "Toronto Stadium" },
  { date: "2026-06-12", group: "D", a: "USA", b: "Paraguay", venue: "Los Angeles Stadium" },
  { date: "2026-06-13", group: "C", a: "Haiti", b: "Scotland", venue: "Boston Stadium" },
  { date: "2026-06-13", group: "D", a: "Australia", b: "Türkiye", venue: "BC Place Vancouver" },
  { date: "2026-06-13", group: "C", a: "Brazil", b: "Morocco", venue: "New York New Jersey Stadium" },
  { date: "2026-06-13", group: "B", a: "Qatar", b: "Switzerland", venue: "San Francisco Bay Area Stadium" },
  { date: "2026-06-14", group: "E", a: "Cote d'Ivoire", b: "Ecuador", venue: "Philadelphia Stadium" },
  { date: "2026-06-14", group: "E", a: "Germany", b: "Curacao", venue: "Houston Stadium" },
  { date: "2026-06-14", group: "F", a: "Netherlands", b: "Japan", venue: "Dallas Stadium" },
  { date: "2026-06-14", group: "F", a: "Sweden", b: "Tunisia", venue: "Estadio Monterrey" },
  { date: "2026-06-15", group: "H", a: "Saudi Arabia", b: "Uruguay", venue: "Miami Stadium" },
  { date: "2026-06-15", group: "H", a: "Spain", b: "Cabo Verde", venue: "Atlanta Stadium" },
  { date: "2026-06-15", group: "G", a: "IR Iran", b: "New Zealand", venue: "Los Angeles Stadium" },
  { date: "2026-06-15", group: "G", a: "Belgium", b: "Egypt", venue: "Seattle Stadium" },
  { date: "2026-06-16", group: "I", a: "France", b: "Senegal", venue: "New York New Jersey Stadium" },
  { date: "2026-06-16", group: "I", a: "Iraq", b: "Norway", venue: "Boston Stadium" },
  { date: "2026-06-16", group: "J", a: "Argentina", b: "Algeria", venue: "Kansas City Stadium" },
  { date: "2026-06-16", group: "J", a: "Austria", b: "Jordan", venue: "San Francisco Bay Area Stadium" },
  { date: "2026-06-17", group: "L", a: "Ghana", b: "Panama", venue: "Toronto Stadium" },
  { date: "2026-06-17", group: "L", a: "England", b: "Croatia", venue: "Dallas Stadium" },
  { date: "2026-06-17", group: "K", a: "Portugal", b: "Congo DR", venue: "Houston Stadium" },
  { date: "2026-06-17", group: "K", a: "Uzbekistan", b: "Colombia", venue: "Mexico City Stadium" },
  { date: "2026-06-18", group: "A", a: "Czechia", b: "South Africa", venue: "Atlanta Stadium" },
  { date: "2026-06-18", group: "B", a: "Switzerland", b: "Bosnia and Herzegovina", venue: "Los Angeles Stadium" },
  { date: "2026-06-18", group: "B", a: "Canada", b: "Qatar", venue: "BC Place Vancouver" },
  { date: "2026-06-18", group: "A", a: "Mexico", b: "Korea Republic", venue: "Estadio Guadalajara" },
  { date: "2026-06-19", group: "C", a: "Brazil", b: "Haiti", venue: "Philadelphia Stadium" },
  { date: "2026-06-19", group: "C", a: "Scotland", b: "Morocco", venue: "Boston Stadium" },
  { date: "2026-06-19", group: "D", a: "Türkiye", b: "Paraguay", venue: "San Francisco Bay Area Stadium" },
  { date: "2026-06-19", group: "D", a: "USA", b: "Australia", venue: "Seattle Stadium" },
  { date: "2026-06-20", group: "E", a: "Germany", b: "Cote d'Ivoire", venue: "Toronto Stadium" },
  { date: "2026-06-20", group: "E", a: "Ecuador", b: "Curacao", venue: "Kansas City Stadium" },
  { date: "2026-06-20", group: "F", a: "Netherlands", b: "Sweden", venue: "Houston Stadium" },
  { date: "2026-06-20", group: "F", a: "Tunisia", b: "Japan", venue: "Estadio Monterrey" },
  { date: "2026-06-21", group: "H", a: "Uruguay", b: "Cabo Verde", venue: "Miami Stadium" },
  { date: "2026-06-21", group: "H", a: "Spain", b: "Saudi Arabia", venue: "Atlanta Stadium" },
  { date: "2026-06-21", group: "G", a: "Belgium", b: "IR Iran", venue: "Los Angeles Stadium" },
  { date: "2026-06-21", group: "G", a: "New Zealand", b: "Egypt", venue: "BC Place Vancouver" },
  { date: "2026-06-22", group: "I", a: "Norway", b: "Senegal", venue: "New York New Jersey Stadium" },
  { date: "2026-06-22", group: "I", a: "France", b: "Iraq", venue: "Philadelphia Stadium" },
  { date: "2026-06-22", group: "J", a: "Argentina", b: "Austria", venue: "Dallas Stadium" },
  { date: "2026-06-22", group: "J", a: "Jordan", b: "Algeria", venue: "San Francisco Bay Area Stadium" },
  { date: "2026-06-23", group: "L", a: "England", b: "Ghana", venue: "Boston Stadium" },
  { date: "2026-06-23", group: "L", a: "Panama", b: "Croatia", venue: "Toronto Stadium" },
  { date: "2026-06-23", group: "K", a: "Portugal", b: "Uzbekistan", venue: "Houston Stadium" },
  { date: "2026-06-23", group: "K", a: "Colombia", b: "Congo DR", venue: "Estadio Guadalajara" },
  { date: "2026-06-24", group: "C", a: "Scotland", b: "Brazil", venue: "Miami Stadium" },
  { date: "2026-06-24", group: "C", a: "Morocco", b: "Haiti", venue: "Atlanta Stadium" },
  { date: "2026-06-24", group: "B", a: "Switzerland", b: "Canada", venue: "BC Place Vancouver" },
  { date: "2026-06-24", group: "B", a: "Bosnia and Herzegovina", b: "Qatar", venue: "Seattle Stadium" },
  { date: "2026-06-24", group: "A", a: "Czechia", b: "Mexico", venue: "Mexico City Stadium" },
  { date: "2026-06-24", group: "A", a: "South Africa", b: "Korea Republic", venue: "Estadio Monterrey" },
  { date: "2026-06-25", group: "E", a: "Curacao", b: "Cote d'Ivoire", venue: "Philadelphia Stadium" },
  { date: "2026-06-25", group: "E", a: "Ecuador", b: "Germany", venue: "New York New Jersey Stadium" },
  { date: "2026-06-25", group: "F", a: "Japan", b: "Sweden", venue: "Dallas Stadium" },
  { date: "2026-06-25", group: "F", a: "Tunisia", b: "Netherlands", venue: "Kansas City Stadium" },
  { date: "2026-06-25", group: "D", a: "Türkiye", b: "USA", venue: "Los Angeles Stadium" },
  { date: "2026-06-25", group: "D", a: "Paraguay", b: "Australia", venue: "San Francisco Bay Area Stadium" },
  { date: "2026-06-26", group: "I", a: "Norway", b: "France", venue: "Boston Stadium" },
  { date: "2026-06-26", group: "I", a: "Senegal", b: "Iraq", venue: "Toronto Stadium" },
  { date: "2026-06-26", group: "G", a: "Egypt", b: "IR Iran", venue: "Seattle Stadium" },
  { date: "2026-06-26", group: "G", a: "New Zealand", b: "Belgium", venue: "BC Place Vancouver" },
  { date: "2026-06-26", group: "H", a: "Cabo Verde", b: "Saudi Arabia", venue: "Houston Stadium" },
  { date: "2026-06-26", group: "H", a: "Uruguay", b: "Spain", venue: "Estadio Guadalajara" },
  { date: "2026-06-27", group: "L", a: "Panama", b: "England", venue: "New York New Jersey Stadium" },
  { date: "2026-06-27", group: "L", a: "Croatia", b: "Ghana", venue: "Philadelphia Stadium" },
  { date: "2026-06-27", group: "J", a: "Algeria", b: "Austria", venue: "Kansas City Stadium" },
  { date: "2026-06-27", group: "J", a: "Jordan", b: "Argentina", venue: "Dallas Stadium" },
  { date: "2026-06-27", group: "K", a: "Colombia", b: "Portugal", venue: "Miami Stadium" },
  { date: "2026-06-27", group: "K", a: "Congo DR", b: "Uzbekistan", venue: "Atlanta Stadium" },
];

function teamGroupSchedule(team) {
  return GROUP_SCHEDULE.filter((m) => m.a === team.en || m.b === team.en).map((m) => {
    const isHome = m.a === team.en;
    const opponent = teams.find((t) => t.en === (isHome ? m.b : m.a));
    return { date: m.date, venue: m.venue, opponent, isHome };
  });
}

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
let toastTimer = null;
let resultsAreStale = false;
let lastDrawerTrigger = null;
let shootingMode = false;
let shootingVariantIndex = 0;
let latestMatchPrediction = null;
let latestSportterySlipText = "";
let sportterySlipOnlyBettable = true;

const $ = (selector) => document.querySelector(selector);
const squadRows = Array.isArray(globalThis.SQUAD_ROWS) ? globalThis.SQUAD_ROWS : [];
const sportteryOddsSnapshot = globalThis.SPORTTERY_FOOTBALL_ODDS_SNAPSHOT || { matches: [] };

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

function formatValue(value) {
  if (!Number.isFinite(value)) return "-";
  return value >= 100 ? `€${Math.round(value)}m` : `€${value.toFixed(1)}m`;
}

function squadForTeam(team) {
  return squadRows
    .filter((player) => player.team === team.en)
    .slice()
    .sort((a, b) => a.slot - b.slot);
}

function roleLabel(role) {
  return {
    starter: "主力",
    rotation: "轮换",
    squad: "替补",
  }[role] || role || "-";
}

function availabilityLabel(status) {
  return {
    available: "可出战",
    doubtful: "待观察",
    out: "缺席",
    suspended: "停赛",
    unknown: "未确认",
  }[status] || status || "未确认";
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
  const favoriteBoost = settings.favoriteBoosts?.get?.(team.id) || 0;
  return getTeamRating(team) + (team.host ? settings.hostBoost : 0) + favoriteBoost;
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

function simulateMatchPrediction(a, b, settings, rng = Math.random) {
  const count = settings.count;
  const scoreCounts = new Map();
  let aWins = 0;
  let draws = 0;
  let bWins = 0;
  let aGoals = 0;
  let bGoals = 0;

  for (let index = 0; index < count; index += 1) {
    const result = simulateMatch(a, b, settings, false, null, null, rng);
    if (result.aGoals > result.bGoals) aWins += 1;
    else if (result.bGoals > result.aGoals) bWins += 1;
    else draws += 1;
    aGoals += result.aGoals;
    bGoals += result.bGoals;
    const score = `${result.aGoals}-${result.bGoals}`;
    scoreCounts.set(score, (scoreCounts.get(score) || 0) + 1);
  }

  return {
    a,
    b,
    settings,
    count,
    aWins,
    draws,
    bWins,
    avgAGoals: aGoals / count,
    avgBGoals: bGoals / count,
    scores: [...scoreCounts.entries()]
      .map(([score, occurrences]) => ({ score, occurrences }))
      .sort((left, right) => right.occurrences - left.occurrences || left.score.localeCompare(right.score)),
  };
}

function calculateBettingAdvice(prediction, odds) {
  const markets = [
    { key: "home", label: `${prediction.a.name}胜`, count: prediction.aWins, odds: Number(odds.home) },
    { key: "draw", label: "平局", count: prediction.draws, odds: Number(odds.draw) },
    { key: "away", label: `${prediction.b.name}胜`, count: prediction.bWins, odds: Number(odds.away) },
  ];
  if (markets.some((market) => !Number.isFinite(market.odds) || market.odds <= 1)) {
    return { complete: false, returnRate: 0, overround: 0, markets: [] };
  }

  const impliedTotal = markets.reduce((sum, market) => sum + (1 / market.odds), 0);
  const rows = markets.map((market) => {
    const modelProbability = market.count / prediction.count;
    const fairProbability = (1 / market.odds) / impliedTotal;
    const expectedReturn = modelProbability * market.odds - 1;
    let tone = "negative";
    let verdict = "规避";
    if (expectedReturn >= 0.06) {
      tone = "positive";
      verdict = "可关注";
    } else if (expectedReturn >= 0.015) {
      tone = "watch";
      verdict = "小优势";
    } else if (expectedReturn > -0.02) {
      tone = "neutral";
      verdict = "观望";
    }
    return {
      ...market,
      modelProbability,
      fairProbability,
      edge: modelProbability - fairProbability,
      expectedReturn,
      tone,
      verdict,
    };
  });

  return {
    complete: true,
    returnRate: 1 / impliedTotal,
    overround: impliedTotal - 1,
    markets: rows.sort((a, b) => b.expectedReturn - a.expectedReturn),
  };
}

const SPORTTERY_RECOMMENDABLE_POOLS = new Set(["HAD", "HHAD", "TTG"]);
const RECENT_GOAL_PROFILE_SNAPSHOT = globalThis.RECENT_GOAL_PROFILES || { teams: {} };
const SPORTTERY_TTG_CALIBRATION = {
  modelWeight: 0.55,
  marketWeight: 0.3,
  recentWeight: 0.15,
};
const SPORTTERY_TEAM_ALIASES = new Map([
  ["沙特阿拉伯", "沙特"],
  ["刚果民主共和国", "刚果（金）"],
  ["民主刚果", "刚果（金）"],
  ["刚果(金)", "刚果（金）"],
  ["韩国队", "韩国"],
  ["伊朗队", "伊朗"],
  ["美国队", "美国"],
]);

function normalizeSportteryName(value) {
  return String(value || "")
    .replaceAll(" ", "")
    .replaceAll("　", "")
    .replace(/[（）()]/g, "");
}

function sportteryTeamKey(value) {
  const normalized = normalizeSportteryName(value);
  return SPORTTERY_TEAM_ALIASES.get(normalized) || normalized;
}

function findSportteryTeam(name) {
  const key = sportteryTeamKey(name);
  return teams.find((team) => sportteryTeamKey(team.name) === key);
}

function parseScoreValue(score) {
  const match = String(score || "").match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function parseGoalLine(value) {
  const match = String(value || "").match(/[+-]?\d+(?:\.\d+)?/);
  if (!match) return null;
  const line = Number(match[0]);
  return Number.isFinite(line) ? line : null;
}

function sportteryOptionProbability(pool, option, scoreRows, count) {
  if (!count) return null;
  const optionKey = String(option.key || "").toLowerCase();
  let occurrences = 0;

  for (const row of scoreRows) {
    const score = parseScoreValue(row.score);
    if (!score) continue;
    const totalGoals = score.home + score.away;
    let wins = false;

    if (pool.code === "HAD") {
      wins = (
        (optionKey === "h" && score.home > score.away) ||
        (optionKey === "d" && score.home === score.away) ||
        (optionKey === "a" && score.home < score.away)
      );
    } else if (pool.code === "HHAD") {
      const line = parseGoalLine(pool.goalLine);
      if (line === null) return null;
      const adjustedHome = score.home + line;
      wins = (
        (optionKey === "h" && adjustedHome > score.away) ||
        (optionKey === "d" && adjustedHome === score.away) ||
        (optionKey === "a" && adjustedHome < score.away)
      );
    } else if (pool.code === "TTG") {
      const totalKey = optionKey.match(/^s(\d)$/);
      if (!totalKey) return null;
      const target = Number(totalKey[1]);
      wins = target === 7 ? totalGoals >= 7 : totalGoals === target;
    }

    if (wins) occurrences += row.occurrences;
  }

  return occurrences / count;
}

function sportteryMarketProbabilities(pool) {
  const rows = (pool.options || [])
    .map((option) => {
      const odds = Number(option.odds);
      return {
        key: String(option.key || "").toLowerCase(),
        probability: Number.isFinite(odds) && odds > 1 ? 1 / odds : null,
      };
    })
    .filter((row) => row.probability !== null);
  const total = rows.reduce((sum, row) => sum + row.probability, 0);
  if (!total) return new Map();
  return new Map(rows.map((row) => [row.key, row.probability / total]));
}

function recentGoalProfile(team) {
  return RECENT_GOAL_PROFILE_SNAPSHOT.teams?.[team?.en] || null;
}

function poissonProbability(lambda, goals) {
  let probability = Math.exp(-lambda);
  for (let goal = 1; goal <= goals; goal += 1) probability *= lambda / goal;
  return probability;
}

function totalGoalProbabilityFromRecentProfiles(match, option) {
  const optionKey = String(option.key || "").toLowerCase();
  const totalKey = optionKey.match(/^s(\d)$/);
  if (!totalKey) return null;
  const homeProfile = recentGoalProfile(findSportteryTeam(match.homeTeam));
  const awayProfile = recentGoalProfile(findSportteryTeam(match.awayTeam));
  if (!homeProfile || !awayProfile) return null;
  const homeExpected = (homeProfile.avgFor + awayProfile.avgAgainst) / 2;
  const awayExpected = (awayProfile.avgFor + homeProfile.avgAgainst) / 2;
  const matchupTotal = homeExpected + awayExpected;
  const recentTotal = (homeProfile.avgTotal + awayProfile.avgTotal) / 2;
  const lambda = clamp(matchupTotal * 0.7 + recentTotal * 0.3, 0.7, 5.8);
  const target = Number(totalKey[1]);
  if (target === 7) {
    let underSeven = 0;
    for (let goals = 0; goals < 7; goals += 1) underSeven += poissonProbability(lambda, goals);
    return clamp(1 - underSeven, 0, 1);
  }
  return poissonProbability(lambda, target);
}

function finalizeSportteryRatedOption(row) {
  const breakEvenProbability = 1 / row.odds;
  const expectedReturn = row.modelProbability * row.odds - 1;
  const edge = row.modelProbability - breakEvenProbability;
  const clippedReturn = clamp(expectedReturn, -0.2, 0.25);
  const clippedEdge = clamp(edge, -0.12, 0.12);
  const riskAdjustedScore = row.modelProbability * 0.72 + clippedReturn * 0.2 + clippedEdge * 0.08;
  const output = {
    ...row,
    breakEvenProbability,
    edge,
    expectedReturn,
    lossProbability: 1 - row.modelProbability,
    riskAdjustedScore,
  };
  output.verdict = sportteryVerdict(output);
  output.tone = sportteryTone(output);
  return output;
}

function sportteryVerdict(option) {
  if (option.single === "需过关") {
    if (option.expectedReturn >= -0.02 && option.modelProbability >= 0.42) return "需过关观察";
    return "建议跳过";
  }
  if (option.expectedReturn >= 0.03 && option.modelProbability >= 0.5) return "优先小注";
  if (option.expectedReturn >= -0.02 && option.modelProbability >= 0.5) return "保守可选";
  if (option.expectedReturn >= 0.02) return "高波动";
  return "建议跳过";
}

function sportteryTone(option) {
  if (option.verdict === "优先小注" || option.verdict === "保守可选") return "positive";
  if (option.verdict === "高波动" || option.verdict === "需过关观察") return "watch";
  return "negative";
}

function sportteryShouldBet(option) {
  return option?.verdict === "优先小注" || option?.verdict === "保守可选";
}

function sportteryStakeUnit(option) {
  if (!sportteryShouldBet(option)) return "0";
  if (option.verdict === "优先小注" && option.edge >= 0.03) return "1u";
  return "0.5u";
}

function sportteryOptionRank(option) {
  if (sportteryShouldBet(option)) return 2;
  if (option.verdict === "高波动" || option.verdict === "需过关观察") return 1;
  return 0;
}

function sportteryVisibleSlipRows(rows, onlyBettable = false) {
  return onlyBettable ? rows.filter(({ advice }) => sportteryShouldBet(advice.recommended)) : rows;
}

function rankSportteryOptions(match, scoreRows, count) {
  const ratedOptions = [];
  for (const pool of match.pools || []) {
    if (!SPORTTERY_RECOMMENDABLE_POOLS.has(pool.code)) continue;
    const poolRows = [];
    const marketProbabilities = sportteryMarketProbabilities(pool);
    for (const option of pool.options || []) {
      const odds = Number(option.odds);
      const rawModelProbability = sportteryOptionProbability(pool, option, scoreRows, count);
      if (!Number.isFinite(odds) || odds <= 1 || rawModelProbability === null) continue;
      const optionKey = String(option.key || "").toLowerCase();
      let modelProbability = rawModelProbability;
      const marketProbability = marketProbabilities.get(optionKey) || null;
      const recentGoalProbability = pool.code === "TTG"
        ? totalGoalProbabilityFromRecentProfiles(match, option)
        : null;
      const isCalibrated = pool.code === "TTG" && marketProbability !== null && recentGoalProbability !== null;
      if (isCalibrated) {
        modelProbability = (
          rawModelProbability * SPORTTERY_TTG_CALIBRATION.modelWeight +
          marketProbability * SPORTTERY_TTG_CALIBRATION.marketWeight +
          recentGoalProbability * SPORTTERY_TTG_CALIBRATION.recentWeight
        );
      }
      const row = {
        poolCode: pool.code,
        poolLabel: pool.label,
        single: pool.single || "未知",
        optionKey: option.key,
        optionLabel: option.label,
        odds,
        modelProbability,
        rawModelProbability,
        marketProbability,
        recentGoalProbability,
      };
      if (isCalibrated) {
        row.calibrationSource = "free_recent_goals_market";
        row.calibrationLabel = "免费总进球调校";
      }
      poolRows.push(row);
    }
    if (pool.code === "TTG") {
      const calibratedRows = poolRows.filter((row) => row.calibrationSource);
      const calibratedTotal = calibratedRows.reduce((sum, row) => sum + row.modelProbability, 0);
      if (calibratedRows.length && calibratedTotal > 0) {
        calibratedRows.forEach((row) => {
          row.modelProbability /= calibratedTotal;
        });
      }
    }
    ratedOptions.push(...poolRows.map(finalizeSportteryRatedOption));
  }

  ratedOptions.sort((a, b) => (
    sportteryOptionRank(b) - sportteryOptionRank(a) ||
    b.riskAdjustedScore - a.riskAdjustedScore ||
    b.modelProbability - a.modelProbability ||
    b.expectedReturn - a.expectedReturn
  ));

  return {
    complete: ratedOptions.length > 0,
    ratedOptions,
    recommended: ratedOptions[0] || null,
  };
}

function createSportteryRecommendation(match, settings) {
  const homeTeam = findSportteryTeam(match.homeTeam);
  const awayTeam = findSportteryTeam(match.awayTeam);
  if (!homeTeam || !awayTeam) {
    return {
      complete: false,
      reason: "未匹配到模型球队",
      ratedOptions: [],
      recommended: null,
    };
  }

  const count = clamp(Math.round(Number(settings.count) || 10000), 3000, 20000);
  const recommendationSettings = { ...settings, count };
  const rng = createRng(`${settings.seed}:sporttery:${match.matchId}:${homeTeam.en}:${awayTeam.en}`);
  const prediction = simulateMatchPrediction(homeTeam, awayTeam, recommendationSettings, rng);
  return {
    ...rankSportteryOptions(match, prediction.scores, prediction.count),
    count: prediction.count,
    homeTeam,
    awayTeam,
  };
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
  const rowByTeamId = new Map(table.map((row) => [row.team.id, row]));

  for (let i = 0; i < groupTeams.length; i += 1) {
    for (let j = i + 1; j < groupTeams.length; j += 1) {
      const result = simulateMatch(groupTeams[i], groupTeams[j], settings, false, null, null, rng);
      const rowA = rowByTeamId.get(groupTeams[i].id);
      const rowB = rowByTeamId.get(groupTeams[j].id);
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

function setStatus(text, state = "ready") {
  const label = $("#statusLabel");
  label.textContent = text;
  label.dataset.state = state;
}

function updateRunProgress(done, total) {
  const value = Math.round((done / total) * 100);
  $("#runProgress").style.width = `${value}%`;
  $("#runProgressTrack").setAttribute("aria-valuenow", String(value));
}

function setRunningState(isRunning) {
  const runBtn = $("#runBtn");
  document.body.classList.toggle("is-running", isRunning);
  runBtn.disabled = isRunning;
  runBtn.setAttribute("aria-busy", String(isRunning));
  runBtn.textContent = isRunning ? "模拟中..." : "运行模拟";
  if (isRunning) updateRunProgress(0, 1);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

async function withButtonBusy(button, busyText, action) {
  const previousText = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = busyText;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  try {
    await action();
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = previousText;
  }
}

function setRefreshButtonState(running, text = "刷新数据") {
  const button = $("#refreshDataBtn");
  button.disabled = running;
  button.setAttribute("aria-busy", String(running));
  button.textContent = text;
}

async function getRefreshState() {
  const response = await fetch("/api/data-refresh/status", { cache: "no-store" });
  if (!response.ok) throw new Error("refresh service unavailable");
  return response.json();
}

async function waitForDataRefresh() {
  while (true) {
    const state = await getRefreshState();
    if (!state.running) return state;
    setRefreshButtonState(true, state.currentStep || "刷新中...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function refreshData() {
  setRefreshButtonState(true, "准备刷新...");
  try {
    const response = await fetch("/api/data-refresh", { method: "POST" });
    if (!response.ok && response.status !== 409) throw new Error("refresh service unavailable");
    const state = await waitForDataRefresh();
    if (!state.ok) {
      console.error(state.output?.join("\n") || "Data refresh failed");
      setRefreshButtonState(false);
      showToast("刷新失败，数据已回滚");
      return;
    }
    setRefreshButtonState(true, "刷新完成");
    showToast("数据已更新，正在重新载入");
    setTimeout(() => window.location.reload(), 700);
  } catch (error) {
    console.error(error);
    setRefreshButtonState(false);
    showToast("请用 npm run dev 启动后再刷新");
  }
}

function revealPanel(selector) {
  $(selector)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function markMatchPredictionStale() {
  if (latestMatchPrediction) $("#matchPrediction").classList.add("is-stale");
}

function updatePresetState() {
  const count = String(currentSettings().count);
  document.querySelectorAll("[data-count]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.count === count);
  });
}

function updateExportState() {
  $("#exportBtn").disabled = !latestResults || resultsAreStale;
}

function syncSelectedTeamStyles() {
  const selectedId = Number($("#focusTeam").value);
  document.querySelectorAll("[data-select-team]").forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.selectTeam) === selectedId);
  });
  document.querySelectorAll("[data-team-row]").forEach((row) => {
    row.classList.toggle("is-selected", Number(row.dataset.teamRow) === selectedId);
  });
  document.querySelectorAll("[data-team-wrap]").forEach((row) => {
    row.classList.toggle("is-selected", Number(row.dataset.teamWrap) === selectedId);
  });
}

function setDrawerOpen(isOpen) {
  $("#drawerOverlay").hidden = !isOpen;
  $("#teamDrawer").hidden = !isOpen;
  document.body.classList.toggle("drawer-open", isOpen);
  if (!isOpen && lastDrawerTrigger) lastDrawerTrigger.focus({ preventScroll: true });
}

function openTeamDrawer(team, trigger = null) {
  lastDrawerTrigger = trigger;
  renderTeamProfile(team);
  setDrawerOpen(true);
  requestAnimationFrame(() => $("#drawerCloseBtn").focus());
}

function closeTeamDrawer() {
  setDrawerOpen(false);
}

function markResultsStale(message = "待重新运行") {
  if (!latestResults) return;
  resultsAreStale = true;
  setStatus(message, "dirty");
  $("#runMeta").textContent = "参数已变更，结果待重新运行";
  updateExportState();
  renderShootingMode();
}

async function runSimulation() {
  const settings = currentSettings();
  const rng = createRng(settings.seed);
  const counters = emptyCounters();
  let goals = 0;
  let pens = 0;
  let thirds = 0;
  const chunkSize = 1000;
  const startTime = performance.now();
  setRunningState(true);
  setStatus("运行中", "running");
  showToast(`开始模拟 ${settings.count.toLocaleString()} 次`);

  try {
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
      const completed = Math.min(done + limit, settings.count);
      const elapsed = (performance.now() - startTime) / 1000;
      const speed = elapsed > 0.1 ? Math.round(completed / elapsed) : 0;
      setStatus(`${completed.toLocaleString()} / ${settings.count.toLocaleString()} · ${speed.toLocaleString()} 次/秒`, "running");
      updateRunProgress(completed, settings.count);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    latestResults = {
      settings,
      counters: [...counters.values()].sort((a, b) => b.champion - a.champion || getTeamRating(b.team) - getTeamRating(a.team)),
      avgGoals: goals / settings.count,
      avgPens: pens / settings.count,
      thirdRate: thirds / (settings.count * 32),
    };
    resultsAreStale = false;
    latestSampleIndex = 0;
    latestSample = simulateTournament(settings, true, createRng(`${settings.seed}:sample:${latestSampleIndex}`));
    setRunningState(false);
    updateRunProgress(1, 1);
    const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
    setStatus(`已完成 · ${totalTime}s`);
    renderResults();
    renderSportteryOdds();
    if (latestMatchPrediction) {
      $("#matchPrediction").classList.remove("is-stale");
    }
    showToast("模拟完成，结果已刷新");
    setTimeout(() => updateRunProgress(0, 1), 450);
  } catch (error) {
    setRunningState(false);
    updateRunProgress(0, 1);
    setStatus("运行失败", "empty");
    showToast("模拟失败，请检查控制台");
    throw error;
  }
}

function renderInitial() {
  renderFocusOptions();
  renderShootingOptions();
  renderMatchPredictionOptions();
  renderMatchPredictionPlaceholder();
  renderRatingEditor();
  renderDataCoverage();
  renderGroups();
  renderRanking(emptyCounters(), 1);
  renderResultSummary();
  renderSportteryOdds();
  renderStageBars(null);
  updatePresetState();
  updateExportState();
  syncSelectedTeamStyles();
  renderShootingMode();
}

function renderMatchPredictionOptions() {
  const teamASelect = $("#matchTeamA");
  const teamBSelect = $("#matchTeamB");
  const previousA = teamASelect.value;
  const previousB = teamBSelect.value;
  const options = teams
    .slice()
    .sort((a, b) => getTeamRating(b) - getTeamRating(a))
    .map((team) => `<option value="${team.id}">${team.flag} ${team.name}</option>`)
    .join("");
  teamASelect.innerHTML = options;
  teamBSelect.innerHTML = options;
  const argentina = teams.find((team) => team.name === "阿根廷");
  const france = teams.find((team) => team.name === "法国");
  teamASelect.value = teams.some((team) => String(team.id) === previousA) ? previousA : String(argentina.id);
  teamBSelect.value = teams.some((team) => String(team.id) === previousB) ? previousB : String(france.id);
  updateMatchTeamInfo();
}

function updateMatchTeamInfo() {
  const teamA = teams.find((team) => team.id === Number($("#matchTeamA").value));
  const teamB = teams.find((team) => team.id === Number($("#matchTeamB").value));
  const render = (team) => team ? [
    `${team.group}组`,
    `FIFA #${team.factors.fifaRank}`,
    `Elo ${team.factors.elo}`,
    `近况 ${team.factors.form}`,
    `综合分 ${getTeamRating(team)}`,
  ].map((text) => `<span>${text}</span>`).join("") : "";
  const infoA = $("#matchTeamAInfo");
  const infoB = $("#matchTeamBInfo");
  if (infoA) infoA.innerHTML = render(teamA);
  if (infoB) infoB.innerHTML = render(teamB);
}

function renderMatchPredictionPlaceholder() {
  latestMatchPrediction = null;
  $("#matchPrediction").classList.remove("is-stale");
  $("#matchPrediction").innerHTML = `
    <div class="empty-state">
      <strong>选择两支球队</strong>
      <small>点击“预测比分”后显示胜平负概率和最可能比分，不以单次随机赛果代替预测。</small>
    </div>
  `;
}

function readBettingOddsInput() {
  return {
    home: Number($("#lotteryHomeOdds").value),
    draw: Number($("#lotteryDrawOdds").value),
    away: Number($("#lotteryAwayOdds").value),
  };
}

function formatSignedPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function renderBettingAdvice(prediction) {
  const advice = calculateBettingAdvice(prediction, readBettingOddsInput());
  if (!advice.complete) {
    return `
      <div class="betting-advice is-empty">
        <h3>体彩赔率对照</h3>
        <p>填入胜 / 平 / 负十进制赔率后，按模型概率计算返还率、价值边际和期望收益。</p>
      </div>
    `;
  }
  return `
    <div class="betting-advice">
      <div class="betting-advice-head">
        <h3>体彩赔率对照</h3>
        <span>返还率 ${(advice.returnRate * 100).toFixed(1)}% · 庄家边际 ${(advice.overround * 100).toFixed(1)}%</span>
      </div>
      <div class="betting-market-list">
        ${advice.markets.map((market) => `
          <div class="betting-market is-${market.tone}">
            <strong>${market.label}</strong>
            <span>赔率 ${market.odds.toFixed(2)}</span>
            <span>模型 ${(market.modelProbability * 100).toFixed(2)}%</span>
            <span>市场 ${(market.fairProbability * 100).toFixed(2)}%</span>
            <b>${formatSignedPercent(market.expectedReturn)} EV</b>
            <em>${market.verdict}</em>
          </div>
        `).join("")}
      </div>
      <p>只比较概率和赔率是否匹配，不代表确定收益；临场伤停、轮换和官方赔率变化要重新核对。</p>
    </div>
  `;
}

function renderSportteryOdds() {
  const matches = Array.isArray(sportteryOddsSnapshot.matches) ? sportteryOddsSnapshot.matches : [];
  const meta = $("#sportteryMeta");
  const body = $("#sportteryOdds");
  const windowText = sportteryOddsSnapshot.window
    ? `${sportteryOddsSnapshot.window.startDate} 至 ${sportteryOddsSnapshot.window.endDate}`
    : "暂无日期";
  meta.textContent = matches.length ? `${matches.length} 场 · ${windowText}` : "暂无世界杯赔率";
  if (!matches.length) {
    body.innerHTML = `
      <div class="empty-state">
        <strong>暂无中国竞彩网世界杯赔率</strong>
        <small>刷新数据后会重新拉取官方固定奖金快照，只保留世界杯赛事。</small>
      </div>
    `;
    return;
  }
  const settings = currentSettings();
  const rows = matches.map((match) => ({ match, advice: createSportteryRecommendation(match, settings) }));
  body.innerHTML = `
    ${renderSportteryBettingSlip(rows)}
    ${rows.map(({ match, advice }) => `
      <article class="sporttery-match">
        <div class="sporttery-match-head">
          <div>
            <strong>${escapeHtml(match.matchNum)} · ${escapeHtml(match.league)}</strong>
            <span>${escapeHtml(match.matchDate)}${match.status ? ` · ${escapeHtml(match.status)}` : ""} · ${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</span>
          </div>
          <a href="${escapeHtml(match.sourceUrl)}" target="_blank" rel="noreferrer">官网</a>
        </div>
        ${renderSportteryRecommendation(advice)}
        <div class="sporttery-pools">
          ${match.pools.map((pool) => renderSportteryPool(pool)).join("")}
        </div>
      </article>
    `).join("")}
  `;
}

function renderSportteryBettingSlip(rows) {
  const visibleRows = sportteryVisibleSlipRows(rows, sportterySlipOnlyBettable);
  latestSportterySlipText = buildSportterySlipText(rows, sportterySlipOnlyBettable);
  const lineRows = visibleRows.map(({ match, advice }) => {
    const item = advice.recommended;
    const shouldBet = sportteryShouldBet(item);
    const pick = item
      ? shouldBet ? `${item.poolLabel} · ${item.optionLabel}` : "跳过"
      : "跳过";
    const tone = item?.tone || "negative";
    return `
      <div class="sporttery-slip-row is-${tone}">
        <span>${escapeHtml(match.matchNum || "-")}</span>
        <strong>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</strong>
        <b>${escapeHtml(pick)}</b>
        <span>${item ? escapeHtml(item.single) : "-"}</span>
        <span>${item ? `${(item.modelProbability * 100).toFixed(1)}%` : "-"}</span>
        <span>${item ? `${(item.lossProbability * 100).toFixed(1)}%` : "-"}</span>
        <span>${item ? item.odds.toFixed(2) : "-"}</span>
        <span>${item ? formatSignedPercent(item.expectedReturn) : "-"}</span>
        <span>${item ? formatSignedPercent(item.edge) : "-"}</span>
        <span>${item ? sportteryStakeUnit(item) : "0"}</span>
        <em>${escapeHtml(item?.verdict || advice.reason || "暂不下注")}</em>
      </div>
    `;
  }).join("") || `
    <div class="sporttery-slip-empty">当前没有可下注项</div>
  `;

  return `
    <section class="sporttery-slip">
      <div class="sporttery-slip-head">
        <div>
          <strong>投注清单</strong>
          <span>去体彩店前按官方赔率再核对一次；总进球使用免费总进球调校</span>
        </div>
        <div class="sporttery-slip-actions">
          <label class="sporttery-slip-toggle">
            <input type="checkbox" data-sporttery-slip-only-bettable ${sportterySlipOnlyBettable ? "checked" : ""}>
            只看可下注
          </label>
          <button type="button" data-copy-sporttery-slip>复制清单</button>
          <button type="button" data-download-sporttery-slip>下载清单</button>
        </div>
      </div>
      <div class="sporttery-slip-grid">
        <div class="sporttery-slip-row is-head">
          <span>场次</span>
          <span>对阵</span>
          <span>推荐</span>
          <span>关</span>
          <span>模型</span>
          <span>亏损</span>
          <span>赔率</span>
          <span>EV</span>
          <span>安全垫</span>
          <span>单位</span>
          <span>结论</span>
        </div>
        ${lineRows}
      </div>
    </section>
  `;
}

function buildSportterySlipText(rows, onlyBettable = false) {
  const visibleRows = sportteryVisibleSlipRows(rows, onlyBettable);
  const lines = ["场次\t对阵\t推荐\t关\t模型\t亏损\t赔率\tEV\t安全垫\t单位\t结论"];
  if (!visibleRows.length) lines.push("无可下注场次");
  for (const { match, advice } of visibleRows) {
    const item = advice.recommended;
    const shouldBet = sportteryShouldBet(item);
    lines.push([
      match.matchNum || "-",
      `${match.homeTeam} vs ${match.awayTeam}`,
      item && shouldBet ? `${item.poolLabel} · ${item.optionLabel}` : "跳过",
      item ? item.single : "-",
      item ? `${(item.modelProbability * 100).toFixed(1)}%` : "-",
      item ? `${(item.lossProbability * 100).toFixed(1)}%` : "-",
      item ? item.odds.toFixed(2) : "-",
      item ? formatSignedPercent(item.expectedReturn) : "-",
      item ? formatSignedPercent(item.edge) : "-",
      item ? sportteryStakeUnit(item) : "0",
      item?.verdict || advice.reason || "暂不下注",
    ].join("\t"));
  }
  return lines.join("\n");
}

function renderSportteryRecommendation(advice) {
  if (!advice.complete) {
    return `
      <div class="sporttery-advice is-empty">
        <strong>暂不生成建议</strong>
        <span>${escapeHtml(advice.reason || "缺少可评级玩法")}</span>
      </div>
    `;
  }
  const item = advice.recommended;
  const action = sportteryShouldBet(item)
    ? `保守建议：${item.poolLabel} · ${item.optionLabel}`
    : "本场建议跳过";
  return `
    <div class="sporttery-advice is-${item.tone}">
      <div>
        <strong>${escapeHtml(action)}</strong>
        <span>${escapeHtml(item.verdict)} · 模型 ${(item.modelProbability * 100).toFixed(1)}% · 赔率 ${item.odds.toFixed(2)} · EV ${formatSignedPercent(item.expectedReturn)}</span>
        ${item.calibrationLabel ? `<span>${escapeHtml(item.calibrationLabel)} · 原始模拟 ${(item.rawModelProbability * 100).toFixed(1)}%</span>` : ""}
      </div>
      <small>按 ${advice.count.toLocaleString()} 次 90 分钟模拟排序，优先高命中率且不明显负期望的低波动项。</small>
    </div>
  `;
}

function renderSportteryPool(pool) {
  const title = pool.goalLine ? `${pool.label} ${pool.goalLine}` : pool.label;
  const shownCount = pool.optionCount && pool.optionCount > pool.options.length
    ? ` · 显示 ${pool.options.length}/${pool.optionCount} 项`
    : "";
  return `
    <section class="sporttery-pool">
      <div class="sporttery-pool-title">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(pool.single)}${shownCount}</span>
      </div>
      <div class="sporttery-option-list">
        ${pool.options.map((option) => `
          <div>
            <span>${escapeHtml(option.label)}</span>
            <b>${Number(option.odds).toFixed(2)}</b>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMatchPrediction(prediction) {
  const outcomes = [
    [`${prediction.a.name}胜`, prediction.aWins],
    ["平局", prediction.draws],
    [`${prediction.b.name}胜`, prediction.bWins],
  ];
  const topScores = prediction.scores.slice(0, 5);
  const maxScoreCount = topScores[0]?.occurrences || 1;
  $("#matchPrediction").classList.remove("is-stale");
  $("#matchPrediction").innerHTML = `
    <div class="match-prediction-head">
      <h2>${prediction.a.flag} ${prediction.a.name} vs ${prediction.b.name} ${prediction.b.flag}</h2>
      <small>模拟 ${prediction.count.toLocaleString()} 次 · seed ${escapeHtml(prediction.settings.seed)} · 90 分钟赛果</small>
    </div>
    <div class="match-outcomes">
      ${outcomes.map(([label, value]) => {
        const interval = probabilityInterval(value, prediction.count);
        return `
          <div>
            <span>${label}</span>
            <strong>${percent(value, prediction.count)}</strong>
            <small>95% ${interval.label}</small>
          </div>
        `;
      }).join("")}
    </div>
    <div class="match-goals">
      <div><span>${prediction.a.flag} ${prediction.a.name} 平均进球</span><strong>${prediction.avgAGoals.toFixed(2)}</strong></div>
      <div><span>${prediction.b.flag} ${prediction.b.name} 平均进球</span><strong>${prediction.avgBGoals.toFixed(2)}</strong></div>
    </div>
    <div class="score-probability-list">
      <h3>最可能比分 Top 5</h3>
      ${topScores.map((row) => `
        <div class="score-probability-row">
          <strong>${row.score}</strong>
          <span class="score-probability-bar"><span style="width:${(row.occurrences / maxScoreCount) * 100}%"></span></span>
          <b>${percent(row.occurrences, prediction.count)}</b>
        </div>
      `).join("")}
    </div>
    ${renderBettingAdvice(prediction)}
  `;
}

function runMatchPrediction() {
  const a = teams.find((team) => team.id === Number($("#matchTeamA").value));
  const b = teams.find((team) => team.id === Number($("#matchTeamB").value));
  if (!a || !b || a.id === b.id) {
    showToast("请选择两支不同的球队");
    return;
  }
  const settings = currentSettings();
  const rng = createRng(`${settings.seed}:match:${a.en}:${b.en}`);
  latestMatchPrediction = simulateMatchPrediction(a, b, settings, rng);
  renderMatchPrediction(latestMatchPrediction);
  revealPanel("#matchPrediction");
  showToast("单场比分概率已生成");
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

function renderShootingOptions() {
  const sceneSelect = $("#shootScene");
  const teamSelect = $("#shootTeam");
  if (!sceneSelect || !teamSelect) return;
  const previousScene = sceneSelect.value || "ranking";
  const previousTeam = teamSelect.value || $("#focusTeam").value;
  sceneSelect.innerHTML = SHOOTING_SCENES.map((scene) => `<option value="${scene.id}">${scene.label}</option>`).join("");
  sceneSelect.value = SHOOTING_SCENES.some((scene) => scene.id === previousScene) ? previousScene : "ranking";
  teamSelect.innerHTML = teams
    .slice()
    .sort((a, b) => getTeamRating(b) - getTeamRating(a))
    .map((team) => `<option value="${team.id}">${team.flag} ${team.name}</option>`)
    .join("");
  teamSelect.value = teams.some((team) => String(team.id) === previousTeam) ? previousTeam : $("#focusTeam").value;
}

function hasFreshResults() {
  return latestResults && !resultsAreStale;
}

function counterFor(team) {
  return latestResults?.counters.find((row) => row.team.id === team.id);
}

function selectedShootingTeam() {
  return teams.find((team) => team.id === Number($("#shootTeam").value)) || teams[0];
}

function mostLikelyStage(counter, total) {
  if (!counter || !total || !hasFreshResults()) return "待模拟";
  return [
    ["小组出局", total - counter.r32],
    ["32强", counter.r32 - counter.r16],
    ["16强", counter.r16 - counter.qf],
    ["8强", counter.qf - counter.sf],
    ["4强", counter.sf - counter.final],
    ["决赛", counter.final - counter.champion],
    ["冠军", counter.champion],
  ].sort((a, b) => b[1] - a[1])[0][0];
}

function shootingHeroMarkup(kicker, title, subtitle) {
  return `
    <div class="shoot-hero">
      <span>${escapeHtml(kicker)}</span>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
    </div>
  `;
}

function renderShootingRanking() {
  const ready = hasFreshResults();
  const rows = ready
    ? latestResults.counters.slice(0, 6)
    : teams.slice().sort((a, b) => getTeamRating(b) - getTeamRating(a)).slice(0, 6).map((team) => ({ team, champion: 0, final: 0 }));
  const count = latestResults?.settings.count || 1;
  const leader = rows[0];
  return `
    ${shootingHeroMarkup(
      ready ? `Monte Carlo ${count.toLocaleString()} 次` : "等待模拟结果",
      ready ? `${leader.team.name}暂居冠军概率榜首` : "先跑一次模拟，再拍冠军概率榜",
      "48队最终名单、赔率、Elo、赛程和天气快照一起进入模型。"
    )}
    <div class="shoot-rank-list">
      ${rows.map((row, index) => `
        <div class="shoot-rank-row">
          <strong>#${index + 1}</strong>
          <span>${row.team.flag} ${row.team.name}</span>
          <b>${ready ? percent(row.champion, count) : "待模拟"}</b>
        </div>
      `).join("")}
    </div>
    <div class="shoot-footnote">数据快照不是赛果断言，适合做概率讨论。</div>
  `;
}

function shootingGroupCandidates() {
  const groupNames = [...new Set(teams.map((team) => team.group))];
  const total = latestResults?.settings.count || 1;
  return groupNames.map((group) => {
    const groupTeams = teams.filter((team) => team.group === group);
    const rows = groupTeams.map((team) => {
      const counter = counterFor(team);
      return {
        team,
        qualifyRate: hasFreshResults() && counter ? counter.r32 / total : 0,
        championRate: hasFreshResults() && counter ? counter.champion / total : 0,
      };
    }).sort((a, b) => getTeamRating(b.team) - getTeamRating(a.team));
    const avgRating = rows.reduce((sum, row) => sum + getTeamRating(row.team), 0) / rows.length;
    const rates = rows.map((row) => row.qualifyRate).sort((a, b) => b - a);
    const tightness = hasFreshResults() ? 1 - (rates[0] - rates[rates.length - 1]) : 0;
    return { group, rows, score: avgRating + tightness * 260 };
  }).sort((a, b) => b.score - a.score);
}

function renderShootingGroup() {
  const groups = shootingGroupCandidates();
  const picked = groups[shootingVariantIndex % groups.length];
  return `
    ${shootingHeroMarkup(
      `${picked.group}组压力测试`,
      `${picked.group}组最适合拍死亡小组`,
      hasFreshResults() ? "出线概率越贴近，比赛越像一场大型心理战。" : "先运行模拟后，这张卡会显示真实出线概率。"
    )}
    <div class="shoot-rank-list">
      ${picked.rows.map((row) => `
        <div class="shoot-rank-row">
          <strong>${row.team.flag}</strong>
          <span>${row.team.name}</span>
          <b>${hasFreshResults() ? `${(row.qualifyRate * 100).toFixed(1)}%` : getTeamRating(row.team)}</b>
        </div>
      `).join("")}
    </div>
    <div class="shoot-footnote">这一页适合配标题：这个小组出线概率太残忍了。</div>
  `;
}

function renderShootingTeam(team) {
  const counter = counterFor(team);
  const total = latestResults?.settings.count || 1;
  const insight = teamInsight(team, counter, total);
  const headlineRisk = insight.risks.find((item) => item.label !== "数据可信度") || insight.risks[0];
  const squad = squadForTeam(team).slice().sort((a, b) => b.marketValueM - a.marketValueM || b.caps - a.caps).slice(0, 3);
  return `
    ${shootingHeroMarkup(
      `${team.flag} ${team.name} 体检报告`,
      `${team.name}的命门在${headlineRisk?.label ?? "淘汰赛"}`,
      insight.summary
    )}
    <div class="shoot-metric-grid">
      <div><span>综合分</span><strong>${getTeamRating(team)}</strong></div>
      <div><span>近况</span><strong>${team.factors.form}/100</strong></div>
      <div><span>伤病风险</span><strong>${team.factors.injuryRisk}</strong></div>
      <div><span>可信度</span><strong>${team.reliability.score}%</strong></div>
    </div>
    <div class="shoot-route compact">
      ${squad.map((player) => `
        <div>
          <span>${escapeHtml(player.position)}</span>
          <strong>${escapeHtml(player.player)}</strong>
          <small>${escapeHtml(player.club)} · ${formatValue(player.marketValueM)}</small>
        </div>
      `).join("")}
    </div>
    <div class="shoot-footnote">${insight.strengths[0]?.text ?? "模型认为这支队整体均衡。"}</div>
  `;
}

function renderShootingData() {
  const avgCoverage = Math.round(teams.reduce((sum, team) => sum + team.coverage, 0) / teams.length);
  const avgReliability = Math.round(teams.reduce((sum, team) => sum + team.reliability.score, 0) / teams.length);
  return `
    ${shootingHeroMarkup(
      "数据底牌",
      "这不是拍脑袋预测",
      "模型把最终名单、赔率、Elo、近况、赛程旅行和天气负担放在同一张表里。"
    )}
    <div class="shoot-metric-grid">
      <div><span>球队</span><strong>48</strong></div>
      <div><span>球员</span><strong>${squadRows.length || "—"}</strong></div>
      <div><span>字段覆盖</span><strong>${avgCoverage}%</strong></div>
      <div><span>可信度</span><strong>${avgReliability}%</strong></div>
    </div>
    <div class="shoot-source-list">
      ${factorSources.map((source) => `<span><b>${source.label}</b>${source.value}</span>`).join("")}
    </div>
    <div class="shoot-footnote">保留代理字段标签，避免把快照误读成官方结论。</div>
  `;
}

function shootingCaption(scene, team) {
  const count = latestResults?.settings.count?.toLocaleString() || "100,000";
  const lines = {
    ranking: `我用最终名单、赔率、Elo 和赛程跑了 ${count} 次世界杯模拟，先看冠军概率榜。`,
    group: "这组的出线概率很适合单独拍一期，强弱差没有肉眼看起来那么简单。",
    team: `${team.name}这支队不能只看球星，真正的上限和风险都藏在阵容、赛程和健康变量里。`,
    data: "这个世界杯模拟器不是算命：最终名单、赔率、Elo、近况、赛程和天气都有单独快照。"
  };
  return `${lines[scene] || lines.ranking}\n\n#世界杯 #世界杯预测 #足球 #数据分析 #2026世界杯`;
}

function renderShootingMode() {
  const canvas = $("#shootCanvas");
  if (!canvas || !shootingMode) return;
  const scene = $("#shootScene").value || "ranking";
  const team = selectedShootingTeam();
  canvas.dataset.scene = scene;
  canvas.innerHTML = {
    ranking: renderShootingRanking,
    group: renderShootingGroup,
    team: () => renderShootingTeam(team),
    data: renderShootingData,
  }[scene]();
  $("#shootCaption").value = shootingCaption(scene, team);
}

function setShootingMode(isOpen) {
  shootingMode = isOpen;
  document.body.classList.toggle("is-shooting", isOpen);
  $("#shootingPanel").hidden = !isOpen;
  $("#shootingModeBtn").textContent = isOpen ? "退出拍摄" : "拍摄模式";
  $("#shootingModeBtn").classList.toggle("is-success", isOpen);
  if (isOpen) {
    renderShootingOptions();
    renderShootingMode();
    revealPanel("#shootingPanel");
  }
}

function advanceShootingCard() {
  const scene = $("#shootScene").value || "ranking";
  const team = selectedShootingTeam();
  if (scene === "team") {
    const sortedTeams = teams.slice().sort((a, b) => getTeamRating(b) - getTeamRating(a));
    const next = sortedTeams[(sortedTeams.findIndex((item) => item.id === team.id) + 1) % sortedTeams.length];
    $("#shootTeam").value = next.id;
    selectTeam(next.id);
  } else {
    shootingVariantIndex += 1;
  }
  renderShootingMode();
}

async function copyShootingCaption() {
  const caption = $("#shootCaption").value;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(caption);
  } else {
    $("#shootCaption").select();
    document.execCommand("copy");
  }
  showToast("小红书文案已复制");
}

async function copySportteryBettingSlip() {
  if (!latestSportterySlipText) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(latestSportterySlipText);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = latestSportterySlipText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast("投注清单已复制");
}

function downloadSportteryBettingSlip() {
  if (!latestSportterySlipText) return;
  const blob = new Blob([latestSportterySlipText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sporttery-world-cup-slip.txt";
  link.click();
  URL.revokeObjectURL(url);
  showToast("投注清单已开始下载");
}

function inlineStylesForExport(sourceNode, cloneNode) {
  if (sourceNode.nodeType !== Node.ELEMENT_NODE || cloneNode.nodeType !== Node.ELEMENT_NODE) return;
  const style = getComputedStyle(sourceNode);
  for (const property of style) {
    cloneNode.style.setProperty(property, style.getPropertyValue(property), style.getPropertyPriority(property));
  }
  [...sourceNode.children].forEach((child, index) => inlineStylesForExport(child, cloneNode.children[index]));
}

async function downloadShootingImage() {
  renderShootingMode();
  const source = $("#shootCanvas");
  const scene = $("#shootScene").value || "ranking";
  const team = selectedShootingTeam();
  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true);
  inlineStylesForExport(source, clone);
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;

  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${markup}</foreignObject>
    </svg>
  `;
  const image = new Image();
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("图片渲染失败，浏览器可能不支持 SVG foreignObject"));
    image.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("图片编码失败"));
    }, "image/png");
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `xiaohongshu-world-cup-${scene}-${team.en.toLowerCase().replaceAll(" ", "-")}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("小红书图片已开始下载");
}

function teamInsight(team, counter = null, total = 1) {
  const f = team.factors;
  const ratingGap = getTeamRating(team) - teams.reduce((sum, item) => sum + getTeamRating(item), 0) / teams.length;
  const strengths = [
    { score: ratingGap, label: "硬实力", text: `综合分高出均值 ${Math.round(ratingGap)}。` },
    { score: f.form - 58, label: "近期状态", text: `近况 ${f.form}/100，能把小优势转成连续性。` },
    { score: f.squadValue / 12, label: "阵容厚度", text: `阵容价值 €${f.squadValue}m，替补容错更足。` },
    { score: f.clubScore - 58, label: "俱乐部分布", text: `俱乐部分布 ${f.clubScore}/100，强强对话经验够用。` },
    { score: f.wcPath - 55, label: "世界杯路径经验", text: `路径经验 ${f.wcPath}/100，淘汰赛不容易慌。` },
    { score: 26 - f.injuryRisk, label: "健康面", text: `伤病风险 ${f.injuryRisk}，阵容完整性较好。` },
  ].filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const risks = [
    { score: f.injuryRisk - 18, label: "健康风险", text: `伤病风险 ${f.injuryRisk}，一处减员就可能改写上限。` },
    { score: f.travelKm / 180, label: "组赛奔波", text: `组赛移动约 ${Math.round(f.travelKm)}km，后半程腿会变沉。` },
    { score: (f.entryTimezoneShift ?? 0) * 5, label: "入境时差", text: `入境时差 ${f.entryTimezoneShift ?? 0}h，开局适应成本偏高。` },
    { score: 58 - f.atmosphere, label: "氛围压力", text: `球队氛围 ${f.atmosphere}/100，逆风局更考验稳定性。` },
    { score: Math.abs((f.avgAge ?? 27.5) - 27.5) * 8, label: "年龄结构", text: `平均年龄 ${f.avgAge} 岁，节奏和恢复都要精算。` },
    { score: 88 - team.reliability.score, label: "数据可信度", text: `可信度 ${team.reliability.score}%，部分字段仍带代理色彩。` },
  ].filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const mainStrength = strengths[0] || { label: "整体均衡", text: "没有单点爆表，但短板也不刺眼。" };
  const mainRisk = risks[0] || { label: "容错率", text: "真正的风险是淘汰赛一场定生死。" };
  const chance = counter ? `当前冠军率 ${percent(counter.champion, total)}。` : "";
  return {
    summary: `${team.name}的上限靠${mainStrength.label}撑住，命门在${mainRisk.label}。${chance}`,
    strengths: strengths.length ? strengths : [mainStrength],
    risks: risks.length ? risks : [mainRisk],
  };
}

function insightMarkup(insight) {
  return `
    <div class="faultline-card">
      <div>
        <span>球队命门</span>
        <p>${escapeHtml(insight.summary)}</p>
      </div>
      <div class="faultline-grid">
        <div>
          <strong>上限来源</strong>
          ${insight.strengths.map((item) => `<small><b>${item.label}</b>${escapeHtml(item.text)}</small>`).join("")}
        </div>
        <div>
          <strong>风险开关</strong>
          ${insight.risks.map((item) => `<small><b>${item.label}</b>${escapeHtml(item.text)}</small>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderRatingEditor() {
  $("#ratingEditor").innerHTML = teams
    .slice()
    .sort((a, b) => getTeamRating(b) - getTeamRating(a))
    .map((team) => `
      <label class="rating-row">
        <span><button class="team-link compact" type="button" data-select-team="${team.id}">${team.flag} ${team.name}</button> <small>${team.group}组 / 模型 ${team.modelRating}</small></span>
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
  const dates = factorSources.map((s) => s.value.match(/\d{4}-\d{2}-\d{2}/)?.[0]).filter(Boolean);
  const latestDate = dates.sort().pop() || "";
  $("#dataCoverage").innerHTML = `
    <div><strong>${avgCoverage}%</strong><span>字段覆盖</span></div>
    <div><strong>${avgReliability}%</strong><span>平均可信度</span></div>
    <div><strong>${reliableFields}/${DATA_FIELDS.length}</strong><span>可核验字段</span></div>
    <div><strong>${proxyFields}</strong><span>代理/人工字段</span></div>
    <div><strong>${factorSources.length}</strong><span>来源类型</span></div>
    <div><strong>${avgRating}</strong><span>平均强度</span></div>
    ${latestDate ? `<div><strong>${latestDate}</strong><span>最新快照</span></div>` : ""}
  `;
}

function renderGroups() {
  const groupNames = [...new Set(teams.map((team) => team.group))];
  const selectedId = Number($("#focusTeam").value);
  $("#groupsGrid").innerHTML = groupNames.map((group) => {
    const groupTeams = teams.filter((team) => team.group === group);
    return `
      <article class="group-card">
        <h3>${group}组</h3>
        ${groupTeams.map((team) => {
          const counter = latestResults?.counters.find((item) => item.team.id === team.id);
          const chance = counter ? percent(counter.r32, latestResults.settings.count) : "-";
          return `
            <div class="group-team ${team.id === selectedId ? "is-selected" : ""}" data-team-wrap="${team.id}">
              <button class="team-link ${team.id === selectedId ? "is-selected" : ""}" type="button" data-select-team="${team.id}">${team.flag} ${team.name}</button>
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
  const selectedId = Number($("#focusTeam").value);
  $("#rankingBody").innerHTML = rows.map((row, index) => {
    const championInterval = probabilityInterval(row.champion, count);
    return `
      <tr data-team-row="${row.team.id}" class="${row.team.id === selectedId ? "is-selected" : ""}">
        <td>${index + 1}</td>
        <td><button class="team-cell team-link ${row.team.id === selectedId ? "is-selected" : ""}" type="button" data-select-team="${row.team.id}">${row.team.flag} ${row.team.name}</button></td>
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

function renderResultSummary() {
  const summary = $("#resultSummary");
  if (!latestResults) {
    summary.className = "result-summary is-empty";
    summary.textContent = "运行模拟后，这里会显示夺冠概率前三和核心结果概览。";
    return;
  }

  summary.className = "result-summary";
  summary.innerHTML = latestResults.counters.slice(0, 3).map((row, index) => {
    const interval = probabilityInterval(row.champion, latestResults.settings.count);
    return `
      <div class="summary-item">
        <span>#${index + 1} 夺冠候选</span>
        <strong>${row.team.flag} ${row.team.name} · ${percent(row.champion, latestResults.settings.count)}</strong>
        <small>决赛 ${percent(row.final, latestResults.settings.count)} · 95% ${interval.label}</small>
      </div>
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

  if (selected) {
    $("#focusTitle").textContent = `${selected.team.flag} ${selected.team.name} 阶段概率`;
    renderFocusCard(selected.team);
  }
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
  syncSelectedTeamStyles();
}

function renderFocusCard(team) {
  const f = team.factors;
  const counter = latestResults?.counters.find((row) => row.team.id === team.id);
  const total = latestResults?.settings.count || 1;
  const insight = teamInsight(team, counter, total);
  $("#teamProfile").innerHTML = `
    <div class="focus-card">
      <div>
        <h3>${team.flag} ${team.name}</h3>
        <p>${team.group}组 · ${team.confed} · 综合分 ${getTeamRating(team)} · ${f.squadStatus}</p>
      </div>
      <div class="focus-card-stats">
        <span>夺冠 <strong>${counter ? percent(counter.champion, total) : "-"}</strong></span>
        <span>出线 <strong>${counter ? percent(counter.r32, total) : "-"}</strong></span>
      </div>
      <button class="ghost-btn small" type="button" data-open-team-detail="${team.id}">查看详情</button>
    </div>
    ${insightMarkup(insight)}
  `;
}

function renderTeamProfile(team) {
  const f = team.factors;
  const quality = team.reliability;
  const squad = squadForTeam(team);
  const counter = latestResults?.counters.find((row) => row.team.id === team.id);
  const total = latestResults?.settings.count || 1;
  const insight = teamInsight(team, counter, total);
  const totalSquadValue = squad.reduce((sum, player) => sum + (Number(player.marketValueM) || 0), 0);
  const positionCounts = squad.reduce((counts, player) => {
    counts[player.position] = (counts[player.position] || 0) + 1;
    return counts;
  }, {});
  const availabilityCounts = squad.reduce((counts, player) => {
    counts[player.injuryStatus] = (counts[player.injuryStatus] || 0) + 1;
    return counts;
  }, {});
  const topPlayers = squad
    .slice()
    .sort((a, b) => b.marketValueM - a.marketValueM || b.caps - a.caps)
    .slice(0, 5);
  const sourceUrl = squad[0]?.sourceUrl;
  $("#teamDrawerTitle").textContent = `${team.flag} ${team.name}`;
  $("#teamDrawerBody").innerHTML = `
    <div class="profile-heading">
      <div>
        <h3>${team.flag} ${team.name}</h3>
        <p>${team.group}组 · ${team.confed} · 综合分 ${getTeamRating(team)} · ${team.host ? "主办国" : "参赛队"}</p>
      </div>
      <span class="pill">${f.squadStatus}</span>
    </div>
    <div class="profile-grid">
      <div><span>FIFA</span><strong>#${f.fifaRank}</strong><small>${f.fifaPoints} 分</small></div>
      <div><span>Elo</span><strong>${f.elo}</strong><small>2026-06-12</small></div>
      <div><span>赔率</span><strong>${f.odds >= 100000 ? "长赔" : `+${f.odds}`}</strong><small>${(oddsProbability(f.odds) * 100).toFixed(1)}%</small></div>
      <div><span>阵容价值</span><strong>€${f.squadValue}m</strong><small>${f.avgAge} 岁</small></div>
      <div><span>伤病风险</span><strong>${f.injuryRisk}</strong><small>越低越好</small></div>
      <div><span>组赛移动</span><strong>${Math.round(f.travelKm / 100) / 10}k km</strong><small>${f.restDays} 天休息</small></div>
      <div><span>入境旅程</span><strong>${Math.round((f.entryTravelKm ?? 0) / 100) / 10}k km</strong><small>${f.entryTimezoneShift ?? 0}h 时区差</small></div>
      <div><span>地理负担</span><strong>${f.timezoneShift ?? 0}h</strong><small>组赛时区 / 环境 ${f.climateLoad ?? 0}</small></div>
    </div>
    ${insightMarkup(insight)}
    <p class="profile-note">名单状态：${f.squadStatus}；公告：${f.squadAnnouncementStatus ?? "待核"}（${f.squadAnnouncementDate ?? "未定"}）。氛围 ${f.atmosphere}/100，俱乐部分布 ${f.clubScore}/100，世界杯路径经验 ${f.wcPath}/100。数据可信度 ${quality.score}%，可核验字段 ${quality.reliableCount}/${quality.total}。</p>
    <section class="squad-detail">
      <div class="detail-title">
        <span>阵容信息</span>
        <span class="muted">${squad.length ? `${squad.length} 名球员 · ${squad[0].snapshotDate}` : "暂无球员级名单"}</span>
      </div>
      ${squad.length ? `
        <div class="squad-summary">
          <div><span>球员行</span><strong>${squad.length}</strong><small>${Object.entries(positionCounts).map(([position, count]) => `${position}${count}`).join(" / ")}</small></div>
          <div><span>名单身价</span><strong>${formatValue(totalSquadValue)}</strong><small>${squad.some((player) => player.valueSource?.includes("proxy")) ? "混合/分配身价" : "球员身价"}</small></div>
          <div><span>可用性</span><strong>${squad.length - (availabilityCounts.unknown || 0)}</strong><small>已核验；${availabilityCounts.unknown || 0} 未确认</small></div>
          <div><span>核心球员</span><strong>${escapeHtml(topPlayers[0]?.player ?? "-")}</strong><small>${formatValue(topPlayers[0]?.marketValueM)}</small></div>
        </div>
        <div class="top-player-row">
          ${topPlayers.map((player) => `
            <span>${escapeHtml(player.player)} <small>${player.position} · ${formatValue(player.marketValueM)}</small></span>
          `).join("")}
        </div>
        <div class="squad-table-wrap">
          <table class="squad-table">
            <thead>
              <tr>
                <th>#</th>
                <th>球员</th>
                <th>位置</th>
                <th>年龄</th>
                <th>俱乐部</th>
                <th>身价</th>
                <th>国家队</th>
                <th>状态</th>
                <th>角色</th>
              </tr>
            </thead>
            <tbody>
              ${squad.map((player) => `
                <tr>
                  <td>${player.slot}</td>
                  <td>${escapeHtml(player.player)}</td>
                  <td>${escapeHtml(player.position)}</td>
                  <td>${player.age}</td>
                  <td>${escapeHtml(player.club)}</td>
                  <td>${formatValue(player.marketValueM)}</td>
                  <td>${player.caps} 场 / ${player.goals} 球</td>
                  <td>${availabilityLabel(player.injuryStatus)}</td>
                  <td>${roleLabel(player.expectedRole)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <p class="profile-note">名单来源：${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(sourceUrl)}</a>` : "未记录"}。身价若标记为代理，表示由球队总身价按角色、年龄、联赛和国家队资历分配。</p>
      ` : `
        <p class="profile-note">这支球队暂未导入可核验的球员级 26 人名单，当前阵容价值、年龄、伤病和俱乐部分布使用球队级代理画像。等官方名单确认后，可通过 README 中的 squad refresh 流程补齐。</p>
      `}
    </section>
    <section class="squad-detail">
      <div class="detail-title">
        <span>小组赛赛程</span>
        <span class="muted">${team.group} 组 · 3 场</span>
      </div>
      <div class="schedule-list">
        ${teamGroupSchedule(team).map((match) => `
          <div class="schedule-row">
            <span>${match.date.slice(5)}</span>
            <strong>${match.opponent ? `${match.opponent.flag} ${match.opponent.name}` : "—"}</strong>
            <span>${match.isHome ? "主" : "客"}</span>
            <small>${match.venue}</small>
          </div>
        `).join("")}
      </div>
    </section>
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
  renderResultSummary();
  renderGroups();
  renderStageBars();
  renderSamplePath();
  $("#runMeta").textContent = `模拟 ${latestResults.settings.count.toLocaleString()} 次 · seed ${latestResults.settings.seed}`;
  $("#avgGoals").textContent = latestResults.avgGoals.toFixed(2);
  $("#avgPens").textContent = latestResults.avgPens.toFixed(2);
  $("#thirdRate").textContent = `${(latestResults.thirdRate * 100).toFixed(1)}%`;
  updateExportState();
  syncSelectedTeamStyles();
  renderShootingMode();
}

function selectTeam(teamId, options = {}) {
  const team = teams.find((item) => item.id === Number(teamId));
  if (!team) return;
  $("#focusTeam").value = team.id;
  $("#shootTeam").value = team.id;
  const counter = latestResults?.counters.find((row) => row.team.id === team.id);
  renderStageBars(counter);
  renderShootingMode();
  if (options.openDetails) openTeamDrawer(team, options.trigger);
}

function syncControlLabels() {
  $("#randomnessValue").textContent = Number($("#randomness").value).toFixed(2);
  $("#hostValue").textContent = $("#hostBoost").value;
  $("#penaltyValue").textContent = Number($("#penaltyWeight").value).toFixed(2);
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: currentSettings(), teams }));
  setStatus("已保存");
  showToast("当前参数已保存到本机");
}

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    setStatus("无保存", "empty");
    showToast("没有找到已保存的方案");
    return;
  }
  const parsed = JSON.parse(stored);
  teams = createTeams(parsed.teams || []);
  latestResults = null;
  latestSample = null;
  latestSampleIndex = 0;
  latestMatchPrediction = null;
  resultsAreStale = false;
  $("#simCount").value = parsed.settings.count;
  $("#seedInput").value = parsed.settings.seed || "2026-world-cup";
  $("#randomness").value = parsed.settings.randomness;
  $("#hostBoost").value = parsed.settings.hostBoost;
  $("#penaltyWeight").value = parsed.settings.penaltyWeight;
  syncControlLabels();
  renderInitial();
  $("#runMeta").textContent = "尚未模拟";
  $("#avgGoals").textContent = "-";
  $("#avgPens").textContent = "-";
  $("#thirdRate").textContent = "-";
  $("#samplePath").innerHTML = "<p class='muted'>运行后显示一条随机路径。</p>";
  setStatus("已加载");
  showToast("已加载保存方案");
}

function resetSettings() {
  teams = createTeams();
  latestResults = null;
  latestSample = null;
  latestSampleIndex = 0;
  resultsAreStale = false;
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
  updateExportState();
  setStatus("已重置");
  showToast("已恢复默认参数");
}

function exportCsv() {
  if (!latestResults || resultsAreStale) {
    showToast("请先运行模拟，再导出 CSV");
    return;
  }
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
  showToast("CSV 已开始下载");
}

document.addEventListener("input", (event) => {
  if (event.target.matches("#randomness, #hostBoost, #penaltyWeight")) {
    syncControlLabels();
    markResultsStale("参数已变更");
    markMatchPredictionStale();
    if (!latestResults) setStatus("参数已变更", "dirty");
  }
  if (event.target.matches("#simCount, #seedInput")) {
    updatePresetState();
    markResultsStale("参数已变更");
    markMatchPredictionStale();
    if (!latestResults) setStatus("参数已变更", "dirty");
  }
  if (event.target.matches("[data-team-rating]")) {
    const team = teams.find((item) => item.id === Number(event.target.dataset.teamRating));
    team.manualRating = Number(event.target.value);
    latestResults = null;
    renderDataCoverage();
    renderGroups();
    renderResultSummary();
    updateExportState();
    markMatchPredictionStale();
    markResultsStale();
    if (!latestResults) setStatus("待重新运行", "dirty");
  }
  if (event.target.matches("[data-lottery-odds]") && latestMatchPrediction) {
    renderMatchPrediction(latestMatchPrediction);
  }
});

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-count]")) {
    $("#simCount").value = event.target.dataset.count;
    updatePresetState();
    markResultsStale("参数已变更");
    markMatchPredictionStale();
    if (!latestResults) setStatus("参数已变更", "dirty");
  }
  const teamButton = event.target.closest("[data-select-team]");
  if (teamButton) selectTeam(teamButton.dataset.selectTeam, { openDetails: true, trigger: teamButton });
  const detailButton = event.target.closest("[data-open-team-detail]");
  if (detailButton) {
    const team = teams.find((item) => item.id === Number(detailButton.dataset.openTeamDetail));
    if (team) openTeamDrawer(team, detailButton);
  }
  if (event.target.closest("[data-copy-sporttery-slip]")) {
    copySportteryBettingSlip().catch(() => showToast("投注清单复制失败"));
  }
  if (event.target.closest("[data-download-sporttery-slip]")) {
    downloadSportteryBettingSlip();
  }
});

$("#runBtn").addEventListener("click", runSimulation);
$("#refreshDataBtn").addEventListener("click", refreshData);
$("#matchPredictBtn").addEventListener("click", async () => {
  await withButtonBusy($("#matchPredictBtn"), "预测中...", runMatchPrediction);
});
$("#shootingModeBtn").addEventListener("click", () => setShootingMode(!shootingMode));
$("#shootNextBtn").addEventListener("click", advanceShootingCard);
$("#shootCopyBtn").addEventListener("click", copyShootingCaption);
$("#shootSaveBtn").addEventListener("click", async () => {
  await withButtonBusy($("#shootSaveBtn"), "保存中...", async () => {
    try {
      await downloadShootingImage();
    } catch (error) {
      showToast("图片保存失败，请改用截图");
      throw error;
    }
  });
});
$("#saveBtn").addEventListener("click", saveSettings);
$("#loadBtn").addEventListener("click", loadSettings);
$("#resetBtn").addEventListener("click", resetSettings);
$("#exportBtn").addEventListener("click", exportCsv);
$("#drawerCloseBtn").addEventListener("click", closeTeamDrawer);
$("#drawerOverlay").addEventListener("click", closeTeamDrawer);
$("#sampleBtn").addEventListener("click", () => {
  latestSampleIndex += 1;
  const settings = latestResults && !resultsAreStale ? latestResults.settings : currentSettings();
  latestSample = simulateTournament(settings, true, createRng(`${settings.seed}:sample:${latestSampleIndex}`));
  renderSamplePath();
  showToast("已重新抽样一条模拟路径");
});
$("#focusTeam").addEventListener("change", () => {
  $("#shootTeam").value = $("#focusTeam").value;
  renderGroups();
  renderRanking(latestResults?.counters || emptyCounters(), latestResults?.settings.count || 1);
  renderStageBars();
  renderShootingMode();
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-sporttery-slip-only-bettable]")) {
    sportterySlipOnlyBettable = event.target.checked;
    renderSportteryOdds();
  }
  if (event.target.matches("#matchTeamA, #matchTeamB")) {
    markMatchPredictionStale();
    updateMatchTeamInfo();
  }
  if (event.target.matches("#shootScene")) {
    renderShootingMode();
  }
  if (event.target.matches("#shootTeam")) {
    selectTeam(event.target.value);
  }
});
document.addEventListener("keydown", (event) => {
  const drawer = $("#teamDrawer");
  if (drawer.hidden) return;
  if (event.key === "Escape") {
    closeTeamDrawer();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) { event.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select, [contenteditable]")) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (!$("#teamDrawer").hidden) return;
  if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    runSimulation();
  }
});

syncControlLabels();
renderInitial();
getRefreshState()
  .then((state) => {
    if (state.running) {
      setRefreshButtonState(true, state.currentStep || "刷新中...");
      waitForDataRefresh().then((result) => {
        if (result.ok) window.location.reload();
        else {
          setRefreshButtonState(false);
          showToast("刷新失败，数据已回滚");
        }
      });
    }
  })
  .catch(() => {});
