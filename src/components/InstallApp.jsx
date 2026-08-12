import { useEffect, useState } from "react";

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null); const [open, setOpen] = useState(false); const [installed, setInstalled] = useState(isStandalone);
  useEffect(() => { const capture = (event) => { event.preventDefault(); setPrompt(event); }; const done = () => setInstalled(true); addEventListener("beforeinstallprompt", capture); addEventListener("appinstalled", done); return () => { removeEventListener("beforeinstallprompt", capture); removeEventListener("appinstalled", done); }; }, []);
  if (installed) return null;
  const install = async () => { if (prompt) { prompt.prompt(); await prompt.userChoice; setPrompt(null); return; } setOpen(true); };
  return <><button className="install-button" onClick={install}>安装 App</button>{open && <div className="install-sheet" role="dialog" aria-modal="true" aria-label="安装足迹应用"><button className="sheet-backdrop" aria-label="关闭" onClick={() => setOpen(false)} /><div className="sheet-card"><button className="sheet-close" onClick={() => setOpen(false)} aria-label="关闭">×</button><img src="/icon-180.png" alt="足迹应用图标" /><h2>安装“足迹”</h2>{isIos() ? <p>在 Safari 点击底部的“分享”，选择“添加到主屏幕”，再点击“添加”。安装后从主屏幕打开，即为独立 App。</p> : <p>点击浏览器菜单中的“安装应用”或“添加到主屏幕”。安装后可离线打开、从桌面直接进入。</p>}<p className="sheet-note">首次使用票据识别会下载本地 OCR 语言模型；票据图片不会上传。</p></div></div>}</>;
}
