import { useQuery, useStore } from "@livestore/react";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Rating } from "ts-fsrs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
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
import type { CustomCard } from "./cards-list";
import { StreamdownRenderer } from "./streamdown";

interface CardReviewProps {
  card: CustomCard;
  onNext: () => void;
  onComplete: () => void;
}

export function CardReview({ card, onNext }: CardReviewProps) {
  const { store } = useStore();
  const [showBack, setShowBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const reviewResult = scheduleCard(card, rating, new Date());
      const updatedFSRSData = fromFSRSCard(reviewResult.card);

      const newValue = {
        id: card.id,
        ...updatedFSRSData,
        updatedAt: new Date(),
      };
      store.commit(events.cardReviewed(newValue));

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
              >
                <Eye className="mr-2 h-4 w-4" />
                Show Answer
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <div className="space-y-6">
            <div>
              {showBack && (
                <h4 className="mb-2 font-medium text-muted-foreground">
                  Question:
                </h4>
              )}
              <RephrasedText text={card.frontMarkdown} deckId={card.deckId} />
            </div>
            {showBack && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 font-medium text-muted-foreground">
                    Answer:
                  </h4>
                  <StreamdownRenderer>
                    {card.backMarkdown}
                  </StreamdownRenderer>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {showBack && reviewTimes && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Button
            onClick={() => handleRating(Rating.Again)}
            disabled={isSubmitting}
            variant="destructive"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Again</span>
            <span className="text-xs opacity-75">{reviewTimes.again}</span>
          </Button>

          <Button
            onClick={() => handleRating(Rating.Hard)}
            disabled={isSubmitting}
            variant="secondary"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Hard</span>
            <span className="text-xs opacity-75">{reviewTimes.hard}</span>
          </Button>

          <Button
            onClick={() => handleRating(Rating.Good)}
            disabled={isSubmitting}
            variant="default"
            className="h-16 flex-col"
          >
            <span className="font-bold text-lg">Good</span>
            <span className="text-xs opacity-75">{reviewTimes.good}</span>
          </Button>

          <Button
            onClick={() => handleRating(Rating.Easy)}
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

function RephrasedText({ text, deckId }: { text: string; deckId: string }) {
  const deck = useQuery(deckById$(deckId))?.[0];
  const { data: user } = useUser();
  const settings = useQuery(userSettings$(user.id))?.[0];
  const [showOriginal, setShowOriginal] = useState(false);

  const { data, isLoading } = useTanstackQuery({
    enabled: shouldRephrase(),
    ...orpcQuery.rephraseText.queryOptions({
      input: {
        text,
        context: '',
        answer: '',
      },
    }),
  });

  function shouldRephrase() {
    if (deck.enableAI !== "global") {
      return deck.enableAI === "true";
    }
    return settings.enableAI;
  }
  if (!shouldRephrase()) {
    return <StreamdownRenderer>{text}</StreamdownRenderer>;
  }

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <StreamdownRenderer>
        {data.outputText}
      </StreamdownRenderer>
      <div className="flex items-center gap-2 mt-2">
        <div className="text-muted-foreground text-xs">
          AI Rephrased
        </div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-xs text-muted-foreground hover:text-foreground underline hover:no-underline transition-colors"
        >
          ({showOriginal ? 'hide original' : 'show original'})
        </button>
      </div>
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "transition-all duration-500 ease-in-out text-muted-foreground",
            showOriginal ? "opacity-70 max-h-96" : "opacity-0 max-h-0"
          )}
        >
          <div className="mt-2">
            <StreamdownRenderer>
              {text}
            </StreamdownRenderer>
          </div>
        </div>
      </div>
    </>);
}
