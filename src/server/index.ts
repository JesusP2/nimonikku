import type { env } from "cloudflare:workers";
import { DurableObjectStore } from "@hono-rate-limiter/cloudflare";
import {
  handleWebSocket,
  makeDurableObject,
} from "@livestore/sync-cf/cf-worker";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { auth } from "./auth";
import { uploadRouter } from "./file-storage";
import { handler } from "./orpc";
import { storage } from "./storage";

export { DurableObjectRateLimiter } from "@hono-rate-limiter/cloudflare";

export class NimonikkuDO extends makeDurableObject({
  onPush: async (message) => {
    console.dir(message, { depth: null });
  },
  onPull: async (...args) => {
    console.log("onPull", ...args);
  },
  onPushRes: async (...args) => {
    console.log("onPushRes", ...args);
  },
}) {}

const app = new Hono<{ Bindings: typeof env }>();

app.use((c, next) =>
  rateLimiter<{ Bindings: typeof env }>({
    windowMs: 60,
    limit: 200,
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
    store: new DurableObjectStore({ namespace: c.env.CACHE }),
  })(c, next),
);

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
    validatePayload: async () => {
      const session = await auth.api.getSession(c.req.raw);
      // if (!data.authToken) {
      //   throw new Error("Missing auth token");
      // }
      // const baseUrl = c.env.VITE_SERVER_URL;
      // const url = `${baseUrl}/api/auth/jwks`;
      // const jwks = createRemoteJWKSet(new URL(url));
      // const { payload } = await jwtVerify(data.authToken, jwks, {
      //   issuer: baseUrl,
      //   audience: baseUrl,
      // });
      if (!session?.session.userId) {
        throw new Error("Invalid auth token");
      }
    },
    durableObject: {
      name: "NimonikkuDO",
    },
  });
});

app.get("/api/ping", (c) => c.json({ text: "pong" }));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/upload/*", (c) => uploadRouter.handlers.GET(c.req.raw));
app.post("/api/upload/*", async (c) => {
  const session = await auth.api.getSession(c.req.raw);
  return storage.run(session?.session.userId, async () =>
    uploadRouter.handlers.POST(c.req.raw),
  );
});

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

export default Sentry.withSentry(
  (env) => {
    const { id: versionId } = env.CF_VERSION_METADATA;
    return {
      dsn: env.SENTRY_DSN,
      release: versionId,
      sendDefaultPii: true,
      integrations: [
        Sentry.captureConsoleIntegration(),
        Sentry.extraErrorDataIntegration(),
      ],
      tracesSampleRate: 1.0,
      enableLogs: true,
    };
  },
  // your existing worker export
  app,
);
