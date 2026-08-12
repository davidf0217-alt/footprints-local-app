const KEY = "xuegao-footprints.plans.v1";
const announce = () => window.dispatchEvent(new Event("xuegao:plans-changed"));
const isPlan = (item) => item && typeof item === "object" && typeof item.city === "string" && item.city.trim().length > 0;
export function readPlans({ includeDeleted = false } = {}) { try { const value = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(value) ? value.filter(isPlan).filter((item) => includeDeleted || !item.deletedAt) : []; } catch { return []; } }
export function replacePlans(plans, { announceChange = true } = {}) { localStorage.setItem(KEY, JSON.stringify((Array.isArray(plans) ? plans : []).filter(isPlan))); if (announceChange) announce(); return readPlans(); }
export function planForCity(city) { return readPlans().filter((item) => item.city === city).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))[0] || null; }
export function savePlan(plan) { const plans = readPlans(); const index = plans.findIndex((item) => item.city === plan.city); const next = { ...plan, clientId: plan.clientId || crypto.randomUUID(), updatedAt: new Date().toISOString() }; if (index < 0) plans.push(next); else plans[index] = next; replacePlans(plans); return next; }
export function removePlan(city) { const all = readPlans({ includeDeleted: true }); const next = all.map((item) => item.city === city ? { ...item, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item); replacePlans(next); return readPlans(); }
