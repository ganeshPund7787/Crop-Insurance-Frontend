import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/styles/global.css";

// Apply theme before first paint (avoids flash)
const stored = localStorage.getItem("cropshield-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = stored ?? (prefersDark ? "dark" : "light");
document.documentElement.classList.add(theme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
