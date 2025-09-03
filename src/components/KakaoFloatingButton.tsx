// src/components/KakaoFloatingButton.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    Kakao: any;
  }
}

type Props = {
  mode?: "chat" | "add"; // 상담하기 버튼 또는 채널추가 버튼
  position?: { bottom?: number; right?: number };
  size?: "small" | "medium" | "large";
};

export default function KakaoFloatingButton({
  mode = "chat",
  position = { bottom: 24, right: 24 },
  size = "large",
}: Props) {
  const JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string;
  const CHANNEL_ID = import.meta.env.VITE_KAKAO_CHANNEL_ID as string;

  useEffect(() => {
    const { Kakao } = window;
    if (!window.Kakao) return;

    if (!Kakao.isInitialized()) {
      Kakao.init(JS_KEY);
    }

    // 버튼 컨테이너 초기화(중복 생성 방지)
    const container = document.getElementById("kakao-floating-btn");
    if (!container) return;
    container.innerHTML = "";

    if (mode === "chat") {
      Kakao.Channel.createChatButton({
        container: "#kakao-floating-btn",
        channelPublicId: CHANNEL_ID,
        title: "consult", // 기본값
        size, // 'small' | 'medium' | 'large'
      });
    } else {
      Kakao.Channel.createAddChannelButton({
        container: "#kakao-floating-btn",
        channelPublicId: CHANNEL_ID,
        size,
      });
    }
  }, [JS_KEY, CHANNEL_ID, mode, size]);

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    bottom: position.bottom ?? 24,
    right: position.right ?? 24,
  };

  // SDK가 막힌 경우 대비한 안전 링크
  const fallbackHref =
    mode === "chat"
      ? `https://pf.kakao.com/${import.meta.env.VITE_KAKAO_CHANNEL_ID}/chat`
      : `https://pf.kakao.com/${import.meta.env.VITE_KAKAO_CHANNEL_ID}`;

  return (
    <div style={style}>
      <div id="kakao-floating-btn" />
      <noscript>
        <a href={fallbackHref} target="_blank" rel="noreferrer">
          카카오 채널 이동
        </a>
      </noscript>
    </div>
  );
}
