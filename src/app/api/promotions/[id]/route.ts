import { NextResponse } from 'next/server'
import { deleteByPublicId } from '@/lib/cloudinary-server'
import { deletePromotionById } from '@/lib/promotions-repo'

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
  if (msg.endsWith(' is required')) return msg
  return 'Errore interno.'
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const value = String(id || '').trim()
    if (!value) return NextResponse.json({ success: false, error: 'ID mancante.' }, { status: 400 })

    const promotion = await deletePromotionById(value)
    if (!promotion) return NextResponse.json({ success: false, error: 'Promozione non trovata.' }, { status: 404 })

    for (const img of promotion.images || []) {
      if (img?.public_id) {
        await deleteByPublicId(img.public_id)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ success: false, error: toSafeErrorMessage(e) }, { status: 500 })
  }
}
