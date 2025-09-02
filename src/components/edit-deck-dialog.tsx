import { useStore } from "@livestore/react";
import { useState } from "react";
import { DeckForm, type DeckFormData } from "@/components/deck-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { events } from "@/server/livestore/schema";

interface Deck {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EditDeckDialogProps {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeckDialog({
  deck,
  open,
  onOpenChange,
}: EditDeckDialogProps) {
  const { store } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      store.commit(
        events.deckUpdated({
          id: deck.id,
          name: data.name.trim(),
          context: data.description?.trim() || "",
          updatedAt: new Date(),
        }),
      );

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update deck:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update your deck's name and description.
          </DialogDescription>
        </DialogHeader>
        <DeckForm
          initialData={{
            name: deck.name,
            description: deck.description || "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Deck"
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
