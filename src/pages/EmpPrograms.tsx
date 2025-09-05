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
      { value: "1515z", label: "포천고용센터" }, // 코드 미확정
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
      { value: "1600y", label: "영광고용센터" }, // 코드 미확정
      { value: "1600z", label: "화순고용센터" }, // 코드 미확정
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
      { value: "1700z", label: "금산고용센터" }, // 코드 미확정
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
// 2) work.go.kr 센터 고정 URL 생성 (센터코드/이름 → slug → URL)
// ─────────────────────────────────────────────────────────────
function normalizeName(s: string) {
  return (s || "").replace(/\s+/g, "").replace(/고용센터$/, "").trim();
}

/** orgCd → slug */
const WORK_CENTER_SLUGS: Record<string, string> = {
  // 서울
  "12003": "seoulgangnam",
  "12012": "seoul",
  "12014": "seocho",
  "12023": "seouldongbu",
  "12025": "seongdonggwangjin",
  "12031": "seoulseobu",
  "12041": "seoulgangseo",
  "12042": "seoulnambu",
  "12051": "seoulbukbu",
  "12057": "gangbukseongbuk",
  "12061": "seoulgwanak",
  // 부산/울산/경남
  "13004": "busan",
  "13005": "busansaha",
  "13011": "busandongbu",
  "13023": "busanbukbu",
  "13111": "masan",
  "13113": "changwon",
  "13115": "haman",
  "13116": "changnyeong",
  "13121": "ulsan",
  "13131": "gimhae",
  "13132": "miryang",
  "13133": "yangsan",
  "13141": "jinju",
  "13146": "hadong",
  "13147": "geochang",
  "13148": "sacheon",
  "13151": "tongyeong",
  "13152": "geoje",
  "13153": "goseong",
  // 대구/경북
  "14002": "daeguseobu",
  "14005": "chilgok",
  "14006": "daegudalseong",
  "14011": "daegu",
  "14013": "gyeongsan",
  "14014": "daegugangbuk",
  "14016": "daegudongbu",
  "14017": "yeongcheon",
  "14111": "pohang",
  "14112": "gyeongju",
  "14113": "uljin",
  "14121": "gumi",
  "14122": "gimcheon",
  "14132": "yeongju",
  "14133": "mungyeong",
  "14134": "sangju",
  "14141": "andong",
  "14145": "uiseong",
  "14146": "yecheon",
  // 경기/인천/강원
  "15001": "incheon",
  "15011": "incheonbukbu",
  "15012": "incheonseobu",
  "15014": "ganghwa",
  "15112": "suwon",
  "15113": "yongin",
  "15115": "hwaseong",
  "15122": "gimpo",
  "15123": "bucheon",
  "15132": "gwangmyeong",
  "15133": "uiwang",
  "15134": "anyang",
  "15136": "gunpo",
  "15141": "siheung",
  "15142": "ansan",
  "15152": "uijeongbu",
  "15153": "guri",
  "15155": "dongducheon",
  "15157": "namyangju",
  "15158": "yangju",
  "15162": "icheon",
  "15163": "seongnam",
  "15164": "hanam",
  "15165": "gyeonggigwangju",
  "15168": "yangpyeong",
  "15169": "yeoju",
  "15171": "pyeongtaek",
  "15172": "anseong",
  "15173": "osan",
  "15181": "goyang",
  "15182": "paju",
  "15212": "chuncheon",
  "15215": "gapyeong",
  "15216": "hongcheon",
  "15221": "samcheok",
  "15222": "taebaek",
  "15231": "gangneung",
  "15232": "sokcho",
  "15234": "donghae",
  "15241": "wonju",
  "15251": "yeongwol",
  // 광주/전라/제주
  "16001": "gwangju",
  "16004": "gwangsan",
  "16009": "naju",
  "16112": "jeongeup",
  "16113": "jeonju",
  "16114": "namwon",
  "16122": "gimje",
  "16123": "iksan",
  "16132": "gunsan",
  "16133": "buan",
  "16134": "gochang",
  "16212": "mokpo",
  "16214": "haenam",
  "16215": "muan",
  "16216": "yeongam",
  "16221": "suncheon",
  "16222": "gwangyang",
  "16223": "yeosu",
  "16301": "jeju",
  "16302": "seogwipo",
  // 대전/충청/세종
  "17004": "nonsan",
  "17005": "daejeon",
  "17006": "gongju",
  "17008": "sejong",
  "17111": "cheongju",
  "17118": "okcheon",
  "17119": "jincheon",
  "17121": "jecheon",
  "17122": "chungju",
  "17125": "eumseong",
  "17211": "cheonan",
  "17212": "asan",
  "17214": "dangjin",
  "17215": "yesan",
  "17222": "boryeong",
  "17226": "buyeo",
  "17227": "seocheon",
  "17228": "hongseong",
  "17231": "seosan",
  "17232": "taean",
};

