import { useStore } from "@livestore/react";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { DeckFormData } from "@/components/deck-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { events } from "@/server/livestore/schema";
import { FileDropzone } from "./file-dropzone";

interface NewDeckDialogProps {
  trigger?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImportDeckDialog({
  trigger,
  open,
  setOpen,
}: NewDeckDialogProps) {
  const { store } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      const now = new Date();
      const id = crypto.randomUUID();
      const userId = "user1"; // TODO: Get from auth context

      store.commit(
        events.deckCreated({
          id,
          userId,
          name: data.name.trim(),
          description: data.description?.trim() || "",
          createdAt: now,
          updatedAt: now,
        }),
      );

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
        <FileDropzone />
      </DialogContent>
    </Dialog>
  );
}
