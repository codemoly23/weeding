// server.ts — Custom Next.js server with Socket.io integration
//
// DEPLOYMENT: Vercel does NOT support custom servers or persistent WebSocket processes.
// This file must run on a platform that supports long-running Node.js processes:
//   - Railway (recommended): `railway up` with `npm run start` as start command
//   - Render: Deploy as a Node.js web service, start command: `npm run start`
//   - AWS ECS (per CLAUDE.md): Containerize with Docker, expose port via ALB
//   - Self-hosted VPS: `pm2 start server.ts --interpreter ts-node`
//
// Production setup:
//   - Deploy THIS server on Railway/ECS — handles both Next.js and Socket.io
//   - Set NEXT_PUBLIC_SOCKET_URL in env to point to this server's public URL
//   - Alternatively: deploy Next.js on Vercel + Socket.io on a separate Railway service,
//     then set NEXT_PUBLIC_SOCKET_URL to the standalone Socket server URL

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/support/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Token refresh scheduler
async function scheduleTokenRefresh() {
  if (!dev) {
    try {
      const { runTokenRefreshJob } = await import("./src/lib/token-refresh-job");

      // Run initial token refresh
      console.log("[TokenRefresh] Running initial token refresh...");
      const result = await runTokenRefreshJob();
      console.log(
        `[TokenRefresh] Complete: ${result.refreshed} refreshed, ${result.skipped} skipped, ${result.failed} failed`
      );

      // Schedule daily refresh (24 hours)
      setInterval(
        async () => {
          console.log("[TokenRefresh] Running scheduled refresh...");
          try {
            const refreshResult = await runTokenRefreshJob();
            console.log(`[TokenRefresh] Refreshed: ${refreshResult.refreshed}`);
          } catch (err) {
            console.error("[TokenRefresh] Failed:", err);
          }
        },
        24 * 60 * 60 * 1000 // 24 hours
      );
    } catch (error) {
      console.error("[TokenRefresh] Init failed:", error);
    }
  }
}

async function startServer() {
  try {
    // Prepare Next.js
    await app.prepare();

    // Create HTTP server
    const httpServer = createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    // Initialize Socket.io
    const io = initializeSocketServer(httpServer);

    // Schedule token refresh (production only)
    await scheduleTokenRefresh();

    // Handle server errors
    httpServer.on("error", (err) => {
      console.error("Server error:", err);
    });

    // Start listening
    httpServer.listen(port, () => {
      console.log(`
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🚀 Server started successfully!                       │
│                                                         │
│   > Local:    http://${hostname}:${port}                     │
│   > Socket:   ws://${hostname}:${port}/api/socket            │
│   > Mode:     ${dev ? "development" : "production"}                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
      `);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\n[Server] Shutting down gracefully...");

      // Close Socket.io connections
      io.close(() => {
        console.log("[Socket.io] All connections closed");
      });

      // Close HTTP server
      httpServer.close(() => {
        console.log("[HTTP] Server closed");
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error("[Server] Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
