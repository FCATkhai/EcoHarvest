import { Router } from 'express'
import { addBatchDocument, getBatchDocuments, deleteBatchDocument } from '@backend/controllers/batch'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '~/shared/userRoles'

const router = Router()

// Thêm chứng từ / tài liệu cho lô hàng
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), addBatchDocument)
// Lấy danh sách tài liệu của lô hàng
router.get('/:batchId', getBatchDocuments)
// Xóa tài liệu của lô hàng
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteBatchDocument)

export default router
