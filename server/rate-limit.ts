import type { IncomingMessage } from "node:http";

// Fixed-window per-IP rate limiter shared by the chat and signup
// middlewares. The hits map self-cleans: a lazy sweep — run at most once
// per sweep interval, triggered by traffic — drops expired timestamps and
// deletes keys left empty, so abandoned IPs can't pile up forever. With
// the defaults the map never outlives one window beyond the last sweep,
// instead of growing for the life of the process.
//
// No setInterval: the sweep rides on incoming requests, so there is no
// timer to keep the event loop (or the tests) alive.

export type RateLimiterOptions = {
  /** hits allowed per window */
  max: number;
  /** fixed window length in ms */
  windowMs: number;
  /** how often the lazy sweep runs; defaults to windowMs */
  sweepMs?: number;
  /** injectable clock for tests */
  now?: () => number;
};

export type RateLimiter = {
  /** record a hit for ip; true when ip is over the limit */
  tooMany(ip: string): boolean;
  /** number of tracked keys (test/observability) */
  size(): number;
  /** force a sweep now (test/observability) */
  sweepNow(): void;
};

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { max, windowMs } = options;
  const sweepMs = options.sweepMs ?? windowMs;
  const now = options.now ?? Date.now;
  const hits = new Map<string, number[]>();
  let nextSweepAt = now() + sweepMs;

  function sweep(t: number) {
    for (const [ip, list] of hits) {
      const live = list.filter((ts) => t - ts < windowMs);
      if (live.length === 0) hits.delete(ip);
      else if (live.length !== list.length) hits.set(ip, live);
    }
    nextSweepAt = t + sweepMs;
  }

  function tooMany(ip: string): boolean {
    const t = now();
    if (t >= nextSweepAt) sweep(t);
    const list = (hits.get(ip) || []).filter((ts) => t - ts < windowMs);
    if (list.length >= max) {
      hits.set(ip, list); // keep the pruned list so the window stays honest
      return true;
    }
    list.push(t);
    hits.set(ip, list);
    return false;
  }

  return {
    tooMany,
    size: () => hits.size,
    sweepNow: () => sweep(now()),
  };
}

// Client identity for the limiters. Only honor x-forwarded-for when the
// socket itself is the loopback edge (cloudflared tunnel, local reverse
// proxy) — a direct client could otherwise mint a fresh bucket per request
// by sending its own XFF header. Expressed "trust proxy" for these raw
// (req, res) middlewares, matching app.set("trust proxy", true).
export function clientIp(req: IncomingMessage): string {
  const remote = req.socket?.remoteAddress || "unknown";
  if (
    remote === "127.0.0.1" ||
    remote === "::1" ||
    remote === "::ffff:127.0.0.1"
  ) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0].trim();
    }
  }
  return remote;
}
