import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./youthpolicydetail.css"; // ← 상세 전용 CSS

/** ───────────────── API 타입: 신규/레거시/래핑 모두 수용 ───────────────── */
type WrappedDetail<T> = { resultCode: number; resultMessage: string; result: T; };

// 신규 스키마
type NewDetail = {
  plcyNo: string; plcyNm: string;
  summary?: string | null; keywords?: string[];
  categoryL?: string | null; categoryM?: string | null;
  applyPeriodType?: string | null; applyPeriod?: string | null; applyUrl?: string | null; applyMethod?: string | null;
  supportContent?: string | null; firstCome?: boolean; supportScaleLimited?: boolean; supportCount?: number | null;
  ageMin?: number | null; ageMax?: number | null; ageLimited?: boolean; maritalStatus?: string | null;
  incomeConditionType?: string | null; incomeMin?: string | null; incomeMax?: string | null; incomeEtc?: string | null;
  jobRequirements?: string[] | null; majorRequirement?: string | null; schoolRequirements?: string[] | null; specialRequirements?: string[] | null;
  additionalQualification?: string | null; participantTarget?: string | null; screeningMethod?: string | null; requiredDocs?: string | null; etcNotes?: string | null;
  refUrls?: string[] | null;
  providerGroup?: string | null; provisionMethod?: string | null; supervisorName?: string | null; operatorName?: string | null;
  businessPeriodType?: string | null; businessBeginYmd?: string | null; businessEndYmd?: string | null; businessEtc?: string | null;
  zipCodes?: Array<string | number> | null; viewCount?: number; firstRegisteredAt?: string | null; lastModifiedAt?: string | null;
};

// 레거시 스키마
type LegacyDetail = {
  plcyNo: string; plcyNm: string;
  plcyExplnCn?: string | null; lclsfNm?: string | null; mclsfNm?: string | null;
  aplyYmd?: string | null; aplyUrlAddr?: string | null; refUrlAddr1?: string | null;
  rgtrInstCdNm?: string | null; sprvsnInstCdNm?: string | null; operInstCdNm?: string | null;
  sprtTrgtMinAge?: string | null; sprtTrgtMaxAge?: string | null;
};

/** ───────────────── 유틸 ───────────────── */
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  return { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` };
}

const REGION_MAP: Record<string, string> = {
  "11": "서울특별시","26":"부산광역시","27":"대구광역시","28":"인천광역시","29":"광주광역시","30":"대전광역시","31":"울산광역시","36":"세종특별자치시",
  "41":"경기도","42":"강원도","43":"충청북도","44":"충청남도","45":"전라북도","46":"전라남도","47":"경상북도","48":"경상남도","50":"제주특별자치도",
};
function zipCodesToRegion(zipCodes?: Array<string | number> | null): string | undefined {
  if (!zipCodes || zipCodes.length === 0) return undefined;
  const prefixes = new Set(
    zipCodes.map((z) => String(z).padStart(5, "0").slice(0, 2)).filter((p) => REGION_MAP[p])
  );
  if (prefixes.size >= 3) return "전국";
  if (prefixes.size === 1) return REGION_MAP[Array.from(prefixes)[0]];
  return "전국";
}
function formatAge(min?: number | null, max?: number | null): string | undefined {
  if (min == null && max == null) return undefined;
  if (min != null && max != null) return `만 ${min}~${max}세`;
  if (min != null) return `만 ${min}세 이상`;
  return `만 ${max}세 이하`;
}
function notEmpty(v?: string | null): v is string { return !!v && v.trim() !== ""; }
function listOrDash(xs?: (string | null)[] | null): string | undefined {
  if (!xs || xs.length === 0) return undefined;
  const t = xs.filter(notEmpty).join(", ");
  return t || undefined;
}

function ensureHttp(u?: string | null): string | undefined {
  if (!u) return undefined;
  const s = u.trim();
  if (!s) return undefined;

  // 이미 스킴이 있거나( mailto:, http:, https:...), 혹은 앱 내부 절대경로(/path)는 그대로 둠
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s) || s.startsWith("/")) return s;

  // 프로토콜 상대 URL(//example.com) → https 기본 부여
  if (s.startsWith("//")) return `https:${s}`;

  // 그 외(www.example.com 같은 케이스)는 https:// 보강
  return `https://${s}`;
}
/** 화면 모델 */
type Ui = {
  id: string; title: string;
  categoryL?: string; categoryM?: string; region?: string; period?: string; orgMain?: string; orgSub?: string;
  summary?: string; keywords?: string[];
  applyType?: string; applyMethod?: string; applyUrl?: string;
  supportContent?: string; firstCome?: boolean; supportScaleLimited?: boolean; supportCount?: number | null;
  ageRange?: string; maritalStatus?: string; income?: string; incomeEtc?: string; jobReq?: string;
  majorReq?: string; schoolReq?: string; specialReq?: string; addQual?: string; participantTarget?: string;
  screeningMethod?: string; requiredDocs?: string;
  bizPeriod?: string; bizEtc?: string;
  refUrls?: string[];
  providerGroup?: string; provisionMethod?: string; viewCount?: number;
  firstRegisteredAt?: string | null; lastModifiedAt?: string | null;
};

