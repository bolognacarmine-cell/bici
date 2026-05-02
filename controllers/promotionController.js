import pgPkg from 'pg'
import { ALLOWED_MIMES, MAX_BYTES, isAllowedImage } from '../middleware/upload.js'
import { deleteByPublicId, uploadImageBuffer } from '../services/cloudinaryService.js'

const { Pool } = pgPkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

function isNumericId(value) {
  return /^[0-9]+$/.test(String(value || '').trim())
}

function normalizeMime(mime) {
  const m = String(mime || '').toLowerCase().trim()
  if (m === 'image/jfif') return 'image/jpeg'
  return m
}

function parsePriceEur(input) {
  if (input === null || input === undefined || input === '') return null
  const raw = String(input).trim()
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const n = Number.parseFloat(normalized)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100) / 100
}

function parseBool(input, fallback) {
  if (input === null || input === undefined || input === '') return fallback
  const v = String(input).toLowerCase().trim()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return fallback
}

export async function uploadPromotionImages(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL is required' })
    }

    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nessun file ricevuto (field name: files).' })
    }

    const uploaded = []
    const errors = []

    for (const file of files) {
      const mime = normalizeMime(file?.mimetype)
      const name = String(file?.originalname || 'file')
      const size = typeof file?.size === 'number' ? file.size : 0

      if (size > MAX_BYTES) {
        errors.push({ file: name, error: 'File troppo grande (max 10MB).' })
        continue
      }

      if (!isAllowedImage({ ...file, mimetype: mime })) {
        errors.push({ file: name, error: 'Tipo file non supportato.' })
        continue
      }

      if (!ALLOWED_MIMES.has(mime) && mime !== 'image/jpeg') {
        errors.push({ file: name, error: 'MIME non consentito.' })
        continue
      }

      try {
        const result = await uploadImageBuffer(file.buffer, { folder: 'promotions' })
        uploaded.push({
          original_name: name,
          original_bytes: size,
          public_id: result.public_id,
          secure_url: result.secure_url,
          mime_type: mime,
          format: result.format || null,
          width: typeof result.width === 'number' ? result.width : null,
          height: typeof result.height === 'number' ? result.height : null,
          bytes: typeof result.bytes === 'number' ? result.bytes : null,
        })
      } catch (_e) {
        errors.push({ file: name, error: 'Errore upload.' })
      }
    }

    return res.status(200).json({ success: true, uploaded, errors })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}

export async function createPromotion(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL is required' })
    }

    const title = String(req.body?.title ?? '').trim()
    if (!title) {
      return res.status(400).json({ success: false, error: 'Titolo obbligatorio.' })
    }

    const description = String(req.body?.description ?? '').trim() || null
    const priceEur = parsePriceEur(req.body?.price_eur ?? req.body?.priceEur)
    if (priceEur === null) {
      return res.status(400).json({ success: false, error: 'Prezzo non valido.' })
    }
    const isActive = parseBool(req.body?.is_active ?? req.body?.isActive, true)

    const imagesRaw = req.body?.images
    const imagesParsed =
      typeof imagesRaw === 'string' ? JSON.parse(imagesRaw) : Array.isArray(imagesRaw) ? imagesRaw : []
    const images = Array.isArray(imagesParsed) ? imagesParsed.filter((x) => x && typeof x === 'object') : []

    if (images.length === 0) {
      return res.status(400).json({ success: false, error: 'Carica almeno una immagine.' })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const promoInsert = await client.query(
        `
          INSERT INTO promotions (title, description, price_eur, is_active)
          VALUES ($1,$2,$3,$4)
          RETURNING id, title, description, price_eur, is_active, created_at, updated_at
        `,
        [title, description, priceEur, isActive]
      )
      const promotion = promoInsert.rows[0]

      const values = []
      const params = []
      let p = 1
      for (let i = 0; i < images.length; i += 1) {
        const img = images[i]
        const publicId = String(img.public_id ?? img.publicId ?? '').trim()
        const secureUrl = String(img.secure_url ?? img.secureUrl ?? '').trim()
        if (!publicId || !secureUrl) continue
        const mime = normalizeMime(img.mime_type ?? img.mimeType ?? '')
        const format = img.format ? String(img.format) : null
        const width = typeof img.width === 'number' ? img.width : null
        const height = typeof img.height === 'number' ? img.height : null
        const bytes = typeof img.bytes === 'number' ? img.bytes : null
        const sortOrder = typeof img.sort_order === 'number' ? img.sort_order : typeof img.sortOrder === 'number' ? img.sortOrder : i

        values.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`)
        params.push(
          promotion.id,
          publicId,
          secureUrl,
          mime || 'image/jpeg',
          format,
          width,
          height,
          bytes,
          sortOrder
        )
      }

      if (values.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, error: 'Immagini non valide.' })
      }

      const imagesInsert = await client.query(
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
      return res.status(201).json({ success: true, promotion, images: imagesInsert.rows })
    } catch (e) {
      await client.query('ROLLBACK')
      return res.status(500).json({ success: false, error: 'Errore interno.' })
    } finally {
      client.release()
    }
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}

export async function deletePromotionImage(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL is required' })
    }

    const id = String(req.params?.id || '').trim()
    if (!id) return res.status(400).json({ success: false, error: 'ID mancante.' })

    if (!isNumericId(id)) {
      await deleteByPublicId(id)
      return res.status(200).json({ success: true })
    }

    const { rows } = await pool.query('SELECT id, public_id FROM promotion_images WHERE id = $1', [id])
    const row = rows[0]
    if (!row) return res.status(404).json({ success: false, error: 'Immagine non trovata.' })

    await deleteByPublicId(row.public_id)
    await pool.query('DELETE FROM promotion_images WHERE id = $1', [id])
    return res.status(200).json({ success: true })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}

export async function deletePromotion(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL is required' })
    }

    const id = String(req.params?.id || '').trim()
    if (!isNumericId(id)) return res.status(400).json({ success: false, error: 'ID non valido.' })

    const { rows } = await pool.query('SELECT public_id FROM promotion_images WHERE promotion_id = $1', [id])
    for (const r of rows) {
      await deleteByPublicId(r.public_id)
    }

    await pool.query('DELETE FROM promotions WHERE id = $1', [id])
    return res.status(200).json({ success: true })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}
