import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import { deckById$, dueCards$ } from "@/lib/livestore/queries";
import { CardReview } from "@/components/card-review";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { CardsState } from "@/components/deck-cards-state";

export const Route = createFileRoute("/deck/$deckId/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();

  const deck = useQuery(deckById$(deckId))?.[0];
  const dueCards = useQuery(dueCards$(deckId)) || [];
  const currentCard = dueCards[0];

  const handleNextCard = () => {
    if (dueCards.length <= 1) {
      handleCompleteReview();
    }
  };

  const handleCompleteReview = () => {
    navigate({ to: `/deck/${deckId}` });
  };

  if (!deck) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Deck not found
          </h1>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (dueCards.length <= 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground">Review Session</p>
          </div>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">All caught up!</h2>
                <p className="text-muted-foreground mt-2">
                  No cards are due for review right now.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={() => navigate({ to: `/deck/${deckId}` })}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Deck
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: `/deck/${deckId}/card/new` })}
                >
                  Add New Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardsState cards={dueCards} />
          </div>
        </div>
      </div>
      {currentCard ? (
        <CardReview
          key={currentCard.id}
          card={currentCard}
          onNext={handleNextCard}
          onComplete={handleCompleteReview}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading next card...</p>
        </div>
      )}
    </div>
  );
}
