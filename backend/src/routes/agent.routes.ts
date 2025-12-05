import { Router } from 'express'
import { aiGetUserCart, aiAddItemToCart } from '@backend/controllers/cart.controller'
import { aiAgentAuthorize } from '@backend/middleware/auth.middleware'

const router = Router()

// Lấy giỏ hàng của user bằng ai agent (tự tạo nếu chưa có)
router.get('/cart', aiAgentAuthorize, aiGetUserCart)
// Thêm sản phẩm vào giỏ hàng (cộng dồn nếu đã tồn tại)
router.post('/cart/items', aiAgentAuthorize, aiAddItemToCart)

export default router
