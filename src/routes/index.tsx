import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@livestore/react";
import { allDecks$, cardsState$ } from "@/lib/livestore/queries";
import { BookOpen, Play } from "lucide-react";
import { CardsState } from "@/components/deck-cards-state";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const decks = useQuery(allDecks$) || [];
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Your Decks</h1>
              <p className="text-muted-foreground mt-2">
                {decks.length === 0
                  ? "Create your first flashcard deck to get started"
                  : `Manage your ${decks.length} flashcard ${decks.length === 1 ? "deck" : "decks"}`}
              </p>
            </div>
            <NewDeckDialog />
          </div>
        </div>
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No decks yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first flashcard deck to start learning. You can add
              cards, organize content, and track your progress.
            </p>
            <NewDeckDialog
              trigger={
                <Button size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
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
                    <div className="w-5 h-5 border border-muted rounded flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground line-clamp-1">
                      {deck.name}
                    </CardTitle>
                  </div>
                  <CardsState cards={deckCards[deck.id] || []} />
                </CardHeader>
                <CardFooter className="px-3 py-2 pt-0 border-t-0">
                  <div className="flex gap-1 w-full">
                    <Button asChild size="sm" className="flex-1 h-7 text-xs">
                      <Link
                        to={`/deck/$deckId/review`}
                        params={{ deckId: deck.id }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Study
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                    >
                      <Link to={`/deck/$deckId`} params={{ deckId: deck.id }}>
                        <BookOpen className="w-3 h-3 mr-1" />
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
