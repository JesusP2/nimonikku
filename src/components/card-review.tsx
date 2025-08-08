import { useState } from "react";
import { useStore } from "@livestore/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { scheduleCard, toFSRSCard, fromFSRSCard, getReviewTimePredictions, formatReviewTime } from "@/lib/fsrs";
import { events } from "@/server/livestore/schema";
import { Eye } from "lucide-react";
import { ratings } from "@/lib/constants";

interface CardData {
  id: string;
  deckId: string;
  frontMarkdown: string;
  backMarkdown: string;
  frontFiles: string;
  backFiles: string;
  due: Date;
  stability: number;
  difficulty: number;
  rating: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CardReviewProps {
  card: CardData;
  onNext: () => void;
  onComplete: () => void;
}

export function CardReview({ card, onNext }: CardReviewProps) {
  const { store } = useStore();
  const [showBack, setShowBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewTimes = showBack ? (() => {
    const fsrsCard = toFSRSCard(card);
    const predictions = getReviewTimePredictions(fsrsCard);
    return {
      again: formatReviewTime(predictions.again),
      hard: formatReviewTime(predictions.hard),
      good: formatReviewTime(predictions.good),
      easy: formatReviewTime(predictions.easy),
    };
  })() : null;

  const handleRating = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const fsrsCard = toFSRSCard(card);
      const reviewResult = scheduleCard(fsrsCard, rating, new Date());
      reviewResult
      const updatedFSRSData = fromFSRSCard(reviewResult.card);

      store.commit(events.cardReviewed({
        id: card.id,
        rating,
        ...updatedFSRSData,
        updatedAt: new Date(),
      }));

      // NOTE: we probably don't need this, we can just trigger onCompletedReview when there are no more dueCards left
      onNext();
    } catch (error) {
      console.error("Failed to review card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {!showBack && (
              <Button 
                onClick={() => setShowBack(true)} 
                variant="outline"
                className="ml-4"
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Answer
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {!showBack ? (
            <MarkdownRenderer content={card.frontMarkdown} />
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2 text-muted-foreground">Question:</h4>
                <MarkdownRenderer content={card.frontMarkdown} />
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-muted-foreground">Answer:</h4>
                <MarkdownRenderer content={card.backMarkdown} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {showBack && reviewTimes && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => handleRating(ratings.AGAIN)}
            disabled={isSubmitting}
            variant="destructive"
            className="h-16 flex-col"
          >
            <span className="text-lg font-bold">Again</span>
            <span className="text-xs opacity-75">{reviewTimes.again}</span>
          </Button>
          
          <Button
            onClick={() => handleRating(ratings.HARD)}
            disabled={isSubmitting}
            variant="secondary"
            className="h-16 flex-col border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <span className="text-lg font-bold">Hard</span>
            <span className="text-xs opacity-75">{reviewTimes.hard}</span>
          </Button>
          
          <Button
            onClick={() => handleRating(ratings.GOOD)}
            disabled={isSubmitting}
            variant="default"
            className="h-16 flex-col bg-green-600 hover:bg-green-700"
          >
            <span className="text-lg font-bold">Good</span>
            <span className="text-xs opacity-75">{reviewTimes.good}</span>
          </Button>
          
          <Button
            onClick={() => handleRating(ratings.EASY)}
            disabled={isSubmitting}
            variant="outline"
            className="h-16 flex-col border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <span className="text-lg font-bold">Easy</span>
            <span className="text-xs opacity-75">{reviewTimes.easy}</span>
          </Button>
        </div>
      )}

      {isSubmitting && (
        <div className="text-center py-4">
          <div className="text-muted-foreground">Processing review...</div>
        </div>
      )}
    </div>
  );
}
