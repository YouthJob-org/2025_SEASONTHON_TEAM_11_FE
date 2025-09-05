import { useEffect, useMemo, useRef, useState } from "react";
import "./chatbot.css";

type Msg = { role: "user" | "bot"; text: string; at: number };
type Course = {
  trprId?: string;
  trprDegr?: string;
  title?: string;
  orgName?: string;
  area?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  tel?: string;
  tuition?: string;
};
type ChatApiResponse = {
  answer: string;
  model?: string;
  courses?: Course[];
};

export default function ChatFloat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "안녕하세요! YouthJob 챗봇이에요 😊\n" +
        "예) “서울 데이터 분석 과정 추천해줘”, “YouthJob(유스잡)에 대해서 설명해줘 ”",
      at: Date.now(),
    },
  ]);

  // 플로팅 버튼 스타일
  const fabStyle: React.CSSProperties = useMemo(
    () => ({
      position: "fixed",
      right: 24,
      bottom: 84,
      zIndex: 9999,
      padding: "12px 16px",
      borderRadius: 999,
      background: "linear-gradient(90deg, #0351fa 0%, #0268f6 100%)",
      border: "1px solid #0147e9",
      boxShadow: "0 6px 16px rgba(3, 81, 250, .25)",
      color: "#fff",
      fontWeight: 700,
      fontSize: 14,
      lineHeight: "20px",
      cursor: "pointer",
      userSelect: "none",
    }),
    []
  );

  // 모바일 프레임 및 자동 스크롤
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 새 메시지 / typing 상태에 맞춰 바닥으로 스크롤
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, busy, open]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text: q, at: Date.now() }]);
    setInput("");

    try {
      const res = await fetch("https://youthjob.site/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatApiResponse = await res.json();

      // 본문 + (있다면) 코스 카드 요약 붙이기
      let finalText = data.answer || "";
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        const lines = data.courses.slice(0, 5).map((c, i) => {
          const period =
            c.startDate && c.endDate ? `${c.startDate}~${c.endDate}` : "-";
          return `• ${i + 1}. ${c.title ?? "-"} / ${c.orgName ?? "-"} / ${
            c.area ?? "-"
          } / ${period}${c.url ? `\n   ↳ ${c.url}` : ""}`;
        });
        finalText += `\n\n추천 목록:\n${lines.join("\n")}`;
      }

      setMsgs((m) => [...m, { role: "bot", text: finalText, at: Date.now() }]);
    } catch (err) {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "서버와 통신 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요 🙏",
          at: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* 플로팅 챗봇 버튼 */}
      <button
        aria-label="YouthJob 챗봇 열기"
        style={fabStyle}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "창 닫기" : "YouthJob 챗봇"}
      </button>

      {/* 휴대폰 프레임 패널 */}
      {open && (
        <div
          ref={panelRef}
          className="yj-chat-panel"
          aria-modal="true"
          role="dialog"
        >
          <div className="yj-chat-head">
            <div className="yj-chat-title">YouthJob 챗봇</div>
            <button className="yj-chat-x" onClick={close} aria-label="닫기">
              ×
            </button>
          </div>

          <div ref={bodyRef} className="yj-chat-body" aria-live="polite">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`yj-msg ${m.role === "user" ? "yj-msg--user" : "yj-msg--bot"}`}
              >
                {m.role === "bot" ? (
                  <img
                    className="yj-avatar"
                    src="/assets/profile.png"
                    alt="YouthJob 챗봇"
                  />
                ) : (
                   <img
                    className="yj-avatar yj-avatar--me"
                    src="/assets/chatprofile.png"      // ← 사용자 이미지(새로 지정)
                    alt="나"
                    onError={(e) => {
                      // 혹시 이미지가 없을 때 챗봇 아이콘으로 폴백
                      (e.currentTarget as HTMLImageElement).src = "/assets/profile.png";
                    }}
                  />
                )}

                <div className={`yj-bubble ${m.role === "user" ? "me" : "bot"}`}>
                  {m.text.split("\n").map((line, idx) => (
                    <p key={idx} className="yj-line">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {busy && <div className="yj-typing">답변 작성 중…</div>}
          </div>

          <div className="yj-chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="메시지를 입력하세요"
              rows={1}
            />
            <button onClick={send} disabled={busy || !input.trim()}>
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
