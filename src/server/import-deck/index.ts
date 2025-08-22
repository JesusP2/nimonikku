import * as z from "zod";
import { os } from "@orpc/server";

export const importDeckSchema = z.file();

export const importDeck = os
  .input(importDeckSchema)
  .handler(async ({ input }) => {
    console.log("input", input.name);
  });
