import {
  Events,
  makeSchema,
  Schema,
  SessionIdSymbol,
  State,
} from "@livestore/livestore";

// You can model your state as SQLite tables (https://docs.livestore.dev/reference/state/sqlite-schema)
export const tables = {
  todos: State.SQLite.table({
    name: "todos",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      text: State.SQLite.text({ default: "" }),
      completed: State.SQLite.boolean({ default: false }),
      deletedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  board: State.SQLite.table({
    name: "board",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ default: "" }),
      description: State.SQLite.text({ default: "" }),
      value: State.SQLite.json({ default: {} }),
      createdAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
      updatedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  // Client documents can be used for local-only state (e.g. form inputs)
  uiState: State.SQLite.clientDocument({
    name: "uiState",
    schema: Schema.Struct({
      newTodoText: Schema.String,
      filter: Schema.Literal("all", "active", "completed"),
    }),
    default: { id: SessionIdSymbol, value: { newTodoText: "", filter: "all" } },
  }),
};

// Events describe data changes (https://docs.livestore.dev/reference/events)
export const events = {
  boardCreated: Events.synced({
    name: "v1.BoardCreated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      description: Schema.String,
      updatedAt: Schema.Date,
      createdAt: Schema.Date,
      value: Schema.JsonValue,
    }),
  }),
  boardUpdated: Events.synced({
    name: "v1.BoardUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      updatedAt: Schema.Date,
      value: Schema.JsonValue,
    }),
  }),
  boardPropertiesUpdated: Events.synced({
    name: "v1.BoardPropertiesUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      description: Schema.String,
      updatedAt: Schema.Date,
    }),
  }),
  boardDeleted: Events.synced({
    name: "v1.BoardDeleted",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
  boardClear: Events.synced({
    name: "v1.BoardClear",
    schema: Schema.Struct({}),
  }),
};

// Materializers are used to map events to state (https://docs.livestore.dev/reference/state/materializers)
const materializers = State.SQLite.materializers(events, {
  "v1.BoardCreated": ({ id, name, description, createdAt, updatedAt, value }) =>
    tables.board.insert({ id, name, description, createdAt, updatedAt, value }),
  "v1.BoardUpdated": ({ id, value, updatedAt }) =>
    tables.board.update({ value, updatedAt }).where({ id }),
  "v1.BoardPropertiesUpdated": ({ id, name, description, updatedAt }) =>
    tables.board.update({ name, description, updatedAt }).where({ id }),
  "v1.BoardDeleted": ({ id }) => tables.board.delete().where({ id }),
  "v1.BoardClear": ({}) => tables.board.delete(),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });
