import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { addRecord, exportRecords, importRecords, readRecords } from "../lib/tripStore.js";
import { syncIfSignedIn } from "../lib/cloudSync.js";
import { resolvePlace } from "../lib/placeCatalog.js";
import TicketScanner from "./TicketScanner.jsx";
import InstallApp from "../components/InstallApp.jsx";
import Onboarding from "../components/Onboarding.jsx";
import PlacePicker from "../components/PlacePicker.jsx";
import PlansDashboard from "./PlansDashboard.jsx";
import CloudAccount from "../components/CloudAccount.jsx";
import "../index.css";

const MapDashboard = lazy(() => import("./MapDashboard.jsx"));
const blankTrip = () => ({ province: "", city: "", placeId: "", date: new Date().toISOString().slice(0, 10), days: 1 });
function download(filename, text) { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }

function Collector({ onSaved }) {
  const [form, setForm] = useState(blankTrip); const [message, setMessage] = useState("");
  const update = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); const place = resolvePlace(form.province, form.city, form.placeId); if (!place || !form.date || !Number(form.days)) return setMessage("请选择省、市并确认日期后再保存。"); onSaved(addRecord({ city: place.city.replace("市", ""), region: `${place.province}${place.city}${place.district || ""}`, date: form.date, days: form.days, coord: place.coord, placeId: place.id })); setForm(blankTrip()); setMessage("这段旅程已冻进雪糕里啦，回看板就能看到！"); };
  return <section className="collector"><div className="collector-intro"><p className="eyebrow">SCOOP A MEMORY</p><h2>收进一口旅程</h2><p>选择去过的省、市和区县，地图会自动定位。</p></div><form onSubmit={submit}><PlacePicker value={form} onChange={setForm} /><div className="form-grid"><label>是哪一天？<input name="date" type="date" value={form.date} onChange={update} /></label><label>停留几天？<input name="days" type="number" min="1" max="365" value={form.days} onChange={update} /></label></div><button className="button primary submit" type="submit">冻进我的雪糕里</button>{message && <p className="form-message" role="status">{message}</p>}</form></section>;
}

export default function TripMapDashboard() {
  const hashRoute = () => ["scan", "collect", "plans"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "dashboard";
  const [route, setRoute] = useState(hashRoute); const [records, setRecords] = useState(readRecords); const [planCity, setPlanCity] = useState(null); const [onboarded, setOnboarded] = useState(() => localStorage.getItem("xuegao.onboarded.v1") === "1"); const fileRef = useRef(null);
  useEffect(() => { const syncRoute = () => setRoute(hashRoute()); const syncRecords = (event) => { if (event.key?.includes("local-footprint-map-demo")) setRecords(readRecords()); }; addEventListener("hashchange", syncRoute); addEventListener("storage", syncRecords); return () => { removeEventListener("hashchange", syncRoute); removeEventListener("storage", syncRecords); }; }, []);
  const syncSavedData = () => { syncIfSignedIn().then((result) => { if (result) setRecords(result.records); }).catch((error) => window.dispatchEvent(new CustomEvent("xuegao:sync-error", { detail: error.message || "网络或权限错误" }))); };
  useEffect(() => { addEventListener("xuegao:plans-changed", syncSavedData); return () => removeEventListener("xuegao:plans-changed", syncSavedData); });
  const switchRoute = (next) => { location.hash = next === "dashboard" ? "dashboard" : next; };
  const finishOnboarding = (next = "dashboard") => { localStorage.setItem("xuegao.onboarded.v1", "1"); setOnboarded(true); switchRoute(next); };
  const handleImport = async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const next = importRecords(await file.text()); setRecords(next); syncSavedData(); alert("旅行碎片已安全合并进雪糕柜。"); } catch { alert("无法导入：请选择由雪糕足迹导出的有效 JSON 备份文件。"); } event.target.value = ""; };
  const saveAndSync = (nextRecords) => { setRecords(nextRecords); syncSavedData(); };
  const continuePlan = (city) => { setPlanCity(city); switchRoute("dashboard"); };
  return <main className="app-shell"><header className="topbar"><a className="brand" href="#dashboard" onClick={() => switchRoute("dashboard")}>雪糕<span>足迹</span></a><nav><button className={route === "dashboard" ? "nav-active" : ""} onClick={() => switchRoute("dashboard")}>雪糕柜</button><button className={route === "plans" ? "nav-active" : ""} onClick={() => switchRoute("plans")}>计划</button><button className={route === "collect" ? "nav-active" : ""} onClick={() => switchRoute("collect")}>加一球</button><button className={route === "scan" ? "nav-active" : ""} onClick={() => switchRoute("scan")}>扫票据</button></nav><InstallApp /></header>{route === "dashboard" ? <><header className="page-heading"><p>ONE SCOOP, ONE STORY</p><h1>{records.length ? "今天，想回味哪段旅程？" : "从第一座城市开始吧"}</h1><span>{records.length ? "每抵达一个地方，就给雪糕柜添一球甜甜的回忆。" : "先逛逛城市图鉴，抵达后再把它收进你的雪糕柜。"}</span></header><Suspense fallback={<div className="map-wrap"><div className="status">正在打开雪糕地图…</div></div>}><MapDashboard records={records} onCollect={() => switchRoute("collect")} requestedCity={planCity} onCityOpened={() => setPlanCity(null)} /></Suspense></> : route === "plans" ? <PlansDashboard onOpenCity={continuePlan} /> : route === "scan" ? <TicketScanner onSaved={saveAndSync} /> : <Collector onSaved={saveAndSync} />}<section className="sync-card"><div><p className="eyebrow">YOUR TRAVEL FREEZER</p><h2>旅行数据保存在这台设备</h2><p>图片与文字票据请到“扫票据”识别；JSON 仅用于完整备份和迁移。</p></div><div className="sync-actions"><button className="button secondary" onClick={() => download("xuegao-travel.json", exportRecords())}>备份旅行碎片</button><button className="button secondary" onClick={() => fileRef.current?.click()}>导入 JSON 备份</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} /></div></section><CloudAccount onSynced={({ records: nextRecords }) => setRecords(nextRecords)} /><footer>雪糕足迹 · 未登录时数据只保存在当前设备</footer>{!onboarded && <Onboarding onDone={finishOnboarding} />}</main>;
}
