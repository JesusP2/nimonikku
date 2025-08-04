import { useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface Card {
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

interface CardsListProps {
  cards: Card[];
  deckId: string;
}

export function CardsList({ cards, deckId }: CardsListProps) {
  const navigate = useNavigate();

  const handleCardClick = (cardId: string) => {
    navigate({ to: `/deck/${deckId}/card/${cardId}` });
  };

  const getCardStatus = (card: Card) => {
    if (card.reps === 0) return { label: "New", variant: "secondary" as const };
    if (new Date(card.due) <= new Date()) return { label: "Due", variant: "destructive" as const };
    return { label: "Learning", variant: "default" as const };
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No cards found in this deck.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the "Add Card" button above to create your first card.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => {
            const status = getCardStatus(card);
            return (
              <TableRow 
                key={card.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleCardClick(card.id)}
              >
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{card.reps}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(card.due).toLocaleDateString()}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
