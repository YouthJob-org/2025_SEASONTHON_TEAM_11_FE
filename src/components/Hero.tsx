import "./hero.css";

export default function Hero() {
  return (
    <section className="yj-hero">
      <div className="yj-hero__media">
        <video className="yj-hero__video" autoPlay muted loop playsInline poster="/assets/hero.jpg">
          <source src="/assets/heroV2.mp4" type="video/mp4" />
        </video>
        <div className="yj-hero__overlay" />
      </div>

      <div className="yj-hero__content">
        <h1 className="yj-hero__title">청년을 위한 커리어 허브</h1>
        <p className="yj-hero__subtitle">배움에서 취업까지, 청년의 길을 열다.</p>
        <div className="yj-hero__actions">
        </div>
      </div>
    </section>
  );
}
