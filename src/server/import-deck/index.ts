import { os } from "@orpc/server";
import * as z from "zod";

export const importDeckSchema = z.file();

export const importDeck = os
  .input(importDeckSchema)
  .handler(async ({ input }) => {
    console.log("input", input.name);
  });
