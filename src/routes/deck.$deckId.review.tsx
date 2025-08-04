import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@livestore/react";
import { deckById$, cardsByDeck$ } from "@/lib/livestore/queries";
import { CardReview } from "@/components/card-review";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/deck/$deckId/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  
  const deck = useQuery(deckById$(deckId))?.[0];
  const allCards = useQuery(cardsByDeck$(deckId)) || [];
  
  // Filter cards that are due for review
  const dueCards = useMemo(() => {
    const now = new Date();
    return allCards.filter(card => new Date(card.due) <= now);
  }, [allCards]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentCard = dueCards[currentCardIndex];
  
  const handleNextCard = () => {
    setReviewedCount(prev => prev + 1);
    
    if (currentCardIndex + 1 < dueCards.length) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Review session complete
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

  if (dueCards.length === 0) {
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

  const progress = ((reviewedCount) / dueCards.length) * 100;

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
                <Badge variant="outline">
                  {reviewedCount} / {dueCards.length} cards
                </Badge>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Cards remaining: {dueCards.length - reviewedCount}
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      {currentCard && (
        <CardReview
          card={currentCard}
          onNext={handleNextCard}
          onComplete={handleCompleteReview}
        />
      )}
    </div>
  );
}
