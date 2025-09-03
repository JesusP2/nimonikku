import { useQuery, useStore } from "@livestore/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Play, Plus, TrashIcon } from "lucide-react";
import { CardsList } from "@/components/cards-list";
import { useConfirmDialog } from "@/components/providers/confirm-dialog";
import { UserMenu } from "@/components/user-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import {
  cardsByDeck$,
  deckById$,
  userSettings$,
} from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";

export const Route = createFileRoute("/deck/$deckId/")({
  component: DeckInfoPage,
});

function DeckInfoPage() {
  const { deckId } = Route.useParams();
  const { openConfirmDialog } = useConfirmDialog();
  const navigate = useNavigate();
  const { store } = useStore();

  const { data: user } = useUser();
  const deck = useQuery(deckById$(deckId))?.[0];
  const settings = useQuery(userSettings$(user.id))?.[0];
  const cards = useQuery(cardsByDeck$(deckId)) || [];

  const now = new Date();
  const dueCards = cards.filter(
    (card) =>
      new Date(card.due) <= new Date(now.getTime() + 1000 * 60 * 10) &&
      card.state !== 0,
  );


  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-3xl">{deck.name}</h1>
        </div>
        <UserMenu />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h1>Deck Information</h1>
            <Button
              onClick={() => {
                store.commit(
                  events.resetDeck({
                    id: deck.id,
                  }),
                );
                // store.commit(
                //   events.resetCards({
                //     id: deck.id,
                //   }),
                // );
              }}
            >
              reset
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                openConfirmDialog({
                  title: "Delete Deck",
                  description:
                    "Are you sure you want to delete this deck? This action cannot be undone.",
                  handleConfirm: () => {
                    navigate({ to: "/" });
                    setTimeout(() => {
                      store.commit(
                        events.deckDeleted({
                          id: deck.id,
                        }),
                      );
                    }, 100);
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
            <div className="flex gap-3">
              {dueCards.length > 0 ? (
                <Link
                  to={`/deck/${deckId}/review`}
                  className={buttonVariants({ className: "flex-1" })}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Review {dueCards.length} Cards
                </Link>
              ) : (
                <Button disabled className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  No Cards Due
                </Button>
              )}
              <Link
                to={`/deck/${deckId}/card/new`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>Configure AI behavior for this deck</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="mb-2 block text-sm">AI Question Rephrasing</Label>
            <RadioGroup
              value={deck.enableAI || "global"}
              onValueChange={(value) => {
                store.commit(
                  events.deckUpdated({
                    id: deck.id,
                    enableAI: value,
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
          <div className="mt-4 pt-4">
            <Label htmlFor="context" className="mb-2 block text-sm">
              Context
            </Label>
            <Textarea
              id="context"
              defaultValue={deck.context || ""}
              onChange={(e) => {
                store.commit(
                  events.deckUpdated({
                    id: deck.id,
                    context: e.target.value,
                    updatedAt: new Date(),
                  }),
                );
              }}
              placeholder="Optional context for AI rephrasing..."
              className="mt-1"
            />
            <p className="mt-2 text-muted-foreground text-xs">
              Add optional context to the AI question rephrasing.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Deck Scheduling</CardTitle>
          <CardDescription>
            Configure daily card limits and reset timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="new-cards-per-day" className="block text-sm">
                New Cards Per Day
              </Label>
              <Input
                id="new-cards-per-day"
                type="number"
                min="1"
                max="100"
                value={deck.newCardsPerDay}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value);
                  if (!Number.isNaN(value) && value >= 1 && value <= 100) {
                    store.commit(
                      events.deckUpdated({
                        id: deck.id,
                        newCardsPerDay: value,
                        updatedAt: new Date(),
                      }),
                    );
                  }
                }}
                className="mt-1 w-32"
              />
              <p className="mt-1 text-muted-foreground text-xs">
                Maximum number of new cards to introduce each day
              </p>
            </div>
            <div>
              <Label htmlFor="reset-hour" className="block text-sm">
                Reset Hour (0-23)
              </Label>
              <Input
                id="reset-hour"
                type="number"
                min="0"
                max="23"
                value={deck.resetTime?.hour ?? 0}
                onChange={(e) => {
                  const hour = Number.parseInt(e.target.value);
                  if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
                    store.commit(
                      events.deckUpdated({
                        id: deck.id,
                        resetTime: {
                          ...deck.resetTime,
                          hour,
                        },
                        updatedAt: new Date(),
                      }),
                    );
                  }
                }}
                className="mt-1 w-20"
              />
              <p className="mt-1 text-muted-foreground text-xs">
                Hour when new cards become available (24-hour format)
              </p>
            </div>
            <div>
              <Label htmlFor="reset-minute" className="block text-sm">
                Reset Minute (0-59)
              </Label>
              <Input
                id="reset-minute"
                type="number"
                min="0"
                max="59"
                value={deck.resetTime?.minute ?? 0}
                onChange={(e) => {
                  const minute = Number.parseInt(e.target.value);
                  if (!Number.isNaN(minute) && minute >= 0 && minute <= 59) {
                    store.commit(
                      events.deckUpdated({
                        id: deck.id,
                        resetTime: {
                          ...deck.resetTime,
                          minute,
                        },
                        updatedAt: new Date(),
                      }),
                    );
                  }
                }}
                className="mt-1 w-20"
              />
              <p className="mt-1 text-muted-foreground text-xs">
                Minute when new cards become available
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="limit-new-cards" className="text-sm">
                    Limit Daily New Cards
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    When enabled, only add enough new cards to reach the daily
                    limit (accounting for cards already in learning)
                  </p>
                </div>
                <Switch
                  id="limit-new-cards"
                  checked={deck.limitNewCardsToDaily ?? true}
                  onCheckedChange={(checked) => {
                    store.commit(
                      events.deckUpdated({
                        id: deck.id,
                        limitNewCardsToDaily: checked,
                        updatedAt: new Date(),
                      }),
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="text-muted-foreground text-sm">
              <p>
                <span className="font-medium">Last Reset:</span>{" "}
                {new Date(deck.lastReset).toLocaleString()}
              </p>
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
