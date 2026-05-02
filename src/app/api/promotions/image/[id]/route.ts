import { NextResponse } from 'next/server'
import { deleteByPublicId } from '@/lib/cloudinary-server'
import { getPgPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isNumericId(value: string) {
  return /^[0-9]+$/.test(String(value || '').trim())
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const value = String(id || '').trim()
    if (!value) return NextResponse.json({ success: false, error: 'ID mancante.' }, { status: 400 })

    if (!isNumericId(value)) {
      await deleteByPublicId(value)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const pool = getPgPool()
    const { rows } = await pool.query('SELECT id, public_id FROM promotion_images WHERE id = $1', [value])
    const row = rows[0]
    if (!row) return NextResponse.json({ success: false, error: 'Immagine non trovata.' }, { status: 404 })

    await deleteByPublicId(row.public_id)
    await pool.query('DELETE FROM promotion_images WHERE id = $1', [value])
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'DATABASE_URL is not set') {
      return NextResponse.json({ success: false, error: 'DATABASE_URL is required' }, { status: 500 })
    }
    if (msg.endsWith(' is required')) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: 'Errore interno.' }, { status: 500 })
  }
}

