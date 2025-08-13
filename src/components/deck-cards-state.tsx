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
    <div className="flex gap-1 mt-2 flex-wrap">
      <div className="bg-green-100 text-green-700 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded text-xs">
        {newCards}
      </div>
      <div className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded text-xs">
        {relarningCards}
      </div>
      <div className="bg-orange-100 text-orange-700 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded text-xs">
        {learningCards}
      </div>
    </div>
  );
}
