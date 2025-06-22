import { queryDb } from "@livestore/livestore";
import { tables } from "@/server/livestore/schema";

export const uiState$ = queryDb(tables.uiState.get(), { label: "uiState" });
