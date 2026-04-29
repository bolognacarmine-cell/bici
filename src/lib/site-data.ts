import fs from 'fs/promises'
import path from 'path'
import { SiteDataSchema, type SiteData } from './site-data-schema'
import { getPgPool } from './db'

export function getSiteDataFilePath() {
  return path.join(process.cwd(), 'src', 'data.json')
}

async function readSiteDataFromFile(): Promise<SiteData> {
  const filePath = getSiteDataFilePath()
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return SiteDataSchema.parse(parsed)
}

async function writeSiteDataToFile(newData: unknown): Promise<void> {
  const filePath = getSiteDataFilePath()
  const validated = SiteDataSchema.parse(newData)
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2))
}

async function ensureTable() {
  const pool = getPgPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_data (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
}

export async function readSiteData(): Promise<SiteData> {
  const hasDb = !!process.env.DATABASE_URL
  const isProd = process.env.NODE_ENV === 'production'

  if (!hasDb) {
    if (isProd) {
      throw new Error('DATABASE_URL is required in production')
    }
    return readSiteDataFromFile()
  }

  await ensureTable()
  const pool = getPgPool()
  const res = await pool.query('SELECT data FROM site_data WHERE id=$1 LIMIT 1', ['default'])
  if (res.rowCount && res.rows[0]?.data) {
    return SiteDataSchema.parse(res.rows[0].data)
  }

  const seed = await readSiteDataFromFile()
  await pool.query(
    'INSERT INTO site_data (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
    ['default', seed]
  )
  return seed
}

export async function writeSiteData(newData: unknown): Promise<void> {
  const hasDb = !!process.env.DATABASE_URL
  const isProd = process.env.NODE_ENV === 'production'

  if (!hasDb) {
    if (isProd) {
      throw new Error('DATABASE_URL is required in production')
    }
    return writeSiteDataToFile(newData)
  }

  await ensureTable()
  const pool = getPgPool()
  const validated = SiteDataSchema.parse(newData)
  await pool.query(
    'INSERT INTO site_data (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
    ['default', validated]
  )
}

