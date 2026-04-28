// API 호출 래퍼: 성공 시 데이터, 실패 시 에러 상태 반환
export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; isTokenError: boolean };

export async function safeFetch<T>(
  fn: () => Promise<T>
): Promise<FetchResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTokenError =
      msg === "TOKEN_EXPIRED" || msg === "NO_TOKEN" || msg.includes("401");
    return { ok: false, error: msg, isTokenError };
  }
}

// 여러 API를 동시 호출하고 하나라도 토큰 에러면 감지
export async function safeParallel<T extends readonly unknown[]>(
  ...fns: { [K in keyof T]: () => Promise<T[K]> }
): Promise<
  | { ok: true; results: T }
  | { ok: false; error: string; isTokenError: boolean }
> {
  const results = await Promise.allSettled(fns.map((fn) => fn()));

  const tokenError = results.find(
    (r) =>
      r.status === "rejected" &&
      (r.reason?.message === "TOKEN_EXPIRED" ||
        r.reason?.message === "NO_TOKEN")
  );

  if (tokenError) {
    return { ok: false, error: "TOKEN_EXPIRED", isTokenError: true };
  }

  const values = results.map((r) =>
    r.status === "fulfilled" ? r.value : { rows: [] }
  ) as unknown as T;

  return { ok: true, results: values };
}
