import type { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import {
  handleWebSocket,
  makeDurableObject,
} from "@livestore/sync-cf/cf-worker";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { appRouter } from "./routers";
import { createContext } from "./trpc/context";

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

// Lightweight connectivity endpoint for online checks
app.get("/api/ping", (c) => c.json({ ok: true }));

app.post("/api/ai/rephrase", async (c) => {
  try {
    const { text: inputText } = await c.req.json<{ text: string }>();
    if (
      !inputText ||
      typeof inputText !== "string" ||
      inputText.trim().length === 0
    ) {
      return c.json({ error: "Missing question" }, 400);
    }

    try {
      const openrouter = createOpenRouter({
        apiKey: "test",
      });

      const { text } = await generateText({
        model: openrouter("google/gemma-2-9b-it"),
        prompt: `Rewrite this question in a different way. Return only the question, no extra symbols no extra words, only the rephrased question:\n\n${inputText}`,
      });

      const outputText = (text || "").trim();
      if (outputText.length > 0) {
        return c.json({ outputText });
      }
    } catch (err) {
      console.error("OpenRouter rephrase failed:", err);
    }
    return c.json({ outputText: inputText });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Bad Request" }, 400);
  }
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
