import * as z from "zod";
import { os } from "@orpc/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const rephraseTextSchema = z.object({
  text: z.string().min(1),
});

export const rephraseText = os
  .input(rephraseTextSchema)
  .handler(async ({ input }) => {
    const openrouter = createOpenRouter({
      apiKey: "test",
    });

    const { text } = await generateText({
      model: openrouter("meta-llama/llama-3.2-3b-instruct", {
        provider: {
          order: ["lambda/bf16"],
        },
      }),
      prompt: `Rewrite this question in a different way. Return only the question, no extra symbols no extra words, only the rephrased question:\n\n${input.text}`,
    });

    const outputText = (text || "").trim();
    if (outputText.length > 0) {
      return { outputText };
    }
    throw new Error("No output text");
  });
