import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles.css";

console.log("VITE_BACKEND_URL =", import.meta.env.VITE_BACKEND_URL);
console.log("VITE_WS_BACKEND_URL =", import.meta.env.VITE_WS_BACKEND_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
