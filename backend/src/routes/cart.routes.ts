import { Router } from 'express'
import {
    getUserCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearUserCart
} from '@backend/controllers/cart.controller'

const router = Router()

// Lấy giỏ hàng của người dùng
router.get('/', getUserCart)
// Thêm sản phẩm vào giỏ hàng
router.post('/items', addItemToCart)
// Cập nhật sản phẩm trong giỏ hàng
router.put('/items/:itemId', updateCartItem)
router.patch('/items/:itemId', updateCartItem)
// Xóa sản phẩm khỏi giỏ hàng
router.delete('/items/:itemId', removeCartItem)
// Xóa toàn bộ giỏ hàng của người dùng
router.delete('/', clearUserCart)

export default router
