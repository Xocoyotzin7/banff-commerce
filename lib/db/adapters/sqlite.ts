import { dbSchema } from "@/lib/db/schema"
import { NotImplementedError } from "@/lib/db/errors"

export type SqliteDb = never

export type SqliteDbAdapter = {
  kind: "sqlite"
  readonly db: SqliteDb
  readonly schema: typeof dbSchema
  close(): Promise<void>
}

export function createSqliteAdapter(): SqliteDbAdapter {
  return {
    kind: "sqlite",
    get db(): never {
      throw new NotImplementedError("SQLite adapter not connected yet")
    },
    schema: dbSchema,
    async close() {
      throw new NotImplementedError("SQLite adapter not connected yet")
    },
  }
}

