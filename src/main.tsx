// src/main.tsx
console.log('ENV DUMP >>>', import.meta.env)
import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";   // ← 확장자까지 써서 확실히

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
