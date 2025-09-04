import { useEffect, useRef } from "react";
import "./stats.css";

export default function Stats() {
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
    <section ref={ref} className="yj-section yj-reveal">
      <div className="yj-container yj-stats">
        <blockquote className="yj-stats__quote">
          “유스잡 하나로 청년들을 위한 모든 것을 볼 수 있었어요”
        </blockquote>

        <div className="yj-stats__cards">
          <div className="yj-stat">
            <div className="yj-stat__number">88126 +</div>
            <div className="yj-stat__label">등록된<br />훈련과정</div>
          </div>
          <div className="yj-stat">
            <div className="yj-stat__number">1,205 +</div>
            <div className="yj-stat__label">등록된<br />구직자 취업역량 강화프로그램</div>
          </div>
          <div className="yj-stat">
            <div className="yj-stat__number">4096 +</div>
            <div className="yj-stat__label">청년 정책<br />데이터</div>
          </div>
        </div>
      </div>
    </section>
  );
}
