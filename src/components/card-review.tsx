import { useState } from "react";
import { useStore } from "@livestore/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { scheduleCard, toFSRSCard, fromFSRSCard } from "@/lib/fsrs";
import { events } from "@/server/livestore/schema";
import { Eye, EyeOff } from "lucide-react";

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
  last_review?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CardReviewProps {
  card: CardData;
  onNext: () => void;
  onComplete: () => void;
}

// FSRS rating mappings
const RATINGS = {
  AGAIN: 1,    // Red - Complete failure (forgot completely)
  HARD: 2,     // Orange - Partial failure (struggled to remember)
  GOOD: 3,     // Green - Success (remembered with some effort)
  EASY: 4,     // Blue - Perfect success (remembered easily)
} as const;

export function CardReview({ card, onNext, onComplete }: CardReviewProps) {
  const { store } = useStore();
  const [showBack, setShowBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Convert our card to FSRS format
      const fsrsCard = toFSRSCard(card);
      
      // Schedule the card using FSRS
      const reviewResult = scheduleCard(fsrsCard, rating, new Date());
      const updatedFSRSData = fromFSRSCard(reviewResult.card);

      // Commit the review to the store
      store.commit(events.cardReviewed({
        id: card.id,
        ...updatedFSRSData,
        updatedAt: new Date(),
      }));

      // Move to next card
      onNext();
    } catch (error) {
      console.error("Failed to review card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 3) return "text-green-600";
    if (difficulty < 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getStabilityBadge = (stability: number) => {
    if (stability < 1) return { variant: "destructive" as const, label: "New" };
    if (stability < 7) return { variant: "secondary" as const, label: "Learning" };
    if (stability < 30) return { variant: "default" as const, label: "Young" };
    return { variant: "outline" as const, label: "Mature" };
  };

  const stabilityBadge = getStabilityBadge(card.stability);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Card Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={stabilityBadge.variant}>{stabilityBadge.label}</Badge>
          <div className="text-sm text-muted-foreground">
            Reviews: <span className="font-medium">{card.reps}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Difficulty: <span className={`font-medium ${getDifficultyColor(card.difficulty)}`}>
              {card.difficulty.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Stability: <span className="font-medium">{card.stability.toFixed(1)} days</span>
          </div>
        </div>
        <Button variant="outline" onClick={onComplete}>
          End Review
        </Button>
      </div>

      {/* Card Content */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {showBack ? "Back Side" : "Front Side"}
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

      {/* Rating Buttons */}
      {showBack && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => handleRating(RATINGS.AGAIN)}
            disabled={isSubmitting}
            variant="destructive"
            className="h-16 flex-col"
          >
            <span className="text-lg font-bold">Again</span>
            <span className="text-xs opacity-75">Forgot completely</span>
          </Button>
          
          <Button
            onClick={() => handleRating(RATINGS.HARD)}
            disabled={isSubmitting}
            variant="secondary"
            className="h-16 flex-col border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <span className="text-lg font-bold">Hard</span>
            <span className="text-xs opacity-75">Struggled to remember</span>
          </Button>
          
          <Button
            onClick={() => handleRating(RATINGS.GOOD)}
            disabled={isSubmitting}
            variant="default"
            className="h-16 flex-col bg-green-600 hover:bg-green-700"
          >
            <span className="text-lg font-bold">Good</span>
            <span className="text-xs opacity-75">Remembered with effort</span>
          </Button>
          
          <Button
            onClick={() => handleRating(RATINGS.EASY)}
            disabled={isSubmitting}
            variant="outline"
            className="h-16 flex-col border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <span className="text-lg font-bold">Easy</span>
            <span className="text-xs opacity-75">Remembered easily</span>
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