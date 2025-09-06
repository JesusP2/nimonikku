import { env } from "cloudflare:workers";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { os } from "@orpc/server";
import { generateText } from "ai";
import * as z from "zod";

export const rephraseTextSchema = z.object({
  text: z.string(),
  context: z.string(),
  answer: z.string(),
});

export const rephraseText = os
  .input(rephraseTextSchema)
  .handler(async ({ input }) => {
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_KEY,
    });

    const prompt = `
You are an expert flashcard rewriter for a mnemonic app. Your goal is to rewrite the front face (question) of a flashcard in a fresh, varied way each time, so users must think deeply about the actual concept instead of memorizing superficial patterns like the first few words. The rewrite must preserve the core meaning and ensure the original back face (answer) remains the correct response—do not change the underlying facts or intent.

Original front face: ${input.text}
Original back face (answer—do not include this in your output): ${input.answer}
Extra context (incorporate this style or theme if provided): {extra_context}

Rewrite the front face in a completely new way. Be creative: vary the phrasing, structure, perspective, or add subtle contextual twists, but keep it concise and clear. Make it different from the original and any previous versions. If extra context is provided, adapt the rewrite to fit that style (e.g., make it sound like an interview question). Output ONLY the rewritten front face, nothing else—no explanations, no back face, no additional text.
`;
    const { text } = await generateText({
      model: openrouter("openai/gpt-oss-120b", {
        provider: {
          order: ["cerebras"],
        },
      }),
      prompt,
    });

    const outputText = (text || "").trim();
    if (outputText.length > 0) {
      return { outputText };
    }
    throw new Error("No output text");
  });
