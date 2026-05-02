CREATE TABLE IF NOT EXISTS carousel_media (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  alt_text TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  mime_type TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  format TEXT,
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS carousel_media_sort_order_idx ON carousel_media (sort_order ASC, id ASC);
CREATE INDEX IF NOT EXISTS carousel_media_is_active_idx ON carousel_media (is_active);

