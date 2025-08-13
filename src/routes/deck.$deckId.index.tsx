import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import {
  deckById$,
  cardsByDeck$,
  userSettings$,
} from "@/lib/livestore/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardsList } from "@/components/cards-list";
import { ArrowLeft, Plus, Play } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStore } from "@livestore/react";
import { events } from "@/server/livestore/schema";

export const Route = createFileRoute("/deck/$deckId/")({
  component: DeckInfoPage,
});

function DeckInfoPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  const { store } = useStore();

  const deck = useQuery(deckById$(deckId))?.[0];
  const settings = useQuery(userSettings$)?.[0];
  const cards = useQuery(cardsByDeck$(deckId)) || [];

  const now = new Date();
  const dueCards = cards.filter((card) => new Date(card.due) <= now);

  const handleAddCard = () => {
    navigate({ to: `/deck/${deckId}/card/new` });
  };

  const handleStartReview = () => {
    navigate({ to: `/deck/${deckId}/review` });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{deck.name}</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Deck Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Due Now
              </dt>
              <dd className="text-2xl font-bold text-red-600">
                {dueCards.length}
              </dd>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <dt className="font-medium text-sm text-muted-foreground">
                  Created
                </dt>
                <dd className="text-sm">
                  {new Date(deck.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-sm text-muted-foreground">
                  Last Updated
                </dt>
                <dd className="text-sm">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-sm text-muted-foreground">
                  Total Cards
                </dt>
                <dd className="text-sm">{cards.length}</dd>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t">
            <dt className="font-medium text-sm text-muted-foreground mb-2">
              AI Settings
            </dt>
            <div>
              <Label className="text-sm mb-2 block">
                AI Question Rephrasing
              </Label>
              <RadioGroup
                value={deck.ai || "global"}
                onValueChange={(value) => {
                  store.commit(
                    events.deckUpdated({
                      id: deck.id,
                      ai: value,
                      updatedAt: new Date(),
                    }),
                  );
                }}
                className="grid gap-2 md:grid-cols-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="global" id="ai-global" />
                  <Label htmlFor="ai-global">
                    Use Global ({settings?.enableAI ? "Enabled" : "Disabled"})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="ai-true" />
                  <Label htmlFor="ai-true">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="ai-false" />
                  <Label htmlFor="ai-false">Disabled</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-2">
                Override global setting for this deck.
              </p>
            </div>
          </div>
          {deck.description && (
            <div className="mt-4 pt-4 border-t">
              <dt className="font-medium text-sm text-muted-foreground">
                Description
              </dt>
              <dd className="text-sm mt-1">{deck.description}</dd>
            </div>
          )}
          <div className="mt-6 pt-4 border-t">
            <div className="flex gap-3">
              <Button
                onClick={handleStartReview}
                disabled={dueCards.length === 0}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {dueCards.length > 0
                  ? `Review ${dueCards.length} Cards`
                  : "No Cards Due"}
              </Button>
              <Button variant="outline" onClick={handleAddCard}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>All cards in this deck</CardDescription>
        </CardHeader>
        <CardContent>
          <CardsList cards={cards} deckId={deckId} />
        </CardContent>
      </Card>
    </div>
  );
}