/** 센터명 → slug (코드 없을 때 보조) */
const NAME_TO_WORK_SLUG: Record<string, string> = {
  // (생략 없이 그대로 유지)
  "서울동부": "seouldongbu",
  "서울서부": "seoulseobu",
  "서울남부": "seoulnambu",
  "서울북부": "seoulbukbu",
  "서울강남": "seoulgangnam",
  "서울강서": "seoulgangseo",
  "서울관악": "seoulgwanak",
  "성동광진": "seongdonggwangjin",
  "강북성북": "gangbukseongbuk",
  "서울": "seoul",
  "부산": "busan",
  "부산사하": "busansaha",
  "부산동부": "busandongbu",
  "부산북부": "busanbukbu",
  "울산": "ulsan",
  "대구": "daegu",
  "대구서부": "daeguseobu",
  "대구강북": "daegugangbuk",
  "대구동부": "daegudongbu",
  "경산": "gyeongsan",
  "칠곡": "chilgok",
  "포항": "pohang",
  "경주": "gyeongju",
  "구미": "gumi",
  "김천": "gimcheon",
  "인천": "incheon",
  "인천북부": "incheonbukbu",
  "인천서부": "incheonseobu",
  "강화": "ganghwa",
  "수원": "suwon",
  "용인": "yongin",
  "화성": "hwaseong",
  "김포": "gimpo",
  "부천": "bucheon",
  "광명": "gwangmyeong",
  "의왕": "uiwang",
  "안양": "anyang",
  "군포": "gunpo",
  "시흥": "siheung",
  "안산": "ansan",
  "의정부": "uijeongbu",
  "구리": "guri",
  "동두천": "dongducheon",
  "남양주": "namyangju",
  "양주": "yangju",
  "이천": "icheon",
  "성남": "seongnam",
  "하남": "hanam",
  "경기광주": "gyeonggigwangju",
  "양평": "yangpyeong",
  "여주": "yeoju",
  "평택": "pyeongtaek",
  "안성": "anseong",
  "오산": "osan",
  "고양": "goyang",
  "파주": "paju",
  "춘천": "chuncheon",
  "가평": "gapyeong",
  "홍천": "hongcheon",
  "삼척": "samcheok",
  "태백": "taebaek",
  "강릉": "gangneung",
  "속초": "sokcho",
  "동해": "donghae",
  "원주": "wonju",
  "영월": "yeongwol",
  "광주": "gwangju",
  "광산": "gwangsan",
  "나주": "naju",
  "정읍": "jeongeup",
  "전주": "jeonju",
  "남원": "namwon",
  "김제": "gimje",
  "익산": "iksan",
  "군산": "gunsan",
  "부안": "buan",
  "고창": "gochang",
  "목포": "mokpo",
  "해남": "haenam",
  "무안": "muan",
  "영암": "yeongam",
  "순천": "suncheon",
  "광양": "gwangyang",
  "여수": "yeosu",
  "제주특별자치도": "jeju",
  "제주": "jeju",
  "서귀포": "seogwipo",
  "대전": "daejeon",
  "세종": "sejong",
  "논산": "nonsan",
  "공주": "gongju",
  "청주": "cheongju",
  "옥천": "okcheon",
  "진천": "jincheon",
  "제천": "jecheon",
  "충주": "chungju",
  "음성": "eumseong",
  "천안": "cheonan",
  "아산": "asan",
  "당진": "dangjin",
  "예산": "yesan",
  "보령": "boryeong",
  "부여": "buyeo",
  "서천": "seocheon",
  "홍성": "hongseong",
  "서산": "seosan",
  "태안": "taean",
};

