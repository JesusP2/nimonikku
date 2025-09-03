import { useQuery, useStore } from "@livestore/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { createNewCard, fromFSRSCard } from "@/lib/fsrs";
import { deckById$ } from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";

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

interface CardEditorProps {
  deckId: string;
  cardId?: string;
  card?: CardData;
  mode: "create" | "edit";
}

export function CardEditor({ deckId, cardId, card, mode }: CardEditorProps) {
  const { store } = useStore();
  const navigate = useNavigate();
  const deck = useQuery(deckById$(deckId))?.[0];

  const [frontMarkdown, setFrontMarkdown] = useState(card?.frontMarkdown || "");
  const [backMarkdown, setBackMarkdown] = useState(card?.backMarkdown || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClearCard = () => {
    if (
      confirm(
        "Are you sure you want to clear this card? This will reset both sides.",
      )
    ) {
      setFrontMarkdown("");
      setBackMarkdown("");
    }
  };

  const handleSave = async () => {
    if (!frontMarkdown.trim() || !backMarkdown.trim()) {
      alert("Both front and back sides must have content.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const now = new Date();
        const id = crypto.randomUUID();

        // Create a new card using FSRS
        const newFSRSCard = createNewCard();
        const fsrsData = fromFSRSCard(newFSRSCard);

        store.commit(
          events.cardCreated({
            id,
            deckId,
            frontMarkdown: frontMarkdown.trim(),
            backMarkdown: backMarkdown.trim(),
            learning_steps: 0,
            frontFiles: [],
            backFiles: [],
            ...fsrsData,
            createdAt: now,
            updatedAt: now,
          }),
        );
      } else if (mode === "edit" && cardId) {
        store.commit(
          events.cardUpdated({
            id: cardId,
            frontMarkdown: frontMarkdown.trim(),
            backMarkdown: backMarkdown.trim(),
            frontFiles: [],
            backFiles: [],
            updatedAt: new Date(),
          }),
        );
      }

      navigate({ to: `/deck/${deckId}` });
    } catch (error) {
      console.error("Failed to save card:", error);
      alert("Failed to save card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          to="/deck/$deckId"
          params={{ deckId }}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deck
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-2xl">
            {mode === "create" ? "Create New Card" : "Edit Card"}
          </h1>
          <p className="text-muted-foreground">Deck: {deck.name}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleClearCard} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Card
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Card"
              : "Update Card"}
        </Button>
      </div>
      <MarkdownEditor
        frontMarkdown={frontMarkdown}
        backMarkdown={backMarkdown}
        onFrontChange={setFrontMarkdown}
        onBackChange={setBackMarkdown}
      />
    </div>
  );
}
