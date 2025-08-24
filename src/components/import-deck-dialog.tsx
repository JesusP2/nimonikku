import { useStore } from "@livestore/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as zip from "jszip";
import * as fzstd from "fzstd";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileDropzone } from "./file-dropzone";

import { useUploadRoute, type S3UploadedFile } from "pushduck/client";
import type { AppUploadRouter } from "@/server/file-storage";
import { useEffect, useRef, useState } from "react";

interface NewDeckDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const url = new URL("http://localhost:5173/worker.sql-wasm.js");
const worker = new Worker(url);
export function ImportDeckDialog({ open, setOpen }: NewDeckDialogProps) {
  const { store } = useStore();
  const [files, setFiles] = useState<S3UploadedFile[]>([]);
  const { uploadFiles } = useUploadRoute<AppUploadRouter>("documentUpload", {
    onSuccess: (files) => {
      setFiles(files);
    },
    endpoint: "/api/upload",
  });

  useEffect(() => {
    worker.onmessage = (event) => {
      if (event.data.id === 1) {
        worker.postMessage({
          id: 2,
          action: "exec",
          sql: "SELECT * FROM notes",
        });
      } else if (event.data.id === 2) {
        console.log(event.data);
      }
    };
  }, [files])

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

      const collectionFile = await extractContent("collection.anki21b");
      const regex = /^\d+$/;
      const matches = Object.keys(zipFile.files).filter((key) =>
        regex.test(key),
      );
      const content = await Promise.all(matches.map(extractContent));
      worker.postMessage({
        id: 1,
        action: "open",
        buffer: await collectionFile.arrayBuffer(),
      });
      await uploadFiles(content)
      function onMessage(event: MessageEvent) {
        console.log(event.data);
        if (event.data.id === 1) {
          worker.postMessage({
            id: 2,
            action: "exec",
            sql: "SELECT * FROM notes",
          });
          worker.removeEventListener("message", onMessage);
        }
      }
      worker.addEventListener("message", onMessage);

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
