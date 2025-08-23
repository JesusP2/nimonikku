import { useStore } from "@livestore/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as zip from "jszip";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { orpcClient } from "@/lib/orpc";
import { FileDropzone } from "./file-dropzone";

// import { useUploadRoute } from 'pushduck/client';
// import type { AppUploadRouter } from "@/server/file-storage";

interface NewDeckDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImportDeckDialog({ open, setOpen }: NewDeckDialogProps) {
  const { store } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { uploadFiles } = useUploadRoute<AppUploadRouter>('imageUpload', {
  //   endpoint: '/api/upload',
  // });

  const handleSubmit = async (file: File) => {
    setIsSubmitting(true);
    try {
      // const now = new Date();
      // const id = crypto.randomUUID();
      // const userId = "user1"; // TODO: Get from auth context
      const {
        "collection.anki21b": sqliteDb,
        media,
        meta,
        "collection.anki2": _,
        ...mediaFiles
      } = (await zip.loadAsync(file)).files;
      // await orpcClient.importDeck(file);

      // store.commit(
      //   events.deckCreated({
      //     id,
      //     userId,
      //     name: data.name.trim(),
      //     description: data.description?.trim() || "",
      //     createdAt: now,
      //     updatedAt: now,
      //   }),
      // );

      setOpen(false);
    } catch (error) {
      console.error("Failed to create deck:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
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
