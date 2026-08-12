import provinces from "./data/provinces.json";
import cities from "./data/cities.json";
import coordinateRegions from "./data/city-coordinates.json";

// 精选区县提供更细的落点；全国城市来自内置行政区目录，离线也可选择。
export const PLACE_CATALOG = [
  { id: "henan-zhengzhou-jinshui", province: "河南省", city: "郑州市", district: "金水区", coord: [113.6606, 34.7998] },
  { id: "henan-zhengzhou-erqi", province: "河南省", city: "郑州市", district: "二七区", coord: [113.6402, 34.7247] },
  { id: "guangdong-shenzhen-nanshan", province: "广东省", city: "深圳市", district: "南山区", coord: [113.9305, 22.5333] },
  { id: "guangdong-shenzhen-futian", province: "广东省", city: "深圳市", district: "福田区", coord: [114.0557, 22.541] },
  { id: "hubei-wuhan-wuchang", province: "湖北省", city: "武汉市", district: "武昌区", coord: [114.3162, 30.5539] },
  { id: "hubei-wuhan-jianghan", province: "湖北省", city: "武汉市", district: "江汉区", coord: [114.2703, 30.6018] },
  { id: "sichuan-chengdu-wuhou", province: "四川省", city: "成都市", district: "武侯区", coord: [104.043, 30.6415] },
  { id: "sichuan-chengdu-jinjiang", province: "四川省", city: "成都市", district: "锦江区", coord: [104.1173, 30.6561] },
  { id: "shandong-qingdao-shinan", province: "山东省", city: "青岛市", district: "市南区", coord: [120.387, 36.0662] },
  { id: "hunan-changsha-yuelu", province: "湖南省", city: "长沙市", district: "岳麓区", coord: [112.9314, 28.235] },
];

export const unique = (items) => [...new Set(items)];
export function findPlace(id) { return PLACE_CATALOG.find((item) => item.id === id); }

const cityCenterOverrides = Object.fromEntries(PLACE_CATALOG.map((item) => [`${item.province}:${item.city}`, item.coord]));
const normalizeName = (name = "") => name.replace(/[市州盟地区特别行政区]/g, "");
const cityCoordinates = new Map();
coordinateRegions.forEach((region) => region.children?.forEach((item) => {
  cityCoordinates.set(`${normalizeName(region.name)}:${normalizeName(item.name)}`, [Number(item.log), Number(item.lat)]);
}));
const mainlandCityCenter = (province, city) => cityCoordinates.get(`${normalizeName(province)}:${normalizeName(city)}`) || cityCoordinates.get(`${normalizeName(province)}:${normalizeName(province)}`) || [116.4074, 39.9042];

export const PROVINCES = provinces.map((item) => ({ code: item.code, name: item.name, province: item.province }));
export const CITIES = cities.map((item) => {
  const province = PROVINCES.find((value) => value.province === item.province);
  return {
    id: `city-${item.code}`,
    code: item.code,
    province: province?.name || "其他地区",
    city: item.name,
    district: "",
    coord: cityCenterOverrides[`${province?.name}:${item.name}`] || mainlandCityCenter(province?.name, item.name),
  };
});

export const placesForCity = (province, city) => PLACE_CATALOG.filter((item) => item.province === province && item.city === city);
export const findCity = (province, city) => CITIES.find((item) => item.province === province && item.city === city);
export const resolvePlace = (province, city, placeId) => findPlace(placeId) || findCity(province, city);
