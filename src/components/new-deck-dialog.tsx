import { useStore } from "@livestore/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DeckForm, type DeckFormData } from "@/components/deck-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { events } from "@/server/livestore/schema";

interface NewDeckDialogProps {
  trigger?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NewDeckDialog({ trigger, open, setOpen }: NewDeckDialogProps) {
  const { data: user } = useUser();
  const { store } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      const now = new Date();
      const id = crypto.randomUUID();

      store.commit(
        events.deckCreated({
          id,
          userId: user.id,
          name: data.name.trim(),
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

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger === undefined ? (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </DialogTrigger>
      ) : (
        trigger
      )}
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
