import { Router } from 'express'
import { uploadLenientMulti } from '../middleware/upload.js'
import { createPromotion, deletePromotion, deletePromotionImage, uploadPromotionImages } from '../controllers/promotionController.js'

const router = Router()

router.post('/api/promotions/upload-images', uploadLenientMulti.array('files', 20), uploadPromotionImages)
router.post('/api/promotions', createPromotion)
router.delete('/api/promotions/image/:id', deletePromotionImage)
router.delete('/api/promotions/:id', deletePromotion)

export default router

