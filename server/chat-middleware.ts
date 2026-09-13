import type { IncomingMessage, ServerResponse } from "node:http";
import { deliverChat, deliverOrder } from "./notify.ts";
import { createRateLimiter, clientIp } from "./rate-limit.ts";

// 8 chats per 10 minutes per client; the shared limiter self-cleans.
const limiter = createRateLimiter({ max: 8, windowMs: 10 * 60 * 1000 });

function readBody(req: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > 8000) {
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

export async function chatMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url?.split("?")[0];
  if (url !== "/api/chat" && url !== "/api/order") {
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

  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch {
    json(res, 400, { ok: false, error: "bad request" });
    return;
  }

  try {
    if (url === "/api/order") {
      const lines = Array.isArray(body.lines) ? body.lines : [];
      if (!lines.length) {
        json(res, 400, { ok: false, error: "empty cart" });
        return;
      }
      const result = await deliverOrder({
        name: String(body.name || ""),
        email: String(body.email || ""),
        foundry: String(body.foundry || ""),
        notes: String(body.notes || ""),
        lines,
        total: Number(body.total) || 0,
      });
      json(res, 200, { ok: true, queued: result.queued });
      return;
    }

    const text = String(body.text || "").trim();
    if (text.length < 2) {
      json(res, 400, { ok: false, error: "empty" });
      return;
    }
    const result = await deliverChat({
      name: String(body.name || ""),
      email: String(body.email || ""),
      text,
    });
    json(res, 200, { ok: true, queued: result.queued });
  } catch {
    json(res, 500, { ok: false, error: "undelivered" });
  }
}
