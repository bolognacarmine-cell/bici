const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

function sendValidationErrors(req, res) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return false
  return res.status(400).json({ errors: errors.array() })
}

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET in environment')
  return jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, secret, { expiresIn: '7d' })
}

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const invalid = sendValidationErrors(req, res)
      if (invalid) return

      const email = String(req.body.email).toLowerCase().trim()
      const password = String(req.body.password)

      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' })
      }

      const user = await User.create({ email, password })
      const token = signToken(user)

      res.status(201).json({
        token,
        user: { id: user._id, email: user.email, role: user.role },
      })
    } catch (err) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  async (req, res) => {
    try {
      const invalid = sendValidationErrors(req, res)
      if (invalid) return

      const email = String(req.body.email).toLowerCase().trim()
      const password = String(req.body.password)

      const user = await User.findOne({ email })
      if (!user) return res.status(401).json({ error: 'Invalid credentials' })

      const ok = await user.comparePassword(password)
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

      const token = signToken(user)
      res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } })
    } catch (_err) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id email role createdAt')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.status(200).json({ user })
  } catch (_err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

