// src/pages/CookiePolicy.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./page-common.css";

export default function CookiePolicy() {
  return (
    <>
      <Navbar />
      <main className="yj-main">
        <div className="yj-page">
          <h1 className="yj-page-title">쿠키 정책</h1>
          <p>
            YouthJob은 더 나은 사용자 경험을 제공하기 위해 쿠키를 사용합니다.
            본 페이지는 쿠키의 사용 목적, 수집되는 정보, 사용자가 관리할 수 있는 방법을 안내합니다.
          </p>

          <h2>쿠키의 정의</h2>
          <p>
            쿠키는 웹사이트 이용 시 브라우저에 저장되는 작은 텍스트 파일로,
            로그인 유지, 맞춤형 서비스 제공 등에 활용됩니다.
          </p>

          <h2>쿠키의 사용 목적</h2>
          <ul>
            <li>서비스 로그인 상태 유지</li>
            <li>맞춤형 콘텐츠 및 광고 제공</li>
            <li>웹사이트 트래픽 및 이용 통계 분석</li>
          </ul>

          <h2>쿠키 관리 방법</h2>
          <p>
            사용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
            단, 일부 기능 이용에 제한이 발생할 수 있습니다.
          </p>

          <p>
            본 쿠키 정책은 2025년 1월 1일부터 시행되며, 필요 시 변경될 수 있습니다.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}