import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Node 22+ ships a global WebSocket, which the Neon driver needs for transactions.
neonConfig.webSocketConstructor = globalThis.WebSocket;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle({ client: new Pool({ connectionString: url }), schema });
}

type Db = ReturnType<typeof createDb>;
const globalForDb = globalThis as unknown as { safeplateDb?: Db };

/** Lazily created so builds without a database still compile. */
export function getDb(): Db {
  globalForDb.safeplateDb ??= createDb();
  return globalForDb.safeplateDb;
}

export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
