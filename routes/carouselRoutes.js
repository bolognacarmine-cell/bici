import { Router } from 'express'
import { uploadStrictSingle } from '../middleware/upload.js'
import { uploadCarouselMedia } from '../controllers/carouselController.js'

const router = Router()

router.post('/api/carousel/upload', uploadStrictSingle.single('file'), uploadCarouselMedia)

export default router
