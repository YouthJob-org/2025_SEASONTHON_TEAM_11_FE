import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./hrd.css";
import { useNavigate } from "react-router-dom";

type HrdCourse = {
  title: string;
  subTitle?: string;
  address?: string;
  telNo?: string;
  traStartDate?: string;
  traEndDate?: string;
  trainTarget?: string;
  trprId: string;
  trprDegr: string;
  courseMan?: string | number; // ⬅️ 변경
  yardMan?: string | number;   // ⬅️ 변경
  titleLink?: string;
};

const AREA_OPTIONS: { value: string; label: string }[] = [
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
];

const NCS1_OPTIONS: { value: string; label: string }[] = [
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
];

const SORT_COL_OPTIONS: { value: "1" | "2" | "3" | "4"; label: string }[] = [
  { value: "1", label: "훈련기관명" },
  { value: "2", label: "훈련시작일" },
  { value: "3", label: "기관 직종별 취업률" },
  { value: "4", label: "만족도점수" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30];

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`; // yyyymmdd
}
function ymdInputToParam(v: string) {
  // "yyyy-mm-dd" -> "yyyymmdd"
  return v.replaceAll("-", "");
}
function toMoney(v?: string | number) {
  if (v === undefined || v === null || v === "") return "-";
  const n = typeof v === "string" ? Number(v) : v;
  if (!isFinite(n as number)) return String(v);
  return (n as number).toLocaleString("ko-KR") + "원";
}

// 토큰을 헤더로 만들어 주는 헬퍼
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken"); // 예: "Bearer eyJ..."
  if (!raw) return {};
  // 혹시 "Bearer "가 빠져 저장된 경우도 방어
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}
export default function HrdCourses() {
  const navigate = useNavigate();
  // 기본 기간: 올해 1월 1일 ~ 오늘
  const now = new Date();
  const startOfYear = useMemo(() => new Date(now.getFullYear(), 0, 1), []);
  const [startDate, setStartDate] = useState(
    `${startOfYear.getFullYear()}-${String(startOfYear.getMonth() + 1).padStart(2, "0")}-${String(startOfYear.getDate()).padStart(2, "0")}`
  );
  const [endDate, setEndDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );

  const [area1, setArea1] = useState<string>("");
  const [ncs1, setNcs1] = useState<string>("");
  const [sortCol, setSortCol] = useState<"1" | "2" | "3" | "4">("2");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC"); // 최신순 기본
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<HrdCourse[]>([]);

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

      const res = await fetch(`https://youthjob.site/api/v1/hrd/courses?${params.toString()}`,
    { headers: { ...getAuthHeader() } });
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

  // 검색 버튼 눌렀을 때만 조회
  const onSearch = () => {
    setPage(1); // 조건 바꾸면 1페이지부터
    // setState 비동기이므로 다음 tick에서 fetch 하도록 setTimeout
    setTimeout(fetchCourses, 0);
  };

  // 페이지 변경 시 자동 조회
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const canPrev = page > 1;
  const canNext = items.length === size; // 총 개수 없으니 size와 동일하면 더 있다고 가정

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
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="hrd__field">
                <label>종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="hrd__field">
                <label>지역</label>
                <select value={area1} onChange={(e) => setArea1(e.target.value)}>
                  {AREA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="hrd__field">
                <label>직종(NCS 1차)</label>
                <select value={ncs1} onChange={(e) => setNcs1(e.target.value)}>
                  {NCS1_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hrd__row">
              <div className="hrd__field">
                <label>정렬 기준</label>
                <select value={sortCol} onChange={(e) => setSortCol(e.target.value as any)}>
                  {SORT_COL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
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
                    <option key={s} value={s}>{s}개</option>
                  ))}
                </select>
              </div>

              <div className="hrd__actions">
                <button className="hrd__btn" onClick={onSearch}>검색</button>
              </div>
            </div>
          </section>

          {/* 결과 */}
          <section className="hrd__result">
            {loading && <div className="hrd__loading">불러오는 중…</div>}
            {error && <div className="hrd__error">{error}</div>}
            {!loading && !error && items.length === 0 && (
              <div className="hrd__empty">검색 결과가 없습니다.</div>
            )}

                    <ul className="hrd__list">
          {items.map((c) => (
            <li key={`${c.trprId}-${c.trprDegr}`} className="hrd__item">
              {/* ✅ '모집중/마감' 배지 제거 */}

              <div className="hrd__main">
                <h3 className="hrd__course">{c.title}</h3>

                <div className="hrd__meta">
                  <span className="hrd__org">{c.subTitle}</span>
                  {c.address && <>
                    <span className="hrd__sep">·</span>
                    <span>{c.address}</span>
                  </>}
                  {(c.traStartDate || c.traEndDate) && <>
                    <span className="hrd__sep">·</span>
                    <span>{c.traStartDate} ~ {c.traEndDate}</span>
                  </>}
                </div>

                <div className="hrd__submeta">
                  {c.telNo && <span>연락처: {c.telNo}</span>}
                  {c.trainTarget && <span>대상: {c.trainTarget}</span>}
                  {c.courseMan !== undefined && <span>교육비: {toMoney(c.courseMan)}</span>}
                  {c.yardMan   !== undefined && <span>정원: {c.yardMan}</span>}
                </div>
              </div>

      <div className="hrd__side">
        {c.titleLink ? (
          <a className="hrd__link" href={c.titleLink} target="_blank" rel="noreferrer">
            상세보기
          </a>
        ) : (
          <button className="hrd__link" disabled>상세보기</button>
        )}
      </div>
    </li>
  ))}
</ul>


            {/* 페이지네이션 */}
            <div className="hrd__pagenav">
              <button disabled={!canPrev} onClick={() => canPrev && setPage((p) => p - 1)}>이전</button>
              <span className="hrd__page">{page}</span>
              <button disabled={!canNext} onClick={() => canNext && setPage((p) => p + 1)}>다음</button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
