import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema/auth.ts",
  out: "./src/server/db/migrations",
});
