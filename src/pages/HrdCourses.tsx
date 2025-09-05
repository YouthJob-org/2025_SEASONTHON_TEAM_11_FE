// src/pages/HrdCourses.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./hrd.css";

/* ===================== Types ===================== */
type HrdCourse = {
  title: string;
  subTitle?: string;        // 기관명
  address?: string;         // 주소(도/시)
  telNo?: string;           // 연락처
  traStartDate?: string;    // 시작일 (YYYY-MM-DD)
  traEndDate?: string;      // 종료일 (YYYY-MM-DD)
  trainTarget?: string;     // 대상
  trprId: string;
  trprDegr: string;
  courseMan?: string | number; // 교육비
  yardMan?: string | number;   // 정원
  titleLink?: string;          // 외부 상세 링크(신청)
  torgId?: string;             // 우리 상세 페이지용
};

type ApiResponse<T> = { code?: string | number; message?: string; data?: T };

type SavedCourseDto = {
  id: number;
  trprId: string;
  trprDegr: string;
  title: string;
  subTitle?: string;
  address?: string;
  telNo?: string;
  traStartDate?: string;
  traEndDate?: string;
  trainTarget?: string;
  trainTargetCd?: string;
  ncsCd?: string;
  courseMan?: string;
  realMan?: string;
  yardMan?: string;
  titleLink?: string;
  subTitleLink?: string;
};

/* ===================== Constants ===================== */
const AREA_OPTIONS = [
  { value: "", label: "전체 지역" },
  { value: "11", label: "서울" },
  { value: "26", label: "부산" },
  { value: "27", label: "대구" },
  { value: "28", label: "인천" },
  { value: "29", label: "광주" },
  { value: "30", label: "대전" },
  { value: "31", label: "울산" },
  { value: "36", label: "세종" },
  { value: "41", label: "경기" },
  { value: "43", label: "충북" },
  { value: "44", label: "충남" },
  { value: "45", label: "전북" },
  { value: "46", label: "전남" },
  { value: "47", label: "경북" },
  { value: "48", label: "경남" },
  { value: "50", label: "제주" },
  { value: "51", label: "강원" },
] as const;

const NCS1_OPTIONS = [
  { value: "", label: "전체 직종" },
  { value: "01", label: "사업관리" },
  { value: "02", label: "경영/회계/사무" },
  { value: "03", label: "금융/보험" },
  { value: "04", label: "교육/자연/사회과학" },
  { value: "05", label: "법률/경찰/소방/교도/국방" },
  { value: "06", label: "보건/의료" },
  { value: "07", label: "사회복지/종교" },
  { value: "08", label: "문화/예술/디자인/방송" },
  { value: "09", label: "운전/운송" },
  { value: "10", label: "영업판매" },
  { value: "11", label: "경비/청소" },
  { value: "12", label: "이용/숙박/여행/오락/스포츠" },
  { value: "13", label: "음식서비스" },
  { value: "14", label: "건설" },
  { value: "15", label: "기계" },
  { value: "16", label: "재료" },
  { value: "17", label: "화학/바이오" },
  { value: "18", label: "섬유/의복" },
  { value: "19", label: "전기/전자" },
  { value: "20", label: "정보통신" },
  { value: "21", label: "식품가공" },
  { value: "22", label: "인쇄/목재/가구/공예" },
  { value: "23", label: "환경/에너지/안전" },
  { value: "24", label: "농림어업" },
] as const;

const SORT_COL_OPTIONS = [
  { value: "1", label: "훈련기관명" },
  { value: "2", label: "훈련시작일" },
  { value: "3", label: "기관 직종별 취업률" },
  { value: "4", label: "만족도점수" },
] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

const API_BASE = "https://youthjob.site";

/* ===================== Utils ===================== */
function ymdInputToParam(v: string) {
  return v.replaceAll("-", "");
}
function toMoney(v?: string | number) {
  if (v === undefined || v === null || v === "") return "-";
  const n = typeof v === "string" ? Number(v) : v;
  if (!isFinite(n as number)) return String(v);
  return (n as number).toLocaleString("ko-KR") + "원";
}
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}
function courseKey(c: { trprId: string; trprDegr: string }) {
  return `${c.trprId}|${c.trprDegr}`;
}
function monthDiff(a?: string, b?: string) {
  if (!a || !b) return null;
  const s = new Date(a);
  const e = new Date(b);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months <= 0 ? 1 : months;
}
function dateLabel(a?: string, b?: string) {
  if (!a && !b) return "";
  if (a && b) return `${a} ~ ${b}`;
  return a ? `${a} ~` : `~ ${b}`;
}

/** 썸네일 경로 빌더.
 *  - public/img/cards/ 아래에 이미지를 넣고 파일명을 반환.
 *  - 지금은 전부 기본 이미지(card1.jpg)를 사용.
 *  - 필요하면 기관명/과정ID별 매핑을 아래에 추가하면 됨.
 */