function normalize(raw: any): Ui {
  const wrapped = raw && raw.result && typeof raw.result === "object" && !Array.isArray(raw.result);
  const d = wrapped ? (raw as WrappedDetail<any>).result : raw;

  if ("summary" in d || "applyPeriod" in d || "zipCodes" in d) {
    const n = d as NewDetail;
    return {
      id: n.plcyNo, title: n.plcyNm,
      categoryL: n.categoryL || undefined, categoryM: n.categoryM || undefined,
      region: zipCodesToRegion(n.zipCodes) || undefined,
      period: n.applyPeriod || undefined,
      orgMain: n.supervisorName || undefined, orgSub: n.operatorName || undefined,
      summary: n.summary || undefined, keywords: (n.keywords || []).filter(Boolean) as string[],
      applyType: n.applyPeriodType || undefined, applyMethod: n.applyMethod || undefined, applyUrl: ensureHttp(n.applyUrl) || undefined,
      supportContent: n.supportContent || undefined, firstCome: !!n.firstCome, supportScaleLimited: !!n.supportScaleLimited, supportCount: n.supportCount ?? null,
      ageRange: formatAge(n.ageMin ?? undefined, n.ageMax ?? undefined),
      maritalStatus: n.maritalStatus || undefined, income: n.incomeConditionType || undefined, incomeEtc: n.incomeEtc || undefined,
      jobReq: listOrDash(n.jobRequirements || []) || undefined, majorReq: n.majorRequirement || undefined,
      schoolReq: listOrDash(n.schoolRequirements || []) || undefined, specialReq: listOrDash(n.specialRequirements || []) || undefined,
      addQual: n.additionalQualification || undefined, participantTarget: n.participantTarget || undefined,
      screeningMethod: n.screeningMethod || undefined, requiredDocs: n.requiredDocs || undefined,
      bizPeriod: n.businessBeginYmd && n.businessEndYmd ? `${n.businessBeginYmd} ~ ${n.businessEndYmd}` : undefined,
      bizEtc: n.businessEtc || undefined,
      refUrls: (n.refUrls || []).map(ensureHttp).filter(notEmpty) as string[],
      providerGroup: n.providerGroup || undefined, provisionMethod: n.provisionMethod || undefined,
      viewCount: n.viewCount ?? undefined, firstRegisteredAt: n.firstRegisteredAt || undefined, lastModifiedAt: n.lastModifiedAt || undefined,
    };
  }

  const l = d as LegacyDetail;
  return {
    id: l.plcyNo, title: l.plcyNm,
    categoryL: l.lclsfNm || undefined, categoryM: l.mclsfNm || undefined,
    period: l.aplyYmd || undefined,
    orgMain: l.rgtrInstCdNm || l.sprvsnInstCdNm || undefined, orgSub: l.operInstCdNm || undefined,
    summary: l.plcyExplnCn || undefined, applyUrl: ensureHttp(l.aplyUrlAddr || l.refUrlAddr1) || undefined,
    ageRange: l.sprtTrgtMinAge || l.sprtTrgtMaxAge ? `만 ${l.sprtTrgtMinAge ?? ""}${l.sprtTrgtMaxAge ? `~${l.sprtTrgtMaxAge}` : ""}세` : undefined,
  };
}

