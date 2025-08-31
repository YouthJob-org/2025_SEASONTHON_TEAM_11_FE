import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll(); // 최초 적용
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`yj-nav ${scrolled ? "is-solid" : ""}`}>
      <div className="yj-nav__inner">
        <a className="yj-nav__brand" href="/">
          <img src="/Logo.png" alt="YouthJob" className="yj-logo" />
        </a>

        <nav className={`yj-nav__menu ${open ? "is-open" : ""}`}>
          <a href="#">내일배움카드</a>
          <a href="#">강소기업</a>
          <a href="#">일자리</a>
          <a href="#">스터디</a>
        </nav>

         <div className="yj-nav__right">
          <a className="yj-nav__link" href="#">로그인</a>
          {/* 👇 회원가입 버튼을 /signup 경로로 */}
          <Link className="yj-nav__btn" to="/signup">
            회원가입
          </Link>
          <button
            className="yj-nav__hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
