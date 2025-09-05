// src/components/FabSpeedDial.tsx
import { useEffect, useRef, useState } from "react";

export default function FabSpeedDial() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        right: "max(16px, env(safe-area-inset-right))",
        bottom: "max(16px, calc(env(safe-area-inset-bottom) + 16px))",
        zIndex: 10000,
      }}
    >
      {/* 펼쳐질 액션들 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 12,
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          transform: `translateY(${open ? 0 : 8}px)`,
          transition: "opacity .2s ease, transform .2s ease",
        }}
      >
        {/* 챗봇 열기 */}
        <button
          onClick={() => {
            // 플로팅 + 클릭 시 ChatFloat 열기
            window.dispatchEvent(new Event("YJ_OPEN_CHAT"));
            setOpen(false);
          }}
          aria-label="챗봇 열기"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "#2B6EF2",
            boxShadow: "0 6px 16px rgba(0,0,0,.2)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <img
            src="/img/chatbot/chatbot1.svg"   // ← 경로 맞춤
            alt=""
            width={28}
            height={28}
            draggable={false}
          />
        </button>

        {/* 카카오 채널 */}
        <a
          href="https://pf.kakao.com/_dFCDn"
          target="_blank"
          rel="noreferrer"
          aria-label="카카오 채널 추가"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#FEE500",
            boxShadow: "0 6px 16px rgba(0,0,0,.2)",
          }}
        >
          <img
            src="/img/kakao/kakao1.png"         // ← 경로 맞춤
            alt=""
            width={28}
            height={28}
            draggable={false}
            style={{ borderRadius: 6 }}
          />
        </a>
      </div>

      {/* 메인 FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "메뉴 닫기" : "빠른 실행 열기"}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg,#0351fa,#0268f6)",
          color: "#fff",
          fontSize: 28,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(3,81,250,.35)",
        }}
      >
        {open ? "×" : "+"}
      </button>
    </div>
  );
}
