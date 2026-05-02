import { NextResponse } from 'next/server'
import { deleteByPublicId } from '@/lib/cloudinary-server'
import { getPgPool } from '@/lib/db'
import { ensurePromotionsTables, normalizePgSchema } from '@/lib/promotions-db'

export const dynamic = 'force-dynamic'

function isNumericId(value: string) {
  return /^[0-9]+$/.test(String(value || '').trim())
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const value = String(id || '').trim()
    if (!isNumericId(value)) {
      return NextResponse.json({ success: false, error: 'ID non valido.' }, { status: 400 })
    }

    const schema = normalizePgSchema(process.env.PG_SCHEMA)
    const promotions = `"${schema}"."promotions"`
    const promotionImages = `"${schema}"."promotion_images"`

    const pool = getPgPool()
    await ensurePromotionsTables(pool, schema)
    const { rows } = await pool.query(`SELECT public_id FROM ${promotionImages} WHERE promotion_id = $1`, [value])
    for (const r of rows) {
      await deleteByPublicId(r.public_id)
    }

    await pool.query(`DELETE FROM ${promotions} WHERE id = $1`, [value])
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
