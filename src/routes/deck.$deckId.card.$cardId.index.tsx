import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import { cardById$, deckById$ } from "@/lib/livestore/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Edit3 } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export const Route = createFileRoute("/deck/$deckId/card/$cardId/")({
  component: CardViewPage,
});

function CardViewPage() {
  const { deckId, cardId } = Route.useParams();
  const navigate = useNavigate();
  
  const card = useQuery(cardById$(cardId))?.[0];
  const deck = useQuery(deckById$(deckId))?.[0];

  if (!card || !deck) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            {!card ? "Card not found" : "Deck not found"}
          </h1>
          <Button 
            onClick={() => navigate({ to: `/deck/${deckId}` })} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck
          </Button>
        </div>
      </div>
    );
  }

  const getCardStatus = () => {
    if (card.reps === 0) return { label: "New", variant: "secondary" as const };
    if (new Date(card.due) <= new Date()) return { label: "Due", variant: "destructive" as const };
    return { label: "Learning", variant: "default" as const };
  };

  const status = getCardStatus();

  const handleEdit = () => {
    navigate({ to: `/deck/${deckId}/card/${cardId}/edit` });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
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
          <p className="text-muted-foreground">Card Details</p>
        </div>
        <Button onClick={handleEdit}>
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Card Statistics
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Reviews</dt>
              <dd className="text-2xl font-bold">{card.reps}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Lapses</dt>
              <dd className="text-2xl font-bold">{card.lapses}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Difficulty</dt>
              <dd className="text-2xl font-bold">{card.difficulty.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Stability</dt>
              <dd className="text-2xl font-bold">{card.stability}</dd>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <dt className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due Date
              </dt>
              <dd className="text-sm">{new Date(card.due).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Last Review</dt>
              <dd className="text-sm">
                {card.last_review 
                  ? new Date(card.last_review).toLocaleString()
                  : "Never reviewed"
                }
              </dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground">Created</dt>
              <dd className="text-sm">{new Date(card.createdAt).toLocaleString()}</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Front Side</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={card.frontMarkdown} />
            {card.frontFiles && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Files: {card.frontFiles}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Back Side</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={card.backMarkdown} />
            {card.backFiles && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Files: {card.backFiles}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
