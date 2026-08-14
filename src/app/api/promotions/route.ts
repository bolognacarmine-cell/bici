import { NextResponse } from 'next/server'
import { createPromotionDoc } from '@/lib/promotions-repo'

export const dynamic = 'force-dynamic'

function toSafeErrorMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : ''
  if (msg === 'MONGODB_URI is not set') return msg
  if (msg.includes('ENOTFOUND') || msg.includes('MongoServerSelectionError')) {
    return 'Connessione MongoDB fallita (verifica MONGODB_URI e Network Access su Atlas).'
  }
  if (msg.toLowerCase().includes('authentication failed') || msg.toLowerCase().includes('bad auth')) {
    return 'Autenticazione MongoDB fallita (verifica username/password nella MONGODB_URI).'
  }
  return 'Errore interno.'
}

function parsePriceEurStrict(input: unknown): { ok: boolean; value: number | null } {
  if (input === null || input === undefined || (typeof input === 'string' && input.trim() === '')) {
    return { ok: true, value: null }
  }
  let n: number
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return { ok: false, value: null }
    n = input
  } else {
    const raw = String(input).trim()
    const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    if (!normalized) return { ok: false, value: null }
    const parsed = Number.parseFloat(normalized)
    if (!Number.isFinite(parsed)) return { ok: false, value: null }
    n = parsed
  }
  if (!(n > 0)) return { ok: false, value: null }
  return { ok: true, value: Math.round(n * 100) / 100 }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, endpoint: 'api/promotions', storage: process.env.MONGODB_URI ? 'mongo' : 'file-disabled' },
    { status: 200 }
  )
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
    const priceParseResult = parsePriceEurStrict((body as any).price_eur ?? (body as any).priceEur)
    if (!priceParseResult.ok) return NextResponse.json({ success: false, error: 'Prezzo non valido.' }, { status: 400 })
    const priceEur = priceParseResult.value
    const isActive = Boolean((body as any).is_active ?? (body as any).isActive ?? true)

    const images = Array.isArray((body as any).images) ? ((body as any).images as any[]) : []
    if (images.length === 0) {
      return NextResponse.json({ success: false, error: 'Carica almeno una immagine.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const promoId = crypto.randomUUID()
    const normalizedImages = images
      .map((img: any, i: number) => {
        if (!img || typeof img !== 'object') return null
        const publicId = String(img.public_id ?? img.publicId ?? '').trim()
        const secureUrl = String(img.secure_url ?? img.secureUrl ?? '').trim()
        if (!publicId || !secureUrl) return null
        const mime = String(img.mime_type ?? img.mimeType ?? 'image/jpeg').trim() || 'image/jpeg'
        const format = img.format ? String(img.format) : null
        const width = typeof img.width === 'number' ? img.width : null
        const height = typeof img.height === 'number' ? img.height : null
        const bytes = typeof img.bytes === 'number' ? img.bytes : null
        const sortOrder = typeof img.sort_order === 'number' ? img.sort_order : i
        return {
          id: crypto.randomUUID(),
          public_id: publicId,
          secure_url: secureUrl,
          mime_type: mime,
          format,
          width,
          height,
          bytes,
          sort_order: sortOrder,
          created_at: now,
        }
      })
      .filter(Boolean) as any[]

    if (normalizedImages.length === 0) {
      return NextResponse.json({ success: false, error: 'Immagini non valide.' }, { status: 400 })
    }

    const promotion = {
      id: promoId,
      title,
      description,
      price_eur: priceEur,
      is_active: isActive,
      created_at: now,
      updated_at: now,
      images: normalizedImages,
    }
    await createPromotionDoc(promotion)

    return NextResponse.json({ success: true, promotion, images: normalizedImages }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: toSafeErrorMessage(e) }, { status: 500 })
  }
}
