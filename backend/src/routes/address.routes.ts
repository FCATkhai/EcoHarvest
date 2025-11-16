import { Router } from 'express'
import { createAddress, getAddressesByUser, updateAddress, deleteAddress } from '../controllers/address.controller'
import { authorize, ownershipAuthorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'
const router = Router()

// Tạo địa chỉ mới
router.post('/', authorize(USER_GROUPS.ALL_USERS), createAddress)
// Lấy danh sách địa chỉ của user
router.get('/:userId', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, getAddressesByUser)
// Cập nhật địa chỉ
router.put('/:id', authorize(USER_GROUPS.ALL_USERS), updateAddress)
router.patch('/:id', authorize(USER_GROUPS.ALL_USERS), updateAddress)
// Xóa địa chỉ
router.delete('/:id', authorize(USER_GROUPS.ALL_USERS), deleteAddress)

export default router
