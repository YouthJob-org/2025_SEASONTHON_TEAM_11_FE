import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://youthjob.site/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let serverMsg = "로그인 실패";
        try {
          const data = await res.json();
          if (data?.message) serverMsg = data.message;
        } catch (_) {}
        throw new Error(serverMsg);
      }

      const data = await res.json();
      if (data?.success && data?.data) {
        const { accessToken, refreshToken, tokenType } = data.data;

        // 토큰 저장 (보통 localStorage 또는 cookie)
        localStorage.setItem("accessToken", `${tokenType} ${accessToken}`);
        localStorage.setItem("refreshToken", refreshToken);
        alert(data.message ?? "로그인 성공");
        navigate("/"); // 홈 화면으로 이동
      } else {
        setError(data?.message ?? "로그인 실패");
      }
    } catch (err: any) {
      setError(err?.message ?? "서버와 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="login-page">
        <div className="login-box">
          <h2 className="login-title">로그인</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              이메일
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              비밀번호
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
