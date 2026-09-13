import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatMiddleware } from "./chat-middleware.ts";
import { podcastFeedMiddleware } from "./podcast-feed.ts";
import { signupMiddleware } from "./signup-middleware.ts";
import { audioMiddleware } from "./audio-middleware.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");

export function createApp() {
  const app = express();
  app.set("trust proxy", true);

  app.use(podcastFeedMiddleware);
  app.use(signupMiddleware);
  app.use(audioMiddleware);
  app.use(chatMiddleware);

  app.use(express.static(distDir));
  app.get("/*splat", (_req, res) => {
    res.sendFile(join(distDir, "index.html"));
  });

  return app;
}
