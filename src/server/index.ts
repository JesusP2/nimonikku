import type { env } from "cloudflare:workers";
import {
  handleWebSocket,
  makeDurableObject,
} from "@livestore/sync-cf/cf-worker";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { handler } from "./orpc";

export class NimonikkuDO extends makeDurableObject({
  onPush: async (message) => {
    console.dir(message, { depth: null });
  },
  onPull: async (_) => {
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
      name: "NimonikkuDO",
    },
  });
});

app.get("/api/ping", (c) => c.json({ ok: true }));
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.use("/api/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/api",
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default app;
