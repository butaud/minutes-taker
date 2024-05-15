import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { SessionStore } from "./store/SessionStore.ts";

const store = new SessionStore();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>
);
