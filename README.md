# 本地足迹地图演示（脱敏示例）

这是一个**仅供本地运行**的 React + Vite PWA 演示仓库。它包含网页看板、移动端采集入口、统计卡片、地点标签与路线回放；身份信息、平台配置、服务端连接及内部链接均已移除。

## 关于公开城市信息与虚构路线的说明（请先阅读）

- 本仓库**保留公开的地理信息**：示例数据中的城市名称（北京、郑州、深圳、武汉、成都、青岛、长沙）及其**公开城市中心经纬度**均为公开地理资料，仅用于地图落点展示，不属于个人隐私。
- 示例中的**路线、片段顺序、停留天数、统计数字均为虚构示例**，使用“示例·片段NN”这样的非日历标签，**不代表任何真实个人行程或连续轨迹**，也不含真实日期时间。
- **未保留、也不会引入**：个人行程时间线（精确日期/时间/连续轨迹/停留信息）、任何姓名/MIS/邮箱/手机号、酒店/商户/客户识别信息、内部域名/URL/SDK、NoCode/项目 ID、密钥、token、环境配置、内网或业务库/API。
- 本目录从源工作区**仅复制了当前的非 `.git` 文件**，不包含原项目的任何 Git 历史、reflog、提交对象或远端配置。
- **禁止**在此仓库或任何派生产物中放入：真实凭据、密钥、内部域名、内部 Git 地址、真实业务数据、真实人员或商户信息。

## 本地运行

要求：Node.js 18 或更高版本。

```bash
# 1. 安装依赖
npm install

# 2. 本地开发预览（默认 http://127.0.0.1:5173 ）
npm run dev

# 3. 生产构建（产物输出到 dist/ ）
npm run build

# 4. 本地预览构建产物
npm run preview
```

## 原生 App 安装与发布

本项目已接入 Capacitor，并包含原生工程：`ios/` 与 `android/`。网页仍可用于公开预览；正式安装请使用原生包，而不是“添加到主屏幕”。

### iPhone / iPad

1. 在 Mac 安装完整 Xcode（Command Line Tools 不够），用 Apple ID 登录 Xcode。
2. 在项目目录执行 `npm run ios`，会同步网页资源并打开 `ios/App/App.xcworkspace`。
3. 在 Xcode 的 **Signing & Capabilities** 选择你的 Team；Bundle ID 为 `com.xuegao.footprints`，如冲突可改为自己的唯一标识。
4. 连接 iPhone 后选择设备并点击 Run，即可直接安装调试版；发布给测试者请用 Archive → TestFlight，正式发布请提交 App Store Connect 审核。

### Android

1. 安装 Android Studio 与 Android SDK（建议 JDK 17）。
2. 执行 `npm run android`，在 Android Studio 打开 `android/`。
3. 连接设备即可 Run；对外分发请从 Build → Generate Signed Bundle / APK 生成签名 AAB（Google Play）或 APK。

每次改网页后，先执行 `npm run native:sync`，再在 Xcode/Android Studio 编译。票据 OCR 图片仍仅在设备内识别；地图、已访问页面和应用外壳可离线使用。

## 推荐的修改入口（面向二次开发）

- 主页面与路由：`src/pages/TripMapDashboard.jsx`
  - 包含 `#dashboard` 网页看板和 `#collect` 移动采集入口。
- 地图看板：`src/pages/MapDashboard.jsx`
- 本地数据与示例记录：`src/lib/tripStore.js`
  - 记录保存在浏览器本地；同一浏览器内采集后看板立即更新。
  - 内置示例记录使用公开城市名 + 公开坐标，路线标签为虚构顺序，仅供演示。
  - 跨设备请从“数据同步”导出 JSON，再在另一台设备导入。该机制不是云同步，也不会上传数据。
- 票据识别：`src/lib/ticketOcr.js` + `src/pages/TicketScanner.jsx`（仅本地浏览器 OCR，不上传图片）
- 全局样式：`src/index.css`
- 页面挂载入口：`src/main.jsx`（一般无需改动）

## 已知限制

- 全国地图数据已随应用打包，并会由 PWA 缓存；首次安装后可离线查看地图和采集记录。
- 图表模块仅在打开“网页看板”时加载，手机采集页不会下载地图与图表代码。
- 本项目不含账户、云端数据、后台接口或真实跨设备自动同步。若要实现登录后实时同步，应新增经过安全审查的后端、身份认证与数据最小化策略，不能直接把本地存储替换成未鉴权接口。
- 票据 OCR 在当前设备浏览器中运行，不会上传截图；首次使用会下载中文/英文离线识别模型，并由浏览器缓存。识别结果必须由用户核对后才会保存为足迹。
- `.gitignore` 已显式忽略 `.npmrc`、`.yarnrc`、`.catpaw/`、环境文件、凭据、依赖与构建产物；请勿绕过该忽略规则提交敏感文件。
- 示例路线与统计为虚构演示，切换或替换时请继续只填入不含个人、客户、商户或凭据的公开/测试数据。
