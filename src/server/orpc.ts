import { RPCHandler } from "@orpc/server/fetch";
import { rephraseText } from "./rephrase";
import { importDeck } from "./import-deck";

const router = {
  rephraseText,
  importDeck,
};

export type ORPCRouter = typeof router;

export const handler = new RPCHandler(router);
