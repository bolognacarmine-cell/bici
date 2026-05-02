import type { Pool, PoolClient } from 'pg'

type Queryable = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>

export function normalizePgSchema(input: unknown) {
  const raw = typeof input === 'string' ? input.trim() : ''
  if (!raw) return 'public'
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) return raw
  return 'public'
}

export async function ensurePromotionsTables(db: Queryable, schemaInput?: unknown) {
  const schema = normalizePgSchema(schemaInput)
  const promotions = `"${schema}"."promotions"`
  const promotionImages = `"${schema}"."promotion_images"`

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${promotions} (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price_eur DECIMAL(10,2) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${promotionImages} (
      id BIGSERIAL PRIMARY KEY,
      promotion_id BIGINT NOT NULL REFERENCES ${promotions}(id) ON DELETE CASCADE,
      public_id TEXT NOT NULL,
      secure_url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      format TEXT,
      width INTEGER,
      height INTEGER,
      bytes INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  await db.query(`CREATE INDEX IF NOT EXISTS promotion_images_promotion_id_idx ON ${promotionImages} (promotion_id);`)
  await db.query(
    `CREATE INDEX IF NOT EXISTS promotion_images_sort_order_idx ON ${promotionImages} (promotion_id, sort_order ASC, id ASC);`
  )
}
