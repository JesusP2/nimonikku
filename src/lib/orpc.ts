import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { ORPCRouter } from "@/server/orpc";

const link = new RPCLink({
  url: "http://localhost:5173/api",
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const orpcClient: RouterClient<ORPCRouter> = createORPCClient(link);
export const orpcQuery = createTanstackQueryUtils(orpcClient);
