const KEY = "xuegao-footprints.plans.v1";
export function readPlans() { try { const value = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(value) ? value : []; } catch { return []; } }
export function planForCity(city) { return readPlans().find((item) => item.city === city) || null; }
export function savePlan(plan) { const plans = readPlans(); const index = plans.findIndex((item) => item.city === plan.city); const next = { ...plan, updatedAt: new Date().toISOString() }; if (index < 0) plans.push(next); else plans[index] = next; localStorage.setItem(KEY, JSON.stringify(plans)); return next; }
export function removePlan(city) { const next = readPlans().filter((item) => item.city !== city); localStorage.setItem(KEY, JSON.stringify(next)); return next; }
