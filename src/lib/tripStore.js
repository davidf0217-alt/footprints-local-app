// 公开城市中心经纬度（来源：公开地理资料，仅用于地图落点展示）。
// 下面的“片段”标签是虚构示例顺序，不是真实日期，不代表任何真实个人行程。
export const ORIGIN = { name: "北京", coord: [116.4074, 39.9042] };
export const SAMPLE_RECORDS = [
  { id: "demo-01", city: "郑州", region: "河南省", coord: [113.6254, 34.7466], date: "示例·片段01", days: 3 },
  { id: "demo-02", city: "深圳", region: "广东省", coord: [114.0579, 22.5431], date: "示例·片段02", days: 3 },
  { id: "demo-03", city: "武汉", region: "湖北省", coord: [114.3055, 30.5928], date: "示例·片段03", days: 2 },
  { id: "demo-04", city: "成都", region: "四川省", coord: [104.0665, 30.5723], date: "示例·片段04", days: 2 },
  { id: "demo-05", city: "青岛", region: "山东省", coord: [120.3826, 36.0671], date: "示例·片段05", days: 4 },
  { id: "demo-06", city: "长沙", region: "湖南省", coord: [112.9388, 28.2282], date: "示例·片段06", days: 3 },
];

const STORE_KEY = "local-footprint-map-demo.records.v1";
// date 字段在外部录入时仍是日历日期（用户自己填写的公开/测试数据）；
// 内置示例记录则使用“示例·片段NN”这样的非日历标签，明确为虚构顺序而非真实行程日期。
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const isSegmentLabel = (value) => typeof value === "string" && /^示例·片段\d{2}$/.test(value);
const isRecord = (item) => item && typeof item.id === "string" && typeof item.city === "string" && item.city.trim().length <= 30 && typeof item.region === "string" && item.region.trim().length <= 30 && (isDate(item.date) || isSegmentLabel(item.date)) && Number.isInteger(item.days) && item.days >= 1 && item.days <= 365 && Array.isArray(item.coord) && item.coord.length === 2 && Number.isFinite(item.coord[0]) && Number.isFinite(item.coord[1]) && item.coord[0] >= 73 && item.coord[0] <= 135 && item.coord[1] >= 18 && item.coord[1] <= 54;

export function readRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY));
    // v1 曾把演示数据放进正式存储。升级后绝不把它带入真实足迹。
    return Array.isArray(value) ? value.filter((item) => isRecord(item) && !item.id.startsWith("demo-")) : [];
  } catch { return []; }
}
export function saveRecords(records) { localStorage.setItem(STORE_KEY, JSON.stringify(records.filter(isRecord))); }
export function replaceRecords(records) { saveRecords(records); return readRecords(); }
export function addRecord(input) {
  const record = { ...input, id: crypto.randomUUID(), days: Number(input.days), coord: input.coord, updatedAt: new Date().toISOString() };
  const records = [...readRecords(), record]; saveRecords(records); return records;
}
export function addTripRecord(input) {
  const record = { id: crypto.randomUUID(), city: input.city.trim(), region: input.region.trim() || "票据识别", coord: input.coord, date: input.date, days: Number(input.days || 1), source: "ticket-ocr", ticketType: input.ticketType, ticketNumber: input.ticketNumber, placeId: input.placeId, updatedAt: new Date().toISOString() };
  if (!isRecord(record)) throw new Error("请补充有效的目的地和坐标后再保存");
  const records = [...readRecords(), record]; saveRecords(records); return records;
}
export function exportRecords() { return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records: readRecords() }, null, 2); }
export function importRecords(text) {
  const payload = JSON.parse(text);
  if (!payload || !Array.isArray(payload.records) || !payload.records.every(isRecord)) throw new Error("文件格式不正确");
  const existing = readRecords();
  const ids = new Set(existing.map((item) => item.id));
  const merged = [...existing, ...payload.records.filter((item) => !ids.has(item.id))];
  saveRecords(merged); return merged;
}
// 仅供旧调用兼容；“清空”应当清空，而不是恢复示例。
export function resetRecords() { saveRecords([]); return []; }
