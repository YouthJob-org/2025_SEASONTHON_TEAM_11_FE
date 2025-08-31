import "./hero.css";

export default function Hero() {
  return (
    <section className="yj-hero">
      <div className="yj-hero__media">
        <video className="yj-hero__video" autoPlay muted loop playsInline poster="/assets/hero.jpg">
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
        <div className="yj-hero__overlay" />
      </div>

      <div className="yj-hero__content">
        <h1 className="yj-hero__title">청년을 위한 커리어 허브</h1>
        <p className="yj-hero__subtitle">배움에서 취업까지, 청년의 길을 열다.</p>
        <div className="yj-hero__actions">
          <a className="yj-btn yj-btn--primary" href="#">교육 찾기</a>
          <a className="yj-btn yj-btn--ghost" href="#">일자리 찾기</a>
        </div>
      </div>
    </section>
  );
}
