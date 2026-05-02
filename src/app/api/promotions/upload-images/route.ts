import { NextResponse } from 'next/server'
import { uploadImageBuffer } from '@/lib/cloudinary-server'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif'])

function isAllowed(file: File) {
  const mime = String(file.type || '').toLowerCase()
  const name = String((file as any).name || '').toLowerCase()
  const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
  if (ALLOWED_MIMES.has(mime)) return true
  if (ALLOWED_EXTS.has(ext)) return true
  return false
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const files = form.getAll('files').filter((x) => x instanceof File) as File[]
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'Nessun file ricevuto (field name: files).' }, { status: 400 })
    }

    const uploaded: any[] = []
    const errors: any[] = []

    for (const file of files) {
      const name = String((file as any).name || 'file')
      const size = typeof (file as any).size === 'number' ? (file as any).size : 0
      const mime = String(file.type || '').toLowerCase()

      if (size > MAX_BYTES) {
        errors.push({ file: name, error: 'File troppo grande (max 10MB).' })
        continue
      }
      if (!isAllowed(file)) {
        errors.push({ file: name, error: 'Tipo file non supportato.' })
        continue
      }

      try {
        const buf = Buffer.from(await file.arrayBuffer())
        const result = await uploadImageBuffer(buf, { folder: 'promotions' })
        uploaded.push({
          original_name: name,
          original_bytes: size,
          public_id: result.public_id,
          secure_url: result.secure_url,
          mime_type: mime === 'image/jfif' ? 'image/jpeg' : mime,
          format: result.format ?? null,
          width: typeof result.width === 'number' ? result.width : null,
          height: typeof result.height === 'number' ? result.height : null,
          bytes: typeof result.bytes === 'number' ? result.bytes : null,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        if (msg.endsWith(' is required')) {
          return NextResponse.json({ success: false, error: msg }, { status: 500 })
        }
        errors.push({ file: name, error: 'Errore upload.' })
      }
    }

    return NextResponse.json({ success: true, uploaded, errors }, { status: 200 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.endsWith(' is required')) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: 'Errore interno.' }, { status: 500 })
  }
}

