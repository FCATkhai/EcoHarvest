import { Router } from 'express'
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '@backend/controllers/product'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '~/shared/userRoles'

const router = Router()

// Tạo sản phẩm mới
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createProduct)
// Lấy danh sách tất cả sản phẩm
router.get('/', getAllProducts)
// Lấy thông tin sản phẩm theo id
router.get('/:id', getProductById)
// Cập nhật thông tin sản phẩm
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateProduct)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateProduct)
// Xóa sản phẩm
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteProduct)

export default router
