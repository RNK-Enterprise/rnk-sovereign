import { createReadStream, existsSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { basename, join, normalize, sep } from "node:path";

// Where episode MP3s live. Default ~/rnk-audio (home of the user running the
// server — matches the atlas layout); override with RNK_AUDIO_DIR.
const audioDir =
  process.env.RNK_AUDIO_DIR ||
  join(process.env.HOME || process.cwd(), "rnk-audio");

export function audioMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url?.split("?")[0] || "";
  if (url !== "/audio" && !url.startsWith("/audio/")) {
    next();
    return;
  }

  // In production the static file server in front of us owns /audio — nothing
  // should fall through to the SPA here. We only stream when the dir exists
  // (dev/pre-caddy setups).
  if (!existsSync(audioDir)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("no audio directory");
    return;
  }

  // Resolve inside audioDir only — traversal guard.
  const rel = normalize(decodeURIComponent(url.slice("/audio/".length)));
  const abs = join(audioDir, rel);
  if (!abs.startsWith(audioDir + sep) || basename(abs).startsWith(".")) {
    res.statusCode = 404;
    res.setHeader("Cache-Control", "no-store"); // keep 404s out of edge caches
    res.end();
    return;
  }
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-store"); // episodes appear over time
    res.end("no such episode");
    return;
  }

  const stat = statSync(abs);
  const size = stat.size;
  const type = abs.endsWith(".m4a")
    ? "audio/x-m4a"
    : abs.endsWith(".wav")
      ? "audio/wav"
      : "audio/mpeg";

  res.setHeader("Content-Type", type);
  res.setHeader("Accept-Ranges", "bytes");
  // Published episodes are immutable — cache hard at the edge.
  res.setHeader("Cache-Control", "public, max-age=86400");

  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (m && (m[1] || m[2])) {
      let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
      let end = m[1] && m[2] ? Number(m[2]) : size - 1;
      if (start >= size || end >= size || start > end) {
        res.statusCode = 416;
        res.setHeader("Content-Range", `bytes */${size}`);
        res.end();
        return;
      }
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
      res.setHeader("Content-Length", String(end - start + 1));
      createReadStream(abs, { start, end }).pipe(res);
      return;
    }
  }

  res.statusCode = 200;
  res.setHeader("Content-Length", String(size));
  createReadStream(abs).pipe(res);
}
