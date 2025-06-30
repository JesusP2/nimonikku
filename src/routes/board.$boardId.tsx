import { Excalidraw } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { queryDb } from "@livestore/livestore";
import { useStore } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { events, tables } from "@/server/livestore/schema";

export const Route = createFileRoute("/board/$boardId")({
  component: RouteComponent,
});

const interval = 50;

function RouteComponent() {
  const { store } = useStore();
  const { boardId } = Route.useParams();
  const [board] = store.useQuery(
    queryDb(
      tables.board.where({
        id: boardId,
      }),
    ),
  );
  const boardUpdatedAt = useRef<Date | null>(null);
  const lastUpdated = useRef<number>(Date.now());
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);

  // NOTE: reconciliation between livestore and excalidraw should only run at the start and when livestore changes from the outside
  // I think we need to save 1 appState per user per board
  useEffect(() => {
    if (!excalidrawApi || !board?.value) return;
    try {
      const value = JSON.parse(board.value);
      boardUpdatedAt.current = board.updatedAt;
      setTimeout(() => {
        excalidrawApi.updateScene({
          elements: value.elements,
        });
        setIsSetupDone(true);
      }, 100);
    } catch (e) {
      console.error(e);
      setIsSetupDone(true);
      return;
    }
  }, [excalidrawApi]);

  useEffect(() => {
    if (!excalidrawApi || !board?.updatedAt || !isSetupDone) return;
    if (!boardUpdatedAt.current) {
      boardUpdatedAt.current = board.updatedAt;
    }
    if (board.updatedAt <= boardUpdatedAt.current) return;
    try {
      const value = JSON.parse(board.value);
      excalidrawApi.updateScene({
        elements: value.elements,
      });
    } catch (e) {
      console.error(e);
      return;
    }
  }, [excalidrawApi, board?.value || "", isSetupDone]);

  const update = useCallback(
    (
      elements: readonly OrderedExcalidrawElement[],
      state: AppState,
      files: BinaryFiles,
    ) => {
      const now = new Date();
      if (!isSetupDone) return;
      if (now.getTime() - lastUpdated.current < interval) return;
      boardUpdatedAt.current = now;
      lastUpdated.current = now.getTime();
      store.commit(
        events.boardUpdated({
          id: boardId,
          updatedAt: now,
          value: JSON.stringify({
            elements,
          }),
        }),
      );
    },
    [isSetupDone],
  );

  return (
    <div className="h-screen">
      <Excalidraw onChange={update} excalidrawAPI={setExcalidrawApi} />
    </div>
  );
}
