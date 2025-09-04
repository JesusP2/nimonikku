import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { dueCards$ } from "@/lib/livestore/queries";
import { useQuery } from "@livestore/react";
import { Link } from "@tanstack/react-router";
import { Play, Grid3X3, BookOpen } from "lucide-react";
import { CardsState } from "./deck-cards-state";

function DeckCard({
  title,
  deckId
}: {
  title: string;
  deckId: string;
}) {
  const cards = useQuery(dueCards$(deckId)) || [];

  const learningCards = cards.filter(
    (card) => card.state === 1 && card.reps === 1,
  ).length;
  const reviewCards = cards.filter((card) => card.state === 2).length;
  const relearningCards = cards.filter(
    (card) => card.state === 1 && card.reps > 1,
  ).length;

  return (
    <div className={`bg-card border border-border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-card-foreground">{title}</h3>
      </div>
      <CardsState cards={cards} />
      <div className="flex gap-2">
        <Link to="/deck/$deckId/review" className={buttonVariants({ size: 'sm', className: 'h-7 flex-1 text-xs' })} params={{ deckId }}>
          <Play className="h-3 w-3" />
          Study
        </Link>
        <Link to="/deck/$deckId" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-7 flex-1 text-xs' })} params={{ deckId }}>
          <Grid3X3 className="h-3 w-3" />
          Manage
        </Link>
      </div>
    </div>
  );
}

export function MnemonicCardsApp({ decks }: { decks: { id: string; name: string; subDecks: { id: string; name: string; }[] }[] }) {

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Accordion type="multiple" className="space-y-4">
        {decks.map((deck) => (
          <AccordionItem
            key={deck.id}
            value={deck.id}
            className="border border-border rounded-lg last:border-b"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 rounded-t-lg data-[state=open]:rounded-b-none">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{deck.name}</span>
                </div>
                <span className="text-sm text-muted-foreground mr-4">
                  {deck.totalCards} cards
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 border-t border-border bg-muted/20">
              <div className="space-y-3">
                {deck.subDecks.map((subDeck) => (
                  <DeckCard
                    key={subDeck.id}
                    deckId={subDeck.id}
                    title={subDeck.name}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
