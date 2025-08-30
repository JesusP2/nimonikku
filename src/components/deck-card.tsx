import { useQuery } from "@livestore/react";
import { Link } from "@tanstack/react-router";
import { BookOpenIcon, PlayIcon } from "lucide-react";
import { CardsState } from "@/components/deck-cards-state";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { dueCards$ } from "@/lib/livestore/queries";

export function DeckCard({ deck }: { deck: { id: string; name: string } }) {
  const cards = useQuery(dueCards$(deck.id)) || [];
  return (
    <Card className="group">
      <CardHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-muted transition-colors group-hover:border-foreground/20">
            <BookOpenIcon className="h-3 w-3 text-muted-foreground" />
          </div>
          <CardTitle className="line-clamp-1 font-semibold text-foreground text-sm">
            {deck.name}
          </CardTitle>
        </div>
        <CardsState cards={cards} />
      </CardHeader>
      <CardFooter className="border-t-0 px-3 py-2 pt-0">
        <div className="flex w-full gap-1">
          <Button asChild size="sm" className="h-7 flex-1 text-xs">
            <Link to={"/deck/$deckId/review"} params={{ deckId: deck.id }}>
              <PlayIcon className="mr-1 h-3 w-3" />
              Study
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 flex-1 text-xs"
          >
            <Link to={"/deck/$deckId"} params={{ deckId: deck.id }}>
              <BookOpenIcon className="mr-1 h-3 w-3" />
              Manage
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
