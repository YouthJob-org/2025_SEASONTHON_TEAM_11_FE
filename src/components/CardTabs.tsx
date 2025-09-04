import { useRef, useState } from "react";
import "./cardtabs.css";

type TabKey = "card" | "program" | "policy";

const TABS: { key: TabKey; title: string; desc: string; icon: string }[] = [
  {
    key: "card",
    title: "내일배움카드",
    desc: "국비로 필요한 기술을 배우는 개인 훈련 바우처",
    icon: "/assets/card.png",
  },
  {
    key: "program",
    title: "취업역량 강화프로그램",
    desc: "고용센터가 제공하는 취업 준비 실전 지원",
    icon: "/assets/building.png",
  },
  {
    key: "policy",
    title: "청년지원정책",
    desc: "청년의 일자리·주거·금융 등 생활 전반 지원",
    icon: "/assets/policy.png",
  },
];

export default function CardTabs() {
  const [active, setActive] = useState<TabKey | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const onSelect = (k: TabKey) => {
    setActive((prev) => (prev === k ? null : k));
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 10);
  };

  return (
    <section className="yj-section yj-section--cards">
      <div className="yj-container yj-cards" role="tablist" aria-label="주요 서비스">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`yj-card ${active === t.key ? "is-active" : ""}`}
            role="tab"
            aria-selected={active === t.key}
            aria-controls={`tab-panel-${t.key}`}
            onClick={() => onSelect(t.key)}
          >
            <div className="yj-card__icon">
              <img src={t.icon} alt="" aria-hidden />
            </div>
            <h3 className="yj-card__title">{t.title}</h3>
            <p className="yj-card__desc">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* 상세 영역 */}
      <div ref={detailsRef} className="yj-container yj-tab-panels">
        {/* 내일배움카드 */}
        <TabPanel id="tab-panel-card" active={active === "card"}>
          <h4>내일배움카드 — 무엇을 할 수 있나요?</h4>
          <ul>
            <li>국비로 <b>직무·자격 교육</b>을 수강하고, 수강료의 대부분을 지원받습니다.</li>
            <li>IT·디자인·회계·제조 등 <b>필요한 분야</b>를 골라 기간·지역·시간대별로 찾을 수 있습니다.</li>
            <li>관심 과정을 저장해 <b>비교·일정 관리</b>가 가능합니다.</li>
          </ul>
          <h4>왜 필요한가요?</h4>
          <ul>
            <li>소득·지역에 상관없이 <b>평등한 재교육 기회</b>를 제공하기 위해서입니다.</li>
            <li>구직자와 재직자의 <b>역량 업그레이드</b>를 통해 고용 가능성을 높이기 위함입니다.</li>
          </ul>
          <p style={{marginTop:12}}>
            ※ 발급 요건과 본인 부담금은 과정·개인 상황에 따라 달라질 수 있습니다.
          </p>
        </TabPanel>

        {/* 취업역량 강화프로그램 */}
        <TabPanel id="tab-panel-program" active={active === "program"}>
          <h4>취업역량 강화프로그램 — 어디서, 어떻게 지원하나요?</h4>
          <ul>
            <li><b>고용센터·지자체·공공기관</b>이 운영하는 특강, 취업캠프, 컨설팅, 멘토링을 제공합니다.</li>
            <li>이력서·자소서 첨삭, <b>면접 코칭</b>, 모의면접, 직무별 실무 워크숍 등 실전 중심입니다.</li>
            <li>지역·일정·대상별로 프로그램을 검색하고, <b>온라인으로 참여 신청</b>이 가능합니다.</li>
          </ul>
          <p style={{marginTop:12}}>
            ※ 일부 프로그램은 선발·정원 제한이 있으며, 참가비가 있는 경우도 있습니다.
          </p>
        </TabPanel>

        {/* 청년지원정책 */}
        <TabPanel id="tab-panel-policy" active={active === "policy"}>
          <h4>청년지원정책 — 무엇을, 누가 도움받을 수 있나요?</h4>
          <ul>
            <li><b>무상·저리 대출·현금성 지원</b> 등 일자리·주거·금융·복지·문화 분야의 혜택을 제공합니다.</li>
            <li>대상은 주로 <b>만 19~34세</b> 내외의 미취업·취업준비생·초기 재직 청년 등(세부 요건 상이).</li>
            <li>조건을 충족하면 <b>지원금, 주거 보조, 교통·의료·교육 바우처</b> 등 다양한 혜택을 받을 수 있습니다.</li>
          </ul>
          <p style={{marginTop:12}}>
            ※ 정책별로 나이·소득·거주지·가구 기준이 다르므로, 세부 요건 확인 후 신청하세요.
          </p>
        </TabPanel>
      </div>
    </section>
  );
}

function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-hidden={!active}
      className={`yj-tab-panel ${active ? "is-open" : ""}`}
    >
      {children}
    </div>
  );
}
