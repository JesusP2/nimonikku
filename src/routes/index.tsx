import { createFileRoute } from "@tanstack/react-router";
import { DeckActionsMenu } from "@/components/deck-actions-menu";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { useQuery } from "@livestore/react";
import { allDecks$ } from "@/lib/livestore/queries";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const decks = useQuery(allDecks$) || [];
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
                  <DeckActionsMenu deck={deck} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
