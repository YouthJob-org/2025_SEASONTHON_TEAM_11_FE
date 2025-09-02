// src/pages/EmpPrograms.tsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./emp.css"; 
// ─────────────────────────────────────────────────────────────
// 1) 지역 → 상위기관(topOrgCd) → 하위기관(orgCd) 매핑
// ─────────────────────────────────────────────────────────────
type Center = { value: string; label: string };
type Region = { key: string; label: string; topOrgCd: string; centers: Center[] };

const REGIONS: Region[] = [
  {
    key: "seoul",
    label: "서울",
    topOrgCd: "12010",
    centers: [
      { value: "", label: "전체(서울지방청)" },
      { value: "12003", label: "서울강남고용센터" },
      { value: "12012", label: "서울고용센터" },
      { value: "12014", label: "서초고용센터" },
      { value: "12023", label: "서울동부고용센터" },
      { value: "12025", label: "성동광진고용센터" },
      { value: "12031", label: "서울서부고용센터" },
      { value: "12041", label: "서울강서고용센터" },
      { value: "12042", label: "서울남부고용센터" },
      { value: "12051", label: "서울북부고용센터" },
      { value: "12057", label: "강북성북고용센터" },
      { value: "12061", label: "서울관악고용센터" },
    ],
  },
  {
    key: "busan",
    label: "부산(경남·울산)",
    topOrgCd: "13000",
    centers: [
      { value: "", label: "전체(부산지방청)" },
      { value: "13004", label: "부산고용센터" },
      { value: "13005", label: "부산사하고용센터" },
      { value: "13011", label: "부산동부고용센터" },
      { value: "13023", label: "부산북부고용센터" },
      { value: "13111", label: "마산고용센터" },
      { value: "13113", label: "창원고용센터" },
      { value: "13115", label: "함안고용센터" },
      { value: "13116", label: "창녕고용센터" },
      { value: "13121", label: "울산고용센터" },
      { value: "13131", label: "김해고용센터" },
      { value: "13132", label: "밀양고용센터" },
      { value: "13133", label: "양산고용센터" },
      { value: "13141", label: "진주고용센터" },
      { value: "13146", label: "하동고용센터" },
      { value: "13147", label: "거창고용센터" },
      { value: "13148", label: "사천고용센터" },
      { value: "13151", label: "통영고용센터" },
      { value: "13152", label: "거제고용센터" },
      { value: "13153", label: "고성고용센터" },
    ],
  },
  {
    key: "daegu",
    label: "대구(경북)",
    topOrgCd: "14010",
    centers: [
      { value: "", label: "전체(대구지방청)" },
      { value: "14002", label: "대구서부고용센터" },
      { value: "14005", label: "칠곡고용센터" },
      { value: "14006", label: "대구달성고용센터" },
      { value: "14011", label: "대구고용센터" },
      { value: "14013", label: "경산고용센터" },
      { value: "14014", label: "대구강북고용센터" },
      { value: "14016", label: "대구동부고용센터" },
      { value: "14017", label: "영천고용센터" },
      { value: "14111", label: "포항고용센터" },
      { value: "14112", label: "경주고용센터" },
      { value: "14113", label: "울진출장센터" },
      { value: "14121", label: "구미고용센터" },
      { value: "14122", label: "김천고용센터" },
      { value: "14132", label: "영주고용센터" },
      { value: "14133", label: "문경고용센터" },
      { value: "14134", label: "상주고용센터" },
      { value: "14141", label: "안동고용센터" },
      { value: "14145", label: "의성고용센터" },
      { value: "14146", label: "예천고용센터" },
    ],
  },
  {
    key: "gyeonggi",
    label: "경기·강원",
    topOrgCd: "15000",
    centers: [
      { value: "", label: "전체(중부지방청)" },
      { value: "15001", label: "인천고용센터" },
      { value: "15011", label: "인천북부고용센터" },
      { value: "15012", label: "인천서부고용센터" },
      { value: "15014", label: "강화고용센터" },
      { value: "15112", label: "수원고용센터" },
      { value: "15113", label: "용인고용센터" },
      { value: "15115", label: "화성고용센터" },
      { value: "15122", label: "김포고용센터" },
      { value: "15123", label: "부천고용센터" },
      { value: "15132", label: "광명고용센터" },
      { value: "15133", label: "의왕고용센터" },
      { value: "15134", label: "안양고용센터" },
      { value: "15136", label: "군포고용센터" },
      { value: "15141", label: "시흥고용센터" },
      { value: "15142", label: "안산고용센터" },
      { value: "15152", label: "의정부고용센터" },
      { value: "15153", label: "구리고용센터" },
      { value: "15155", label: "동두천고용센터" },
      { value: "15157", label: "남양주고용센터" },
      { value: "15158", label: "양주고용센터" },
      { value: "1515z", label: "포천고용센터" },
      { value: "15162", label: "이천고용센터" },
      { value: "15163", label: "성남고용센터" },
      { value: "15164", label: "하남고용센터" },
      { value: "15165", label: "경기광주고용센터" },
      { value: "15168", label: "양평고용센터" },
      { value: "15169", label: "여주고용센터" },
      { value: "15171", label: "평택고용센터" },
      { value: "15172", label: "안성고용센터" },
      { value: "15173", label: "오산고용센터" },
      { value: "15181", label: "고양고용센터" },
      { value: "15182", label: "파주고용센터" },
      { value: "15212", label: "춘천고용센터" },
      { value: "15215", label: "가평고용센터" },
      { value: "15216", label: "홍천고용센터" },
      { value: "15221", label: "삼척고용센터" },
      { value: "15222", label: "태백고용센터" },
      { value: "15231", label: "강릉고용센터" },
      { value: "15232", label: "속초고용센터" },
      { value: "15234", label: "동해고용센터" },
      { value: "15241", label: "원주고용센터" },
      { value: "15251", label: "영월고용센터" },
    ],
  },
  {
    key: "gwangju",
    label: "광주(전남·전북·제주)",
    topOrgCd: "16000",
    centers: [
      { value: "", label: "전체(광주지방청)" },
      { value: "16001", label: "광주고용센터" },
      { value: "16004", label: "광주광산고용센터" },
      { value: "16009", label: "나주고용센터" },
      { value: "1600y", label: "영광고용센터" },
      { value: "1600z", label: "화순고용센터" },
      { value: "16112", label: "정읍고용센터" },
      { value: "16113", label: "전주고용센터" },
      { value: "16114", label: "남원고용센터" },
      { value: "16122", label: "김제고용센터" },
      { value: "16123", label: "익산고용센터" },
      { value: "16132", label: "군산고용센터" },
      { value: "16133", label: "부안고용센터" },
      { value: "16134", label: "고창고용센터" },
      { value: "16212", label: "목포고용센터" },
      { value: "16214", label: "해남고용센터" },
      { value: "16215", label: "무안고용센터" },
      { value: "16216", label: "영암고용센터" },
      { value: "16221", label: "순천고용센터" },
      { value: "16222", label: "광양고용센터" },
      { value: "16223", label: "여수고용센터" },
      { value: "16301", label: "제주특별자치도고용센터" },
      { value: "16302", label: "제주특별자치도고용센터 서귀포지소" },
    ],
  },
  {
    key: "daejeon",
    label: "대전(충청·세종)",
    topOrgCd: "17000",
    centers: [
      { value: "", label: "전체(대전지방청)" },
      { value: "17004", label: "논산고용센터" },
      { value: "17005", label: "대전고용센터" },
      { value: "17006", label: "공주고용센터" },
      { value: "17008", label: "세종고용센터" },
      { value: "1700z", label: "금산고용센터" },
      { value: "17111", label: "청주고용센터" },
      { value: "17118", label: "옥천고용센터" },
      { value: "17119", label: "진천고용센터" },
      { value: "17121", label: "제천고용센터" },
      { value: "17122", label: "충주고용센터" },
      { value: "17125", label: "음성고용센터" },
      { value: "17211", label: "천안고용센터" },
      { value: "17212", label: "아산고용센터" },
      { value: "17214", label: "당진고용센터" },
      { value: "17215", label: "예산고용센터" },
      { value: "17222", label: "보령고용센터" },
      { value: "17226", label: "부여고용센터" },
      { value: "17227", label: "서천고용센터" },
      { value: "17228", label: "홍성고용센터" },
      { value: "17231", label: "서산고용센터" },
      { value: "17232", label: "태안고용센터" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
type EmpProgram = {
  id?: number;
  pgmId?: string;
  pgmNm?: string;
  topOrgCd?: string;
  topOrgNm?: string;
  orgCd?: string;
  orgNm?: string;
  pgmStdt?: string;
  pgmEddt?: string;
  url?: string;
  [k: string]: any;
};

type EmpProgramResponse = {
  startPage?: number;
  display?: number;
  totalCount?: number;
  items?: EmpProgram[];
  list?: EmpProgram[];
  data?: EmpProgram[];
  [k: string]: any;
};

type SavedEmpProgram = {
  id: number;
  pgmId?: string;
  pgmNm?: string;
  topOrgCd?: string;
  orgCd?: string;
  pgmStdt?: string;
  [k: string]: any;
};

// 네이버 블로그 검색 응답 타입
type NaverBlogItem = {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string; // yyyymmdd
};
type NaverBlogResp = { items: NaverBlogItem[] };

// ─────────────────────────────────────────────────────────────
// 유틸
function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}
async function ensureAuth(res: Response) {
  if (res.status === 401) {
    alert("로그인이 필요합니다.");
    location.href = "/login";
    throw new Error("401");
  }
}
function toYmdInput(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function ymdInputToParam(v: string) {
  return v.replaceAll("-", "");
}
function firstNonEmpty(obj: any, keys: string[], fallback = "-") {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
}
function programKey(it: EmpProgram) {
  return String(
    it.id ??
      it.pgmId ??
      `${it.topOrgCd || ""}/${it.orgCd || ""}/${it.pgmNm || ""}/${it.pgmStdt || ""}`
  );
}

function Heart({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={active ? "저장 취소" : "저장"}
      onClick={onClick}
      className="hrd__link"
      title={active ? "저장 취소" : "저장"}
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        borderColor: active ? "#ef4444" : undefined,
        color: active ? "#ef4444" : undefined,
      }}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill={active ? "#ef4444" : "none"}
        stroke={active ? "#ef4444" : "#64748b"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      {active ? "저장됨" : "저장"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
export default function EmpPrograms() {
  // 폼 상태
  const [date, setDate] = useState<string>(toYmdInput(new Date()));
  const [regionKey, setRegionKey] = useState<string>(REGIONS[0].key);
  const region = REGIONS.find((r) => r.key === regionKey)!;
  const [orgCd, setOrgCd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  // 결과/상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resp, setResp] = useState<EmpProgramResponse | null>(null);
  const items: EmpProgram[] = useMemo(
    () => (resp?.items ?? resp?.list ?? resp?.data ?? (resp as any)?.programs ?? []) as EmpProgram[],
    [resp]
  );

  // 저장상태
  const [savedMap, setSavedMap] = useState<Record<string, number>>({});

  // 블로그 후기 패널 상태
  const [blogOpenKey, setBlogOpenKey] = useState<string | null>(null);
  const [blogMap, setBlogMap] = useState<Record<string, NaverBlogItem[]>>({});
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState("");

  // 지역 변경 시 orgCd 초기화
  useEffect(() => {
    setOrgCd("");
  }, [regionKey]);

  // 내 저장목록 선로딩
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://youthjob.site/api/v1/emp-programs/saved", {
          headers: { ...getAuthHeader() },
        });
        await ensureAuth(res);
        if (!res.ok) throw new Error("저장목록 조회 실패");
        const saved: SavedEmpProgram[] = await res.json();
        const m: Record<string, number> = {};
        saved.forEach((s) => {
          const k =
            programKey(s as any) ||
            String(
              s.pgmId ??
                `${s.topOrgCd || ""}/${(s as any).orgCd || ""}/${s.pgmNm || ""}/${s.pgmStdt || ""}`
            );
          m[k] = s.id;
        });
        setSavedMap(m);
      } catch {
        // 비로그인일 수 있으니 조용히 패스
      }
    })();
  }, []);

  // 검색
  async function fetchPrograms(p = page) {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      const ymd = ymdInputToParam(date || "");
      if (ymd) qs.set("pgmStdt", ymd);

      qs.set("topOrgCd", region.topOrgCd);
      if (orgCd) qs.set("orgCd", orgCd);

      qs.set("startPage", String(p || 1));
      qs.set("display", String(size || 10));

      const res = await fetch(
        `https://youthjob.site/api/v1/emp-programs?${qs.toString()}`,
        { headers: { ...getAuthHeader() } }
      );
      await ensureAuth(res);
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
      const json: EmpProgramResponse = await res.json();
      setResp(json);
    } catch (e: any) {
      setError(e?.message ?? "오류가 발생했습니다.");
      setResp(null);
    } finally {
      setLoading(false);
    }
  }

  const onSearch = () => {
    setPage(1);
    setTimeout(() => fetchPrograms(1), 0);
  };

  useEffect(() => {
    fetchPrograms(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const canPrev = page > 1;
  const canNext = items.length === size;

  // 저장 토글
  async function onToggleSave(it: EmpProgram) {
    const key = programKey(it);
    const savedId = savedMap[key];
    try {
      if (savedId) {
        const res = await fetch(
          `https://youthjob.site/api/v1/emp-programs/saved/${savedId}`,
          { method: "DELETE", headers: { ...getAuthHeader() } }
        );
        await ensureAuth(res);
        if (!res.ok) throw new Error("삭제 실패");
        setSavedMap((m) => {
          const n = { ...m };
          delete n[key];
          return n;
        });
      } else {
        const res = await fetch(`https://youthjob.site/api/v1/emp-programs/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(it),
        });
        await ensureAuth(res);
        if (!res.ok) throw new Error("저장 실패");
        const saved: SavedEmpProgram = await res.json();
        setSavedMap((m) => ({ ...m, [key]: saved.id }));
      }
    } catch (e: any) {
      alert(e?.message ?? "처리에 실패했습니다.");
    }
  }

  // 블로그 검색 쿼리
  function buildBlogQuery(it: EmpProgram) {
  const title = firstNonEmpty(it, ["pgmNm", "title", "name"], "");
  const org   = firstNonEmpty(it, ["orgNm", "orgName", "orgCd"], "");
  const q = [title, org].filter(Boolean).join(" ");
  return q.replace(/\s+/g, " ").trim();  // 예) "취업희망 서울고용센터"
}
    const API_BASE = "https://youthjob.site"; // 백엔드 베이스
  // 블로그 검색 호출
  async function fetchBlogReviews(it: EmpProgram, key: string) {
    try {
      setBlogLoading(true);
      setBlogError("");
      const q = buildBlogQuery(it);
      const res = await fetch(
      `${API_BASE}/api/v1/naver/blogs?q=${encodeURIComponent(q)}&display=5&sort=sim`,
      { headers: { ...getAuthHeader() } } // 인증 불필요하면 제거 가능
    );
      if (!res.ok) throw new Error("블로그 검색 실패");
      const json: NaverBlogResp = await res.json();
      setBlogMap((m) => ({ ...m, [key]: json.items || [] }));
    } catch (e: any) {
      setBlogError(e?.message ?? "블로그 검색 오류");
    } finally {
      setBlogLoading(false);
    }
  }

  // 한 행 렌더링
  function Row({ it }: { it: EmpProgram }) {
    const title = firstNonEmpty(it, ["pgmNm", "title", "name"]);
    const org = firstNonEmpty(it, ["orgNm", "orgName", "orgCd"]);
    const topOrg = firstNonEmpty(it, ["topOrgNm", "topOrgCd"]);
    const sdt = firstNonEmpty(it, ["pgmStdt", "startDate", "sdt"], "");
    const edt = firstNonEmpty(it, ["pgmEddt", "pgmEndt", "endDate", "edt"], "");
    const sub = firstNonEmpty(it, ["pgmSubNm"], "");
    const time = firstNonEmpty(it, ["openTime"], "");
    const dur = firstNonEmpty(it, ["operationTime"], "");
    const place = firstNonEmpty(it, ["openPlcCont"], "");

    const key = programKey(it);
    const active = !!savedMap[key];

    const isOpen = blogOpenKey === key;
    const reviews = blogMap[key] ?? [];

    const onClickBlogs = async () => {
      if (isOpen) {
        setBlogOpenKey(null); // 접기
        return;
      }
      setBlogOpenKey(key); // 펼치기
      if (!blogMap[key]) {
        await fetchBlogReviews(it, key);
      }
    };

    return (
      <li className="emp__item">
        <div className="emp__main">
          <h3 className="hrd__course">{title}</h3>
          {sub && <div className="hrd__desc" style={{ color: "#64748b" }}>{sub}</div>}

          <div className="hrd__meta">
            <span className="hrd__org">{org}</span>
            {topOrg && topOrg !== "-" && (<><span className="hrd__sep">·</span><span>{topOrg}</span></>)}
            {(sdt || edt) && (
              <>
                <span className="hrd__sep">·</span>
                <span>{sdt}{edt ? ` ~ ${edt}` : ""}</span>
              </>
            )}
            {(time || dur) && (
              <>
                <span className="hrd__sep">·</span>
                <span>{time}{dur ? ` (${dur}시간)` : ""}</span>
              </>
            )}
          </div>

          {place && (
            <div className="hrd__meta" style={{ marginTop: 4 }}>
              <span>장소: {place}</span>
            </div>
          )}
        </div>

        <div className="hrd__side" style={{ display: "flex", gap: 8 }}>
          <button
            className="hrd__link"
            onClick={onClickBlogs}
            aria-expanded={isOpen}
            aria-controls={`reviews-${key}`}
          >
            블로그후기
          </button>
          <Heart active={active} onClick={() => onToggleSave(it)} />
        </div>

        {/* ▼ 블로그 후기 패널 */}
        {isOpen && (
          <div
                id={`reviews-${key}`}
                className={`hrd__reviews ${isOpen ? "open" : ""}`}
                aria-hidden={!isOpen}
                >
                {blogLoading && <div className="hrd__reviews-loading">후기 불러오는 중…</div>}
                {blogError && <div className="hrd__error">{blogError}</div>}

                {!blogLoading && !blogError && reviews.length === 0 && (
                    <div className="hrd__reviews-empty">관련 블로그 후기가 없습니다.</div>
                )}

                {reviews.map((b, i) => (
                    <div key={i} className="hrd__review">
                    <a
                        href={b.link}
                        target="_blank"
                        rel="noreferrer"
                        className="hrd__review-title"
                        dangerouslySetInnerHTML={{ __html: b.title }}
                    />
                    <div
                        className="hrd__review-desc"
                        dangerouslySetInnerHTML={{ __html: b.description }}
                    />
                    <div className="hrd__review-meta">
                        {b.bloggername} · {b.postdate.slice(0, 4)}-{b.postdate.slice(4, 6)}-{b.postdate.slice(6, 8)}
                    </div>
                    </div>
                ))}
                </div>
        )}
      </li>
    );
  }

  return (
    <>
      <Navbar />
      <main className="hrd">
        <div className="hrd__container">
          <h1 className="hrd__title">취업역량 강화프로그램</h1>
          <p className="hrd__subtitle">지역과 기관을 선택해 프로그램을 검색하고, 하트로 저장하세요.</p>

          {/* 검색바 */}
          <section className="hrd__search">
            <div className="hrd__row">
              <div className="hrd__field">
                <label>시작일(선택)</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="hrd__field">
                <label>지역</label>
                <select value={regionKey} onChange={(e) => setRegionKey(e.target.value)}>
                  {REGIONS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__field">
                <label>기관(센터)</label>
                <select value={orgCd} onChange={(e) => setOrgCd(e.target.value)}>
                  {region.centers.map((c) => (
                    <option key={c.value || "all"} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__field">
                <label>페이지 크기</label>
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  {[10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}개
                    </option>
                  ))}
                </select>
              </div>

              <div className="hrd__actions">
                <button className="hrd__btn" onClick={onSearch} disabled={loading}>
                  {loading ? "검색중…" : "검색"}
                </button>
              </div>
            </div>
          </section>

          {/* 결과 */}
          <section className="hrd__result">
            {loading && <div className="hrd__loading">불러오는 중…</div>}
            {error && <div className="hrd__error">{error}</div>}
            {!loading && !error && (items?.length ?? 0) === 0 && (
              <div className="hrd__empty">검색 결과가 없습니다.</div>
            )}

            {items.length > 0 && (
              <ul className="hrd__list">
                {items.map((it, idx) => (
                  <Row key={programKey(it) + "_" + idx} it={it} />
                ))}
              </ul>
            )}

            {/* 페이지네비게이션 */}
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
