import { Router } from 'express'
import { createBatch, getAllBatches, getBatchById, updateBatch, deleteBatch } from '@backend/controllers/batch'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Tạo lô hàng mới
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createBatch)
// Lấy danh sách tất cả lô hàng
router.get('/', authorize(USER_GROUPS.ADMINS_ONLY), getAllBatches)
// Lấy thông tin lô hàng theo id
router.get('/:id', authorize(USER_GROUPS.ADMINS_ONLY), getBatchById)
// Cập nhật lô hàng
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateBatch)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateBatch)
// Xóa lô hàng
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteBatch)

export default router
