const DEFAULT_ASSET_ORIGIN = 'https://bici-1-eefj.onrender.com'

const assetOrigin = (process.env.NEXT_PUBLIC_ASSET_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_ASSET_ORIGIN).replace(
  /\/+$/,
  ''
)

export function toHostedAssetUrl(input: string) {
  const raw = String(input ?? '').trim()
  if (!raw) return raw
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `${assetOrigin}${path}`
}
