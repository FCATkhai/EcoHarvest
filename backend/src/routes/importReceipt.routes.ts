import { Router } from 'express'
import {
    createImportReceipt,
    getAllImportReceipts,
    updateImportReceipt,
    deleteImportReceipt
} from '@backend/controllers/batch'
import { authorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Tạo phiếu nhập hàng mới
router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createImportReceipt)
// Lấy danh sách phiếu nhập hàng
router.get('/', authorize(USER_GROUPS.ADMINS_ONLY), getAllImportReceipts)
// Cập nhật phiếu nhập hàng
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateImportReceipt)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateImportReceipt)
// Xóa phiếu nhập hàng
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteImportReceipt)

export default router
