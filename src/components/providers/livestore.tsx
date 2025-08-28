import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { LiveStoreProvider as LiveStoreProviderReact } from "@livestore/react";
import type React from "react";
import { useEffect } from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { useStore } from "@livestore/react";
import { authClient } from "@/lib/auth-client";
import { schema } from "@/server/livestore/schema";
import { startCardScheduler, stopCardScheduler } from "@/lib/card-scheduler";
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
  const session = authClient.useSession();
  if (session.isPending) return;
  return (
    <LiveStoreProviderReact
      schema={schema}
      storeId={session.data?.user.id}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
      syncPayload={{ authToken: "insecure-token-change-me" }}
    >
      <SchedulerInitializer />
      {children}
    </LiveStoreProviderReact>
  );
}
