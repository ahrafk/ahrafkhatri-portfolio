import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks with a retry hint", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect([1, 2, 3].map((i) => limiter.check("ip", i * 1000).ok)).toEqual([true, true, true]);
    const blocked = limiter.check("ip", 4000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(57);
  });

  it("frees capacity once the window has passed", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("ip", 0).ok).toBe(true);
    expect(limiter.check("ip", 500).ok).toBe(false);
    expect(limiter.check("ip", 1001).ok).toBe(true);
  });

  it("tracks keys independently and reports remaining capacity", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(limiter.check("a", 0).remaining).toBe(1);
    expect(limiter.check("a", 1).remaining).toBe(0);
    expect(limiter.check("b", 2).ok).toBe(true);
  });
});
