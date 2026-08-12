import { useMemo } from "react";
import { PROVINCES, CITIES, placesForCity } from "../lib/placeCatalog.js";
import "./placePicker.css";

export default function PlacePicker({ value, onChange, compact = false }) {
  const provinces = PROVINCES.map((item) => item.name);
  const cities = CITIES.filter((item) => item.province === value.province).map((item) => item.city);
  const districts = placesForCity(value.province, value.city);
  const selected = useMemo(() => districts.find((item) => item.id === value.placeId), [districts, value.placeId]);
  const update = (field, next) => { if (field === "province") onChange({ province: next, city: "", placeId: "" }); else if (field === "city") onChange({ ...value, city: next, placeId: "" }); else onChange({ ...value, placeId: next }); };
  return <div className={`place-picker${compact ? " compact" : ""}`}><label>省份<select value={value.province} onChange={(event) => update("province", event.target.value)}><option value="">选择省份</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select></label><label>城市<select value={value.city} onChange={(event) => update("city", event.target.value)} disabled={!value.province}><option value="">选择城市</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label><label>区 / 县 <em>可选</em><select value={value.placeId} onChange={(event) => update("placeId", event.target.value)} disabled={!value.city || districts.length === 0}><option value="">{districts.length ? "选择区 / 县（可选）" : "该城市暂未收录区县"}</option>{districts.map((item) => <option value={item.id} key={item.id}>{item.district}</option>)}</select></label>{selected && <p className="place-selected">📍 {selected.province} · {selected.city} · {selected.district}，已自动定位</p>}{value.city && !selected && <p className="place-selected">📍 已按 {value.city} 城市中心自动定位；区县可后续补选</p>}</div>;
}
