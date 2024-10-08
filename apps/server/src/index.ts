import "source-map-support/register";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { Server } from "ws";
import { appRouter, createContext } from "@repo/router";
import env from "./env";

const wss = new Server({
  port: parseInt(env.PORT),
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: (opts) => createContext({ ...opts, dbUrl: env.DATABASE_URL }),
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log(`✅ WebSocket Server listening on ws://localhost:${env.PORT}`);
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
