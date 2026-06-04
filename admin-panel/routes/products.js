const express = require('express')
const { body, param, query, validationResult } = require('express-validator')

const Product = require('../models/Product')
const auth = require('../middleware/auth')
const cloudinary = require('../utils/cloudinary')

const router = express.Router()

function sendValidationErrors(req, res) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return false
  return res.status(400).json({ errors: errors.array() })
}

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    try {
      const invalid = sendValidationErrors(req, res)
      if (invalid) return

      const page = Number(req.query.page || 1)
      const limit = Number(req.query.limit || 12)
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

      const filter = {}
      if (q) {
        filter.$or = [{ name: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }]
      }

      const [items, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter),
      ])

      res.status(200).json({
        items,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      })
    } catch (_err) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

router.get('/:id', [param('id').isMongoId()], async (req, res) => {
  try {
    const invalid = sendValidationErrors(req, res)
    if (invalid) return

    const item = await Product.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Product not found' })
    res.status(200).json({ item })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty().escape(),
    body('description').optional().isString().trim().escape(),
    body('price').isFloat({ gt: 0 }).toFloat(),
    body('category').optional().isString().trim().escape(),
    body('stock').optional().isInt({ min: 0 }).toInt(),
    body('active').optional().isBoolean().toBoolean(),
    body('images').optional().isArray(),
    body('images.*.public_id').optional().isString().trim(),
    body('images.*.url').optional().isString().trim().isURL(),
  ],
  async (req, res) => {
    try {
      const invalid = sendValidationErrors(req, res)
      if (invalid) return

      const payload = {
        name: req.body.name,
        description: req.body.description ?? '',
        price: req.body.price,
        category: req.body.category ?? '',
        stock: req.body.stock ?? 0,
        active: typeof req.body.active === 'boolean' ? req.body.active : true,
        images: Array.isArray(req.body.images) ? req.body.images : [],
      }

      const created = await Product.create(payload)
      res.status(201).json({ item: created })
    } catch (_err) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().notEmpty().escape(),
    body('description').optional().isString().trim().escape(),
    body('price').optional().isFloat({ gt: 0 }).toFloat(),
    body('category').optional().isString().trim().escape(),
    body('stock').optional().isInt({ min: 0 }).toInt(),
    body('active').optional().isBoolean().toBoolean(),
    body('images').optional().isArray(),
    body('images.*.public_id').optional().isString().trim(),
    body('images.*.url').optional().isString().trim().isURL(),
  ],
  async (req, res) => {
    try {
      const invalid = sendValidationErrors(req, res)
      if (invalid) return

      const update = {}
      for (const key of ['name', 'description', 'price', 'category', 'stock', 'active', 'images']) {
        if (req.body[key] !== undefined) update[key] = req.body[key]
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      if (!updated) return res.status(404).json({ error: 'Product not found' })

      res.status(200).json({ item: updated })
    } catch (_err) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

router.delete('/:id', auth, [param('id').isMongoId()], async (req, res) => {
  try {
    const invalid = sendValidationErrors(req, res)
    if (invalid) return

    const item = await Product.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Product not found' })

    const images = Array.isArray(item.images) ? item.images : []
    await Product.deleteOne({ _id: item._id })

    const destroyTasks = images
      .map((img) => String(img?.public_id ?? '').trim())
      .filter(Boolean)
      .map((publicId) => cloudinary.uploader.destroy(publicId, { invalidate: true }))

    if (destroyTasks.length > 0) {
      await Promise.allSettled(destroyTasks)
    }

    res.status(200).json({ ok: true })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

