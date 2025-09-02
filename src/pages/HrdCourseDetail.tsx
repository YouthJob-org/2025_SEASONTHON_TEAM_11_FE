// src/pages/HrdCourseDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./hrd-detail.css";
import KakaoMap from "../components/KakaoMap";


// ▼ 추가: 네이버 블로그 응답 타입
type NaverBlogItem = {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string; // yyyymmdd
};
type NaverBlogResp = { items: NaverBlogItem[] };

// 공통
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
const METHOD: Record<string, string> = {
  M1001: "오프라인(집체)",
  M1002: "혼합(온·오프라인)",
  M1003: "온라인(원격)",
};
// 코드값 → 라벨 변환
const RATE_CODE_LABEL: Record<string, string> = {
  A: "개설예정",
  B: "진행중",
  C: "미실시",
  D: "수료자 없음",
};
function formatRate(v?: string | null): string {
  if (v == null) return "-";
  const s = String(v).trim();
  if (RATE_CODE_LABEL[s]) return RATE_CODE_LABEL[s];
  const n = Number(s);
  if (!Number.isNaN(n)) return `${n}%`;
  return s;
}

// API 타입
type Detail = {
  trprId: string;
  trprDegr: string;
  trprNm: string;
  ncsCd?: string;
  ncsNm?: string;
  traingMthCd?: string;
  trtm?: string;
  trDcnt?: string;
  perTrco?: string;
  instPerTrco?: string;
  inoNm?: string;
  addr1?: string;
  addr2?: string;
  zipCd?: string;
  hpAddr?: string;
  trprChap?: string;
  trprChapTel?: string;
  trprChapEmail?: string;
  torgParGrad?: string;   // 평가등급
  filePath?: string;      // 썸네일/로고 파일 URL
  pFileName?: string;     // 파일명
};
type Stat = {
  trStaDt?: string;
  trEndDt?: string;
  totFxnum?: string;
  totParMks?: string;
  totTrpCnt?: string;
  finiCnt?: string;
  totTrco?: string;
  hrdEmplRate6?: string;
  eiEmplRate6?: string;
};
type FullResp = { detail: Detail; stats: Stat[] };

