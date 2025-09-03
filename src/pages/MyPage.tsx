import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./mypage.css";

/** ===== 타입 ===== */
type ProfileDto = {
  displayName: string;
  email: string;
  joinedAt: string; // ISO
  name?: string;
};
type CountersDto = { savedEmpPrograms: number; savedCourses: number; savedPolicies: number };
type MyPageSummaryDto = { profile: ProfileDto; counters: CountersDto };

type PageResult<T> = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: T[];
};

type SavedEmpProgramDto = {
  id: number;
  orgNm: string;
  pgmNm: string;
  pgmSubNm?: string;
  pgmTarget?: string;
  pgmStdt?: string;  // YYYYMMDD
  pgmEndt?: string;  // YYYYMMDD
  openTimeClcd?: string;
  openTime?: string;
  operationTime?: string;
  openPlcCont?: string;
  createdAt?: string;
};
type SavedCourseDto = {
  id: number;
  trprId?: string; trprDegr?: string;
  title: string; subTitle?: string;
  address?: string; telNo?: string;
  traStartDate?: string; traEndDate?: string;
  trainTarget?: string; trainTargetCd?: string;
  ncsCd?: string; courseMan?: string; realMan?: string; yardMan?: string;
  titleLink?: string; subTitleLink?: string;
  createdAt?: string;
};
type SavedPolicyDto = {
  id: number;
  plcyNo?: string;
  plcyNm: string;
  plcyKywdNm?: string;
  lclsfNm?: string;
  mclsfNm?: string;
  aplyYmd?: string;
  aplyUrlAddr?: string;
  sprvsnInstCdNm?: string;
  operInstCdNm?: string;
};

