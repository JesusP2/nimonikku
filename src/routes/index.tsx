import { useQuery } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { CreateDeckDropdown } from "@/components/create-deck-dropdown";
import { DeckCard } from "@/components/deck-card";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { Button } from "@/components/ui/button";
import { allDecks$ } from "@/lib/livestore/queries";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const decks = useQuery(allDecks$) || [];
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
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
                <Button
                  size="lg"
                  onClick={() => setIsCreateDeckDialogOpen(true)}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create Your First Deck
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
