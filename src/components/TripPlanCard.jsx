import { useState } from "react";
import { BUDGETS, CHECKLIST, PLAN_TEMPLATES } from "../lib/planTemplates.js";
import { planForCity, savePlan } from "../lib/planStore.js";
import "./tripPlan.css";

export default function TripPlanCard({ city, guide, onBack }) {
  const template = PLAN_TEMPLATES[city]; const [plan, setPlan] = useState(() => planForCity(city) || { city, budget: "balanced", checks: {}, travelers: 1 });
  if (!template) return <div className="plan-empty"><span>🗓️</span><p>这座城市的计划模板还在准备中。</p><button className="button secondary" onClick={onBack}>返回城市卡</button></div>;
  const change = (next) => { setPlan(next); savePlan(next); };
  return <div className="trip-plan"><button className="text-button" onClick={onBack}>← 返回城市卡</button><p className="eyebrow">TRIP PLAN · LOCAL FIRST</p><h2>{city}，先把旅行想明白</h2><section><h3>三个关键判断</h3>{template.decisions.map((item, i) => <p className="decision" key={item}><b>{i + 1}</b>{item}</p>)}</section><section><h3>按天安排</h3>{template.days.map((day, i) => <div className="plan-day" key={i}><b>DAY {i + 1}</b><span>{day.join(" · ")}</span></div>)}</section><section><h3>预算与 AA</h3><div className="budget-options">{BUDGETS.map((item) => <button key={item.id} className={plan.budget === item.id ? "is-selected" : ""} onClick={() => change({ ...plan, budget: item.id })}><b>{item.label}</b><span>{item.range}</span><small>{item.note}</small></button>)}</div><p className="plan-note">预算为参考区间，未包含实时票价；多人同行可按实际支出均分，出发前再核对。</p></section><section><h3>出发前确认</h3>{CHECKLIST.map((item) => <label className="plan-check" key={item}><input type="checkbox" checked={Boolean(plan.checks[item])} onChange={() => change({ ...plan, checks: { ...plan.checks, [item]: !plan.checks[item] } })} />{item}</label>)}<a href={guide.source.url} target="_blank" rel="noreferrer">打开官方信息核验 ↗</a></section><p className="plan-saved">已自动保存在这台设备</p></div>;
}
