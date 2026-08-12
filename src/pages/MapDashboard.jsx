import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { EffectScatterChart, LinesChart, MapChart } from "echarts/charts";
import { GeoComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { ACHIEVEMENTS, CITY_GUIDES, achievementFor, nextAchievementFor } from "../lib/cityGuide.js";
import "./cityExplorer.css";

echarts.use([GeoComponent, TitleComponent, TooltipComponent, EffectScatterChart, LinesChart, MapChart, CanvasRenderer]);

function CityExplorer({ city, record, onClose }) {
  const [tab, setTab] = useState("sights");
  const guide = CITY_GUIDES[city];
  if (!city) return null;
  const items = tab === "sights" ? guide?.sights : guide?.foods;
  const isSight = tab === "sights";
  return <div className="city-modal" role="dialog" aria-modal="true" aria-label={`${city}城市探索`}>
    <button className="city-modal-backdrop" aria-label="关闭城市探索" onClick={onClose} />
    <section className="city-modal-card">
      <button className="city-modal-close" aria-label="关闭" onClick={onClose}>×</button>
      <p className="eyebrow">CITY SCOOP</p>
      <div className="city-modal-title"><div><h2>{city}</h2><p>{guide?.tone || "新解锁的城市"} · 已收进雪糕柜</p></div><span>🍨</span></div>
      <div className="city-modal-tabs"><button className={tab === "sights" ? "is-selected" : ""} onClick={() => setTab("sights")}>🏛️ 必去景点</button><button className={tab === "foods" ? "is-selected" : ""} onClick={() => setTab("foods")}>🍜 当地美食</button></div>
      {items ? <><div className="city-modal-grid">{items.map((item, index) => <article key={item} className={`city-modal-item item-${index % 3}`}><span>{isSight ? ["🏔️", "🌊", "🏛️"][index % 3] : ["🥣", "🍢", "🍲"][index % 3]}</span><b>{item}</b></article>)}</div><p className="city-modal-tip">{guide.tip}</p><a className="city-modal-link" href={guide.source.url} target="_blank" rel="noreferrer">查看 {city} 官方文旅信息 ↗</a></> : <div className="city-modal-empty"><span>🧭</span><p>这座城市的灵感卡正在准备中。</p><small>{record?.region || "已解锁"} · 先把这段旅程好好收进雪糕柜吧</small></div>}
    </section>
  </div>;
}

export default function MapDashboard({ records, onCollect }) {
  const chartRef = useRef(null); const instanceRef = useRef(null);
  const [state, setState] = useState("loading"); const [playIndex, setPlayIndex] = useState(-1); const [playing, setPlaying] = useState(false); const [selectedCity, setSelectedCity] = useState(null);
  const timeline = useMemo(() => [...records].sort((a, b) => a.date.localeCompare(b.date)), [records]);
  const active = playIndex < 0 ? records : timeline.slice(0, playIndex + 1); const current = timeline[playIndex];
  const unlockedCities = useMemo(() => [...new Set(records.map((item) => item.city.trim()).filter(Boolean))], [records]);
  const currentAchievement = achievementFor(unlockedCities.length); const nextAchievement = nextAchievementFor(unlockedCities.length);
  const cityGuides = Object.entries(CITY_GUIDES).map(([city, guide]) => ({ city, guide, unlocked: unlockedCities.includes(city) }));
  const selectedRecord = records.find((item) => item.city === selectedCity);
  const stats = [{ value: active.length, label: "雪糕球" }, { value: unlockedCities.length, label: "解锁城市" }, { value: active.reduce((sum, item) => sum + item.days, 0), label: "旅行天数" }, { value: playIndex < 0 ? timeline.length : playIndex + 1, label: "回味进度" }];

  useEffect(() => { fetch(`${import.meta.env.BASE_URL}maps/china.geo.json`).then((response) => { if (!response.ok) throw Error(); return response.json(); }).then((map) => { echarts.registerMap("china", map); setState("ready"); }).catch(() => setState("error")); }, []);
  useEffect(() => {
    if (state !== "ready" || !chartRef.current) return;
    const chart = instanceRef.current || echarts.init(chartRef.current); instanceRef.current = chart;
    chart.setOption({ backgroundColor: "transparent", title: { text: "雪糕旅程地图", subtext: records.length ? "点一座城市，打开它的探索卡" : "你的地图从第一座城市开始", left: "center", top: 12, textStyle: { color: "#584445", fontSize: 18, fontWeight: 700 }, subtextStyle: { color: "#86868b", fontSize: 12 } }, tooltip: { show: false }, geo: { map: "china", roam: true, zoom: 1.15, itemStyle: { areaColor: "#f8f4f3", borderColor: "#ded9d7" }, emphasis: { itemStyle: { areaColor: "#f7e9df" } } }, series: [{ type: "effectScatter", coordinateSystem: "geo", rippleEffect: { brushType: "stroke", scale: 4 }, symbolSize: (value) => 8 + value[2] * 3, itemStyle: { color: "#f48b9f" }, label: { show: true, position: "right", formatter: "{b}", color: "#584445", fontSize: 10 }, data: active.map((item) => ({ name: item.city, value: [...item.coord, item.days], record: item })) }, { type: "lines", coordinateSystem: "geo", effect: { show: true, period: 4, symbol: "arrow", symbolSize: 6, color: "#f48b9f" }, lineStyle: { color: "#f48b9f", width: 1.2, opacity: .5, curveness: .25 }, data: active.slice(1).map((item, index) => ({ coords: [active[index].coord, item.coord] })) }] }, true);
    const openCity = (params) => { if (params.data?.record) setSelectedCity(params.data.record.city); };
    chart.off("click"); chart.on("click", openCity);
    const resize = () => chart.resize(); addEventListener("resize", resize); return () => { chart.off("click", openCity); removeEventListener("resize", resize); };
  }, [active, state]);
  useEffect(() => () => instanceRef.current?.dispose(), []);
  useEffect(() => { if (!playing) return; const timer = setInterval(() => setPlayIndex((value) => { if (value >= timeline.length - 1) { setPlaying(false); return value; } return value + 1; }), 1400); return () => clearInterval(timer); }, [playing, timeline.length]);

  return <><section className="stats">{stats.map((item) => <div className="stat" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</section><section className="map-wrap" aria-busy={state === "loading"}>{state === "loading" && <div className="status">正在打开雪糕地图…</div>}{state === "error" && <div className="status error">雪糕地图没有准备好，请重新安装应用。</div>}<div ref={chartRef} className="chart" hidden={state !== "ready"} /></section><section className="controls"><button className="button primary" onClick={() => { if (playIndex < 0 || playIndex >= timeline.length - 1) setPlayIndex(0); setPlaying(true); }} disabled={!timeline.length}>{playing ? "正在回味" : playIndex >= 0 ? "继续回味" : "回味旅程"}</button><button className="button secondary" onClick={() => setPlaying(false)} disabled={!playing}>先放一放</button><button className="button secondary" onClick={() => { setPlaying(false); setPlayIndex(-1); }}>看看全部</button></section>{current && <div className="progress" aria-live="polite"><span>{current.date}　{current.city}　{current.days} 天</span><i style={{ "--progress": `${((playIndex + 1) / timeline.length) * 100}%` }} /></div>}<section className="achievement" aria-label="城市解锁成就"><div className="achievement-main"><span className="achievement-icon">{currentAchievement?.icon || "🍦"}</span><div><p>已解锁 {unlockedCities.length} 座城市</p><h2>{currentAchievement?.title || "第一口，先出发"}</h2><span>{currentAchievement?.note || "记录第一座城市即可解锁称号。"}</span></div></div>{nextAchievement ? <div className="achievement-next"><span>距离「{nextAchievement.title}」还差 {nextAchievement.min - unlockedCities.length} 座</span><i><b style={{ width: `${Math.min(100, (unlockedCities.length / nextAchievement.min) * 100)}%` }} /></i></div> : <p className="achievement-complete">全部称号已点亮，继续为你的雪糕柜添新口味吧。</p>}<div className="achievement-badges">{ACHIEVEMENTS.map((item) => <span className={unlockedCities.length >= item.min ? "is-unlocked" : ""} key={item.title} title={`${item.min} 座城市解锁`}>{item.icon}<b>{item.title}</b></span>)}</div></section><section className="city-discoveries"><div className="section-heading"><div><p>LOCAL FLAVOURS</p><h2>已解锁的城市风味</h2></div><span>点击地图城市查看完整探索卡</span></div>{cityGuides.length ? <div className="city-guide-grid">{cityGuides.map(({ city, guide }) => <button className="city-guide" key={city} onClick={() => setSelectedCity(city)}><div className="city-guide-title"><div><span>{guide.tone}</span><h3>{city}</h3></div><i>🍨</i></div><div className="guide-pairs"><p><b>🍜 吃什么</b>{guide.foods.join(" · ")}</p><p><b>📍 去哪里</b>{guide.sights.join(" · ")}</p></div><span className="guide-open">打开探索卡 →</span></button>)}</div> : <p className="empty">解锁城市后，这里会出现一张当地灵感卡。</p>}</section><section className="footprints"><h2>我的雪糕柜</h2><div>{records.length ? records.map((item) => <button className={`chip${active.includes(item) ? " is-active" : ""}`} key={item.id} onClick={() => setSelectedCity(item.city)}>🍨 {item.city} <b>{item.date}</b></button>) : <p className="empty">雪糕柜还是空的，去加第一球旅程吧。</p>}</div></section><CityExplorer city={selectedCity} record={selectedRecord} onClose={() => setSelectedCity(null)} /></>;
}
