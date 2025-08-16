import { useQuery, useStore } from "@livestore/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Play, Plus, TrashIcon } from "lucide-react";
import { CardsList } from "@/components/cards-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  cardsByDeck$,
  deckById$,
  userSettings$,
} from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";
import { useConfirmDialog } from "@/components/providers/confirm-dialog";

export const Route = createFileRoute("/deck/$deckId/")({
  component: DeckInfoPage,
});

function DeckInfoPage() {
  const { deckId } = Route.useParams();
  const { openConfirmDialog } = useConfirmDialog();
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
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-3xl">{deck.name}</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h1>Deck Information</h1>
            <Button
              variant="destructive"
              onClick={() =>
                openConfirmDialog({
                  title: "Delete Deck",
                  description:
                    "Are you sure you want to delete this deck? This action cannot be undone.",
                  handleConfirm: () => {
                    navigate({ to: "/" });
                    store.commit(
                      events.deckDeleted({
                        id: deck.id,
                      }),
                    );
                  },
                })
              }
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Deck
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <dt className="font-medium text-muted-foreground text-sm">
                Due Now
              </dt>
              <dd className="font-bold text-2xl text-red-600">
                {dueCards.length}
              </dd>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <dt className="font-medium text-muted-foreground text-sm">
                  Created
                </dt>
                <dd className="text-sm">
                  {new Date(deck.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground text-sm">
                  Last Updated
                </dt>
                <dd className="text-sm">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground text-sm">
                  Total Cards
                </dt>
                <dd className="text-sm">{cards.length}</dd>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <dt className="mb-2 font-medium text-muted-foreground text-sm">
              AI Settings
            </dt>
            <div>
              <Label className="mb-2 block text-sm">
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
              <p className="mt-2 text-muted-foreground text-xs">
                Override global setting for this deck.
              </p>
            </div>
          </div>
          {deck.description && (
            <div className="mt-4 border-t pt-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Description
              </dt>
              <dd className="mt-1 text-sm">{deck.description}</dd>
            </div>
          )}
          <div className="mt-6 border-t pt-4">
            <div className="flex gap-3">
              <Button
                onClick={handleStartReview}
                disabled={dueCards.length === 0}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {dueCards.length > 0
                  ? `Review ${dueCards.length} Cards`
                  : "No Cards Due"}
              </Button>
              <Button variant="outline" onClick={handleAddCard}>
                <Plus className="mr-2 h-4 w-4" />
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
