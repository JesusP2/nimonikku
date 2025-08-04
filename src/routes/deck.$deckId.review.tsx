import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import { deckById$, dueCards$ } from "@/lib/livestore/queries";
import { CardReview } from "@/components/card-review";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { ratings } from "@/lib/constants";

export const Route = createFileRoute("/deck/$deckId/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  
  const deck = useQuery(deckById$(deckId))?.[0];
  const dueCards = useQuery(dueCards$(deckId)) || [];
  const currentCard = dueCards[0];
  const again = dueCards.filter(card => card.rating === ratings.AGAIN);
  const hard = dueCards.filter(card => card.rating === ratings.HARD);
  const good = dueCards.filter(card => card.rating === ratings.GOOD);
  const easy = dueCards.filter(card => card.rating === ratings.EASY);
  
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

  if (dueCards.length <= 0) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: `/deck/${deckId}` })} 
            variant="outline" 
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => navigate({ to: `/deck/${deckId}` })} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deck
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{deck.name}</h1>
          <p className="text-muted-foreground">Review Session</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{dueCards.length}</span> cards remaining
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {again.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {again.length} again
                    </div>
                  )}
                  {hard.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      {hard.length} hard
                    </div>
                  )}
                  {good.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {good.length} good
                    </div>
                  )}
                  {easy.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {easy.length} easy
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
