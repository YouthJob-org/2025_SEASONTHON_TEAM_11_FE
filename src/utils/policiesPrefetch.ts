// src/utils/policiesPrefetch.ts
// 전체 4096개를 '모조리' 백그라운드로 로드해서 세션 캐시에 저장.
// YouthPolicy.tsx에서 getCachedPolicies()로 즉시 표기.

export type Policy = {
  plcyNo: string;
  plcyNm: string;
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

type Pagging = { totCount: number; pageNum: number; pageSize: number; };
type ListApiPayload =
  | { resultCode: number; resultMessage: string; result: { pagging?: Pagging; youthPolicyList?: Policy[] } }
  | { resultCode: number; resultMessage: string; result: Policy[] };

const CACHE_KEY = "YPOLICY_CACHE_V1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12시간

function getAuthHeader(): HeadersInit {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  return { Authorization: raw.startsWith("Bearer ") ? raw : `Bearer ${raw}` };
}

type CacheShape = { at: number; items: Policy[] };

export function getCachedPolicies(): Policy[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed?.items?.length) return null;
    // TTL 체크
    if (Date.now() - (parsed.at || 0) > CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function saveCache(items: Policy[]) {
  try {
    const data: CacheShape = { at: Date.now(), items };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // 용량 초과 등은 무시
  }
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const yieldToBrowser = () =>
  new Promise<void>(res => {
    (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(() => res())
      : setTimeout(() => res(), 0);
  });

/** 4,096 모두 수집(페이지 루프) */
export async function prefetchPoliciesAllSilent(signal?: AbortSignal) {
  // 이미 캐시가 신선하면 Skip
  const cached = getCachedPolicies();
  if (cached?.length) return;

  const pageSize = 500; // 백엔드 기본이 500 → 그대로 사용
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  const acc: Policy[] = [];

  while (!signal?.aborted) {
    // 브라우저 숨 쉬게
    await yieldToBrowser();

    const qs = new URLSearchParams({
      pageType: "1",
      rtnType: "json",
      pageNum: String(page),
      pageSize: String(pageSize),
    });

    const res = await fetch(`https://youthjob.site/api/v1/youth-policies?${qs.toString()}`, {
      headers: { ...getAuthHeader() },
      signal,
    });

    if (!res.ok) break;

    const data = (await res.json()) as ListApiPayload;

    let chunk: Policy[] = [];
    if (Array.isArray((data as any)?.result)) {
      // 배열 그대로인 백엔드 대응
      chunk = (data as any).result as Policy[];
      // 전체 개수는 모를 수 있으니 계속 루프, chunk가 모자라면 종료
      if (chunk.length < pageSize) {
        acc.push(...chunk);
        saveCache(acc);
        break;
      }
    } else {
      const obj = (data as any)?.result as { pagging?: Pagging; youthPolicyList?: Policy[] };
      chunk = obj?.youthPolicyList ?? [];
      // 첫 페이지면 총량 파악
      if (page === 1 && obj?.pagging?.totCount) total = obj.pagging.totCount;
      acc.push(...chunk);
      saveCache(acc);
      if (acc.length >= total || chunk.length < pageSize) break;
    }

    page += 1;
    // 서버 보호용 살짝 딜레이
    await sleep(120);
  }
}

/** 취소 가능한 스타터 (App에서 호출) */
export function startPoliciesPrefetch() {
  const ctrl = new AbortController();
  prefetchPoliciesAllSilent(ctrl.signal);
  return () => ctrl.abort();
}
