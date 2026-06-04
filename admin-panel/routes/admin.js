const express = require('express')

const auth = require('../middleware/auth')
const Product = require('../models/Product')
const Order = require('../models/Order')

const router = express.Router()

router.get('/stats', auth, async (_req, res) => {
  try {
    const [productsTotal, ordersTotal, revenueAgg] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' } } }]),
    ])

    const revenue = Array.isArray(revenueAgg) && revenueAgg.length > 0 ? Number(revenueAgg[0].revenue || 0) : 0

    res.status(200).json({
      productsTotal,
      ordersTotal,
      revenue,
    })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/ping', auth, (_req, res) => {
  res.status(200).json({ ok: true })
})

module.exports = router

