import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { uploadCarouselMedia } from '../controllers/carouselController.js'

const router = Router()

router.post('/api/carousel/upload', upload.single('file'), uploadCarouselMedia)

export default router

