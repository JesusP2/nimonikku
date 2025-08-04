import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@livestore/react";
import { cardById$ } from "@/lib/livestore/queries";
import { CardEditor } from "@/components/card-editor";

export const Route = createFileRoute("/deck/$deckId/card/$cardId/edit")({
  component: EditCardPage,
});

function EditCardPage() {
  const { deckId, cardId } = Route.useParams();
  const card = useQuery(cardById$(cardId))?.[0];

  if (!card) {
    return <div>Card not found</div>;
  }

  return <CardEditor deckId={deckId} cardId={cardId} card={card} mode="edit" />;
}