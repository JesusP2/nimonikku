import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@livestore/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { events } from "@/server/livestore/schema";
import { MoreVertical, Info, Edit3, Trash2 } from "lucide-react";
import { useConfirmDialog } from "./providers/confirm-dialog";

interface Deck {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeckActionsMenuProps {
  deck: Deck;
}

export function DeckActionsMenu({ deck }: DeckActionsMenuProps) {
  const { store } = useStore();
  const navigate = useNavigate();
  const { openConfirmDialog } = useConfirmDialog();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleInfo = () => {
    navigate({ to: `/deck/${deck.id}` });
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleInfo}>
            <Info className="w-4 h-4 mr-2" />
            Info
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              openConfirmDialog({
                title: "Delete Deck",
                description: "Are you sure you want to delete this deck?",
                handleConfirm: () =>
                  store.commit(events.deckDeleted({ id: deck.id })),
              })
            }
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditDeckDialog
        deck={deck}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
