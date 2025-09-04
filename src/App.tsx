// src/App.tsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Steps from "./components/Steps";
import Stats from "./components/Stats";
import CardTabs from "./components/CardTabs";
import ChatFloat from "./components/ChatFloat"; 
import "./global.css";

export default function App() {
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
      <a
        href="https://pf.kakao.com/_dFCDn"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 9999,
          padding: "12px 16px",
          borderRadius: 999,
          background: "#FEE500",
          boxShadow: "0 6px 16px rgba(0,0,0,.15)",
          color: "#000",
          fontWeight: 700,
        }}
      >
        유스잡 채널 추가
      </a>
    </div>
  );
}
