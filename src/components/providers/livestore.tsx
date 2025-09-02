import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import {
  LiveStoreProvider as LiveStoreProviderReact,
  useStore,
} from "@livestore/react";
import type React from "react";
import { useEffect } from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { useUser } from "@/hooks/use-user";
import { startCardScheduler, stopCardScheduler } from "@/lib/card-scheduler";
import { schema } from "@/server/livestore/schema";
import LiveStoreWorker from "../../livestore.worker?worker";

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});

function SchedulerInitializer({ userId }: { userId?: string }) {
  const { store } = useStore();

  useEffect(() => {
    if (!userId) return;
    if (store) {
      startCardScheduler(store, userId);
      return () => {
        stopCardScheduler();
      };
    }
  }, [store]);

  return null;
}

export function LiveStoreProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  return (
    <LiveStoreProviderReact
      schema={schema}
      storeId={user?.id}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
    >
      <SchedulerInitializer userId={user?.id} />
      {children}
    </LiveStoreProviderReact>
  );
}
