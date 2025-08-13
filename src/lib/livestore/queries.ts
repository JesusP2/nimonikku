import { queryDb } from "@livestore/livestore";
import { tables } from "@/server/livestore/schema";

// UI state for local-only state management
export const uiState$ = queryDb(tables.uiState.get(), { label: "uiState" });

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
      .where({ deckId, due: { op: "<=", value: new Date() } })
      .orderBy("due", "asc"),
    { label: `dueCards-${deckId}` },
  );

export const cardsState$ = (userDecksIds: string[]) =>
  queryDb(
    tables.card
      .select("state", "id", "deckId")
      .where({ deckId: { op: "IN", value: userDecksIds } }),
    { label: "cardsState" },
  );
