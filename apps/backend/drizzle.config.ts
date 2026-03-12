import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getEnv } from "./src/lib/env";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "./src/db/schemas/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnv("DATABASE_URL"),
  },
});
