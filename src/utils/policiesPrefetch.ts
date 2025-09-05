// src/utils/policiesPrefetch.ts
// 간단 캐시(메모리 + localStorage) + 백그라운드 선로딩

export type Policy = {
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

type Pagging = { totCount: number; pageNum: number; pageSize: number };
type ListApiPayload =
  | { result: { pagging?: Pagging; youthPolicyList?: Policy[] }; [k: string]: any }
  | { result: Policy[]; [k: string]: any };

const LS_KEY = "ypolicies:all:v1";   // 캐시 키(버전)
const LS_TTL_MS = 1000 * 60 * 60 * 6; // 6시간 TTL

let memoryCache: { data: Policy[]; at: number } | null = null;

function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  return { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` };
}

export function getCachedPolicies(): Policy[] | null {
  if (memoryCache && Date.now() - memoryCache.at < LS_TTL_MS) return memoryCache.data;

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Policy[] };
    if (!parsed?.data?.length) return null;
    if (Date.now() - parsed.at > LS_TTL_MS) return null;

    memoryCache = parsed;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCache(data: Policy[]) {
  memoryCache = { data, at: Date.now() };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(memoryCache));
  } catch {
    // 용량 초과 등은 무시
  }
}

// 서버 페이지네이션으로 전체 수집
async function fetchAllPolicies(): Promise<Policy[]> {
  const acc: Policy[] = [];
  let cur = 1;
  const serverPageSize = 500; // 백엔드 최대/기본에 맞춰 크게
  let expectedTotal = Number.POSITIVE_INFINITY;

  const base = new URLSearchParams({ pageType: "1", rtnType: "json" });

  while (acc.length < expectedTotal && cur < 2000) {
    const qs = new URLSearchParams(base);
    qs.set("pageNum", String(cur));
    qs.set("pageSize", String(serverPageSize));

    const res = await fetch(`https://youthjob.site/api/v1/youth-policies?${qs.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("청년정책 조회 실패");

    const json: ListApiPayload = await res.json();
    let chunk: Policy[] = [];
    let pageInfo: Pagging | undefined;

    if (Array.isArray((json as any).result)) {
      chunk = (json as any).result as Policy[];
    } else {
      const r = (json as any).result || {};
      chunk = r.youthPolicyList || [];
      pageInfo = r.pagging;
    }

    if (cur === 1 && pageInfo?.totCount) expectedTotal = pageInfo.totCount;

    acc.push(...chunk);
    if (chunk.length < serverPageSize) break; // 마지막 페이지
    cur += 1;
  }

  return acc;
}

/** 홈에서 한 번 호출(절대 await 하지 말고 “조용히” 실행) */
export async function prefetchPoliciesAllSilent() {
  if (getCachedPolicies()) return; // 캐시 있으면 스킵
  try {
    const all = await fetchAllPolicies();
    if (all?.length) saveCache(all);
  } catch {
    /* 실패는 조용히 무시 → 목록 페이지에서 폴백 호출 */
  }
}
