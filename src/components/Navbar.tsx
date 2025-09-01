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

  return (
    <header className={`yj-nav ${scrolled ? "is-solid" : ""}`}>
      <div className="yj-nav__inner">
        {/* SPA 네비게이션이면 Link가 더 좋아요 */}
        <Link className="yj-nav__brand" to="/">
          <img src="/Logo.png" alt="YouthJob" className="yj-logo" />
        </Link>

        <nav className={`yj-nav__menu ${open ? "is-open" : ""}`}>
          <Link to="/hrd/courses">내일배움카드</Link>
          <a href="#">강소기업</a>
          <a href="#">일자리</a>
          <a href="#">스터디</a>
        </nav>

        <div className="yj-nav__right">
          {userEmail ? (
              <>
                <span className="yj-nav__welcome">
                  안녕하세요 <span className="yj-nav__email">{userEmail}</span> 님!
                </span>
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
