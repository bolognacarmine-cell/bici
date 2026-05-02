import { NextResponse } from 'next/server'
import { getPgPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isNumericId(value: string) {
  return /^[0-9]+$/.test(String(value || '').trim())
}

function parsePriceEur(input: unknown) {
  if (input === null || input === undefined || input === '') return null
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null
    return Math.round(input * 100) / 100
  }
  const raw = String(input).trim()
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const n = Number.parseFloat(normalized)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100) / 100
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Body non valido.' }, { status: 400 })
    }

    const title = String((body as any).title ?? '').trim()
    if (!title) return NextResponse.json({ success: false, error: 'Titolo obbligatorio.' }, { status: 400 })

    const description = String((body as any).description ?? '').trim() || null
    const priceEur = parsePriceEur((body as any).price_eur ?? (body as any).priceEur)
    if (priceEur === null) return NextResponse.json({ success: false, error: 'Prezzo non valido.' }, { status: 400 })
    const isActive = Boolean((body as any).is_active ?? (body as any).isActive ?? true)

    const images = Array.isArray((body as any).images) ? ((body as any).images as any[]) : []
    if (images.length === 0) {
      return NextResponse.json({ success: false, error: 'Carica almeno una immagine.' }, { status: 400 })
    }

    const pool = getPgPool()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const promoRes = await client.query(
        `
          INSERT INTO promotions (title, description, price_eur, is_active)
          VALUES ($1,$2,$3,$4)
          RETURNING id, title, description, price_eur, is_active, created_at, updated_at
        `,
        [title, description, priceEur, isActive]
      )
      const promotion = promoRes.rows[0]

      const values: string[] = []
      const params: any[] = []
      let p = 1
      for (let i = 0; i < images.length; i += 1) {
        const img = images[i]
        if (!img || typeof img !== 'object') continue
        const publicId = String((img as any).public_id ?? (img as any).publicId ?? '').trim()
        const secureUrl = String((img as any).secure_url ?? (img as any).secureUrl ?? '').trim()
        if (!publicId || !secureUrl) continue

        const mime = String((img as any).mime_type ?? (img as any).mimeType ?? 'image/jpeg').trim() || 'image/jpeg'
        const format = (img as any).format ? String((img as any).format) : null
        const width = typeof (img as any).width === 'number' ? (img as any).width : null
        const height = typeof (img as any).height === 'number' ? (img as any).height : null
        const bytes = typeof (img as any).bytes === 'number' ? (img as any).bytes : null
        const sortOrder = typeof (img as any).sort_order === 'number' ? (img as any).sort_order : i

        values.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`)
        params.push(promotion.id, publicId, secureUrl, mime, format, width, height, bytes, sortOrder)
      }

      if (values.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ success: false, error: 'Immagini non valide.' }, { status: 400 })
      }

      const imgsRes = await client.query(
        `
          INSERT INTO promotion_images
            (promotion_id, public_id, secure_url, mime_type, format, width, height, bytes, sort_order)
          VALUES
            ${values.join(',')}
          RETURNING id, promotion_id, public_id, secure_url, mime_type, format, width, height, bytes, sort_order, created_at
        `,
        params
      )

      await client.query('COMMIT')
      return NextResponse.json({ success: true, promotion, images: imgsRes.rows }, { status: 201 })
    } catch {
      await client.query('ROLLBACK')
      return NextResponse.json({ success: false, error: 'Errore interno.' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'DATABASE_URL is not set') {
      return NextResponse.json({ success: false, error: 'DATABASE_URL is required' }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: 'Errore interno.' }, { status: 500 })
  }
}

