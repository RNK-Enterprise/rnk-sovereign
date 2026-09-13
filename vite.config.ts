import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { chatMiddleware } from "./server/chat-middleware.ts";
import { podcastFeedMiddleware } from "./server/podcast-feed.ts";
import { signupMiddleware } from "./server/signup-middleware.ts";
import { audioMiddleware } from "./server/audio-middleware.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.RNK_SMS_TO) process.env.RNK_SMS_TO = env.RNK_SMS_TO;
  if (env.KDECONNECT_DEVICE_ID) {
    process.env.KDECONNECT_DEVICE_ID = env.KDECONNECT_DEVICE_ID;
  }

  return {
    plugins: [
      react(),
      {
        name: "rnk-chat-api",
        configureServer(server) {
          server.middlewares.use(podcastFeedMiddleware);
          server.middlewares.use(signupMiddleware);
          server.middlewares.use(audioMiddleware);
          server.middlewares.use(chatMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(podcastFeedMiddleware);
          server.middlewares.use(signupMiddleware);
          server.middlewares.use(audioMiddleware);
          server.middlewares.use(chatMiddleware);
        },
      },
    ],
    server: {
      host: true,
      port: 5173,
    },
    preview: {
      host: true,
      port: 4173,
    },
  };
});
