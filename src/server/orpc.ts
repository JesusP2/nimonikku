import { RPCHandler } from "@orpc/server/fetch";
import { rephraseText } from "./rephrase";

const router = {
  rephraseText,
};

export type ORPCRouter = typeof router;

export const handler = new RPCHandler(router);
