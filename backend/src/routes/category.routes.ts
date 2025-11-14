import { Router } from 'express'
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '@backend/controllers/category'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Tạo danh mục mới
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createCategory)
// Lấy danh sách tất cả danh mục
router.get('/', getAllCategories)
// Cập nhật danh mục
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateCategory)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateCategory)
// Xóa danh mục
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteCategory)

export default router
