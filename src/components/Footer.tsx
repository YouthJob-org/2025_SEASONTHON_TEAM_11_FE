import "./footer.css";

export default function Footer() {
  return (
    <footer className="yj-footer">
      <div className="yj-footer__inner">
        <nav className="yj-footer__links">
          <a href="#">개인정보 처리방침</a>
          <a href="#">이용약관</a>
          <a href="#">문의</a>
        </nav>
        <p className="yj-footer__copy">© {new Date().getFullYear()} YouthJob</p>
      </div>
    </footer>
  );
}
