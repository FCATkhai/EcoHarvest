import { Router } from 'express'
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    updatePaymentStatus
} from '@backend/controllers/order'
import { USER_GROUPS } from '@backend/constants/userRoles'
import { authorize, ownershipAuthorize } from '@backend/middleware/auth.middleware'
const router = Router()

//TODO: phân lại quyền sao cho hợp lý hơn
router.post('/', authorize(USER_GROUPS.ALL_USERS), createOrder)
router.get('/', authorize(USER_GROUPS.ALL_USERS), getAllOrders)
router.get('/:id', authorize(USER_GROUPS.ALL_USERS), getOrderById)
router.put('/:id/status', authorize(USER_GROUPS.ALL_USERS), updateOrderStatus)
router.patch('/:id/status', authorize(USER_GROUPS.ALL_USERS), updateOrderStatus)

router.put('/payments/:orderId/status', authorize(USER_GROUPS.ALL_USERS), updatePaymentStatus)
router.patch('/payments/:orderId/status', authorize(USER_GROUPS.ALL_USERS), updatePaymentStatus)

router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteOrder)

export default router
