// src/App.tsx
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import "./global.css";
import { startPoliciesPrefetch } from "./utils/policiesPrefetch"; // ✅ 추가

export default function App() {
  // ✅ 홈 진입 즉시 4,096개 전부 백그라운드로 캐시에 적재
  useEffect(() => {
    const stop = startPoliciesPrefetch();
    return stop; // 언마운트 시 중단
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Hero />
        {/* ... 이하 동일 ... */}
        <section className="yj-section yj-section--cards">
          <div className="yj-container yj-cards">
            <article className="yj-card">
              <div className="yj-card__icon">
                <img src="/assets/card.png" alt="카드 아이콘" />
              </div>
              <h3 className="yj-card__title">내일배움카드</h3>
              <p className="yj-card__desc">국비 지원으로 배우는 직무·자격 교육</p>
            </article>
            <article className="yj-card">
              <div className="yj-card__icon">
                <img src="/assets/building.png" alt="강소기업" />
              </div>
              <h3 className="yj-card__title">취업역량강화프로그램</h3>
              <p className="yj-card__desc">청년 친화적 우수 중소기업 정보</p>
            </article>
            <article className="yj-card">
              <div className="yj-card__icon">
                <img src="/assets/policy.png" alt="청년지원정책" />
              </div>
              <h3 className="yj-card__title">청년지원정책</h3>
              <p className="yj-card__desc">일자리·주거·금융·복지 통합 지원</p>
            </article>
          </div>
        </section>

        <section className="yj-section">
          <div className="yj-container">
            <div className="yj-notice">공지 · 국민취업지원제도 확대 시행 안내</div>
          </div>
        </section>
      </main>
      <Footer />

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
