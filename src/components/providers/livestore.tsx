import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import {
  LiveStoreProvider as LiveStoreProviderReact,
  useStore,
} from "@livestore/react";
import type React from "react";
import { useEffect } from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";
import { startCardScheduler, stopCardScheduler } from "@/lib/card-scheduler";
import { userSettings$ } from "@/lib/livestore/queries";
import { events, schema } from "@/server/livestore/schema";
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
    const [userSettings] = store.query(userSettings$(userId));
    if (!userSettings) {
      store.commit(
        events.settingsCreated({
          id: crypto.randomUUID(),
          userId,
          enableAI: false,
        }),
      );
    }
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
  const session = authClient.useSession();
  if (session.isPending) return;
  return (
    <LiveStoreProviderReact
      schema={schema}
      storeId={session.data?.user?.id}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
    >
      <SchedulerInitializer userId={session.data?.user?.id} />
      {children}
    </LiveStoreProviderReact>
  );
}
