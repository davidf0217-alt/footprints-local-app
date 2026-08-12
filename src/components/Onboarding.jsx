import { useState } from "react";
import "./onboarding.css";

const steps = [
  { icon: "🍦", title: "把旅程做成雪糕球", text: "每到一座城市，就收进一球独一无二的回忆。" },
  { icon: "🗺️", title: "先逛逛，再解锁", text: "全国城市都可以先浏览；到达后再把它点亮进你的地图。" },
  { icon: "🔒", title: "数据先留在你手里", text: "未登录时数据只保存在本机。登录后可开启跨设备同步。" },
];

export default function Onboarding({ onDone }) {
  const [index, setIndex] = useState(0); const step = steps[index]; const last = index === steps.length - 1;
  return <div className="onboarding" role="dialog" aria-modal="true" aria-label="雪糕足迹新手引导"><div className="onboarding-card"><span className="onboarding-icon">{step.icon}</span><p className="eyebrow">WELCOME TO XUEGAO</p><h1>{step.title}</h1><p>{step.text}</p><div className="onboarding-dots">{steps.map((_, item) => <i className={item === index ? "is-active" : ""} key={item} />)}</div><button className="button primary" onClick={() => last ? onDone() : setIndex(index + 1)}>{last ? "开始我的第一段旅程" : "继续"}</button><button className="text-button" onClick={onDone}>跳过</button></div></div>;
}
