import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./youthpolicy.css";

/** ───────────────── API 타입: 신규/레거시/래핑 모두 수용 ───────────────── */
type WrappedDetail<T> = {
  resultCode: number;
  resultMessage: string;
  result: T;
};

// 신규 스키마(질문 본문)
type NewDetail = {
  plcyNo: string;
  plcyNm: string;
  summary?: string | null;
  keywords?: string[];
  categoryL?: string | null;
  categoryM?: string | null;

  applyPeriodType?: string | null; // "특정기간" 등
  applyPeriod?: string | null;     // "YYYYMMDD ~ YYYYMMDD"
  applyUrl?: string | null;
  applyMethod?: string | null;

  supportContent?: string | null;
  firstCome?: boolean;
  supportScaleLimited?: boolean;
  supportCount?: number | null;

  ageMin?: number | null;
  ageMax?: number | null;
  ageLimited?: boolean;
  maritalStatus?: string | null;

  incomeConditionType?: string | null;
  incomeMin?: string | null;
  incomeMax?: string | null;
  incomeEtc?: string | null;

  jobRequirements?: string[] | null;
  majorRequirement?: string | null;
  schoolRequirements?: string[] | null;
  specialRequirements?: string[] | null;

  additionalQualification?: string | null;
  participantTarget?: string | null;
  screeningMethod?: string | null;
  requiredDocs?: string | null;
  etcNotes?: string | null;

  refUrls?: string[] | null;

  providerGroup?: string | null;   // 제공 분류(중앙/지자체 등)
  provisionMethod?: string | null; // 보조금/대출 등
  supervisorName?: string | null;  // 주관
  operatorName?: string | null;    // 운영

  businessPeriodType?: string | null;
  businessBeginYmd?: string | null; // "YYYY-MM-DD"
  businessEndYmd?: string | null;
  businessEtc?: string | null;

  zipCodes?: Array<string | number> | null;

  viewCount?: number;
  firstRegisteredAt?: string | null;
  lastModifiedAt?: string | null;
};

// 레거시(이전 상세)
type LegacyDetail = {
  plcyNo: string;
  plcyNm: string;
  plcyExplnCn?: string | null;
  lclsfNm?: string | null;
  mclsfNm?: string | null;
  aplyYmd?: string | null;
  aplyUrlAddr?: string | null;
  refUrlAddr1?: string | null;
  rgtrInstCdNm?: string | null;
  sprvsnInstCdNm?: string | null;
  operInstCdNm?: string | null;
  sprtTrgtMinAge?: string | null;
  sprtTrgtMaxAge?: string | null;
};

