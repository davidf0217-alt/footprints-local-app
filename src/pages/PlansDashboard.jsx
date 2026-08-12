import { useState } from "react";
import { readPlans, removePlan } from "../lib/planStore.js";
import { BUDGETS, CHECKLIST } from "../lib/planTemplates.js";

export default function PlansDashboard({ onOpenCity }) {
  const [plans, setPlans] = useState(readPlans); const erase = (city) => { if (confirm(`删除「${city}」的本地计划吗？足迹记录不会受影响。`)) setPlans(removePlan(city)); };
  return <section className="plans-dashboard"><header className="page-heading"><p>TRAVEL PLANS</p><h1>出发前，先把旅程想明白</h1><span>计划不会解锁城市；只有实际到达并记录，才会点亮足迹。</span></header>{plans.length ? <div className="plans-grid">{plans.map((plan) => { const budget = BUDGETS.find((item) => item.id === plan.budget); const done = CHECKLIST.filter((item) => plan.checks?.[item]).length; return <article className="plan-summary" key={plan.city}><span>🗓️</span><div><p>{budget?.label || "舒适"}预算 · {plan.travelers || 1} 人同行</p><h2>{plan.city}</h2><small>确认清单 {done}/{CHECKLIST.length} 项</small></div><button className="button secondary" onClick={() => onOpenCity(plan.city)}>继续计划</button><button className="text-button" onClick={() => erase(plan.city)}>删除</button></article>; })}</div> : <div className="plans-empty"><span>🗓️</span><h2>还没有旅行计划</h2><p>去城市图鉴打开一座城市，再点击“为这里做个计划”。</p></div>}</section>;
}
