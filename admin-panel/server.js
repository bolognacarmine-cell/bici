const path = require('path')

const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const uploadRoutes = require('./routes/upload')
const adminRoutes = require('./routes/admin')

const app = express()

function sanitizeNoSql(value) {
  if (!value || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map(sanitizeNoSql)
  }

  const out = {}
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith('$')) continue
    if (key.includes('.')) continue
    out[key] = sanitizeNoSql(val)
  }
  return out
}

app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeNoSql(req.body)
  if (req.query && typeof req.query === 'object') req.query = sanitizeNoSql(req.query)
  if (req.params && typeof req.params === 'object') req.params = sanitizeNoSql(req.params)
  next()
})

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

const allowedOrigins = String(process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (allowedOrigins.length === 0) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

app.use(express.static(path.join(__dirname, 'public')))

app.use((err, _req, res, _next) => {
  const message = typeof err?.message === 'string' ? err.message : 'Server error'
  const status = message === 'Not allowed by CORS' ? 403 : 500
  res.status(status).json({ error: message })
})

const PORT = Number(process.env.PORT || 5000)

async function start() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
  })
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { app, start }
