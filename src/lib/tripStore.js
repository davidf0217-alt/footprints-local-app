export const ORIGIN = { name: "示例中心", coord: [116.4074, 39.9042] };
export const SAMPLE_RECORDS = [
  { id: "sample-01", city: "示例城市甲", region: "示例区域一", coord: [113.6254, 34.7466], date: "2025-01-12", days: 3 },
  { id: "sample-02", city: "示例城市乙", region: "示例区域二", coord: [114.0579, 22.5431], date: "2025-03-08", days: 3 },
  { id: "sample-03", city: "示例城市丙", region: "示例区域三", coord: [114.3055, 30.5928], date: "2025-03-20", days: 2 },
  { id: "sample-04", city: "示例城市丁", region: "示例区域四", coord: [104.0665, 30.5723], date: "2025-06-16", days: 2 },
  { id: "sample-05", city: "示例城市戊", region: "示例区域五", coord: [120.3826, 36.0671], date: "2025-09-05", days: 4 },
  { id: "sample-06", city: "示例城市己", region: "示例区域六", coord: [112.9388, 28.2282], date: "2025-12-22", days: 3 },
];

const STORE_KEY = "local-footprint-map-demo.records.v1";
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const isRecord = (item) => item && typeof item.id === "string" && typeof item.city === "string" && item.city.trim().length <= 30 && typeof item.region === "string" && item.region.trim().length <= 30 && isDate(item.date) && Number.isInteger(item.days) && item.days >= 1 && item.days <= 365 && Array.isArray(item.coord) && item.coord.length === 2 && Number.isFinite(item.coord[0]) && Number.isFinite(item.coord[1]) && item.coord[0] >= 73 && item.coord[0] <= 135 && item.coord[1] >= 18 && item.coord[1] <= 54;

export function readRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY));
    return Array.isArray(value) && value.every(isRecord) ? value : SAMPLE_RECORDS;
  } catch { return SAMPLE_RECORDS; }
}
export function saveRecords(records) { localStorage.setItem(STORE_KEY, JSON.stringify(records)); }
export function addRecord(input) {
  const record = { ...input, id: crypto.randomUUID(), days: Number(input.days), coord: [Number(input.longitude), Number(input.latitude)] };
  const records = [...readRecords(), record]; saveRecords(records); return records;
}
export function addTripRecord(input) {
  const record = { id: crypto.randomUUID(), city: input.city.trim(), region: input.region.trim() || "票据识别", coord: [Number(input.longitude), Number(input.latitude)], date: input.date, days: Number(input.days || 1), source: "ticket-ocr", ticketType: input.ticketType, ticketNumber: input.ticketNumber };
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
export function resetRecords() { saveRecords(SAMPLE_RECORDS); return SAMPLE_RECORDS; }
