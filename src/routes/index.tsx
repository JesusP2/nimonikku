import { useQuery } from "@livestore/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Play } from "lucide-react";
import { CreateDeckDropdown } from "@/components/create-deck-dropdown";
import { CardsState } from "@/components/deck-cards-state";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { allDecks$, cardsState$ } from "@/lib/livestore/queries";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const decks = useQuery(allDecks$) || [];
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false);
  const _deckCards = useQuery(cardsState$(decks.map((deck) => deck.id))) || [];
  const deckCards = _deckCards.reduce(
    (acc, card) => {
      acc[card.deckId] = acc[card.deckId] || [];
      acc[card.deckId].push(card);
      return acc;
    },
    {} as Record<string, { id: string; state: number }[]>,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bold text-4xl text-foreground">Your Decks</h1>
              <p className="mt-2 text-muted-foreground">
                {decks.length === 0
                  ? "Create your first flashcard deck to get started"
                  : `Manage your ${decks.length} flashcard ${decks.length === 1 ? "deck" : "decks"}`}
              </p>
            </div>
            <CreateDeckDropdown />
          </div>
        </div>
        {decks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-muted-foreground/30 border-dashed">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground text-xl">
              No decks yet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Create your first flashcard deck to start learning. You can add
              cards, organize content, and track your progress.
            </p>
            <NewDeckDialog
              open={isCreateDeckDialogOpen}
              setOpen={setIsCreateDeckDialogOpen}
              trigger={
                <Button size="lg" onClick={() => setIsCreateDeckDialogOpen(true)}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create Your First Deck
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {decks.map((deck) => (
              <Card key={deck.id} className="group">
                <CardHeader className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded border border-muted transition-colors group-hover:border-foreground/20">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <CardTitle className="line-clamp-1 font-semibold text-foreground text-sm">
                      {deck.name}
                    </CardTitle>
                  </div>
                  <CardsState cards={deckCards[deck.id] || []} />
                </CardHeader>
                <CardFooter className="border-t-0 px-3 py-2 pt-0">
                  <div className="flex w-full gap-1">
                    <Button asChild size="sm" className="h-7 flex-1 text-xs">
                      <Link
                        to={"/deck/$deckId/review"}
                        params={{ deckId: deck.id }}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Study
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 flex-1 text-xs"
                    >
                      <Link to={"/deck/$deckId"} params={{ deckId: deck.id }}>
                        <BookOpen className="mr-1 h-3 w-3" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
