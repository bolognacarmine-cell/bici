import { getCloudinary } from '../config/cloudinary.js'
import pgPkg from 'pg'

const { Pool } = pgPkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary()
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'carousel',
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )

    stream.end(buffer)
  })
}

function toIntOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number.parseInt(String(value), 10)
  return Number.isFinite(n) ? n : null
}

function toBoolOrDefault(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  const v = String(value).toLowerCase().trim()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return fallback
}

export async function uploadCarouselMedia(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL is required' })
    }

    const file = req.file
    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, error: 'File mancante (field name: file).' })
    }

    const title = String(req.body?.title ?? '').trim() || null
    const altText = String(req.body?.alt_text ?? req.body?.altText ?? '').trim() || null
    const sortOrder = toIntOrNull(req.body?.sort_order ?? req.body?.sortOrder) ?? 0
    const isActive = toBoolOrDefault(req.body?.is_active ?? req.body?.isActive, true)

    const uploaded = await uploadToCloudinary(file.buffer, file.mimetype)

    const record = {
      title,
      alt_text: altText,
      media_type: 'image',
      mime_type: String(file.mimetype || '').trim() || null,
      secure_url: uploaded?.secure_url ?? null,
      public_id: uploaded?.public_id ?? null,
      format: uploaded?.format ?? null,
      width: typeof uploaded?.width === 'number' ? uploaded.width : null,
      height: typeof uploaded?.height === 'number' ? uploaded.height : null,
      bytes: typeof uploaded?.bytes === 'number' ? uploaded.bytes : null,
      sort_order: sortOrder,
      is_active: isActive,
    }

    if (!record.secure_url || !record.public_id || !record.mime_type) {
      return res.status(500).json({ success: false, error: 'Upload incompleto su Cloudinary.' })
    }

    const { rows } = await pool.query(
      `
        INSERT INTO carousel_media
          (title, alt_text, media_type, mime_type, secure_url, public_id, format, width, height, bytes, sort_order, is_active)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING
          id, title, alt_text, media_type, mime_type, secure_url, public_id, format, width, height, bytes, sort_order, is_active, created_at
      `,
      [
        record.title,
        record.alt_text,
        record.media_type,
        record.mime_type,
        record.secure_url,
        record.public_id,
        record.format,
        record.width,
        record.height,
        record.bytes,
        record.sort_order,
        record.is_active,
      ]
    )

    return res.status(201).json({ success: true, record: rows[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : null
    if (msg && msg.endsWith(' is required')) {
      return res.status(500).json({ success: false, error: msg })
    }
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}
