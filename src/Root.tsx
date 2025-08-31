// src/Root.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
