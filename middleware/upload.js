import multer from 'multer'
import path from 'path'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif'])
const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/jfif',
  'image/pjpeg',
])

function isAllowed(file) {
  const mime = String(file?.mimetype || '').toLowerCase()
  const ext = path.extname(String(file?.originalname || '')).toLowerCase()
  if (ALLOWED_MIMES.has(mime)) return true
  if (ALLOWED_EXTS.has(ext)) return true
  return false
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowed(file)) {
      const err = new Error('Tipo file non supportato. Carica un’immagine (jpg/jpeg/png/webp/jfif/avif).')
      err.statusCode = 400
      return cb(err)
    }
    cb(null, true)
  },
})

