import { useQuery, useStore } from "@livestore/react";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { Eye, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ratings } from "@/lib/constants";
import {
  formatReviewTime,
  fromFSRSCard,
  getReviewTimePredictions,
  scheduleCard,
  toFSRSCard,
} from "@/lib/fsrs";
import { deckById$, userSettings$ } from "@/lib/livestore/queries";
import { orpcQuery } from "@/lib/orpc";
import { events } from "@/server/livestore/schema";
import { useIsOnline } from "./providers/is-online";

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
  const [rephrasedText, setRephrasedText] = useState<string | null>(null);
  const deck = useQuery(deckById$(card.deckId))?.[0];
  const settings = useQuery(userSettings$)?.[0];
  const { isOnline } = useIsOnline();
  const query = useTanstackQuery({
    enabled: card.frontMarkdown.length > 0 && shouldRephrase() && isOnline,
    ...orpcQuery.rephraseText.queryOptions({
      input: {
        text: card.frontMarkdown,
      },
    }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      setRephrasedText(query.data.outputText);
    } else if (query.isError) {
      setRephrasedText(null);
      toast.error("Failed to fetch AI rephrased question.");
    }
  }, [query.isLoading]);

  function shouldRephrase() {
    if (deck?.ai !== "global") {
      return deck?.ai === "true";
    }
    return settings.enableAI;
  }

  const reviewTimes = showBack
    ? (() => {
        const fsrsCard = toFSRSCard(card);
        const predictions = getReviewTimePredictions(fsrsCard);
        return {
          again: formatReviewTime(predictions.again),
          hard: formatReviewTime(predictions.hard),
          good: formatReviewTime(predictions.good),
          easy: formatReviewTime(predictions.easy),
        };
      })()
    : null;

  const handleRating = async (rating: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fsrsCard = toFSRSCard(card);
      const reviewResult = scheduleCard(fsrsCard, rating, new Date());
      const updatedFSRSData = fromFSRSCard(reviewResult.card);

      store.commit(
        events.cardReviewed({
          id: card.id,
          rating,
          ...updatedFSRSData,
          updatedAt: new Date(),
        }),
      );

      // NOTE: we probably don't need this, we can just trigger onCompletedReview when there are no more dueCards left
      onNext();
    } catch (error) {
      console.error("Failed to review card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {!showBack && (
              <Button
                onClick={() => setShowBack(true)}
                variant="outline"
                className="ml-4"
              >
                <Eye className="mr-2 h-4 w-4" />
                Show Answer
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {!showBack ? (
            <div className="space-y-2">
              {query.isLoading ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <MarkdownRenderer
                  content={rephrasedText || card.frontMarkdown}
                />
              )}
              {rephrasedText && (
                <div className="text-muted-foreground text-xs">
                  AI Rephrased
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground">
                  Question:
                </h4>
                {query.isLoading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <MarkdownRenderer
                    content={rephrasedText || card.frontMarkdown}
                  />
                )}
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground">
                  Answer:
                </h4>
                <MarkdownRenderer content={card.backMarkdown} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {showBack && reviewTimes && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Button
            onClick={() => handleRating(ratings.AGAIN)}
            disabled={isSubmitting}
            variant="destructive"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Again</span>
            <span className="text-xs opacity-75">{reviewTimes.again}</span>
          </Button>

          <Button
            onClick={() => handleRating(ratings.HARD)}
            disabled={isSubmitting}
            variant="secondary"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Hard</span>
            <span className="text-xs opacity-75">{reviewTimes.hard}</span>
          </Button>

          <Button
            onClick={() => handleRating(ratings.GOOD)}
            disabled={isSubmitting}
            variant="default"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Good</span>
            <span className="text-xs opacity-75">{reviewTimes.good}</span>
          </Button>

          <Button
            onClick={() => handleRating(ratings.EASY)}
            disabled={isSubmitting}
            variant="outline"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Easy</span>
            <span className="text-xs opacity-75">{reviewTimes.easy}</span>
          </Button>
        </div>
      )}

      {isSubmitting && (
        <div className="py-4 text-center">
          <div className="text-muted-foreground">Processing review...</div>
        </div>
      )}
    </div>
  );
}