export default function HrdCourseDetail() {
  const { trprId = "", trprDegr = "" } = useParams();
  const [sp] = useSearchParams();
  const torgId = sp.get("torgId") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState<FullResp | null>(null);

  const stat = useMemo<Stat | undefined>(() => data?.stats?.[0], [data]);


  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState("");
  const [blogs, setBlogs] = useState<NaverBlogItem[]>([]);
  const API_BASE = "https://youthjob.site";
  useEffect(() => {
    if (!trprId || !trprDegr || !torgId) {
      setErr("잘못된 접근입니다.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(
          `https://youthjob.site/api/v1/hrd/courses/${encodeURIComponent(trprId)}/${encodeURIComponent(
            trprDegr
          )}/full?torgId=${encodeURIComponent(torgId)}`,
          { headers: { ...getAuthHeader() } }
        );
        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("상세 정보를 불러오지 못했습니다.");
        const json: FullResp = await res.json();
        setData(json);
      } catch (e: any) {
        setErr(e?.message ?? "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [trprId, trprDegr, torgId, navigate]);
useEffect(() => {
  const org = data?.detail?.inoNm?.trim();
  const title = data?.detail?.trprNm?.trim();
  if (!org) { setBlogs([]); return; } // 기관명 없으면 종료

  const q = `${org} ${title ?? ""}`.trim();
  let aborted = false;

  (async () => {
    try {
      setBlogLoading(true);
      setBlogError("");
      const res = await fetch(
        `${API_BASE}/api/v1/naver/blogs?q=${encodeURIComponent(q)}&display=5&sort=sim`,
        { headers: { ...getAuthHeader() } }
      );
      if (!res.ok) throw new Error("블로그 후기를 불러오지 못했습니다.");
      const json: NaverBlogResp = await res.json();
      if (!aborted) setBlogs(json.items || []);
    } catch (e:any) {
      if (!aborted) setBlogError(e?.message ?? "블로그 검색 오류");
    } finally {
      if (!aborted) setBlogLoading(false);
    }
  })();

  return () => { aborted = true; };
}, [data?.detail?.inoNm, data?.detail?.trprNm]);
  const d = data?.detail;
  const period =
    stat?.trStaDt && stat?.trEndDt ? `${stat.trStaDt} ~ ${stat.trEndDt}` : "-";
  const method = d?.traingMthCd ? METHOD[d.traingMthCd] ?? d.traingMthCd : "-";

  // 외부 지도 링크(선택)
  const mapUrl = d?.addr1
    ? `https://map.kakao.com/?q=${encodeURIComponent(d.addr1)}`
    : undefined;
    const [logoOk, setLogoOk] = useState(true);
    const thumbUrl = d?.filePath ? d.filePath.replace(/^http:/, "https:") : undefined;
  return (
    <>
      <Navbar />
      <main className="hrd-detail">
        <div className="hd__container">
          {loading && <div className="hd__loading">불러오는 중…</div>}
          {err && <div className="hd__error">{err}</div>}

          {!loading && !err && d && (
            <>
              {/* 헤더 */}
              <section className="hd__header">
                <div className="hd__logo" style={{ width:64, height:64, borderRadius:12, overflow:"hidden",
                        display:"flex", alignItems:"center", justifyContent:"center", background:"#eef2f7" }}>
                        {thumbUrl && logoOk ? (
                          <img
                            src={thumbUrl}
                            alt={d.pFileName || d.inoNm || d.trprNm}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => setLogoOk(false)}   // ✅ 이미지 못 받으면 폴백
                            style={{ width:"100%", height:"100%", objectFit:"cover" }}
                          />
                        ) : (
                          "LOGO"
                        )}
                      </div>
                <div className="hd__titlewrap">
                  <h1 className="hd__title">{d.trprNm}</h1>
                  <div className="hd__chips">
                    <span className="hd__chip">국비</span>
                    <span className="hd__chip">NCS {d.ncsNm ?? d.ncsCd ?? "-"}</span>
                    {d.torgParGrad && (
                      <span className="hd__chip">평가등급 {d.torgParGrad}</span>
                    )}
                  </div>
                </div>

                <div className="hd__actions">
                  {d.hpAddr && (
                    <a className="hd__btn ghost" href={d.hpAddr} target="_blank" rel="noreferrer">
                      공식 페이지
                    </a>
                  )}
                  {mapUrl && (
                    <a className="hd__btn ghost" href={mapUrl} target="_blank" rel="noreferrer">
                      지도 보기
                    </a>
                  )}
                </div>
              </section>

              {/* 개요/사이드 */}
              <section className="hd__grid">
                {/* 개요 카드 */}
                <div className="hd__card">
                  <h2 className="hd__cardtitle">{d.trprNm}</h2>
                  <div className="hd__rows">
                    <div className="hd__row">
                      <span className="hd__label">훈련기관</span>
                      <span className="hd__value">{d.inoNm ?? "-"}</span>
                    </div>
                    <div className="hd__row">
                      <span className="hd__label">훈련기간</span>
                      <span className="hd__value">{period}</span>
                    </div>
                    <div className="hd__row">
                      <span className="hd__label">수업형태</span>
                      <span className="hd__value">{method}</span>
                    </div>
                    <div className="hd__row">
                      <span className="hd__label">정원</span>
                      <span className="hd__value">{stat?.totFxnum ?? "-"}</span>
                    </div>
                    <div className="hd__row">
                      <span className="hd__label">총 시간</span>
                      <span className="hd__value">{d?.trtm ?? "-"}시간</span>
                    </div>
                    <div className="hd__row">
                      <span className="hd__label">교육비</span>
                      <span className="hd__value">{toMoney(d?.perTrco ?? stat?.totTrco)}</span>
                    </div>
                    <div className="hd__divider" />
                    {/* --- 훈련기관 블로그 후기 (개요카드 내부, 라벨열에 맞춰 들여쓰기) --- */}
                        <div className="hd__inset">
                          <div className="hd__sectionhead">
                            <h3 className="hd__sectitle">관련 블로그 후기</h3>
                            {data?.detail?.inoNm && (
                              <a
                                className="hd__morelink"
                                href={`https://search.naver.com/search.naver?where=post&sm=tab_jum&query=${encodeURIComponent(
                                  `${data.detail.inoNm} ${data.detail.trprNm ?? ""}`.trim()
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                네이버에서 더보기
                              </a>
                            )}
                          </div>

                          {blogLoading && <div className="hd__muted">불러오는 중…</div>}
                          {blogError && <div className="hd__error">{blogError}</div>}

                          {!blogLoading && !blogError && blogs.length === 0 && (
                            <div className="hd__muted">관련 블로그 후기가 없습니다.</div>
                          )}

                          <ul className="hd__bloglist cardy">
                            {blogs.map((b, i) => (
                              <li key={i} className="hd__blogitem cardy__item">
                                <a
                                  className="hd__blogtitle"
                                  href={b.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  dangerouslySetInnerHTML={{ __html: b.title }}
                                />
                                <div
                                  className="hd__blogdesc"
                                  dangerouslySetInnerHTML={{ __html: b.description }}
                                />
                                <div className="hd__blogmeta">
                                  {b.bloggername} · {b.postdate.slice(0,4)}-{b.postdate.slice(4,6)}-{b.postdate.slice(6,8)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                  </div>
                </div>

                {/* 사이드 카드들 */}
                <div className="hd__side">
                  <div className="hd__card">
                    <h3 className="hd__cardtitle">훈련기관 정보</h3>
                    <div className="hd__rows">
                      {d.torgParGrad && (
                        <div className="hd__row">
                          <span className="hd__label">평가등급</span>
                          <span className="hd__value">{d.torgParGrad}</span>
                        </div>
                      )}
                      <div className="hd__row">
                        <span className="hd__label">문의</span>
                        <span className="hd__value">{d?.trprChapTel ?? "-"}</span>
                      </div>
                      <div className="hd__row">
                        <span className="hd__label">담당자</span>
                        <span className="hd__value">
                          {d?.trprChap ?? "-"} {d?.trprChapEmail ? `(${d.trprChapEmail})` : ""}
                        </span>
                      </div>
                      <div className="hd__row">
                        <span className="hd__label">주소</span>
                        <span className="hd__value">
                          {d?.addr1 ?? "-"} {d?.addr2 ?? ""}
                        </span>
                      </div>
                      {d?.hpAddr && (
                        <div className="hd__row">
                          <span className="hd__label">홈페이지</span>
                          <a className="hd__value link" href={d.hpAddr} target="_blank" rel="noreferrer">
                            {d.hpAddr}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="hd__divider" />
                    
                  </div>

                  <div className="hd__card">
                    <h3 className="hd__cardtitle">지표</h3>
                    <div className="hd__rows">
                      <div className="hd__row">
                        <span className="hd__label">취업률(6개월)</span>
                        <span className="hd__value">
                          {formatRate(stat?.eiEmplRate6 ?? stat?.hrdEmplRate6)}
                        </span>
                      </div>
                      <div className="hd__row">
                        <span className="hd__label">참여자수</span>
                        <span className="hd__value">{stat?.totTrpCnt ?? "-"}</span>
                      </div>
                      <div className="hd__row">
                        <span className="hd__label">수료자수</span>
                        <span className="hd__value">{stat?.finiCnt ?? "-"}</span>
                      </div>
                    </div>
                  </div>

                  {(d?.addr1 || d?.addr2) && (
                    <div className="hd__card">
                      <h3 className="hd__cardtitle">위치</h3>
                      <KakaoMap
                        address={`${d?.addr1 ?? ""} ${d?.addr2 ?? ""}`.trim()}
                        height={280}
                      />
                    </div>
                  )}
                </div>
              </section>
              
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
