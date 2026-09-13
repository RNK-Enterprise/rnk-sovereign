import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { createRateLimiter, clientIp } from "./rate-limit.ts";

// Subscribers live in one JSONL file next to the repo (gitignored). One JSON
// object per line — easy to append, easy to import into a real mail tool later.
const dataDir = process.env.RNK_DATA_DIR || "/home/rnk/rnk-data";
const listFile = join(dataDir, "podcast-signups.jsonl");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readJsonBody(req: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > 2000) {
        reject(new Error("too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("bad json"));
      }
    });
    req.on("error", reject);
  });
}

function json(res: ServerResponse, code: number, obj: unknown) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function alreadySubscribed(email: string) {
  if (!existsSync(listFile)) return false;
  try {
    const text = readFileSync(listFile, "utf8");
    const needle = `"email":"${email.toLowerCase().replace(/"/g, "")}"`;
    return text.includes(needle);
  } catch {
    return false;
  }
}

// 5 signups per 10 minutes per client; the shared limiter self-cleans.
const limiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

export function signupMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url?.split("?")[0];
  if (url !== "/api/signup") {
    next();
    return;
  }
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "method" });
    return;
  }

  const ip = clientIp(req);
  if (limiter.tooMany(ip)) {
    json(res, 429, { ok: false, error: "slow down" });
    return;
  }

  readJsonBody(req)
    .then((body) => {
      const email = String(body.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email.length > 254) {
        json(res, 400, { ok: false, error: "That email does not look right." });
        return;
      }
      if (alreadySubscribed(email)) {
        // Idempotent: treat as success so the UI can say "you're on the list".
        json(res, 200, { ok: true, duplicate: true });
        return;
      }
      const record = {
        email,
        source: String(body.source || "podcast"),
        at: new Date().toISOString(),
        ip,
      };
      appendFileSync(listFile, JSON.stringify(record) + "\n", { mode: 0o600 });
      json(res, 200, { ok: true });
    })
    .catch(() => json(res, 400, { ok: false, error: "bad request" }));
}
