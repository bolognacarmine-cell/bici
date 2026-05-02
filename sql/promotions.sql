CREATE TABLE IF NOT EXISTS promotions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_eur DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_images (
  id BIGSERIAL PRIMARY KEY,
  promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS promotion_images_promotion_id_idx ON promotion_images (promotion_id);
CREATE INDEX IF NOT EXISTS promotion_images_sort_order_idx ON promotion_images (promotion_id, sort_order ASC, id ASC);

