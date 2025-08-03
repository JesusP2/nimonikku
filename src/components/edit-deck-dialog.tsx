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
import { Edit3 } from "lucide-react";

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
  trigger?: React.ReactNode;
}

export function EditDeckDialog({ deck, trigger }: EditDeckDialogProps) {
  const { store } = useStore();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      store.commit(
        events.deckUpdated({
          id: deck.id,
          name: data.name.trim(),
          description: data.description?.trim() || "",
          updatedAt: new Date(),
        })
      );

      setOpen(false);
    } catch (error) {
      console.error("Failed to update deck:", error);
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
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
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
