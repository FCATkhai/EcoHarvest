import { Router } from 'express'
import {
    addProductCertification,
    getProductCertifications,
    deleteProductCertification
} from '@backend/controllers/product/productCertification.controller'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Thêm chứng nhận cho sản phẩm
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), addProductCertification)
// Lấy danh sách chứng nhận của sản phẩm
router.get('/:productId', getProductCertifications)
// Xóa chứng nhận của sản phẩm
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteProductCertification)

export default router
