export const ACHIEVEMENTS = [
  { min: 1, title: "融化的第一口", note: "第一座城市，第一球回忆。", icon: "🍦" },
  { min: 3, title: "甜筒漫游者", note: "三座城市，开始有自己的口味地图。", icon: "🍧" },
  { min: 6, title: "风味收藏家", note: "六座城市，能把旅程装满一整个雪糕柜。", icon: "🍨" },
  { min: 10, title: "城市品鉴师", note: "十座城市，懂得每一站都有不同的甜。", icon: "🏆" },
  { min: 20, title: "雪糕旅行家", note: "二十座城市，把好奇心带得很远。", icon: "🌏" },
  { min: 50, title: "地球甜品师", note: "五十座城市，世界都是你的口味灵感。", icon: "✨" },
];

// 轻量的本地“城市风味卡”。开放、预约、价格等即时信息请以卡片中的官方入口为准。
export const CITY_GUIDES = {
  郑州: { tone: "中原暖汤", foods: ["烩面", "胡辣汤"], sights: ["河南博物院", "黄河文化公园"], tip: "适合把博物馆安排在白天，再用一碗热汤收尾。", source: { label: "郑州文旅官方信息", url: "https://www.zhengzhou.gov.cn/view42/index.jhtml" } },
  深圳: { tone: "海风早茶", foods: ["广式早茶", "烧鹅"], sights: ["深圳湾公园", "华侨城创意文化园"], tip: "海边散步与城市展览可以排在同一天，记得预留傍晚。", source: { label: "深圳文旅官方信息", url: "https://www.sz.gov.cn/cn/bmfw/ydyy/wx/bm/content/post_11406351.html" } },
  武汉: { tone: "江城热气", foods: ["热干面", "豆皮"], sights: ["黄鹤楼", "东湖"], tip: "早晨吃一碗热干面，再慢慢把江边和湖边留给傍晚。", source: { label: "武汉文旅官方信息", url: "https://www.wuhan.gov.cn/zjwh/whly/" } },
  成都: { tone: "麻辣奶盖", foods: ["川味火锅", "担担面"], sights: ["成都大熊猫繁育研究基地", "宽窄巷子"], tip: "熊猫基地适合早点出发；街区和小吃更适合慢慢逛。", source: { label: "成都文旅官方信息", url: "https://cdwglj.chengdu.gov.cn/" } },
  青岛: { tone: "海盐气泡", foods: ["海鲜", "鲅鱼水饺"], sights: ["八大关", "崂山"], tip: "给海边留一段无目的散步的时间，天气变化时注意保暖。", source: { label: "青岛文旅官方信息", url: "https://whly.qingdao.gov.cn/" } },
  长沙: { tone: "辣味焦糖", foods: ["臭豆腐", "剁椒鱼头"], sights: ["岳麓山", "橘子洲"], tip: "山、水、夜宵适合分段体验，不必把行程塞得太满。", source: { label: "长沙文旅官方信息", url: "https://wlgd.changsha.gov.cn/" } },
};

export function achievementFor(cityCount) { return [...ACHIEVEMENTS].reverse().find((item) => cityCount >= item.min) || null; }
export function nextAchievementFor(cityCount) { return ACHIEVEMENTS.find((item) => item.min > cityCount) || null; }
