import { createNeonAdapter, type NeonDbAdapter } from "@/lib/db/adapters/neon"
import { createSqliteAdapter, type SqliteDbAdapter } from "@/lib/db/adapters/sqlite"

export type DbAdapter = NeonDbAdapter | SqliteDbAdapter

let cachedDb: DbAdapter | null = null

function resolveDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  return databaseUrl
}

export function getDb(): DbAdapter {
  if (cachedDb) return cachedDb

  const databaseUrl = resolveDatabaseUrl()

  // Adapter selection is a runtime boundary: file URLs stay local, remote URLs go through Neon.
  if (databaseUrl.startsWith("file:")) {
    cachedDb = createSqliteAdapter()
    return cachedDb
  }

  cachedDb = createNeonAdapter(databaseUrl)
  return cachedDb
}

export { createNeonAdapter, createSqliteAdapter }
export { NotImplementedError } from "@/lib/db/errors"
export * from "@/lib/db/schema"
