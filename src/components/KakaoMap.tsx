// src/components/KakaoMap.tsx
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { kakao: any; }
}

type Props = { address: string; height?: number };

export default function KakaoMap({ address, height = 280 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) { setError("주소가 없습니다."); return; }

    const appkey = import.meta.env.VITE_KAKAO_MAP_JS_KEY;
    if (!appkey) { setError("카카오 지도 키가 설정되지 않았습니다."); return; }

    const SDK_ID = "kakao-map-sdk";

    const draw = () => {
      const { kakao } = window as any;
      if (!kakao?.maps) { setError("카카오 지도 SDK가 로드되지 않았습니다."); return; }

      const map = new kakao.maps.Map(ref.current!, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
      });

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (results: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK || !results?.length) {
          setError("주소를 찾지 못했습니다.");
          return;
        }
        const { x, y } = results[0];
        const pos = new kakao.maps.LatLng(Number(y), Number(x));
        map.setCenter(pos);
        new kakao.maps.Marker({ position: pos, map });
      });
    };

    const loaded = document.getElementById(SDK_ID) as HTMLScriptElement | null;

    if (!loaded) {
      const s = document.createElement("script");
      s.id = SDK_ID;
      s.async = true;
      // autoload=false 로드 → load 콜백 안에서만 지도 생성
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
      s.onload = () => window.kakao.maps.load(draw);
      s.onerror = () => setError("지도를 불러오지 못했습니다. (스크립트 로드 실패)");
      document.head.appendChild(s);
    } else {
      // 이미 붙어있으면: SDK가 준비된 경우 바로, 아니면 load 이벤트에 연결
      if (window.kakao?.maps) window.kakao.maps.load(draw);
      else loaded.addEventListener("load", () => window.kakao.maps.load(draw), { once: true });
    }
  }, [address]);

  return (
    <div style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", background: "#f5f7fb" }}>
      {error ? (
        <div style={{ padding: 16, color: "#64748b" }}>
          {error}
          <br />
          <small>도메인 등록/키 설정을 확인해 주세요.</small>
        </div>
      ) : (
        <div ref={ref} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}
