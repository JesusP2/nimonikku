import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { useQuery, useStore } from "@livestore/react";
import { allDecks$ } from "@/lib/livestore/queries";
import { useConfirmDialog } from "@/components/providers/confirm-dialog";
import { Edit3Icon, Trash2Icon } from "lucide-react";
import { events } from "@/server/livestore/schema";
import { EditDeckDialog } from "@/components/edit-deck-dialog";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();
  const decks = useQuery(allDecks$) || [];
  const { openConfirmDialog } = useConfirmDialog();
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Decks</h2>
        <NewDeckDialog />
      </div>
      <div className="grid gap-4">
        {decks.map((deck) => (
          <Card key={deck.id} className="rounded-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{deck.name}</CardTitle>
                  <CardDescription>{deck.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <EditDeckDialog deck={deck} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      openConfirmDialog({
                        title: "Delete Deck",
                        description:
                          "Are you sure you want to delete this deck?",
                        handleConfirm: () =>
                          store.commit(events.deckDeleted({ id: deck.id })),
                      })
                    }
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
