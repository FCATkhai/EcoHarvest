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
router.post('/', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, createOrder)
router.get('/', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, getAllOrders)
router.get('/:id', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, getOrderById)
router.put('/:id/status', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateOrderStatus)
router.patch('/:id/status', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateOrderStatus)

router.put('/payments/:orderId/status', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updatePaymentStatus)
router.patch('/payments/:orderId/status', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updatePaymentStatus)

router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteOrder)

export default router
