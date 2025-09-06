import "./footer.css";

export default function Footer() {
  return (
    <footer className="yj-footer">
      <div className="yj-footer__inner">
        {/* 왼쪽 브랜드 블록 */}
        <div className="yj-footer__brand">
          <div className="yj-footer__head">
            {/* 라운드 로고 박스 + 이미지 */}
            <div className="yj-footer__logo">
              <img src="/assets/logo.png" alt="YouthJob Logo" className="yj-footer__logo-img" />
            </div>

            <div className="yj-footer__brand-text">
              <h3 className="yj-footer__title">YouthJob</h3>
              <p className="yj-footer__subtitle">청년 취업 지원 플랫폼</p>
            </div>
          </div>

          <p className="yj-footer__desc">
            청년들의 꿈을 현실로 만드는 통합 취업 지원 플랫폼입니다. 당신의 꿈을 응원합니다!
          </p>

          <div className="yj-footer__buttons">
            <button type="button">앱 다운로드</button>
            <button type="button">뉴스레터 구독</button>
          </div>
        </div>

        {/* 서비스 */}
        <div className="yj-footer__links-group">
          <h4>서비스</h4>
          <ul>
            <li><a href="/hrd/courses">국민내일배움카드</a></li>
            <li><a href="/emp-programs">취업역량강화</a></li>
            <li><a href="/youthpolicy">청년정책</a></li>
            <li><a href="/services/chatbot">AI 추천</a></li>
            <li><a href="https://pf.kakao.com/_dFCDn">카카오톡채널</a></li>
          </ul>
        </div>

        {/* 지원 */}
        <div className="yj-footer__links-group">
          <h4>지원</h4>
          <ul>
            <li><a href="/support/help">도움말</a></li>
            <li><a href="/contact">문의하기</a></li>
            <li><a href="/support/faq">FAQ</a></li>
            <li><a href="https://www.work24.go.kr/cm/e/a/0110/selectOpenApiIntro.do?">개발자 API</a></li>
            <li><a href="/support/partner">파트너십</a></li>
          </ul>
        </div>
      </div>

      {/* 하단 저작권 */}
      <div className="yj-footer__bottom">
        <p>© {new Date().getFullYear()} YouthJob. All rights reserved.</p>
        <nav>
          <a href="/privacy">개인정보처리방침</a>
          <a href="/terms">이용약관</a>
          <a href="/cookie-policy">쿠키 정책</a>
        </nav>
      </div>
    </footer>
  );
}
