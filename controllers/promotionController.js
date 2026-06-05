import { ALLOWED_MIMES, MAX_BYTES, isAllowedImage } from '../middleware/upload.js'
import { deleteByPublicId, uploadImageBuffer } from '../services/cloudinaryService.js'
import fs from 'fs/promises'
import path from 'path'

function getStorePath() {
  return path.join(process.cwd(), 'storage', 'promotions.json')
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(getStorePath()), { recursive: true })
}

async function readStore() {
  const filePath = getStorePath()
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    const promotions = Array.isArray(parsed?.promotions) ? parsed.promotions : []
    return { promotions }
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String(e.code) : ''
    if (code === 'ENOENT') return { promotions: [] }
    throw e
  }
}

async function writeStore(store) {
  await ensureStoreDir()
  const filePath = getStorePath()
  const payload = { promotions: Array.isArray(store?.promotions) ? store.promotions : [] }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2))
}

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
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        if (msg.endsWith(' is required')) {
          return res.status(500).json({ success: false, error: msg })
        }
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

    const now = new Date().toISOString()
    const promoId = crypto.randomUUID()

    const normalizedImages = images
      .map((img, i) => {
        const publicId = String(img.public_id ?? img.publicId ?? '').trim()
        const secureUrl = String(img.secure_url ?? img.secureUrl ?? '').trim()
        if (!publicId || !secureUrl) return null
        const mime = normalizeMime(img.mime_type ?? img.mimeType ?? '') || 'image/jpeg'
        const format = img.format ? String(img.format) : null
        const width = typeof img.width === 'number' ? img.width : null
        const height = typeof img.height === 'number' ? img.height : null
        const bytes = typeof img.bytes === 'number' ? img.bytes : null
        const sortOrder = typeof img.sort_order === 'number' ? img.sort_order : typeof img.sortOrder === 'number' ? img.sortOrder : i

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
      .filter(Boolean)

    if (normalizedImages.length === 0) {
      return res.status(400).json({ success: false, error: 'Immagini non valide.' })
    }

    const store = await readStore()
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
    await writeStore({ promotions: [...store.promotions, promotion] })
    return res.status(201).json({ success: true, promotion, images: normalizedImages })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}

export async function deletePromotionImage(req, res) {
  try {
    const id = String(req.params?.id || '').trim()
    if (!id) return res.status(400).json({ success: false, error: 'ID mancante.' })

    const store = await readStore()
    let publicId = null
    for (const p of store.promotions) {
      const found = Array.isArray(p?.images) ? p.images.find((img) => String(img?.id || '') === id) : null
      if (found?.public_id) {
        publicId = found.public_id
        break
      }
    }

    await deleteByPublicId(publicId || id)

    if (publicId) {
      const nextPromotions = store.promotions.map((p) => {
        const imgs = Array.isArray(p?.images) ? p.images : []
        return { ...p, images: imgs.filter((img) => String(img?.id || '') !== id) }
      })
      await writeStore({ promotions: nextPromotions })
    }
    return res.status(200).json({ success: true })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}

export async function deletePromotion(req, res) {
  try {
    const id = String(req.params?.id || '').trim()
    if (!id) return res.status(400).json({ success: false, error: 'ID mancante.' })

    const store = await readStore()
    const promotion = store.promotions.find((p) => String(p?.id || '') === id)
    if (!promotion) return res.status(404).json({ success: false, error: 'Promozione non trovata.' })

    for (const img of promotion.images || []) {
      if (img?.public_id) await deleteByPublicId(img.public_id)
    }

    const nextPromotions = store.promotions.filter((p) => String(p?.id || '') !== id)
    await writeStore({ promotions: nextPromotions })
    return res.status(200).json({ success: true })
  } catch (_err) {
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}
