// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";

type JwtPayload = { sub?: string; exp?: number; [k: string]: any };

function parseJwt(bearerToken: string | null): JwtPayload | null {
  if (!bearerToken) return null;
  const token = bearerToken.replace(/^Bearer\s+/, "");
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let p = parts[1];
    const rem = p.length % 4;
    if (rem === 2) p += "==";
    else if (rem === 3) p += "=";
    else if (rem !== 0) return null; // rem === 1 같은 비정상은 거절

    const base64 = p.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null) {
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}
function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

   useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 마운트/라우트 변경 시 토큰 만료 체크
  useEffect(() => {
    const raw = localStorage.getItem("accessToken");
    const payload = parseJwt(raw);
    if (!raw || isExpired(payload)) {
      clearAuth();
      setUserEmail(null);
      return;
    }
    setUserEmail(payload?.sub ?? localStorage.getItem("userEmail"));
  }, [location.pathname]);

  // 다른 탭 변경 동기화 + 만료 체크
  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem("accessToken");
      const payload = parseJwt(raw);
      if (!raw || isExpired(payload)) {
        clearAuth();
        setUserEmail(null);
      } else {
        setUserEmail(payload?.sub ?? localStorage.getItem("userEmail"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

 const handleLogout = () => {
    clearAuth();
    setUserEmail(null);
    navigate("/");
  };

// 이메일 앞부분 추출
  const userName = userEmail ? userEmail.split("@")[0] : null;

  return (
    <header className={`yj-nav ${scrolled ? "is-solid" : ""}`}>
      <div className="yj-nav__inner">
        <Link className="yj-nav__brand" to="/">
          <img src="/Logo1.png" alt="YouthJob" className="yj-logo" />
        </Link>

        <nav className={`yj-nav__menu ${open ? "is-open" : ""}`}>
          <Link to="/hrd/courses">내일배움카드</Link>
          <Link to="/emp-programs">취업역량 프로그램</Link>
          <Link to="/youthpolicy">청년정책</Link>
        </nav>

        <div className="yj-nav__right">
          {userName ? (
            <>
              <span className="yj-nav__welcome">
                <span className="yj-nav__username">{userName}</span>님 안녕하세요!
              </span>
              <Link className="yj-nav__mypage" to="/mypage" aria-label="마이페이지">
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                마이페이지
              </Link>
              <button className="yj-nav__logout" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link className="yj-nav__link" to="/login">
                로그인
              </Link>
              <Link className="yj-nav__btn" to="/signup">
                회원가입
              </Link>
            </>
          )}

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