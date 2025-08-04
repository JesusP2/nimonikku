import { createFileRoute } from "@tanstack/react-router";
import { CardEditor } from "@/components/card-editor";

export const Route = createFileRoute("/deck/$deckId/card/new")({
  component: NewCardPage,
});

function NewCardPage() {
  const { deckId } = Route.useParams();

  return <CardEditor deckId={deckId} mode="create" />;
}
