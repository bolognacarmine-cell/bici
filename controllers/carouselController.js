import { getCloudinary } from '../config/cloudinary.js'
import fs from 'fs/promises'
import path from 'path'

function getStorePath() {
  return path.join(process.cwd(), 'storage', 'carousel.json')
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(getStorePath()), { recursive: true })
}

async function readStore() {
  const filePath = getStorePath()
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return { items }
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String(e.code) : ''
    if (code === 'ENOENT') return { items: [] }
    throw e
  }
}

async function writeStore(store) {
  await ensureStoreDir()
  const filePath = getStorePath()
  const payload = { items: Array.isArray(store?.items) ? store.items : [] }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2))
}

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

    const now = new Date().toISOString()
    const item = { id: crypto.randomUUID(), ...record, created_at: now }
    const store = await readStore()
    await writeStore({ items: [...store.items, item] })

    return res.status(201).json({ success: true, record: item })
  } catch (err) {
    const msg = err instanceof Error ? err.message : null
    if (msg && msg.endsWith(' is required')) {
      return res.status(500).json({ success: false, error: msg })
    }
    return res.status(500).json({ success: false, error: 'Errore interno.' })
  }
}
