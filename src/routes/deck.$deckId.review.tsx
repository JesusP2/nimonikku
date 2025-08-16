import { useQuery } from "@livestore/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { CardReview } from "@/components/card-review";
import { CardsState } from "@/components/deck-cards-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deckById$, dueCards$ } from "@/lib/livestore/queries";

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
      <div className="mx-auto max-w-6xl py-8">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-muted-foreground">
            Deck not found
          </h1>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (dueCards.length <= 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-2xl">{deck.name}</h1>
            <p className="text-muted-foreground">Review Session</p>
          </div>
        </div>
        <Card className="py-12 text-center">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">All caught up!</h2>
                <p className="mt-2 text-muted-foreground">
                  No cards are due for review right now.
                </p>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Button onClick={() => navigate({ to: `/deck/${deckId}` })}>
                  <BookOpen className="mr-2 h-4 w-4" />
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
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
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
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading next card...</p>
        </div>
      )}
    </div>
  );
}
