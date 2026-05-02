import express from 'express'
import carouselRoutes from './routes/carouselRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/healthz', (_req, res) => res.status(200).send('ok'))
app.use(carouselRoutes)
app.use(promotionRoutes)

app.use((err, _req, res, _next) => {
  const status = typeof err?.statusCode === 'number' ? err.statusCode : err?.code === 'LIMIT_FILE_SIZE' ? 400 : 500
  const message =
    status === 400
      ? err?.message || 'Richiesta non valida.'
      : 'Errore interno.'
  res.status(status).json({ success: false, error: message })
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log(`Carousel API listening on :${port}`)
})
