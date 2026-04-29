import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __bici_pg_pool: Pool | undefined
}

export function getPgPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }
  if (!global.__bici_pg_pool) {
    global.__bici_pg_pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: 5,
    })
  }
  return global.__bici_pg_pool
}

