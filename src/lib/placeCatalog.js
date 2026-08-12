// 首批内置地点目录：采集时由目录提供中心坐标，用户不需要手填经纬度。
// 后续可替换为全国行政区数据包或云端只读目录，记录仍保留 placeId 与坐标快照。
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
