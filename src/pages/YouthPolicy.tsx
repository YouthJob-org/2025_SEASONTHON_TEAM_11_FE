// src/pages/YouthPolicy.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./youthpolicy.css";
import { getCachedPolicies, prefetchPoliciesAllSilent } from "../utils/policiesPrefetch";

/* ================== 타입들 ================== */
type Policy = {
  plcyNo: string;
  plcyNm: string;
  plcyKywdNm?: string;
  plcyExplnCn?: string;
  lclsfNm?: string;
  mclsfNm?: string;
  aplyYmd?: string;
  refUrlAddr1?: string;
  sprtTrgtMinAge?: string;
  sprtTrgtMaxAge?: string;
  zipCd?: string;
  rgtrInstCdNm?: string;
};

type SavedListPayload = {
  resultCode: number;
  resultMessage: string;
  result: Policy[]; // plcyNo 포함
};

/* ================== 상수/옵션 ================== */
// 광역 시/도 5자리(상위 코드)
const REGION_CODES: { value: string; label: string }[] = [
  { value: "", label: "전체 지역" },
  { value: "11000", label: "서울특별시" },
  { value: "26000", label: "부산광역시" },
  { value: "27000", label: "대구광역시" },
  { value: "28000", label: "인천광역시" },
  { value: "29000", label: "광주광역시" },
  { value: "30000", label: "대전광역시" },
  { value: "31000", label: "울산광역시" },
  { value: "36110", label: "세종특별자치시" },
  { value: "41000", label: "경기도" },
  { value: "42000", label: "강원도" },
  { value: "43000", label: "충청북도" },
  { value: "44000", label: "충청남도" },
  { value: "45000", label: "전라북도" },
  { value: "46000", label: "전라남도" },
  { value: "47000", label: "경상북도" },
  { value: "48000", label: "경상남도" },
  { value: "50000", label: "제주특별자치도" },
];

// 분류(문자열 매칭)
const BIG_CATE = [
  "", "일자리", "창업", "주거", "생활·복지", "교육·문화", "참여·권리", "복지문화",
] as const;

const MID_CATE = [
  "", "금융지원", "교통·통신", "문화활동", "예술인지원", "취약계층 및 금융지원",
] as const;

// 화면 표시 개수(요청: 30 고정)
const UI_PAGE_SIZE = 30;