/** ───────────────── Component ───────────────── */
export default function YouthPolicyDetail() {
  const { plcyNo } = useParams<{ plcyNo: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ui, setUi] = useState<Ui | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`https://youthjob.site/api/v1/youth-policies/${plcyNo}`, {
          headers: { ...getAuthHeader() },
        });
        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("정책 상세 정보를 불러오지 못했습니다.");
        const json = await res.json();
        setUi(normalize(json));
      } catch (e: any) {
        setError(e?.message ?? "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [plcyNo, navigate]);

  const onBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/youth-policies");
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text);
  const share = () =>
    (navigator as any).share
      ? (navigator as any).share({ title: ui?.title, url: location.href })
      : navigator.clipboard.writeText(location.href);

  return (
    <>
      <Navbar />
      <main className="yp">
        <div className="yp__container">
          {loading && (
            <div className="yp__detail">
              <span className="yp__skeleton" style={{ width: "42%", height: 28 }} />
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                <span className="yp__skeleton" style={{ width: "100%", height: 14 }} />
                <span className="yp__skeleton" style={{ width: "92%", height: 14 }} />
                <span className="yp__skeleton" style={{ width: "85%", height: 14 }} />
              </div>
            </div>
          )}
          {error && <div className="yp__error">{error}</div>}

          {ui && (
            <>
              {/* HERO */}
              <section className="yp__hero">
                <div className="yp__hero_badges">
                  {ui.categoryL && <span className="yp__badge">{ui.categoryL}</span>}
                  {ui.categoryM && <span className="yp__meta_item--soft">중분류: {ui.categoryM}</span>}
                  {ui.region && <span className="yp__meta_item--soft">지역: {ui.region}</span>}
                  {ui.period && <span className="yp__meta_item--soft">신청기간: {ui.period}</span>}
                </div>
                <h1 className="yp__hero_title">{ui.title}</h1>
                {(ui.orgMain || ui.orgSub) && (
                  <p className="yp__hero_org">
                    {ui.orgMain && (<><strong>주관</strong> {ui.orgMain}</>)}
                    {ui.orgSub && (<> · <strong>운영</strong> {ui.orgSub}</>)}
                  </p>
                )}
                <div className="yp__hero_actions">
                  <button className="yp__btn yp__btn--ghost" onClick={onBack}>← 목록으로</button>
                  {ui.applyUrl && (
                    <a className="yp__btn yp__btn--primary" href={ui.applyUrl} target="_blank" rel="noreferrer">
                      공식 링크 바로가기
                    </a>
                  )}
                </div>
              </section>

              {/* 본문 */}
              <article className="yp__detail yp__detail--grid">
                <div className="yp__detail_main">
                  {(ui.summary || (ui.keywords && ui.keywords.length > 0)) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--info">개요</h3>
                      {ui.summary && <p className="yp__section_p">{ui.summary}</p>}
                      {ui.keywords && ui.keywords.length > 0 && (
                        <div className="yp__chips">
                          {ui.keywords.map((k, i) => (<span key={i} className="yp__chip">#{k}</span>))}
                        </div>
                      )}
                    </section>
                  )}

                  {(ui.applyType || ui.applyMethod || ui.applyUrl) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--form">신청/접수</h3>
                      <dl className="yp__kv">
                        {ui.applyType && (<div className="yp__kv_row"><dt>신청유형</dt><dd>{ui.applyType}</dd></div>)}
                        {ui.applyMethod && (<div className="yp__kv_row"><dt>신청방법</dt><dd>{ui.applyMethod}</dd></div>)}
                        {ui.applyUrl && (
                          <div className="yp__kv_row">
                            <dt>공식 링크</dt>
                            <dd>
                              <a className="yp__a" href={ui.applyUrl} target="_blank" rel="noreferrer">{ui.applyUrl}</a>
                              <button className="yp__mini_btn" onClick={() => copy(ui.applyUrl!)}>복사</button>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </section>
                  )}

                  {(ui.supportContent || ui.firstCome !== undefined || ui.supportScaleLimited !== undefined || ui.supportCount != null) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--gift">지원내용</h3>
                      <dl className="yp__kv">
                        {ui.supportContent && (<div className="yp__kv_row"><dt>내용</dt><dd>{ui.supportContent}</dd></div>)}
                        {ui.firstCome !== undefined && (<div className="yp__kv_row"><dt>선착순</dt><dd>{ui.firstCome ? "예" : "아니오"}</dd></div>)}
                        {ui.supportScaleLimited !== undefined && (<div className="yp__kv_row"><dt>규모 제한</dt><dd>{ui.supportScaleLimited ? "예" : "아니오"}</dd></div>)}
                        {ui.supportCount != null && (<div className="yp__kv_row"><dt>지원(선발) 인원</dt><dd>{ui.supportCount}명</dd></div>)}
                      </dl>
                    </section>
                  )}

                  {(ui.ageRange || ui.maritalStatus || ui.income || ui.incomeEtc || ui.jobReq || ui.majorReq || ui.schoolReq || ui.specialReq || ui.addQual || ui.participantTarget) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--user">대상 및 자격</h3>
                      <dl className="yp__kv">
                        {ui.ageRange && (<div className="yp__kv_row"><dt>연령</dt><dd>{ui.ageRange}</dd></div>)}
                        {ui.maritalStatus && (<div className="yp__kv_row"><dt>혼인</dt><dd>{ui.maritalStatus}</dd></div>)}
                        {ui.income && (<div className="yp__kv_row"><dt>소득조건</dt><dd>{ui.income}</dd></div>)}
                        {ui.incomeEtc && (<div className="yp__kv_row"><dt>소득 비고</dt><dd>{ui.incomeEtc}</dd></div>)}
                        {ui.jobReq && (<div className="yp__kv_row"><dt>직무/대상</dt><dd>{ui.jobReq}</dd></div>)}
                        {ui.majorReq && (<div className="yp__kv_row"><dt>전공</dt><dd>{ui.majorReq}</dd></div>)}
                        {ui.schoolReq && (<div className="yp__kv_row"><dt>학력/학교</dt><dd>{ui.schoolReq}</dd></div>)}
                        {ui.specialReq && (<div className="yp__kv_row"><dt>특이요건</dt><dd>{ui.specialReq}</dd></div>)}
                        {ui.addQual && (<div className="yp__kv_row"><dt>추가자격</dt><dd>{ui.addQual}</dd></div>)}
                        {ui.participantTarget && (<div className="yp__kv_row"><dt>참여대상</dt><dd>{ui.participantTarget}</dd></div>)}
                      </dl>
                    </section>
                  )}

                  {(ui.screeningMethod || ui.requiredDocs) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--check">심사/제출서류</h3>
                      <dl className="yp__kv">
                        {ui.screeningMethod && (<div className="yp__kv_row"><dt>심사방법</dt><dd>{ui.screeningMethod}</dd></div>)}
                        {ui.requiredDocs && (<div className="yp__kv_row"><dt>제출서류</dt><dd>{ui.requiredDocs}</dd></div>)}
                      </dl>
                    </section>
                  )}

                  {(ui.bizPeriod || ui.bizEtc) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--calendar">사업기간</h3>
                      <dl className="yp__kv">
                        {ui.bizPeriod && (<div className="yp__kv_row"><dt>기간</dt><dd>{ui.bizPeriod}</dd></div>)}
                        {ui.bizEtc && (<div className="yp__kv_row"><dt>비고</dt><dd>{ui.bizEtc}</dd></div>)}
                      </dl>
                    </section>
                  )}

                  {ui.refUrls && ui.refUrls.length > 0 && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--link">참고 링크</h3>
                      <ul className="yp__links">
                        {ui.refUrls.map((u, i) => (
                          <li key={i}><a className="yp__a" href={u} target="_blank" rel="noreferrer">{u}</a></li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(ui.providerGroup || ui.provisionMethod || ui.viewCount != null || ui.firstRegisteredAt || ui.lastModifiedAt) && (
                    <section className="yp__sectionCard">
                      <h3 className="yp__section_t yp__section_t--meta">메타정보</h3>
                      <dl className="yp__kv">
                        {ui.providerGroup && (<div className="yp__kv_row"><dt>제공주체</dt><dd>{ui.providerGroup}</dd></div>)}
                        {ui.provisionMethod && (<div className="yp__kv_row"><dt>지원방식</dt><dd>{ui.provisionMethod}</dd></div>)}
                        {ui.viewCount != null && (<div className="yp__kv_row"><dt>조회수</dt><dd>{ui.viewCount}</dd></div>)}
                        {ui.firstRegisteredAt && (<div className="yp__kv_row"><dt>등록일</dt><dd>{ui.firstRegisteredAt}</dd></div>)}
                        {ui.lastModifiedAt && (<div className="yp__kv_row"><dt>수정일</dt><dd>{ui.lastModifiedAt}</dd></div>)}
                      </dl>
                    </section>
                  )}

                  {/* 하단 액션 */}
                  <div className="yp__detail_actions">
                    <button className="yp__link" onClick={onBack}>뒤로가기</button>
                    {ui.applyUrl && (
                      <a className="yp__link yp__link--primary" href={ui.applyUrl} target="_blank" rel="noreferrer">
                        공식 링크 열기
                      </a>
                    )}
                  </div>
                </div>

                {/* 사이드 요약 */}
                <aside className="yp__detail_side">
                  <div className="yp__sideCard">
                    <div className="yp__side_title">요약</div>
                    <ul className="yp__side_list">
                      {ui.region && <li><span>지역</span><strong>{ui.region}</strong></li>}
                      {ui.period && <li><span>신청기간</span><strong>{ui.period}</strong></li>}
                      {ui.provisionMethod && <li><span>지원방식</span><strong>{ui.provisionMethod}</strong></li>}
                      {ui.supportCount != null && <li><span>선발인원</span><strong>{ui.supportCount}명</strong></li>}
                    </ul>
                    {ui.applyUrl && <a className="yp__btn yp__btn--block" href={ui.applyUrl} target="_blank" rel="noreferrer">지원하러 가기</a>}
                  </div>
                </aside>

                {/* 플로팅 액션 */}
                <div className="yp__fab_wrap">
                  <button className="yp__fab" onClick={share} title="공유">공유</button>
                </div>
              </article>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
