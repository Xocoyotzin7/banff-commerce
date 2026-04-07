import { Pool } from "@neondatabase/serverless"
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless"

import { dbSchema } from "@/lib/db/schema"
import { NotImplementedError } from "@/lib/db/errors"

export type NeonDb = NeonDatabase<typeof dbSchema> & {
  $client: Pool
}

export type NeonDbAdapter = {
  kind: "neon"
  readonly pool: Pool
  readonly db: NeonDb
  readonly schema: typeof dbSchema
  close(): Promise<void>
}

export function createNeonAdapter(databaseUrl: string): NeonDbAdapter {
  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema: dbSchema })

  return {
    kind: "neon",
    pool,
    db,
    schema: dbSchema,
    async close() {
      await pool.end()
    },
  }
}

export function createUnavailableNeonAdapter(): never {
  throw new NotImplementedError("Neon adapter requires a valid DATABASE_URL")
}
