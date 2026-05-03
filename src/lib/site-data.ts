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

  const normalizeImages = (owner: any) => {
    const fallback = typeof owner?.image === 'string' ? String(owner.image).trim() : ''
    const raw = owner?.images
    const cleaned: any[] = []

    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (typeof entry === 'string') {
          const url = entry.trim()
          if (!url) continue
          cleaned.push(url)
          continue
        }
        if (entry && typeof entry === 'object') {
          const url = String((entry as any).url ?? '').trim()
          if (!url) continue
          const label = String((entry as any).label ?? '').trim()
          const alt = String((entry as any).alt ?? '').trim()
          cleaned.push({
            url,
            ...(label ? { label } : {}),
            ...(alt ? { alt } : {}),
          })
        }
      }
    }

    const hasAny = cleaned.length > 0
    const firstUrl = hasAny ? (typeof cleaned[0] === 'string' ? cleaned[0] : String((cleaned[0] as any).url)) : fallback
    owner.images = hasAny ? cleaned : fallback ? [fallback] : undefined
    owner.image = firstUrl || undefined
  }

  for (const p of products) normalizeImages(p as any)
  for (const promo of promotions) normalizeImages(promo as any)

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

  if (!hasDb) {
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

  if (!hasDb) {
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

