import { useState } from "react";
import { useStore } from "@livestore/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeckForm, type DeckFormData } from "@/components/deck-form";
import { events } from "@/server/livestore/schema";
import { Plus } from "lucide-react";

interface NewDeckDialogProps {
  trigger?: React.ReactNode;
}

export function NewDeckDialog({ trigger }: NewDeckDialogProps) {
  const { store } = useStore();
  const [open, setOpen] = useState(false);
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
        })
      );

      setOpen(false);
    } catch (error) {
      console.error("Failed to create deck:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Create a new flashcard deck. You can add cards to it later.
          </DialogDescription>
        </DialogHeader>
        <DeckForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Deck"
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
