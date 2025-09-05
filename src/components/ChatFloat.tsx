// src/components/ChatFloat.tsx
import { useEffect, useRef, useState } from "react";
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

  // 자동 스크롤용
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  // ESC 닫기 + SpeedDial 전역 이벤트로 열기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);

    const onOpen = () => setOpen(true);
    window.addEventListener("YJ_OPEN_CHAT", onOpen as unknown as EventListener);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("YJ_OPEN_CHAT", onOpen as unknown as EventListener);
    };
  }, []);

  // 새 메시지/typing/열릴 때 바닥으로 스크롤
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
    } catch {
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

  // 바꿔치기
function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  // 한글/일본어 등 IME 조합 상태면 전송 금지
  // Chrome/Edge/Safari: e.nativeEvent.isComposing
  // 일부 브라우저(구형) 호환: keyCode === 229
  const composing =
    (e.nativeEvent as any).isComposing || (e as any).isComposing || e.keyCode === 229;

  if (composing) return;

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}


  return (
    <>
      {/* 기존의 'YouthJob 챗봇' 플로팅 버튼은 제거 → SpeedDial이 대신 엽니다 */}

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
                    src="/assets/chatprofile.png"
                    alt="나"
                    onError={(e) => {
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
