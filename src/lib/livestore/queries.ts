import { queryDb } from "@livestore/livestore";
import { tables } from "@/server/livestore/schema";

// UI state for local-only state management
export const uiState$ = queryDb(tables.uiState.get(), { label: "uiState" });

// User settings
export const userSettings$ = (userId: string) =>
  queryDb(
    tables.userSettings.select().where({ userId: { op: "=", value: userId } }),
    {
      label: "userSettings",
    },
  );

// Deck queries
export const allDecks$ = queryDb(
  tables.deck.select().orderBy("createdAt", "desc"),
  { label: "allDecks" },
);

export const deckById$ = (deckId: string) =>
  queryDb(tables.deck.select().where({ id: deckId }), {
    label: `deck-${deckId}`,
  });

export const userDecks$ = (userId: string) =>
  queryDb(tables.deck.select().where({ userId }).orderBy("createdAt", "desc"), {
    label: `userDecks-${userId}`,
  });

export const userDecksLastReset$ = (userId: string) =>
  queryDb(
    tables.deck
      .select("lastReset", "id", "newCardsPerDay")
      .where({ userId })
      .orderBy("createdAt", "desc"),
    {
      label: `userDecksLastReset-${userId}`,
    },
  );

// Card queries
export const cardsByDeck$ = (deckId: string) =>
  queryDb(tables.card.select().where({ deckId }).orderBy("createdAt", "desc"), {
    label: `cardsByDeck-${deckId}`,
  });

export const cardById$ = (cardId: string) =>
  queryDb(tables.card.select().where({ id: cardId }), {
    label: `card-${cardId}`,
  });

export const dueCards$ = (deckId: string) =>
  queryDb(
    tables.card
      .select()
      .where({
        deckId,
        due: {
          op: "<=",
          value: new Date(new Date().getTime() + 1000 * 60 * 10),
        },
        state: { op: "!=", value: 0 },
      })
      .orderBy("due", "asc"),
    { label: `dueCards-${deckId}` },
  );

export const resetDeck$ = (deckId: string) => {
  const now = new Date("2023-07-01T00:00:00.000Z");
  queryDb(tables.deck.update({ lastReset: now }).where({ id: deckId }));
  queryDb(tables.card.update({ state: 0 }).where({ deckId: deckId }));
};
