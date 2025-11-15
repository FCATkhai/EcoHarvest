import { Router } from 'express'
import {
    getUserCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearUserCart
} from '@backend/controllers/cart.controller'
import { authorize, ownershipAuthorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Lấy giỏ hàng của người dùng
router.get('/', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, getUserCart)
// Thêm sản phẩm vào giỏ hàng
router.post('/items', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, addItemToCart)
// Cập nhật sản phẩm trong giỏ hàng
router.put('/items/:itemId', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateCartItem)
router.patch('/items/:itemId', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateCartItem)
// Xóa sản phẩm khỏi giỏ hàng
router.delete('/items/:itemId', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, removeCartItem)
// Xóa toàn bộ giỏ hàng của người dùng
router.delete('/', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, clearUserCart)
export default router