/** 최종 URL */
function getCenterUrlFromItem(it: any) {
  const code = (it?.orgCd ?? "").toString().trim();
  const name = normalizeName(it?.orgNm ?? it?.orgName ?? "");
  const slug = (code && WORK_CENTER_SLUGS[code]) || (name && NAME_TO_WORK_SLUG[name]);
  if (slug) return `https://www.work.go.kr/${slug}/main.do`;
  return "https://www.work.go.kr/empCtrMain/empCtrMain.do"; // 안전 폴백
}

// ─────────────────────────────────────────────────────────────
// 4) 타입들
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
// 5) 유틸
// ─────────────────────────────────────────────────────────────
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
function norm(v?: any) {
  return (v ?? "").toString().replace(/\s+/g, " ").trim();
}
function programKey(x: any) {
  const id = norm(x.pgmId);
  if (id) return `id:${id}`;
  const org = norm(x.orgNm ?? x.orgName);
  const name = norm(x.pgmNm ?? x.title ?? x.name);
  const sub = norm(x.pgmSubNm);
  const sdt = norm(x.pgmStdt ?? x.startDate ?? x.sdt);
  const edt = norm(x.pgmEddt ?? x.pgmEndt ?? x.endDate ?? x.edt);
  const open = norm(x.openTime);
  const dur = norm(x.operationTime);
  const place = norm(x.openPlcCont);
  return [org, name, sub, sdt, edt, open, dur, place].join("|");
}

