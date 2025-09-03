// src/pages/Contact.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./page-common.css";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="yj-main">
        <div className="yj-page">
          <h1 className="yj-page-title">문의</h1>
          <p>
            YouthJob 서비스를 이용하시면서 불편한 점이나 개선사항, 기타 문의사항이
            있으시면 아래 방법을 통해 연락해 주시기 바랍니다. 접수된 문의는
            순차적으로 확인 후 답변드립니다.
          </p>

          <h2>1. 카카오채널 문의</h2>
          <p>
            가장 빠른 문의 방법은 YouthJob 공식 카카오 채널을 이용하는 것입니다.
            채널 추가 후 1:1 채팅으로 문의를 남겨주시면 담당자가 확인 후
            안내드립니다.
          </p>
          <p>
            👉{" "}
            <a
              href="https://pf.kakao.com/_dFCDn"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb", fontWeight: "600" }}
            >
              YouthJob 카카오채널 바로가기
            </a>
          </p>

          <h2>2. 이메일 문의</h2>
          <p>
            이메일 문의는 별도의 지정된 주소를 통해 접수됩니다. 문의를 남기실 경우,
            확인 후 순차적으로 회신이 이루어집니다.
          </p>
          <ul>
            <li>※ 실제 이메일 주소는 서비스 내 별도 공지를 통해 안내됩니다.</li>
          </ul>

          <h2>3. 전화 문의</h2>
          <p>
            전화 상담은 운영 정책에 따라 제공될 수 있으며, 운영 시간과 연락처는
            추후 공지사항을 통해 안내됩니다.
          </p>
          <ul>
            <li>※ 현재는 전화 상담이 제공되지 않습니다.</li>
          </ul>

          <h2>4. 오프라인 문의</h2>
          <p>
            필요 시 오프라인 방문 상담이 가능하며, 방문 관련 정보는 추후 별도
            공지를 통해 안내될 예정입니다.
          </p>

          <h2>5. 자주 묻는 질문</h2>
          <p>
            회원가입, 로그인, 비밀번호 재설정 등 기본적인 문의는 FAQ 페이지를 통해
            확인하실 수 있습니다. (추후 연결 예정)
          </p>

          <h2>6. 기타 문의</h2>
          <p>
            서비스 제휴, 협력 제안, 광고 관련 문의 등은 별도의 경로를 통해 접수될
            수 있으며, 해당 사항은 추후 공지사항을 통해 안내됩니다.
          </p>

          <p style={{ marginTop: "32px", fontWeight: "600" }}>
            YouthJob은 이용자 여러분의 의견을 소중히 여기며, 청년 취업 지원
            서비스가 더 나아질 수 있도록 최선을 다하겠습니다.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
