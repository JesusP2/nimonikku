import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import { deckById$, cardsByDeck$ } from "@/lib/livestore/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardsList } from "@/components/cards-list";
import { ArrowLeft, Plus, Play } from "lucide-react";

export const Route = createFileRoute("/deck/$deckId/")({
  component: DeckInfoPage,
});

function DeckInfoPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  
  const deck = useQuery(deckById$(deckId))?.[0];
  const cards = useQuery(cardsByDeck$(deckId)) || [];

  if (!deck) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Deck not found</h1>
          <Button 
            onClick={() => navigate({ to: "/" })} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddCard = () => {
    navigate({ to: `/deck/${deckId}/card/new` });
  };

  const handleStartReview = () => {
    navigate({ to: `/deck/${deckId}/review` });
  };

  // Calculate due cards
  const now = new Date();
  const dueCards = cards.filter(card => new Date(card.due) <= now);
  const newCards = cards.filter(card => card.reps === 0);
  const learningCards = cards.filter(card => card.reps > 0 && card.stability < 21);
  const matureCards = cards.filter(card => card.stability >= 21);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => navigate({ to: "/" })} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground mt-1">{deck.description}</p>
          )}
        </div>
      </div>

      {/* Deck Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Deck Information
            <div className="flex gap-2">
              <Badge variant="secondary">
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </Badge>
              {dueCards.length > 0 && (
                <Badge variant="destructive">
                  {dueCards.length} due
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <dt className="font-medium text-sm text-muted-foreground">New Cards</dt>
              <dd className="text-2xl font-bold text-blue-600">{newCards.length}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Learning</dt>
              <dd className="text-2xl font-bold text-orange-600">{learningCards.length}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Due Now</dt>
              <dd className="text-2xl font-bold text-red-600">{dueCards.length}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Mature</dt>
              <dd className="text-2xl font-bold text-green-600">{matureCards.length}</dd>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <dt className="font-medium text-sm text-muted-foreground">Created</dt>
                <dd className="text-sm">{new Date(deck.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium text-sm text-muted-foreground">Last Updated</dt>
                <dd className="text-sm">{new Date(deck.updatedAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium text-sm text-muted-foreground">Total Cards</dt>
                <dd className="text-sm">{cards.length}</dd>
              </div>
            </div>
          </div>
          
          {deck.description && (
            <div className="mt-4 pt-4 border-t">
              <dt className="font-medium text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm mt-1">{deck.description}</dd>
            </div>
          )}
          
          {/* Review Button */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex gap-3">
              <Button 
                onClick={handleStartReview}
                disabled={dueCards.length === 0}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {dueCards.length > 0 ? `Review ${dueCards.length} Cards` : "No Cards Due"}
              </Button>
              <Button variant="outline" onClick={handleAddCard}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>
            All cards in this deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardsList cards={cards} deckId={deckId} />
        </CardContent>
      </Card>
    </div>
  );
}