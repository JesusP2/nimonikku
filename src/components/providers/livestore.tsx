import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import {
  LiveStoreProvider as LiveStoreProviderReact,
  useStore,
} from "@livestore/react";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect } from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { authClient } from "@/lib/auth-client";
import { startCardScheduler, stopCardScheduler } from "@/lib/card-scheduler";
import { schema } from "@/server/livestore/schema";
import LiveStoreWorker from "../../livestore.worker?worker";

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});

function SchedulerInitializer() {
  const { store } = useStore();

  useEffect(() => {
    if (store) {
      startCardScheduler(store);
      return () => {
        stopCardScheduler();
      };
    }
  }, [store]);

  return null;
}

export function LiveStoreProvider({ children }: { children: React.ReactNode }) {
  const session = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      let jwt = null;
      const session = await authClient.getSession({
        fetchOptions: {
          onSuccess: (ctx) => {
            jwt = ctx.response.headers.get("set-auth-jwt");
          },
        },
      });
      console.log(jwt);
      return {
        ...session.data,
        jwt,
      };
    },
  });
  if (session.isLoading) return;
  return (
    <LiveStoreProviderReact
      schema={schema}
      storeId={session.data?.user?.id}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
      syncPayload={{ authToken: session.data?.jwt ?? "invalid-token" }}
    >
      <SchedulerInitializer />
      {children}
    </LiveStoreProviderReact>
  );
}
