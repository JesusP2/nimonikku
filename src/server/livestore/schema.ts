import {
  Events,
  makeSchema,
  Schema,
  SessionIdSymbol,
  State,
} from "@livestore/livestore";

// SQLite tables for deck and card management
export const tables = {
  deck: State.SQLite.table({
    name: "deck",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text(),
      private: State.SQLite.integer({ nullable: true }),
      name: State.SQLite.text(),
      description: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.datetime(),
      updatedAt: State.SQLite.datetime(),
    },
  }),
  card: State.SQLite.table({
    name: "card",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      deckId: State.SQLite.text(),
      frontMarkdown: State.SQLite.text(),
      backMarkdown: State.SQLite.text(),
      frontFiles: State.SQLite.text(),
      backFiles: State.SQLite.text(),
      due: State.SQLite.datetime(),
      stability: State.SQLite.integer(),
      difficulty: State.SQLite.integer(),
      rating: State.SQLite.integer(),
      elapsed_days: State.SQLite.integer(),
      scheduled_days: State.SQLite.integer(),
      reps: State.SQLite.integer(),
      lapses: State.SQLite.integer(),
      state: State.SQLite.integer(),
      last_review: State.SQLite.datetime({ nullable: true }),
      createdAt: State.SQLite.datetime(),
      updatedAt: State.SQLite.datetime(),
    },
  }),
  // Client documents for local-only state
  uiState: State.SQLite.clientDocument({
    name: "uiState",
    schema: Schema.Struct({
      selectedDeck: Schema.String,
      studyMode: Schema.Literal("review", "learn", "cram"),
    }),
    default: { id: SessionIdSymbol, value: { selectedDeck: "", studyMode: "review" } },
  }),
};

// Events for deck operations
export const events = {
  // Deck events
  deckCreated: Events.synced({
    name: "v1.DeckCreated",
    schema: Schema.Struct({
      id: Schema.String,
      userId: Schema.String,
      private: Schema.optional(Schema.Number),
      name: Schema.String,
      description: Schema.optional(Schema.String),
      createdAt: Schema.Date,
      updatedAt: Schema.Date,
    }),
  }),
  deckUpdated: Events.synced({
    name: "v1.DeckUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.optional(Schema.String),
      description: Schema.optional(Schema.String),
      private: Schema.optional(Schema.Number),
      updatedAt: Schema.Date,
    }),
  }),
  deckDeleted: Events.synced({
    name: "v1.DeckDeleted",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),

  // Card events
  cardCreated: Events.synced({
    name: "v1.CardCreated",
    schema: Schema.Struct({
      id: Schema.String,
      deckId: Schema.String,
      frontMarkdown: Schema.String,
      backMarkdown: Schema.String,
      frontFiles: Schema.String,
      backFiles: Schema.String,
      due: Schema.Date,
      stability: Schema.Number,
      difficulty: Schema.Number,
      rating: Schema.Number,
      elapsed_days: Schema.Number,
      scheduled_days: Schema.Number,
      reps: Schema.Number,
      lapses: Schema.Number,
      state: Schema.Number,
      last_review: Schema.optional(Schema.Date),
      createdAt: Schema.Date,
      updatedAt: Schema.Date,
    }),
  }),
  cardUpdated: Events.synced({
    name: "v1.CardUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      frontMarkdown: Schema.optional(Schema.String),
      backMarkdown: Schema.optional(Schema.String),
      frontFiles: Schema.optional(Schema.String),
      backFiles: Schema.optional(Schema.String),
      updatedAt: Schema.Date,
    }),
  }),
  cardReviewed: Events.synced({
    name: "v1.CardReviewed",
    schema: Schema.Struct({
      id: Schema.String,
      due: Schema.Date,
      stability: Schema.Number,
      difficulty: Schema.Number,
      rating: Schema.Number,
      elapsed_days: Schema.Number,
      scheduled_days: Schema.Number,
      reps: Schema.Number,
      lapses: Schema.Number,
      state: Schema.Number,
      last_review: Schema.Date,
      updatedAt: Schema.Date,
    }),
  }),
  cardDeleted: Events.synced({
    name: "v1.CardDeleted",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
};

// Materializers map events to state changes
const materializers = State.SQLite.materializers(events, {
  // Deck materializers
  "v1.DeckCreated": ({ id, userId, private: isPrivate, name, description, createdAt, updatedAt }) =>
    tables.deck.insert({ id, userId, private: isPrivate, name, description, createdAt, updatedAt }),
  "v1.DeckUpdated": ({ id, name, description, private: isPrivate, updatedAt }) =>
    tables.deck.update({ 
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isPrivate !== undefined && { private: isPrivate }),
      updatedAt 
    }).where({ id }),
  "v1.DeckDeleted": ({ id }) => tables.deck.delete().where({ id }),

  // Card materializers
  "v1.CardCreated": ({ 
    id, deckId, frontMarkdown, backMarkdown, frontFiles, backFiles,
    due, stability, difficulty, rating, elapsed_days, scheduled_days,
    reps, lapses, state, last_review, createdAt, updatedAt 
  }) =>
    tables.card.insert({ 
      id, deckId, frontMarkdown, backMarkdown, frontFiles, backFiles,
      due, stability, difficulty, rating, elapsed_days, scheduled_days,
      reps, lapses, state, last_review, createdAt, updatedAt 
    }),
  "v1.CardUpdated": ({ id, frontMarkdown, backMarkdown, frontFiles, backFiles, updatedAt }) =>
    tables.card.update({ 
      ...(frontMarkdown !== undefined && { frontMarkdown }),
      ...(backMarkdown !== undefined && { backMarkdown }),
      ...(frontFiles !== undefined && { frontFiles }),
      ...(backFiles !== undefined && { backFiles }),
      updatedAt 
    }).where({ id }),
  "v1.CardReviewed": ({ 
    id, due, stability, difficulty, rating, elapsed_days, scheduled_days,
    reps, lapses, state, last_review, updatedAt 
  }) =>
    tables.card.update({ 
      due, stability, difficulty, rating, elapsed_days, scheduled_days,
      reps, lapses, state, last_review, updatedAt 
    }).where({ id }),
  "v1.CardDeleted": ({ id }) => tables.card.delete().where({ id }),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });
