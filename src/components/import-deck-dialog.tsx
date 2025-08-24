import { useStore } from "@livestore/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import zip from "jszip";
import fzstd from "fzstd";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileDropzone } from "./file-dropzone";

import { useUploadRoute } from "pushduck/client";
import type { AppUploadRouter } from "@/server/file-storage";
import { useRef } from "react";
import { events } from "@/server/livestore/schema";
import { createEmptyCard } from "ts-fsrs";
import { fromFSRSCard } from "@/lib/fsrs";

interface NewDeckDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const url = new URL("http://localhost:5173/worker.sql-wasm.js");
const worker = new Worker(url);
export function ImportDeckDialog({ open, setOpen }: NewDeckDialogProps) {
  const { store } = useStore();
  const collectionFile = useRef<File | null>(null);
  const { uploadFiles } = useUploadRoute<AppUploadRouter>(
    "documentUpload",
    {
      onSuccess: async () => onSuccess(),
      endpoint: "/api/upload",
    },
  );

  async function onSuccess() {
    worker.postMessage({
      id: 1,
      action: "open",
      buffer: await collectionFile.current?.arrayBuffer(),
    });
    const now = new Date();
    let deckId: string;
    function onMessage(event: MessageEvent) {
      if (event.data.id === 1) {
        worker.postMessage({
          id: 2,
          action: "exec",
          sql: "SELECT * FROM decks",
        });
      } else if (event.data.id === 2) {
        deckId = crypto.randomUUID();
        const deckName = event.data.results[0]?.values?.[0]?.[1];
        store.commit(
          events.deckCreated({
            id: deckId,
            userId: "user1",
            name: deckName,
            description: "",
            createdAt: now,
            updatedAt: now,
          }),
        );
        worker.postMessage({
          id: 3,
          action: "exec",
          sql: "SELECT * FROM notes",
        });
      } else if (event.data.id === 3) {
        const notes = event.data.results[0].values;
        if (!notes) return;
        (notes as any[]).forEach((note) => {
          const card = fromFSRSCard(createEmptyCard());
          let front = note[7].replaceAll("\u001f", "\n");
          let back = note[6].replaceAll("\u001f", "\n");
          // TODO: fk this, need to find a way to map files to cards
          // find substring that matches [placeholder:number_placeholder2] placeholder and placeholder can be any string
          // const placeholderRegex = /\[(.*?):(\d+)_(.*?)\]/g;
          // const match = [...back.matchAll(placeholderRegex)].at(0)?.at(0);
          // console.log('-----------------------------')
          // console.log(front, back)
          // if (match) {
          //   const idx = match.split(':')[1].split('_')[0];
          //   const file = files[idx];
          //   console.log(file)
          // }

          store.commit(
            events.cardCreated({
              id: window.crypto.randomUUID(),
              deckId,
              frontMarkdown: front,
              backMarkdown: back,
              rating: 0,
              frontFiles: [],
              backFiles: [],
              ...card,
              createdAt: now,
              updatedAt: now,
            }),
          );
        });
        worker.removeEventListener("message", onMessage);
      }
    }
    worker.addEventListener("message", onMessage);
  }

  const handleSubmit = async (file: File) => {
    try {
      const zipFile = await zip.loadAsync(file);
      async function extractContent(key: string) {
        if (!zipFile.files[key]) {
          throw new Error(`File ${key} not found in zip file`);
        }
        const arrayBuffer = await zipFile.files[key].async("arraybuffer");
        return new File([fzstd.decompress(new Uint8Array(arrayBuffer))], key, {
          type: "application/octet-stream",
        });
      }

      collectionFile.current = await extractContent("collection.anki21b");

      const regex = /^\d+$/;
      const matches = Object.keys(zipFile.files).filter((key) =>
        regex.test(key),
      );
      const content = await Promise.all(matches.map(extractContent));
      if (!content.length) {
        await onSuccess();
      }
      await uploadFiles(content);
      setOpen(false);
    } catch (error) {
      console.error("Failed to import deck:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Import Deck</DialogTitle>
        </VisuallyHidden>
        <FileDropzone onFileUpload={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
