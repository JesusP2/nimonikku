import type { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import {
  handleWebSocket,
  makeDurableObject,
} from "@livestore/sync-cf/cf-worker";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { appRouter } from "./routers";
import { createContext } from "./trpc/context";

export class Pikaboard extends makeDurableObject({
  onPush: async (message) => {
    console.dir(message, { depth: null });
  },
  onPull: async (message) => {
    // console.log("onPull", message);
  },
}) {}

const app = new Hono<{ Bindings: typeof env }>();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "traceparent", "b3"],
    credentials: true,
  }),
);

app.get("/websocket", (c) => {
  return handleWebSocket(c.req.raw, c.env, c.executionCtx, {
    validatePayload: (payload: any) => {
      console.log("validatePayload", payload);
      if (payload?.authToken !== "insecure-token-change-me") {
        throw new Error("Invalid auth token");
      }
    },
    durableObject: {
      name: "Pikaboard",
    },
  });
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