/* ================== 유틸 ================== */
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  return { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` };
}
function parseAge(min?: string, max?: string) {
  if (!min && !max) return "";
  if (min && max) return `만 ${min}~${max}세`;
  if (min) return `만 ${min}세 이상`;
  return `만 ${max}세 이하`;
}
function includesIgnoreCase(hay: string | undefined, needle: string) {
  if (!hay) return false;
  return hay.toLowerCase().includes(needle.toLowerCase());
}

/* ================== 컴포넌트 ================== */
export default function YouthPolicyPage() {
  const navigate = useNavigate();

  // 검색 상태(입력값)
  const [zipCd, setZipCd] = useState<string>("");
  const [plcyNm, setPlcyNm] = useState<string>("");
  const [plcyKywdNm, setPlcyKywdNm] = useState<string>("");
  const [lclsfNm, setLclsfNm] = useState<(typeof BIG_CATE)[number]>("");
  const [mclsfNm, setMclsfNm] = useState<(typeof MID_CATE)[number]>("");

  // 원천 데이터(전부)
  const [allRaw, setAllRaw] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  // 하트(관심저장)
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  // “화면 페이지네이션” (30개씩)
  const [page, setPage] = useState<number>(1);

  /* -------- 저장목록 선로딩 -------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://youthjob.site/api/v1/youth-policies/saved", {
          headers: { ...getAuthHeader() },
        });
        if (!res.ok) return;
        const data: SavedListPayload = await res.json();
        const arr = Array.isArray(data?.result) ? data.result : [];
        setSavedSet(new Set(arr.map((p) => String(p.plcyNo))));
      } catch {
        // 비로그인일 수 있으니 조용히 패스
      }
    })();
  }, []);

  async function toggleSaved(plcyNo: string) {
    setSavedSet((prev) => {
      const next = new Set(prev);
      const key = String(plcyNo);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    try {
      await fetch("https://youthjob.site/api/v1/youth-policies/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ plcyNo }),
      });
    } catch {
      // 롤백
      setSavedSet((prev) => {
        const next = new Set(prev);
        const key = String(plcyNo);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      alert("관심 정책 저장 중 오류가 발생했습니다.");
    }
  }

  /* -------- 전체 4,096건 캐시 즉시-로드 + 없으면 백그라운드 수집 -------- */
  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const cached = getCachedPolicies();
        if (cached?.length) {
          if (!stopped) setAllRaw(cached);
        }
        // 캐시가 없거나 오래됐을 때 백그라운드 수집(세션에 계속 쌓임)
        await prefetchPoliciesAllSilent();
        if (!stopped) {
          const again = getCachedPolicies();
          if (again?.length) setAllRaw(again);
        }
      } catch (e: any) {
        if (!stopped) setError(e?.message ?? "오류가 발생했습니다.");
      } finally {
        if (!stopped) setLoading(false);
      }
    })();
    return () => {
      stopped = true;
    };
  }, []);

  /* -------- 클라이언트 필터링 -------- */
  const applyFilterFlagRef = useRef(0);
  const bumpFilter = () => (applyFilterFlagRef.current += 1);

  const filtered = useMemo(() => {
    // applyFilterFlagRef.current 은 사용만 해서 memo 깨우는 용도
    void applyFilterFlagRef.current;

    const name = plcyNm.trim();
    const kwRaw = plcyKywdNm.trim();
    const kwList = kwRaw
      ? kwRaw
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return allRaw.filter((p) => {
      // 지역(5자리 prefix)
      if (zipCd) {
        const z = (p.zipCd || "").slice(0, 5);
        if (!z.startsWith(zipCd.slice(0, 5))) return false;
      }
      // 대분류/중분류
      if (lclsfNm && p.lclsfNm !== lclsfNm) return false;
      if (mclsfNm && p.mclsfNm !== mclsfNm) return false;
      // 정책명
      if (name && !includesIgnoreCase(p.plcyNm, name)) return false;
      // 키워드: 제목/설명/키워드 중 하나라도 포함
      if (kwList.length) {
        const hay = `${p.plcyKywdNm ?? ""} ${p.plcyNm ?? ""} ${p.plcyExplnCn ?? ""}`.toLowerCase();
        const ok = kwList.some((k) => hay.includes(k.toLowerCase()));
        if (!ok) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRaw, zipCd, plcyNm, plcyKywdNm, lclsfNm, mclsfNm, applyFilterFlagRef.current]);

  /* -------- 화면용 30개 슬라이스 -------- */
  const pageSlice = useMemo(() => {
    const start = (page - 1) * UI_PAGE_SIZE;
    return filtered.slice(start, start + UI_PAGE_SIZE);
  }, [filtered, page]);

  const canPrev = page > 1;
  const canNext = page * UI_PAGE_SIZE < filtered.length;

  /* -------- 검색 버튼 -------- */
  const onSearch = () => {
    setPage(1);
    bumpFilter();
  };

  return (
    <>
      <Navbar />
      <main className="yp">
        <div className="yp__container">
          <h1 className="yp__title">청년지원정책</h1>
          <p className="yp__subtitle">정부·지자체 청년정책을 한 곳에서 확인하세요.</p>

          {/* 검색 바 */}
          <section className="yp__search">
            <div className="yp__row">
              <div className="yp__field">
                <label>지역(법정동코드 5자리)</label>
                <select value={zipCd} onChange={(e) => setZipCd(e.target.value)}>
                  {REGION_CODES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="yp__field">
                <label>정책명</label>
                <input
                  type="text"
                  placeholder="정책명"
                  value={plcyNm}
                  onChange={(e) => setPlcyNm(e.target.value)}
                />
              </div>

              <div className="yp__field">
                <label>키워드(쉼표/띄어쓰기)</label>
                <input
                  type="text"
                  placeholder='예) 보조금, 교통비'
                  value={plcyKywdNm}
                  onChange={(e) => setPlcyKywdNm(e.target.value)}
                />
              </div>

              <div className="yp__field">
                <label>대분류</label>
                <select
                  value={lclsfNm}
                  onChange={(e) => setLclsfNm(e.target.value as (typeof BIG_CATE)[number])}
                >
                  {BIG_CATE.map((v) => (
                    <option key={v} value={v}>
                      {v || "전체"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="yp__field">
                <label>중분류</label>
                <select
                  value={mclsfNm}
                  onChange={(e) => setMclsfNm(e.target.value as (typeof MID_CATE)[number])}
                >
                  {MID_CATE.map((v) => (
                    <option key={v} value={v}>
                      {v || "전체"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="yp__actions">
                <button className="yp__btn" onClick={onSearch} disabled={loading}>
                  {loading ? "검색중…" : "검색"}
                </button>
              </div>
            </div>
          </section>

          {/* 결과 */}
          <section className="yp__result">
            {loading && allRaw.length === 0 && <div className="yp__loading">불러오는 중…</div>}
            {error && <div className="yp__error">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="yp__empty">검색 결과가 없습니다.</div>
            )}

            <ul className="yp__grid">
              {pageSlice.map((p) => {
                const isSaved = savedSet.has(String(p.plcyNo));
                return (
                  <li
                    key={p.plcyNo}
                    className="yp__card yp__card--clickable"
                    onClick={() => navigate(`/youth-policies/${encodeURIComponent(p.plcyNo)}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate(`/youth-policies/${encodeURIComponent(p.plcyNo)}`);
                    }}
                  >
                    <div className="yp__card_head">
                      <span className="yp__badge">{p.lclsfNm || "정책"}</span>
                      <button
                        className={`yp__heart ${isSaved ? "is-on" : ""}`}
                        aria-label="관심저장"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaved(p.plcyNo);
                        }}
                      >
                        <span className="yp__heart_shape" />
                      </button>
                    </div>

                    <h3 className="yp__title_sm">{p.plcyNm}</h3>
                    {p.plcyExplnCn && <p className="yp__summary">{p.plcyExplnCn}</p>}

                    <div className="yp__meta">
                      {p.mclsfNm && <span className="yp__meta_item">중분류: {p.mclsfNm}</span>}
                      {p.aplyYmd && <span className="yp__meta_item">기간: {p.aplyYmd}</span>}
                      {(p.sprtTrgtMinAge || p.sprtTrgtMaxAge) && (
                        <span className="yp__meta_item">
                          연령: {parseAge(p.sprtTrgtMinAge, p.sprtTrgtMaxAge)}
                        </span>
                      )}
                      {p.rgtrInstCdNm && (
                        <span className="yp__meta_item">기관: {p.rgtrInstCdNm}</span>
                      )}
                    </div>

                    <div className="yp__card_foot" onClick={(e) => e.stopPropagation()}>
                      {p.refUrlAddr1 && (
                        <a className="yp__link" href={p.refUrlAddr1} target="_blank" rel="noreferrer">
                          사이트 이동
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* 페이지네이션(총페이지 미표시) */}
            {filtered.length > 0 && (
              <div className="yp__pagenav">
                <button disabled={!canPrev} onClick={() => canPrev && setPage((p) => p - 1)}>
                  이전
                </button>
                <span className="yp__page">{page}</span>
                <button disabled={!canNext} onClick={() => canNext && setPage((p) => p + 1)}>
                  다음
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
