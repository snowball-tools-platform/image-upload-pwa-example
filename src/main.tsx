import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import { useRegisterSW } from "virtual:pwa-register/react";
import "./index.css";

const AppUpdater = () => {
  const intervalMS = 1000 * 60 * 60 // 1 hour;

  useRegisterSW({
    onRegisteredSW(swUrl, r) {
      r &&
        setInterval(async () => {
          if (!(!r.installing && navigator)) return;
          if ("connection" in navigator && !navigator.onLine) return;

          const resp = await fetch(swUrl, {
            cache: "no-store",
            headers: {
              cache: "no-store",
              "cache-control": "no-cache",
            },
          });

          if (resp?.status === 200) await r.update();
        }, intervalMS);
    },
  });

  return null;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <AppUpdater />
  </React.StrictMode>,
);
