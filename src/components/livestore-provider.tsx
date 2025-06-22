import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { LiveStoreProvider as LiveStoreProviderReact } from "@livestore/react";
import type React from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { schema } from "@/server/livestore/schema";
import LiveStoreWorker from "../livestore.worker?worker";

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});
export function LiveStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <LiveStoreProviderReact
      schema={schema}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
      syncPayload={{ authToken: "insecure-token-change-me" }}
    >
      {children}
    </LiveStoreProviderReact>
  );
}
