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
    <div className="mt-2 flex flex-wrap gap-1">
      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-700 text-xs dark:bg-blue-900/20 dark:text-blue-400">
        {learningCards}
      </div>
      <div className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 text-xs dark:bg-red-900/20 dark:text-red-400">
        {relearningCards}
      </div>
      <div className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 text-xs dark:bg-green-900/20 dark:text-green-400">
        {reviewCards}
      </div>
    </div>
  );
}