const DEFAULT_THUMB = "/img/cards/card1.jpg";
const THUMB_BY_ORG: Record<string, string> = {
  // 예: "러닝플러스 주식회사": "/img/cards/learningplus.jpg",
};

function getThumbSrc(c: HrdCourse) {
  if (c.subTitle && THUMB_BY_ORG[c.subTitle]) return THUMB_BY_ORG[c.subTitle];
  return DEFAULT_THUMB;
}

/* ===================== Component ===================== */
export default function HrdCourses() {
  const navigate = useNavigate();

  // 기본 기간: 올해 1월 1일 ~ 오늘
  const now = new Date();
  const startOfYear = useMemo(() => new Date(now.getFullYear(), 0, 1), []);
  const [startDate, setStartDate] = useState(
    `${startOfYear.getFullYear()}-${String(startOfYear.getMonth() + 1).padStart(2, "0")}-${String(
      startOfYear.getDate()
    ).padStart(2, "0")}`
  );
  const [endDate, setEndDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );

  const [area1, setArea1] = useState<string>("");
  const [ncs1, setNcs1] = useState<string>("");
  const [sortCol, setSortCol] = useState<"1" | "2" | "3" | "4">("2");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<HrdCourse[]>([]);

  // 저장 상태: trprId|trprDegr -> savedId
  const [savedMap, setSavedMap] = useState<Record<string, number>>({});

  // 저장 목록 선로딩
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/hrd/saved`, { headers: { ...getAuthHeader() } });
        if (res.status === 401) return; // 비로그인 패스
        const json: ApiResponse<SavedCourseDto[]> | SavedCourseDto[] = await res.json();
        const data = Array.isArray(json) ? json : json?.data ?? [];
        const m: Record<string, number> = {};
        for (const s of data) if (s?.trprId && s?.trprDegr && s?.id) m[`${s.trprId}|${s.trprDegr}`] = s.id;
        setSavedMap(m);
      } catch {
        // ignore
      }
    })();
  }, []);

  // 검색
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        startDt: ymdInputToParam(startDate),
        endDt: ymdInputToParam(endDate),
        page: String(page),
        size: String(size),
        sort,
        sortCol,
      });
      if (area1) params.append("area1", area1);
      if (ncs1) params.append("ncs1", ncs1);

      const res = await fetch(`${API_BASE}/api/v1/hrd/courses?${params.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
      const data: HrdCourse[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "오류가 발생했습니다.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    setPage(1);
    setTimeout(fetchCourses, 0);
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const canPrev = page > 1;
  const canNext = items.length === size;

  // 저장 토글
  async function toggleSave(course: HrdCourse) {
    try {
      const key = courseKey(course);
      const savedId = savedMap[key];

      if (savedId) {
        const res = await fetch(`${API_BASE}/api/v1/hrd/saved/${savedId}`, {
          method: "DELETE",
          headers: { ...getAuthHeader() },
        });
        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("삭제 실패");
        setSavedMap((m) => {
          const n = { ...m };
          delete n[key];
          return n;
        });
      } else {
        const body = {
          trprId: course.trprId,
          trprDegr: course.trprDegr,
          title: course.title,
          subTitle: course.subTitle ?? "",
          address: course.address ?? "",
          telNo: course.telNo ?? "",
          traStartDate: course.traStartDate ?? "",
          traEndDate: course.traEndDate ?? "",
          trainTarget: course.trainTarget ?? "",
          trainTargetCd: "",
          ncsCd: "",
          courseMan: String(course.courseMan ?? ""),
          realMan: "",
          yardMan: String(course.yardMan ?? ""),
          titleLink: course.titleLink ?? "",
          subTitleLink: "",
        };

        const res = await fetch(`${API_BASE}/api/v1/hrd/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(body),
        });
        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("저장 실패");

        const json: ApiResponse<SavedCourseDto> | SavedCourseDto = await res.json();
        const saved = (json as any)?.data ?? json;
        if (saved?.id) setSavedMap((m) => ({ ...m, [key]: saved.id }));
      }
    } catch (e: any) {
      alert(e?.message ?? "처리에 실패했습니다.");
    }
  }

  // 이미지 로드 핸들러 (실패 시 플레이스홀더 보이기)
  function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    img.style.display = "none";
    const parent = img.parentElement;
    if (parent) parent.classList.add("is-empty");
  }
  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const parent = (e.currentTarget.parentElement);
    if (parent) parent.classList.remove("is-empty");
  }

  return (
    <>
      <Navbar />
      <main className="hrd">
        <div className="hrd__container">
          <h1 className="hrd__title">국민내일배움카드 훈련과정 찾기</h1>
          <p className="hrd__subtitle">원하는 지역과 분야의 국비 지원 교육과정을 검색하세요.</p>

          {/* 검색바 */}
          <section className="hrd__search">
            <div className="hrd__row">
              <div className="hrd__field">
                <label>시작일</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="hrd__field">
                <label>종료일</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div className="hrd__field">
                <label>지역</label>
                <select value={area1} onChange={(e) => setArea1(e.target.value)}>
                  {AREA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__field">
                <label>직종(NCS 1차)</label>
                <select value={ncs1} onChange={(e) => setNcs1(e.target.value)}>
                  {NCS1_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hrd__row">
              <div className="hrd__field">
                <label>정렬 기준</label>
                <select value={sortCol} onChange={(e) => setSortCol(e.target.value as any)}>
                  {SORT_COL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__field">
                <label>정렬 방향</label>
                <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
                  <option value="DESC">최신순</option>
                  <option value="ASC">오래된순</option>
                </select>
              </div>

              <div className="hrd__field">
                <label>페이지 크기</label>
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}개
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__actions">
                <button className="hrd__btn" onClick={onSearch}>
                  검색
                </button>
              </div>
            </div>
          </section>

          {/* 결과 */}
          <section className="hrd__result">
            {loading && <div className="hrd__loading">불러오는 중…</div>}
            {error && <div className="hrd__error">{error}</div>}
            {!loading && !error && items.length === 0 && <div className="hrd__empty">검색 결과가 없습니다.</div>}

            <ul className="hrd__cards">
              {items.map((c) => {
                const key = courseKey(c);
                const active = !!savedMap[key];
                const months = monthDiff(c.traStartDate, c.traEndDate);

                return (
                  <li key={`${c.trprId}-${c.trprDegr}`} className="hrd__card">
                    {/* 우상단 즐겨찾기(심플 아이콘) */}
                    <button
                      aria-label={active ? "저장 취소" : "저장"}
                      onClick={() => toggleSave(c)}
                      className={`hrd__fav ${active ? "is-active" : ""}`}
                      title={active ? "저장 취소" : "저장"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0-0-7.78z" />
                      </svg>
                    </button>

                    {/* 좌측 썸네일 */}
                    <div className="hrd__thumb is-empty" aria-hidden="true">
                      <img
                        className="hrd__thumb-img"
                        alt=""
                        src={getThumbSrc(c)}
                        onError={onImgError}
                        onLoad={onImgLoad}
                        loading="lazy"
                      />
                      <span className="hrd__thumb-dot" />
                    </div>

                    {/* 본문 */}
                    <div className="hrd__card-main">
                      <div className="hrd__card-head">
                        <h3 className="hrd__card-title">{c.title}</h3>
                        {c.subTitle && <div className="hrd__card-sub">{c.subTitle}</div>}
                      </div>

                      <p className="hrd__card-desc">
                        {c.trainTarget ? `대상: ${c.trainTarget}` : c.address ? c.address : "국민내일배움카드 지원 과정"}
                      </p>

                      {/* 아이콘 칩들 */}
                      <div className="hrd__tags">
                        {c.address && (
                          <span className="hrd__tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {c.address}
                          </span>
                        )}
                        {months && (
                          <span className="hrd__tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 3" />
                            </svg>
                            {months}개월
                          </span>
                        )}
                        <span className="hrd__tag hrd__tag--success">
                          {/* 달러 아이콘 */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 1v22" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          국민내일배움카드
                        </span>
                        {c.yardMan !== undefined && (
                          <span className="hrd__tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            정원 {c.yardMan}
                          </span>
                        )}
                      </div>

                      {(c.traStartDate || c.traEndDate || c.telNo || c.courseMan !== undefined) && (
                        <div className="hrd__meta-row">
                          {(c.traStartDate || c.traEndDate) && (
                            <span className="hrd__meta">{dateLabel(c.traStartDate, c.traEndDate)}</span>
                          )}
                          {c.telNo && <span className="hrd__meta">문의: {c.telNo}</span>}
                          {c.courseMan !== undefined && <span className="hrd__meta">교육비: {toMoney(c.courseMan)}</span>}
                        </div>
                      )}

                      {/* 우하단 액션 */}
                      <div className="hrd__card-actions">
                        {c.torgId ? (
                          <Link
                            className="hrd__btn-outline"
                            to={`/hrd/courses/${c.trprId}/${c.trprDegr}?torgId=${encodeURIComponent(c.torgId)}`}
                          >
                            상세보기
                          </Link>
                        ) : c.titleLink ? (
                          <a className="hrd__btn-outline" href={c.titleLink} target="_blank" rel="noreferrer">
                            상세보기
                          </a>
                        ) : (
                          <button className="hrd__btn-outline" disabled>
                            상세보기
                          </button>
                        )}

                        {c.titleLink ? (
                          <a className="hrd__btn-primary" href={c.titleLink} target="_blank" rel="noreferrer">
                            신청하기
                          </a>
                        ) : (
                          <button className="hrd__btn-primary" disabled>
                            신청하기
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* 페이지네이션 */}
            <div className="hrd__pagenav">
              <button disabled={!canPrev} onClick={() => canPrev && setPage((p) => p - 1)}>
                이전
              </button>
              <span className="hrd__page">{page}</span>
              <button disabled={!canNext} onClick={() => canNext && setPage((p) => p + 1)}>
                다음
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
