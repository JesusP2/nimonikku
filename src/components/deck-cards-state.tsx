export function CardsState({
  cards,
}: {
  cards: readonly { id: string; state: number; reps: number }[];
}) {
  const learningCards = cards.filter(
    (card) => card.state === 1 && card.reps === 1,
  ).length;
  const reviewCards = cards.filter((card) => card.state === 2).length;
  const relearningCards = cards.filter(
    (card) => card.state === 1 && card.reps > 1,
  ).length;

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        {learningCards}
      </span>
      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
        {relearningCards}
      </span>
      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
        {reviewCards}
      </span>
    </div>
  );
}
