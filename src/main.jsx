import ReactDOM from "react-dom/client";
import TripMapDashboard from "./pages/TripMapDashboard.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<TripMapDashboard />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    await navigator.serviceWorker.ready;
    const assets = [...performance.getEntriesByType("resource")].map((entry) => entry.name).filter((url) => url.startsWith(location.origin));
    registration.active?.postMessage({ type: "CACHE_ASSETS", assets: [...new Set([`${location.origin}${import.meta.env.BASE_URL}`, ...assets])] });
  });
}
