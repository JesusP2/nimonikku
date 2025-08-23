import { RPCHandler } from "@orpc/server/fetch";
import { importDeck } from "./import-deck";
import { rephraseText } from "./rephrase";

const router = {
  rephraseText,
  importDeck,
};

export type ORPCRouter = typeof router;

export const handler = new RPCHandler(router);
