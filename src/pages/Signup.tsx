import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    console.log({ email, password });
    alert("회원가입 요청이 전송되었습니다.");
  };

  return (
    <>
      {/* 네비게이션바 */}
      <Navbar />

      <main className="signup-page">
        <div className="signup-box">
          <h2 className="signup-title">회원가입</h2>
          <form onSubmit={handleSubmit} className="signup-form">
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

            <label>
              비밀번호 확인
              <input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="signup-error">{error}</p>}

            <button type="submit" className="signup-btn">
              회원가입
            </button>
          </form>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />
    </>
  );
}
