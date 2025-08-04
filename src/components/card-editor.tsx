import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore, useQuery } from "@livestore/react";
import { deckById$ } from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { createNewCard, fromFSRSCard } from "@/lib/fsrs";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

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
    if (confirm("Are you sure you want to clear this card? This will reset both sides.")) {
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
        
        store.commit(events.cardCreated({
          id,
          deckId,
          frontMarkdown: frontMarkdown.trim(),
          backMarkdown: backMarkdown.trim(),
          rating: 0,
          frontFiles: "",
          backFiles: "",
          ...fsrsData,
          createdAt: now,
          updatedAt: now,
        }));
      } else if (mode === "edit" && cardId) {
        store.commit(events.cardUpdated({
          id: cardId,
          frontMarkdown: frontMarkdown.trim(),
          backMarkdown: backMarkdown.trim(),
          frontFiles: "",
          backFiles: "",
          updatedAt: new Date(),
        }));
      }

      navigate({ to: `/deck/${deckId}` });
    } catch (error) {
      console.error("Failed to save card:", error);
      alert("Failed to save card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: `/deck/${deckId}` });
  };

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={handleCancel} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deck
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create New Card" : "Edit Card"}
          </h1>
          <p className="text-muted-foreground">Deck: {deck.name}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleClearCard} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Card
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Card" : "Update Card"}
        </Button>
      </div>

      {/* Markdown Editor */}
      <MarkdownEditor
        frontMarkdown={frontMarkdown}
        backMarkdown={backMarkdown}
        onFrontChange={setFrontMarkdown}
        onBackChange={setBackMarkdown}
      />

      {/* Both Sides Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Card Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Front Side</h4>
              <div className="p-3 border rounded-md bg-muted/20 min-h-[100px]">
                {frontMarkdown.trim() ? (
                  <MarkdownRenderer content={frontMarkdown} />
                ) : (
                  <p className="text-muted-foreground italic text-sm">No content</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Back Side</h4>
              <div className="p-3 border rounded-md bg-muted/20 min-h-[100px]">
                {backMarkdown.trim() ? (
                  <MarkdownRenderer content={backMarkdown} />
                ) : (
                  <p className="text-muted-foreground italic text-sm">No content</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