/** ===== 유틸 ===== */
function fmtYmd(ymd?: string) {
  if (!ymd) return "-";
  if (ymd.includes("-") || ymd.includes(".")) return ymd;
  return ymd.length === 8 ? `${ymd.slice(0,4)}.${ymd.slice(4,6)}.${ymd.slice(6,8)}` : ymd;
}
function authHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  return raw ? { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` } : {};
}

/** ===== 공용 하트(저장 취소) ===== */
function Heart({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      className="hrd__link"
      aria-label={active ? "저장 취소" : "저장"}
      title={active ? "저장 취소" : "저장"}
      onClick={onClick}
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        borderColor: active ? "#ef4444" : undefined,
        color: active ? "#ef4444" : undefined,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#ef4444" : "none"} stroke={active ? "#ef4444" : "#64748b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {active ? "저장됨" : "저장"}
    </button>
  );
}

type TabKey = "emp" | "courses" | "policies";
const API = "https://youthjob.site";

/** ===== 이름 수정 인라인 컴포넌트 (이름 오른쪽에 표시) ===== */
function NameEditor({
  current,
  onSaved,
}: {
  current?: string;
  onSaved: (newProfile: ProfileDto) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setName(current ?? "");
  }, [current]);

  const disabled = saving || name.trim().length === 0 || name.trim() === (current ?? "").trim();

  const save = async () => {
    const v = name.trim();
    if (v.length < 1 || v.length > 30) {
      setMsg("이름은 1~30자로 입력해 주세요.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/api/v1/mypage/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ name: v }),
      });
      if (res.status === 401) { setMsg("로그인이 필요합니다."); return; }
      if (!res.ok) { setMsg(`수정 실패 (${res.status})`); return; }
      const updated: ProfileDto = await res.json();
      onSaved(updated);
      setEditing(false);
    } catch {
      setMsg("네트워크 오류로 실패했습니다.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 1500);
    }
  };

  if (!editing) {
    return (
      <button className="yj-btn" onClick={() => setEditing(true)}>이름 변경</button>
    );
  }

  return (
    <div className="name-inline-editor">
      <input
        className="mypage-nameedit__input"
        value={name}
        maxLength={30}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) save();
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder="이름(1~30자)"
        autoFocus
      />
      <button className="yj-btn" onClick={save} disabled={disabled}>
        {saving ? "저장중…" : "저장"}
      </button>
      <button className="yj-btn ghost" onClick={() => setEditing(false)} disabled={saving}>
        취소
      </button>
      {msg && <div className="mypage-nameedit__msg">{msg}</div>}
    </div>
  );
}

/** ===== 페이지 ===== */
export default function MyPage() {
  const [summary, setSummary] = useState<MyPageSummaryDto | null>(null);

  const [tab, setTab] = useState<TabKey>("courses"); // 스샷처럼 기본 "저장한 과정"
  const [empPage, setEmpPage] = useState(0);
  const [coursePage, setCoursePage] = useState(0);
  const [policyPage, setPolicyPage] = useState(0);
  const PAGE_SIZE = 10;

  const [emp, setEmp] = useState<PageResult<SavedEmpProgramDto> | null>(null);
  const [courses, setCourses] = useState<PageResult<SavedCourseDto> | null>(null);
  const [policies, setPolicies] = useState<PageResult<SavedPolicyDto> | null>(null);

  async function fetchWithAuth<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url, { headers: authHeader() });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`API error ${res.status}`);
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchWithAuth<MyPageSummaryDto>(`${API}/api/v1/mypage/summary`).then((d) => d && setSummary(d));
  }, []);

  useEffect(() => {
    if (tab === "emp") {
      fetchWithAuth<PageResult<SavedEmpProgramDto>>(
        `${API}/api/v1/mypage/saved-emp-programs?page=${empPage}&size=${PAGE_SIZE}`
      ).then((d) => d && setEmp(d));
    } else if (tab === "courses") {
      fetchWithAuth<PageResult<SavedCourseDto>>(
        `${API}/api/v1/mypage/saved-courses?page=${coursePage}&size=${PAGE_SIZE}`
      ).then((d) => d && setCourses(d));
    } else {
      fetchWithAuth<PageResult<SavedPolicyDto>>(
        `${API}/api/v1/mypage/saved-policies?page=${policyPage}&size=${PAGE_SIZE}`
      ).then((d) => d && setPolicies(d));
    }
  }, [tab, empPage, coursePage, policyPage]);

  async function removeEmp(id: number) {
    const res = await fetch(`${API}/api/v1/emp-programs/saved/${id}`, { method: "DELETE", headers: authHeader() });
    if (!res.ok) return alert("삭제 실패");
    setEmp((p) => (p ? { ...p, items: p.items.filter((i) => i.id !== id), totalElements: p.totalElements - 1 } : p));
    setSummary((s) => s ? { ...s, counters: { ...s.counters, savedEmpPrograms: Math.max(0, s.counters.savedEmpPrograms - 1) } } : s);
  }
  async function removeCourse(id: number) {
    const res = await fetch(`${API}/api/v1/hrd/saved/${id}`, { method: "DELETE", headers: authHeader() });
    if (!res.ok) return alert("삭제 실패");
    setCourses((p) => (p ? { ...p, items: p.items.filter((i) => i.id !== id), totalElements: p.totalElements - 1 } : p));
    setSummary((s) => s ? { ...s, counters: { ...s.counters, savedCourses: Math.max(0, s.counters.savedCourses - 1) } } : s);
  }
  async function removePolicy(id: number) {
    const res = await fetch(`${API}/api/v1/youth-policies/saved/${id}`, { method: "DELETE", headers: authHeader() });
    if (!res.ok) return alert("삭제 실패");
    setPolicies((p) => (p ? { ...p, items: p.items.filter((i) => i.id !== id), totalElements: p.totalElements - 1 } : p));
    setSummary((s) => s ? { ...s, counters: { ...s.counters, savedPolicies: Math.max(0, s.counters.savedPolicies - 1) } } : s);
  }

  function Tabs() {
    return (
      <div className="mypage-tabs">
        <button className={tab === "emp" ? "is-active" : ""} onClick={() => setTab("emp")}>저장한 교육</button>
        <button className={tab === "courses" ? "is-active" : ""} onClick={() => setTab("courses")}>저장한 과정</button>
        <button className={tab === "policies" ? "is-active" : ""} onClick={() => setTab("policies")}>저장한 정책</button>
      </div>
    );
  }

  function Pager({
    page, totalPages, onPrev, onNext,
  }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
    return (
      <div className="hrd__pagenav" style={{ marginTop: 8 }}>
        <button disabled={page <= 0} onClick={onPrev}>이전</button>
        <span className="hrd__page">{page + 1} / {Math.max(1, totalPages || 1)}</span>
        <button disabled={page + 1 >= (totalPages || 1)} onClick={onNext}>다음</button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="yj-main">
        <div className="mypage">
          {/* 프로필 카드 */}
          {summary && (
            <section className="mypage-summary">
              {/* 왼쪽: 아바타 + 텍스트 블록 */}
              <div className="mypage-left">
                <div className="mypage-avatar">
                  <img src="/assets/profile.png" alt="프로필" />
                </div>

                <div className="mypage-left-text">
                  <div className="name-row">
                    <h2 className="mypage-name">
                      {summary.profile.name || summary.profile.displayName}
                    </h2>
                    {/* 이름 수정 버튼/폼이 이름 오른쪽에 */}
                    <NameEditor
                      current={summary.profile.name ?? ""}
                      onSaved={(newProfile) =>
                        setSummary((s) => (s ? { ...s, profile: newProfile } : s))
                      }
                    />
                  </div>

                  <p className="mypage-email">{summary.profile.email}</p>
                  <p className="mypage-joined">가입일 {summary.profile.joinedAt?.slice(0, 10) ?? "-"}</p>
                </div>
              </div>

              {/* 오른쪽: 카운터 */}
              <div className="mypage-counters">
                <span>저장한 교육 {summary.counters.savedEmpPrograms}</span>
                <span>저장한 과정 {summary.counters.savedCourses}</span>
                <span>저장한 정책 {summary.counters.savedPolicies}</span>
              </div>
            </section>
          )}

          <Tabs />

          {/* 탭 내용 */}
          {tab === "emp" && (
            <section>
              <ul className="mypage-list">
                {(emp?.items ?? []).map((p) => (
                  <li key={p.id} className="mypage-row">
                    <div className="mypage-row__main">
                      <strong>{p.pgmNm}</strong>{p.pgmSubNm ? <> — {p.pgmSubNm}</> : null}<br/>
                      {p.orgNm}<br/>{fmtYmd(p.pgmStdt)} ~ {fmtYmd(p.pgmEndt)}
                    </div>
                    <div className="mypage-row__side">
                      <Heart active={true} onClick={() => removeEmp(p.id)} />
                    </div>
                  </li>
                ))}
                {(emp?.items?.length ?? 0) === 0 && <li>저장된 교육이 없습니다.</li>}
              </ul>
              <Pager
                page={empPage}
                totalPages={emp?.totalPages ?? 1}
                onPrev={() => setEmpPage((p) => Math.max(0, p - 1))}
                onNext={() => setEmpPage((p) => (emp && p + 1 < (emp.totalPages ?? 1) ? p + 1 : p))}
              />
            </section>
          )}

          {tab === "courses" && (
            <section>
              <ul className="mypage-list">
                {(courses?.items ?? []).map((c) => (
                  <li key={c.id} className="mypage-row">
                    <div className="mypage-row__main">
                      <strong>{c.title}</strong>{c.subTitle ? <> — {c.subTitle}</> : null}<br/>
                      {c.traStartDate ?? "-"} ~ {c.traEndDate ?? "-"}
                    </div>
                    <div className="mypage-row__side">
                      <Heart active={true} onClick={() => removeCourse(c.id)} />
                    </div>
                  </li>
                ))}
                {(courses?.items?.length ?? 0) === 0 && <li>저장된 과정이 없습니다.</li>}
              </ul>
              <Pager
                page={coursePage}
                totalPages={courses?.totalPages ?? 1}
                onPrev={() => setCoursePage((p) => Math.max(0, p - 1))}
                onNext={() => setCoursePage((p) => (courses && p + 1 < (courses.totalPages ?? 1) ? p + 1 : p))}
              />
            </section>
          )}

          {tab === "policies" && (
            <section>
              <ul className="mypage-list">
                {(policies?.items ?? []).map((p) => (
                  <li key={p.id} className="mypage-row">
                    <div className="mypage-row__main">
                      <strong>{p.plcyNm}</strong>
                      {p.operInstCdNm ? <> — {p.operInstCdNm}</> : null}
                      {p.aplyUrlAddr && <> · <a href={p.aplyUrlAddr} target="_blank" rel="noreferrer">신청 바로가기</a></>}
                    </div>
                    <div className="mypage-row__side">
                      <Heart active={true} onClick={() => removePolicy(p.id)} />
                    </div>
                  </li>
                ))}
                {(policies?.items?.length ?? 0) === 0 && <li>저장된 정책이 없습니다.</li>}
              </ul>
              <Pager
                page={policyPage}
                totalPages={policies?.totalPages ?? 1}
                onPrev={() => setPolicyPage((p) => Math.max(0, p - 1))}
                onNext={() => setPolicyPage((p) => (policies && p + 1 < (policies.totalPages ?? 1) ? p + 1 : p))}
              />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
