import { Router } from 'express'
import { createAddress, getAddressesByUser, updateAddress, deleteAddress } from '../controllers/address.controller'
import { authorize, ownershipAuthorize } from '../middleware/auth.middleware'
import { USER_GROUPS } from '~/shared/userRoles'
const router = Router()

// Tạo địa chỉ mới
router.post('/', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, createAddress)
// Lấy danh sách địa chỉ của user
router.get('/:userId', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, getAddressesByUser)
// Cập nhật địa chỉ
router.put('/:id', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateAddress)
router.patch('/:id', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, updateAddress)
// Xóa địa chỉ
router.delete('/:id', authorize(USER_GROUPS.ALL_USERS), ownershipAuthorize, deleteAddress)

export default router
