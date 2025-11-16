import { Router } from 'express'

import { addProductImage, getProductImages, deleteProductImage } from '@backend/controllers/product'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Thêm ảnh cho sản phẩm
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), addProductImage)
// Lấy danh sách ảnh của sản phẩm
router.get('/:productId', getProductImages)

// Xóa ảnh sản phẩm
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteProductImage)
export default router