// 좋아요(저장) 버튼 (상단 우측 원형 하트)
function Heart({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={active ? "저장 취소" : "저장"}
      onClick={onClick}
      className={`emp__fav ${active ? "is-active" : ""}`}
      title={active ? "저장 취소" : "저장"}
    >
        <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={active ? "#ef4444" : "none"}
    stroke={active ? "#ef4444" : "#64748b"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 
             5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 
             5.5 0 0 0 0-7.78z"></path>
  </svg>

    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 6) 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export default function EmpPrograms() {
  const [date, setDate] = useState<string>(toYmdInput(new Date()));
  const [regionKey, setRegionKey] = useState<string>(REGIONS[0].key);
  const region = REGIONS.find((r) => r.key === regionKey)!;
  const [orgCd, setOrgCd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resp, setResp] = useState<EmpProgramResponse | null>(null);
  const items: EmpProgram[] = useMemo(
    () => (resp?.items ?? resp?.list ?? resp?.data ?? (resp as any)?.programs ?? []) as EmpProgram[],
    [resp]
  );

  const [savedMap, setSavedMap] = useState<Record<string, number>>({});
  const [blogOpenKey, setBlogOpenKey] = useState<string | null>(null);
  const [blogMap, setBlogMap] = useState<Record<string, NaverBlogItem[]>>({});
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState("");

  useEffect(() => {
    setOrgCd("");
  }, [regionKey]);

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
    setBlogMap({});
    setBlogOpenKey(null);
    setTimeout(() => fetchPrograms(1), 0);
  };

  useEffect(() => {
    fetchPrograms(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const canPrev = page > 1;
  const canNext = items.length === size;

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

  function buildBlogQuery(it: EmpProgram) {
    const title = firstNonEmpty(it, ["pgmNm", "title", "name"], "");
    const org = firstNonEmpty(it, ["orgNm", "orgName", "orgCd"], "");
    const q = [title, org].filter(Boolean).join(" ");
    return q.replace(/\s+/g, " ").trim();
  }
  const API_BASE = "https://youthjob.site";

  async function fetchBlogReviews(it: EmpProgram, key: string) {
    try {
      setBlogLoading(true);
      setBlogError("");
      const q = buildBlogQuery(it);
      const res = await fetch(
        `${API_BASE}/api/v1/naver/blogs?q=${encodeURIComponent(q)}&display=5&sort=sim`,
        { headers: { ...getAuthHeader() } }
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

  // ─────────────────────────────────────────────────────────────
  // 카드형 Row (스크린샷 레이아웃)
  // ─────────────────────────────────────────────────────────────
  function Row({ it, rowKey }: { it: EmpProgram; rowKey: string }) {
    const title = firstNonEmpty(it, ["pgmNm", "title", "name"]);
    const org = firstNonEmpty(it, ["orgNm", "orgName", "orgCd"]);
    const topOrg = firstNonEmpty(it, ["topOrgNm", "topOrgCd"]);
    const sdt = firstNonEmpty(it, ["pgmStdt", "startDate", "sdt"], "");
    const edt = firstNonEmpty(it, ["pgmEddt", "pgmEndt", "endDate", "edt"], "");
    const sub = firstNonEmpty(it, ["pgmSubNm"], "");
    const time = firstNonEmpty(it, ["openTime"], "");
    const dur = firstNonEmpty(it, ["operationTime"], "");
    const place = firstNonEmpty(it, ["openPlcCont"], "");

    const cacheKey = programKey(it);
    const active = !!savedMap[cacheKey];
    const isOpen = blogOpenKey === rowKey;
    const reviews = blogMap[cacheKey] ?? [];

    const centerUrl = getCenterUrlFromItem(it);

    const onClickBlogs = async () => {
      if (isOpen) {
        setBlogOpenKey(null);
        return;
      }
      setBlogOpenKey(rowKey);
      if (!blogMap[cacheKey]) {
        await fetchBlogReviews(it, cacheKey);
      }
    };

    return (
      <li className="emp__card">
        {/* 우상단 하트 */}
        <Heart active={active} onClick={() => onToggleSave(it)} />

        {/* 본문 */}
        <div className="emp__card-main">
          <div className="emp__card-head">
            <h3 className="emp__card-title">{title}</h3>
            <span className="emp__card-sub">{org}</span>
          </div>

          {sub && <p className="emp__card-desc">{sub}</p>}

          <div className="emp__meta-row">
            {(sdt || edt) && (
              <div className="emp__meta">
                <span>
                  {sdt}
                  {edt ? ` ~ ${edt}` : ""}
                </span>
              </div>
            )}
            {(time || dur) && (
              <div className="emp__meta">
                <span>
                  {time}
                  {dur ? ` (${dur}시간)` : ""}
                </span>
              </div>
            )}
            {place && (
              <div className="emp__meta">
                <span>장소: {place}</span>
              </div>
            )}
            {topOrg && topOrg !== "-" && (
              <div className="emp__meta">
                <span>{topOrg}</span>
              </div>
            )}
          </div>

    {/* 하단 버튼 */}
          <div className="emp__card-actions">
            <button className="hrd__link" onClick={onClickBlogs} aria-expanded={isOpen}>
              블로그후기
            </button>

            {centerUrl && (
              <a
                className="hrd__link btn--primary"
                href={centerUrl}
                target="_blank"
                rel="noreferrer"
              >
                센터홈
              </a>
            )}
          </div>
      </div>

        {/* 블로그 후기 패널 */}
        <div
          id={`reviews-${rowKey}`}
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
                {b.bloggername} · {b.postdate.slice(0, 4)}-{b.postdate.slice(4, 6)}-
                {b.postdate.slice(6, 8)}
              </div>
            </div>
          ))}
        </div>
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
  <div className="hrd__empty">
    검색 결과가 없습니다.
    <div className="hrd__empty-hint">
      시작일을 휴일(공휴일)로 설정할 경우 검색결과가 없을 수 있습니다.
    </div>
  </div>
)}

            {items.length > 0 && (
              <ul className="hrd__list">
                {items.map((it, idx) => {
                  const rowKey = `${programKey(it)}__p${page}__i${idx}`;
                  return <Row key={rowKey} it={it} rowKey={rowKey} />;
                })}
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
