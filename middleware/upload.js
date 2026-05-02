import multer from 'multer'
import path from 'path'

export const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif'])
export const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/pjpeg'])

function isAllowed(file) {
  const mime = String(file?.mimetype || '').toLowerCase()
  const ext = path.extname(String(file?.originalname || '')).toLowerCase()
  if (mime === 'image/jfif') return true
  if (ALLOWED_MIMES.has(mime)) return true
  if (ALLOWED_EXTS.has(ext)) return true
  return false
}

export const uploadStrictSingle = multer({
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

export const uploadLenientMulti = multer({
  storage: multer.memoryStorage(),
  limits: { files: 20 },
})

export function isAllowedImage(file) {
  return isAllowed(file)
}
