const express = require('express')
const multer = require('multer')
const { param, validationResult } = require('express-validator')

const auth = require('../middleware/auth')
const cloudinary = require('../utils/cloudinary')

const router = express.Router()

function sendValidationErrors(req, res) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return false
  return res.status(400).json({ errors: errors.array() })
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image files are allowed'))
  },
})

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
    stream.end(buffer)
  })
}

router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing image file' })
    const folder = process.env.CLOUDINARY_FOLDER || 'admin-panel'

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
    })

    res.status(201).json({ image: { public_id: result.public_id, url: result.secure_url } })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/images', auth, upload.array('images', 10), async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0) return res.status(400).json({ error: 'Missing image files' })
    const folder = process.env.CLOUDINARY_FOLDER || 'admin-panel'

    const uploads = files.map((f) =>
      uploadBufferToCloudinary(f.buffer, { folder, resource_type: 'image' }).then((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
      }))
    )

    const images = await Promise.all(uploads)
    res.status(201).json({ images })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/image/:public_id(*)', auth, [param('public_id').isString().trim().notEmpty()], async (req, res) => {
  try {
    const invalid = sendValidationErrors(req, res)
    if (invalid) return

    const publicId = String(req.params.public_id)
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true })
    res.status(200).json({ result })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

