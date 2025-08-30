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
      name: State.SQLite.text(),
      description: State.SQLite.text({ nullable: true }),
      enableAI: State.SQLite.text({ nullable: true }),
      newCardsPerDay: State.SQLite.integer(),
      limitNewCardsToDaily: State.SQLite.boolean({ nullable: true }),
      lastReset: State.SQLite.datetime(),
      resetTime: State.SQLite.json(),
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
      frontFiles: State.SQLite.json(),
      backFiles: State.SQLite.json(),
      due: State.SQLite.datetime(),
      stability: State.SQLite.real(),
      difficulty: State.SQLite.real(),
      // learning_steps: State.SQLite.integer(),
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
    default: {
      id: SessionIdSymbol,
      value: { selectedDeck: "", studyMode: "review" },
    },
  }),
  userSettings: State.SQLite.table({
    name: "userSettings",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text(),
      enableAI: State.SQLite.boolean(),
    },
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
      name: Schema.String,
      description: Schema.optional(Schema.String),
      enableAI: Schema.optional(Schema.String),
      newCardsPerDay: Schema.optional(Schema.Number),
      limitNewCardsToDaily: Schema.optional(Schema.Boolean),
      resetTime: Schema.optional(Schema.JsonValue),
      lastReset: Schema.optional(Schema.Date),
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
      enableAI: Schema.optional(Schema.String),
      newCardsPerDay: Schema.optional(Schema.Number),
      limitNewCardsToDaily: Schema.optional(Schema.Boolean),
      resetTime: Schema.optional(Schema.JsonValue),
      lastReset: Schema.optional(Schema.Date),
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
      frontFiles: Schema.JsonValue,
      backFiles: Schema.JsonValue,
      due: Schema.Date,
      stability: Schema.Number,
      difficulty: Schema.Number,
      // learning_steps: Schema.Number,
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
      frontFiles: Schema.optional(Schema.JsonValue),
      backFiles: Schema.optional(Schema.JsonValue),
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
      // learning_steps: Schema.Number,
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
  settingsCreated: Events.synced({
    name: "v1.SettingsCreated",
    schema: Schema.Struct({
      id: Schema.String,
      userId: Schema.String,
      enableAI: Schema.Boolean,
    }),
  }),
  toggleAIGlobalSetting: Events.synced({
    name: "v1.ToggleAIGlobalSetting",
    schema: Schema.Struct({
      id: Schema.String,
      enableAI: Schema.Boolean,
    }),
  }),
  deleteAll: Events.synced({
    name: "v1.DeleteAll",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
  resetDeck: Events.synced({
    name: "v1.ResetDeck",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
  resetCards: Events.synced({
    name: "v1.ResetCards",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
};

// Materializers map events to state changes
const materializers = State.SQLite.materializers(events, {
  "v1.DeleteAll": () => tables.deck.delete(),
  // Deck materializers
  "v1.DeckCreated": ({
    id,
    userId,
    name,
    description,
    enableAI,
    lastReset,
    resetTime,
    newCardsPerDay,
    limitNewCardsToDaily,
    createdAt,
    updatedAt,
  }) =>
    tables.deck.insert({
      id,
      userId,
      name,
      description,
      enableAI: enableAI ?? "global",
      newCardsPerDay: newCardsPerDay ?? 20,
      limitNewCardsToDaily: limitNewCardsToDaily ?? true,
      lastReset: lastReset ?? new Date(),
      resetTime: resetTime ?? { hour: 0, minute: 0 },
      createdAt,
      updatedAt,
    }),
  "v1.DeckUpdated": ({
    id,
    name,
    description,
    ai,
    lastReset,
    resetTime,
    newCardsPerDay,
    limitNewCardsToDaily,
    updatedAt,
  }) =>
    tables.deck
      .update({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(ai !== undefined && { ai }),
        ...(newCardsPerDay !== undefined && { newCardsPerDay }),
        ...(limitNewCardsToDaily !== undefined && { limitNewCardsToDaily }),
        ...(resetTime !== undefined && { resetTime }),
        ...(lastReset !== undefined && { lastReset }),
        updatedAt,
      })
      .where({ id }),
  "v1.DeckDeleted": ({ id }) => [
    tables.card.delete().where({ deckId: id }),
    tables.deck.delete().where({ id }),
  ],
  // Card materializers
  "v1.CardCreated": ({
    id,
    deckId,
    frontMarkdown,
    backMarkdown,
    frontFiles,
    backFiles,
    due,
    stability,
    difficulty,
    // learning_steps,
    elapsed_days,
    scheduled_days,
    reps,
    lapses,
    state,
    last_review,
    createdAt,
    updatedAt,
  }) =>
    tables.card.insert({
      id,
      deckId,
      frontMarkdown,
      backMarkdown,
      frontFiles,
      backFiles,
      due,
      stability,
      difficulty,
      // learning_steps,
      elapsed_days,
      scheduled_days,
      reps,
      lapses,
      state,
      last_review,
      createdAt,
      updatedAt,
    }),
  "v1.CardUpdated": ({
    id,
    frontMarkdown,
    backMarkdown,
    frontFiles,
    backFiles,
    updatedAt,
  }) =>
    tables.card
      .update({
        ...(frontMarkdown !== undefined && { frontMarkdown }),
        ...(backMarkdown !== undefined && { backMarkdown }),
        ...(frontFiles !== undefined && { frontFiles }),
        ...(backFiles !== undefined && { backFiles }),
        updatedAt,
      })
      .where({ id }),
  "v1.CardReviewed": ({
    id,
    due,
    stability,
    difficulty,
    // learning_steps,
    elapsed_days,
    scheduled_days,
    reps,
    lapses,
    state,
    last_review,
    updatedAt,
  }) =>
    tables.card
      .update({
        due,
        stability,
        difficulty,
        // learning_steps,
        elapsed_days,
        scheduled_days,
        reps,
        lapses,
        state,
        last_review,
        updatedAt,
      })
      .where({ id }),
  "v1.CardDeleted": ({ id }) => tables.card.delete().where({ id }),
  "v1.SettingsCreated": ({ id, userId, enableAI }) =>
    tables.userSettings.insert({ id, userId, enableAI }),
  "v1.ToggleAIGlobalSetting": ({ enableAI }) =>
    tables.userSettings.update({ enableAI }),
  "v1.ResetDeck": ({ id }) => {
    const now = new Date("2023-07-01T00:00:00.000Z");
    return tables.deck.update({ lastReset: now }).where({ id });
  },
  "v1.ResetCards": ({ id }) =>
    tables.card.update({ state: 0 }).where({ deckId: id }),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });
