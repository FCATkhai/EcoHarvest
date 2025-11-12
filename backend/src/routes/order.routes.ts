import { Router } from 'express'
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder } from '@backend/controllers/order'

const router = Router()

router.post('/', createOrder)
router.get('/', getAllOrders)
router.get('/:id', getOrderById)
router.put('/:id/status', updateOrderStatus)
router.patch('/:id/status', updateOrderStatus)
router.delete('/:id', deleteOrder)

export default router
