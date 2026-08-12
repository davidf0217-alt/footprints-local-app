import { readPlans, replacePlans, savePlan } from "./planStore.js";
import { readRecords, replaceRecords } from "./tripStore.js";
import { cloudConfigured, supabase } from "./supabaseClient.js";

const DEVICE_KEY = "xuegao-footprints.device-id.v1";
let running = null;
let rerun = false;
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const validCoord = (value) => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && value[0] >= 73 && value[0] <= 135 && value[1] >= 18 && value[1] <= 54;
const getDeviceId = () => { let id = localStorage.getItem(DEVICE_KEY); if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); } return id; };
const sourceFor = (source) => source === "ticket-ocr" ? "image_ocr" : source === "text-paste" ? "text_paste" : "manual";
const transportFor = (value = "") => /机|flight|air/i.test(value) ? "flight" : /火车|高铁|动车|train/i.test(value) ? "train" : "other";
const transportLabel = (value) => value === "flight" ? "机票" : value === "train" ? "火车票" : value ? "其他票据" : undefined;

function toTripRow(record) {
  if (!record?.id || !record.city?.trim() || !validDate(record.date) || !validCoord(record.coord)) return null;
  return { client_id: record.id, city: record.city.trim(), province: record.region?.trim() || "", days: Math.max(1, Number(record.days) || 1), trip_month: record.date.slice(0, 7), city_id: record.placeId || null, district_name: record.district || null, coord: { lng: record.coord[0], lat: record.coord[1] }, arrived_on: record.date, transport: record.ticketType ? transportFor(record.ticketType) : null, service_number: record.ticketNumber?.slice(0, 20) || null, source: sourceFor(record.source), device_id: getDeviceId(), revision: 1 };
}
function fromTripRow(row) {
  const coord = row?.coord && Number.isFinite(Number(row.coord.lng)) && Number.isFinite(Number(row.coord.lat)) ? [Number(row.coord.lng), Number(row.coord.lat)] : null;
  if (!row?.client_id || !row.city?.trim() || !validDate(row.arrived_on) || !validCoord(coord)) return null;
  return { id: row.client_id, city: row.city, region: row.province || "", coord, date: row.arrived_on, days: Number(row.days) || 1, placeId: row.city_id || undefined, district: row.district_name || undefined, source: row.source === "image_ocr" ? "ticket-ocr" : row.source, ticketType: transportLabel(row.transport), ticketNumber: row.service_number || undefined, updatedAt: row.updated_at };
}
function mergeById(local, remote, key = "id") {
  const result = new Map(local.map((item) => [item[key] || item.clientId, item]));
  remote.filter(Boolean).forEach((item) => { const id = item[key] || item.clientId; const current = result.get(id); if (!current || (item.updatedAt || "") > (current.updatedAt || "")) result.set(id, item); });
  return [...result.values()];
}
async function syncTrips() {
  const { data: pulled, error } = await supabase.from("trips").select("client_id,city,province,days,trip_month,city_id,district_name,coord,arrived_on,transport,service_number,source,updated_at,deleted_at").is("deleted_at", null);
  if (error) throw error;
  const rows = readRecords().map(toTripRow).filter(Boolean);
  if (rows.length) { const { error: writeError } = await supabase.from("trips").upsert(rows, { onConflict: "user_id,client_id" }); if (writeError) throw writeError; }
  const validRemote = (pulled || []).map(fromTripRow).filter(Boolean);
  replaceRecords(mergeById(readRecords(), validRemote));
}
async function syncPlans() {
  const localAll = readPlans({ includeDeleted: true }).map((plan) => plan.clientId ? plan : savePlan(plan));
  const { data: pulled, error } = await supabase.from("plans").select("client_id,city_id,city_name,content,status,updated_at,deleted_at");
  if (error) throw error;
  const remoteAll = (pulled || []).map((row) => ({ ...(row.content || {}), city: row.city_name, cityId: row.city_id, clientId: row.client_id, status: row.status, deletedAt: row.deleted_at || undefined, updatedAt: row.updated_at })).filter((item) => item.clientId && item.city);
  const merged = mergeById(localAll, remoteAll, "clientId");
  const rows = merged.map((plan) => ({ client_id: plan.clientId, city_id: plan.cityId || `local-${encodeURIComponent(plan.city)}`, city_name: plan.city, content: { ...plan, deletedAt: undefined }, status: plan.status || "draft", device_id: getDeviceId(), revision: 1, deleted_at: plan.deletedAt || null }));
  if (rows.length) { const { error: writeError } = await supabase.from("plans").upsert(rows, { onConflict: "user_id,client_id" }); if (writeError) throw writeError; }
  replacePlans(merged, { announceChange: false });
}
async function executeSync() { await syncTrips(); await syncPlans(); return { records: readRecords(), plans: readPlans() }; }
export async function syncAll() {
  if (!cloudConfigured) throw new Error("云同步尚未配置");
  if (running) { rerun = true; return running; }
  running = executeSync().finally(() => { running = null; });
  const result = await running;
  if (rerun) { rerun = false; return syncAll(); }
  return result;
}
export async function syncIfSignedIn() { if (!cloudConfigured) return null; const { data } = await supabase.auth.getSession(); return data.session ? syncAll() : null; }
