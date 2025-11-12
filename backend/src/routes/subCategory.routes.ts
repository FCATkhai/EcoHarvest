import { Router } from 'express'
import {
    createSubCategory,
    getAllSubCategories,
    updateSubCategory,
    deleteSubCategory
} from '@backend/controllers/category'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '~/shared/userRoles'

const router = Router()

// Tạo danh mục con mới
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createSubCategory)
// Lấy danh sách tất cả danh mục con
router.get('/', getAllSubCategories)
// Cập nhật danh mục con
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateSubCategory)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateSubCategory)
// Xóa danh mục con
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteSubCategory)

export default router
