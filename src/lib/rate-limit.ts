type Options = { limit: number; windowMs: number };
type Result = { ok: boolean; remaining: number; retryAfterSeconds: number };

/** In-memory sliding window. Best effort per server instance; use a shared store if the site is scaled out. */
export function createRateLimiter({ limit, windowMs }: Options) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(key);
    }
  }

  return {
    check(key: string, now = Date.now()): Result {
      if (hits.size > 1000) prune(now);
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
