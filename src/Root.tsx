// src/Root.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import HrdCourses from "./pages/HrdCourses";
import HrdCourseDetail from "./pages/HrdCourseDetail";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        < Route path="/hrd/courses" element={<HrdCourses />} />
        <Route path="/hrd/courses/:trprId/:trprDegr" element={<HrdCourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
