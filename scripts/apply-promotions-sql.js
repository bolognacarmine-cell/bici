import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const sqlPath = path.join(root, 'sql', 'promotions.sql')

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const ssl = process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl,
})

try {
  const sql = await fs.readFile(sqlPath, 'utf8')
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)

  await client.connect()
  for (const stmt of statements) {
    await client.query(stmt)
  }

  console.log('Promotions tables OK')
} finally {
  await client.end().catch(() => {})
}
