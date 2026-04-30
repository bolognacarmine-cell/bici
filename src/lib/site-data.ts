import fs from 'fs/promises'
import path from 'path'
import { SiteDataSchema, type SiteData } from './site-data-schema'
import { getPgPool } from './db'

export function getSiteDataFilePath() {
  return path.join(process.cwd(), 'src', 'data.json')
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function normalizeSiteData(input: SiteData): SiteData {
  const products = Array.isArray(input.products) ? [...input.products] : []
  const promotions = Array.isArray(input.promotions) ? [...input.promotions] : []

  for (const p of products) {
    const image = typeof (p as any).image === 'string' ? String((p as any).image).trim() : ''
    const images = Array.isArray((p as any).images) ? ((p as any).images as any[]).map(String).filter((x) => x.trim()) : []
    const nextImages = images.length > 0 ? images : image ? [image] : []
    ;(p as any).images = nextImages.length > 0 ? nextImages : undefined
    ;(p as any).image = nextImages[0] ?? image ?? undefined
  }

  for (const promo of promotions) {
    const image = typeof (promo as any).image === 'string' ? String((promo as any).image).trim() : ''
    const images = Array.isArray((promo as any).images)
      ? ((promo as any).images as any[]).map(String).filter((x) => x.trim())
      : []
    const nextImages = images.length > 0 ? images : image ? [image] : []
    ;(promo as any).images = nextImages.length > 0 ? nextImages : undefined
    ;(promo as any).image = nextImages[0] ?? image ?? undefined
  }

  const skuSeen = new Set<string>()
  for (let index = 0; index < products.length; index += 1) {
    const p = products[index]
    const current = String(p.sku || '').trim()
    const generatedBase = slugify(p.name || `prodotto-${index + 1}`) || `prodotto-${index + 1}`
    const sku = current || `SKU-${generatedBase.toUpperCase()}`
    let candidate = sku
    let i = 2
    while (skuSeen.has(candidate.toLowerCase())) {
      candidate = `${sku}-${i}`
      i += 1
    }
    p.sku = candidate
    skuSeen.add(candidate.toLowerCase())
  }

  const slugSeen = new Set<string>()
  for (const p of products) {
    const base = String(p.slug || '').trim() || slugify(p.name)
    let candidate = base
    let i = 2
    while (candidate && slugSeen.has(candidate)) {
      candidate = `${base}-${i}`
      i += 1
    }
    if (candidate) {
      p.slug = candidate
      slugSeen.add(candidate)
    }
  }

  const productSkuSet = new Set(products.map((p) => String(p.sku).trim()))
  for (const promo of promotions) {
    if (promo.scope === 'product') {
      const sku = String(promo.productSku || '').trim()
      if (!sku) {
        throw new Error('Promo su prodotto: prodotto obbligatorio.')
      }
      if (!productSkuSet.has(sku)) {
        promo.scope = 'general'
        promo.status = 'draft'
        promo.productSku = undefined
      }
    }
  }

  return { ...input, products, promotions }
}

async function readSiteDataFromFile(): Promise<SiteData> {
  const filePath = getSiteDataFilePath()
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return normalizeSiteData(SiteDataSchema.parse(parsed))
}

async function writeSiteDataToFile(newData: unknown): Promise<void> {
  const filePath = getSiteDataFilePath()
  const validated = normalizeSiteData(SiteDataSchema.parse(newData))
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
    return normalizeSiteData(SiteDataSchema.parse(res.rows[0].data))
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
  const validated = normalizeSiteData(SiteDataSchema.parse(newData))
  await pool.query(
    'INSERT INTO site_data (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
    ['default', validated]
  )
}

