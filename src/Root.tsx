// src/Root.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import HrdCourses from "./pages/HrdCourses";
import HrdCourseDetail from "./pages/HrdCourseDetail";
import EmpPrograms from "./pages/EmpPrograms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import MyPage from "./pages/MyPage"; 
import YouthPolicy from "./pages/YouthPolicy";
import YouthPolicyDetail from "./pages/YouthPolicyDetail";
import CookiePolicy from "./pages/CookiePolicy";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        < Route path="/hrd/courses" element={<HrdCourses />} />
        <Route path="/hrd/courses/:trprId/:trprDegr" element={<HrdCourseDetail />} />
        <Route path="/emp-programs" element={<EmpPrograms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/youthpolicy" element={<YouthPolicy />} />
        <Route path="/youth-policies/:plcyNo" element={<YouthPolicyDetail />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
      </Routes>
    </BrowserRouter>
  );
}
