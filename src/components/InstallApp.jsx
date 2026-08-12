import { useEffect, useState } from "react";

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null); const [open, setOpen] = useState(false); const [installed, setInstalled] = useState(isStandalone);
  useEffect(() => { const capture = (event) => { event.preventDefault(); setPrompt(event); }; const done = () => setInstalled(true); addEventListener("beforeinstallprompt", capture); addEventListener("appinstalled", done); return () => { removeEventListener("beforeinstallprompt", capture); removeEventListener("appinstalled", done); }; }, []);
  // Capacitor exposes this marker inside the signed iOS/Android shell.
  // The PWA instruction is useful on the web, but nonsensical in a native app.
  if (installed || window.Capacitor?.isNativePlatform?.()) return null;
  const install = async () => { if (prompt) { prompt.prompt(); await prompt.userChoice; setPrompt(null); return; } setOpen(true); };
  return <><button className="install-button" onClick={install}>安装 App</button>{open && <div className="install-sheet" role="dialog" aria-modal="true" aria-label="安装雪糕足迹"><button className="sheet-backdrop" aria-label="关闭" onClick={() => setOpen(false)} /><div className="sheet-card"><button className="sheet-close" onClick={() => setOpen(false)} aria-label="关闭">×</button><img src={`${import.meta.env.BASE_URL}icon-180.png`} alt="雪糕足迹应用图标" /><h2>安装“雪糕足迹”</h2>{isIos() ? <p>在 Safari 点击底部的“分享”，选择“添加到主屏幕”，再点击“添加”。安装后，从主屏幕打开你的甜甜旅行册。</p> : <p>点击浏览器菜单中的“安装应用”或“添加到主屏幕”。安装后可离线打开，把旅程放进桌面的小雪糕里。</p>}<p className="sheet-note">票据识别只在本地进行，截图不会上传。</p></div></div>}</>;
}
