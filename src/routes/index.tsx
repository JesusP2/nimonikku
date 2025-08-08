import { createFileRoute, Link } from "@tanstack/react-router";
import { DeckActionsMenu } from "@/components/deck-actions-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@livestore/react";
import { allDecks$ } from "@/lib/livestore/queries";
import { BookOpen, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const decks = useQuery(allDecks$) || [];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Your Decks
              </h1>
              <p className="text-muted-foreground mt-2">
                {decks.length === 0 
                  ? "Create your first flashcard deck to get started" 
                  : `Manage your ${decks.length} flashcard ${decks.length === 1 ? 'deck' : 'decks'}`
                }
              </p>
            </div>
            <NewDeckDialog />
          </div>
        </div>

        {/* Empty State */}
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No decks yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first flashcard deck to start learning. You can add cards, organize content, and track your progress.
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
          /* Deck Grid */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {decks.map((deck) => (
              <Card 
                key={deck.id} 
                className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 py-2"
              >
                <CardHeader className="px-3 py-2">
                  <div className="flex justify-between items-center">
                    <div className="w-6 h-6 border border-muted rounded flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <DeckActionsMenu deck={deck} />
                  </div>
                  <CardTitle className="text-sm font-semibold text-foreground line-clamp-1 mt-2">
                    {deck.name}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="px-3 py-2 border-t">
                  <div className="flex gap-1 w-full">
                    <Button 
                      asChild 
                      size="sm"
                      className="flex-1 h-7 text-xs"
                    >
                      <Link to={`/deck/$deckId/review`} params={{ deckId: deck.id }}>
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