/** ───────────────── 유틸 ───────────────── */
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  return { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` };
}

const REGION_MAP: Record<string, string> = {
  "11": "서울특별시", "26": "부산광역시", "27": "대구광역시", "28": "인천광역시",
  "29": "광주광역시", "30": "대전광역시", "31": "울산광역시", "36": "세종특별자치시",
  "41": "경기도", "42": "강원도", "43": "충청북도", "44": "충청남도",
  "45": "전라북도", "46": "전라남도", "47": "경상북도", "48": "경상남도",
  "50": "제주특별자치도",
};

function zipCodesToRegion(zipCodes?: Array<string | number> | null): string | undefined {
  if (!zipCodes || zipCodes.length === 0) return undefined;
  const prefixes = new Set(
    zipCodes
      .map((z) => String(z).padStart(5, "0").slice(0, 2))
      .filter((p) => REGION_MAP[p])
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

function notEmpty(v?: string | null): v is string {
  return !!v && v.trim() !== "";
}
function listOrDash(xs?: (string | null)[] | null): string | undefined {
  if (!xs || xs.length === 0) return undefined;
  const t = xs.filter(notEmpty).join(", ");
  return t || undefined;
}

/** 화면 모델 */
type Ui = {
  id: string;
  title: string;

  // 배지/상단 메타
  categoryL?: string;
  categoryM?: string;
  region?: string;
  period?: string;
  orgMain?: string;
  orgSub?: string;

  // 개요
  summary?: string;
  keywords?: string[];

  // 신청
  applyType?: string;
  applyMethod?: string;
  applyUrl?: string;

  // 지원
  supportContent?: string;
  firstCome?: boolean;
  supportScaleLimited?: boolean;
  supportCount?: number | null;

  // 대상/요건
  ageRange?: string;
  maritalStatus?: string;
  income?: string;
  incomeEtc?: string;
  jobReq?: string;
  majorReq?: string;
  schoolReq?: string;
  specialReq?: string;
  addQual?: string;
  participantTarget?: string;

  // 심사/서류
  screeningMethod?: string;
  requiredDocs?: string;

  // 사업기간/비고
  bizPeriod?: string;
  bizEtc?: string;

  // 참고링크
  refUrls?: string[];

  // 메타
  providerGroup?: string;
  provisionMethod?: string;
  viewCount?: number;
  firstRegisteredAt?: string | null;
  lastModifiedAt?: string | null;
};

function normalize(raw: any): Ui {
  const wrapped = raw && raw.result && typeof raw.result === "object" && !Array.isArray(raw.result);
  const d = wrapped ? (raw as WrappedDetail<any>).result : raw;

  // 신규 스키마
  if ("summary" in d || "applyPeriod" in d || "zipCodes" in d) {
    const n = d as NewDetail;
    return {
      id: n.plcyNo,
      title: n.plcyNm,
      categoryL: n.categoryL || undefined,
      categoryM: n.categoryM || undefined,
      region: zipCodesToRegion(n.zipCodes) || undefined,
      period: n.applyPeriod || undefined,
      orgMain: n.supervisorName || undefined,
      orgSub: n.operatorName || undefined,

      summary: n.summary || undefined,
      keywords: (n.keywords || []).filter(Boolean) as string[],

      applyType: n.applyPeriodType || undefined,
      applyMethod: n.applyMethod || undefined,
      applyUrl: n.applyUrl || undefined,

      supportContent: n.supportContent || undefined,
      firstCome: !!n.firstCome,
      supportScaleLimited: !!n.supportScaleLimited,
      supportCount: n.supportCount ?? null,

      ageRange: formatAge(n.ageMin ?? undefined, n.ageMax ?? undefined),
      maritalStatus: n.maritalStatus || undefined,
      income: n.incomeConditionType || undefined,
      incomeEtc: n.incomeEtc || undefined,
      jobReq: listOrDash(n.jobRequirements || []) || undefined,
      majorReq: n.majorRequirement || undefined,
      schoolReq: listOrDash(n.schoolRequirements || []) || undefined,
      specialReq: listOrDash(n.specialRequirements || []) || undefined,
      addQual: n.additionalQualification || undefined,
      participantTarget: n.participantTarget || undefined,

      screeningMethod: n.screeningMethod || undefined,
      requiredDocs: n.requiredDocs || undefined,

      bizPeriod:
        n.businessBeginYmd && n.businessEndYmd
          ? `${n.businessBeginYmd} ~ ${n.businessEndYmd}`
          : undefined,
      bizEtc: n.businessEtc || undefined,

      refUrls: (n.refUrls || []).filter(notEmpty) as string[],

      providerGroup: n.providerGroup || undefined,
      provisionMethod: n.provisionMethod || undefined,
      viewCount: n.viewCount ?? undefined,
      firstRegisteredAt: n.firstRegisteredAt || undefined,
      lastModifiedAt: n.lastModifiedAt || undefined,
    };
  }

  // 레거시 스키마
  const l = d as LegacyDetail;
  return {
    id: l.plcyNo,
    title: l.plcyNm,
    categoryL: l.lclsfNm || undefined,
    categoryM: l.mclsfNm || undefined,
    period: l.aplyYmd || undefined,
    orgMain: l.rgtrInstCdNm || l.sprvsnInstCdNm || undefined,
    orgSub: l.operInstCdNm || undefined,
    summary: l.plcyExplnCn || undefined,
    applyUrl: l.aplyUrlAddr || l.refUrlAddr1 || undefined,
    ageRange:
      l.sprtTrgtMinAge || l.sprtTrgtMaxAge
        ? `만 ${l.sprtTrgtMinAge ?? ""}${l.sprtTrgtMaxAge ? `~${l.sprtTrgtMaxAge}` : ""}세`
        : undefined,
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

  return (
    <>
      <Navbar />
      <main className="yp">
        <div className="yp__container">
          {loading && <div className="yp__loading">불러오는 중…</div>}
          {error && <div className="yp__error">{error}</div>}

          {ui && (
            <article className="yp__detail">
              {/* 타이틀 */}
              <h1 className="yp__title">{ui.title}</h1>

              {/* 상단 메타 */}
              <div className="yp__meta" style={{ marginTop: 8 }}>
                {ui.categoryL && <span className="yp__badge">{ui.categoryL}</span>}
                {ui.categoryM && <span className="yp__meta_item">중분류: {ui.categoryM}</span>}
                {ui.region && <span className="yp__meta_item">지역: {ui.region}</span>}
                {ui.period && <span className="yp__meta_item">신청기간: {ui.period}</span>}
                {ui.orgMain && <span className="yp__meta_item">주관: {ui.orgMain}</span>}
                {ui.orgSub && <span className="yp__meta_item">운영: {ui.orgSub}</span>}
              </div>

              {/* 개요 */}
              {(ui.summary || (ui.keywords && ui.keywords.length > 0)) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">개요</h3>
                  {ui.summary && <p className="yp__section_p">{ui.summary}</p>}
                  {ui.keywords && ui.keywords.length > 0 && (
                    <div className="yp__chips">
                      {ui.keywords.map((k, i) => (
                        <span key={i} className="yp__chip">#{k}</span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* 신청/접수 */}
              {(ui.applyType || ui.applyMethod || ui.applyUrl) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">신청/접수</h3>
                  <dl className="yp__dl">
                    {ui.applyType && (
                      <>
                        <dt>신청유형</dt><dd>{ui.applyType}</dd>
                      </>
                    )}
                    {ui.applyMethod && (
                      <>
                        <dt>신청방법</dt><dd>{ui.applyMethod}</dd>
                      </>
                    )}
                    {ui.applyUrl && (
                      <>
                        <dt>공식 링크</dt>
                        <dd>
                          <a className="yp__a" href={ui.applyUrl} target="_blank" rel="noreferrer">
                            {ui.applyUrl}
                          </a>
                        </dd>
                      </>
                    )}
                  </dl>
                </section>
              )}

              {/* 지원내용/규모 */}
              {(ui.supportContent ||
                ui.firstCome !== undefined ||
                ui.supportScaleLimited !== undefined ||
                ui.supportCount != null) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">지원내용</h3>
                  <dl className="yp__dl">
                    {ui.supportContent && (
                      <>
                        <dt>내용</dt><dd>{ui.supportContent}</dd>
                      </>
                    )}
                    {ui.firstCome !== undefined && (
                      <>
                        <dt>선착순</dt><dd>{ui.firstCome ? "예" : "아니오"}</dd>
                      </>
                    )}
                    {ui.supportScaleLimited !== undefined && (
                      <>
                        <dt>규모 제한</dt><dd>{ui.supportScaleLimited ? "예" : "아니오"}</dd>
                      </>
                    )}
                    {ui.supportCount != null && (
                      <>
                        <dt>지원(선발) 인원</dt><dd>{ui.supportCount}명</dd>
                      </>
                    )}
                  </dl>
                </section>
              )}

              {/* 대상/자격 요건 */}
              {(ui.ageRange || ui.maritalStatus || ui.income || ui.incomeEtc ||
                ui.jobReq || ui.majorReq || ui.schoolReq || ui.specialReq ||
                ui.addQual || ui.participantTarget) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">대상 및 자격</h3>
                  <dl className="yp__dl">
                    {ui.ageRange && (<><dt>연령</dt><dd>{ui.ageRange}</dd></>)}
                    {ui.maritalStatus && (<><dt>혼인</dt><dd>{ui.maritalStatus}</dd></>)}
                    {ui.income && (<><dt>소득조건</dt><dd>{ui.income}</dd></>)}
                    {ui.incomeEtc && (<><dt>소득 비고</dt><dd>{ui.incomeEtc}</dd></>)}
                    {ui.jobReq && (<><dt>직무/대상</dt><dd>{ui.jobReq}</dd></>)}
                    {ui.majorReq && (<><dt>전공</dt><dd>{ui.majorReq}</dd></>)}
                    {ui.schoolReq && (<><dt>학력/학교</dt><dd>{ui.schoolReq}</dd></>)}
                    {ui.specialReq && (<><dt>특이요건</dt><dd>{ui.specialReq}</dd></>)}
                    {ui.addQual && (<><dt>추가자격</dt><dd>{ui.addQual}</dd></>)}
                    {ui.participantTarget && (<><dt>참여대상</dt><dd>{ui.participantTarget}</dd></>)}
                  </dl>
                </section>
              )}

              {/* 심사/제출서류 */}
              {(ui.screeningMethod || ui.requiredDocs) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">심사/제출서류</h3>
                  <dl className="yp__dl">
                    {ui.screeningMethod && (<><dt>심사방법</dt><dd>{ui.screeningMethod}</dd></>)}
                    {ui.requiredDocs && (<><dt>제출서류</dt><dd>{ui.requiredDocs}</dd></>)}
                  </dl>
                </section>
              )}

              {/* 사업기간 */}
              {(ui.bizPeriod || ui.bizEtc) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">사업기간</h3>
                  <dl className="yp__dl">
                    {ui.bizPeriod && (<><dt>기간</dt><dd>{ui.bizPeriod}</dd></>)}
                    {ui.bizEtc && (<><dt>비고</dt><dd>{ui.bizEtc}</dd></>)}
                  </dl>
                </section>
              )}

              {/* 참고 링크(배너 버튼 말고 정보 섹션으로) */}
              {ui.refUrls && ui.refUrls.length > 0 && (
                <section className="yp__section">
                  <h3 className="yp__section_t">참고 링크</h3>
                  <ul className="yp__links">
                    {ui.refUrls.map((u, i) => (
                      <li key={i}>
                        <a className="yp__a" href={u} target="_blank" rel="noreferrer">{u}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 하단 메타 */}
              {(ui.providerGroup || ui.provisionMethod || ui.viewCount != null ||
                ui.firstRegisteredAt || ui.lastModifiedAt) && (
                <section className="yp__section">
                  <h3 className="yp__section_t">메타정보</h3>
                  <dl className="yp__dl">
                    {ui.providerGroup && (<><dt>제공주체</dt><dd>{ui.providerGroup}</dd></>)}
                    {ui.provisionMethod && (<><dt>지원방식</dt><dd>{ui.provisionMethod}</dd></>)}
                    {ui.viewCount != null && (<><dt>조회수</dt><dd>{ui.viewCount}</dd></>)}
                    {ui.firstRegisteredAt && (<><dt>등록일</dt><dd>{ui.firstRegisteredAt}</dd></>)}
                    {ui.lastModifiedAt && (<><dt>수정일</dt><dd>{ui.lastModifiedAt}</dd></>)}
                  </dl>
                </section>
              )}

              {/* 액션: 뒤로가기만 */}
              <div className="yp__detail_actions">
                <button className="yp__link" onClick={onBack}>뒤로가기</button>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
