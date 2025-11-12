import { Router } from 'express'
import { updatePaymentStatus } from '@backend/controllers/order'
const router = Router()

router.put('/:orderId/status', updatePaymentStatus)
router.patch('/:orderId/status', updatePaymentStatus)

export default router
