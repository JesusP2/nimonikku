import { useStore } from "@livestore/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Edit3, Info, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { events } from "@/server/livestore/schema";
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
          <DropdownMenuItem asChild>
            <Link to="/deck/$deckId" params={{ deckId: deck.id }}>
              <Info className="mr-2 h-4 w-4" />
              Info
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
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
            <Trash2 className="mr-2 h-4 w-4" />
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
