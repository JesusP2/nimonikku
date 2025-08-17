import { RPCHandler } from "@orpc/server/fetch";
import { rephraseText } from "./rephrase";
import { os } from "@orpc/server";

const router = {
  rephraseText,
  ping: os.handler(async () => {
    return {
      ok: true,
    };
  }),
};

export type ORPCRouter = typeof router;

export const handler = new RPCHandler(router);
