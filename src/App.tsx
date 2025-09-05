// src/App.tsx
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Steps from "./components/Steps";
import Stats from "./components/Stats";
import CardTabs from "./components/CardTabs";
import ChatFloat from "./components/ChatFloat";
import { prefetchPoliciesAllSilent } from "./utils/policiesPrefetch";
import FabSpeedDial from "./components/FabSpeedDial";
import "./global.css";

export default function App() {
  useEffect(() => {
    prefetchPoliciesAllSilent(); // await X
  }, []);
  return (
    <div className="app-layout">{/* ✅ 세로 플렉스 래퍼 */}
      <Navbar />

      <main className="app-main">{/* ✅ 남은 공간 모두 차지 */}
        <Hero />

        <CardTabs />
        <Steps />
        <Stats />
      </main>

      <Footer /> {/* ✅ margin-top:auto; 덕분에 하단으로 밀림 */}
      <ChatFloat />
      {/* 플로팅 버튼은 레이아웃 밖에 둬도 됨 */}
    <FabSpeedDial />
    </div>
  );
}
