import { useEffect, useRef } from "react";
import "./steps.css";

export default function Steps() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => e.isIntersecting && el.classList.add("is-visible")),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="yj-section yj-section--alt yj-reveal">
      <div className="yj-container yj-steps">
        <h2 className="yj-steps__title">
          YouthJob 활용 방법 <span className="yj-steps__badge">(4단계)</span>
        </h2>
        <p className="yj-steps__subtitle">
          흩어진 취업 지원 정보를 한곳에서, 검색부터 관리까지 청년 커리어를 완성하세요.
        </p>

        <div className="yj-steps__rows">
          {/* 1 */}
          <div className="yj-step-row">
            <button className="yj-step-chip">탐색하기</button>
            <span className="yj-step-arrow" aria-hidden />
            <div className="yj-step-bubble">
              국민내일배움카드 과정, 취업역량 강화 프로그램, 청년정책을 카테고리별로 확인
            </div>
          </div>
          {/* 2 */}
          <div className="yj-step-row">
            <button className="yj-step-chip">저장하기</button>
            <span className="yj-step-arrow" aria-hidden />
            <div className="yj-step-bubble">
              관심 있는 교육·정책은 <b>My Page</b>에 모아두기
            </div>
          </div>
          {/* 3 */}
          <div className="yj-step-row">
            <button className="yj-step-chip">신청하기</button>
            <span className="yj-step-arrow" aria-hidden />
            <div className="yj-step-bubble">
              내일배움카드 발급, 프로그램 참여, 정책 지원
            </div>
          </div>
          {/* 4 */}
          <div className="yj-step-row">
            <button className="yj-step-chip">나의 첫 커리어 시작</button>
            <span className="yj-step-arrow" aria-hidden />
            <div className="yj-step-bubble">
              유스잡과 함께 커리어 시작!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
