import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
/*   base: "/juhap/", */

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "주합 (酒合) | 완벽한 페어링",
        short_name: "주합 (酒合) | 완벽한 페어링",
        description: "오늘 뭐 마시지? 술과 안주의 완벽한 조합을 AI 챗봇 주아가 취향에 맞게 추천해드립니다. 실패 없는 미식 생활을 시작해보세요.",
        theme_color: "#f7f4ef",
        background_color: "#fbfaf9",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});