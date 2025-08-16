export function CardsState({
  cards,
}: {
  cards: readonly { id: string; state: number }[];
}) {
  const newCards = cards.filter((card) => card.state === 0).length;
  const learningCards = cards.filter(
    (card) => card.state === 1 || card.state === 2,
  ).length;
  const relarningCards = cards.filter((card) => card.state === 3).length;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-700 text-xs dark:bg-blue-900/20 dark:text-blue-400">
        {newCards}
      </div>
      <div className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 text-xs dark:bg-red-900/20 dark:text-red-400">
        {relarningCards}
      </div>
      <div className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 text-xs dark:bg-green-900/20 dark:text-green-400">
        {learningCards}
      </div>
    </div>
  );
}
