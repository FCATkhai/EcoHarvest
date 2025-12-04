import { Router } from 'express'
import {
    createChatSession,
    getUserChatSessions,
    getChatSessionById,
    createChatMessage,
    getMessagesBySession,
    deleteChatSession
} from '@backend/controllers/chat.controller'
import { authorize } from '@backend/middleware/auth.middleware'
import { USER_GROUPS } from '@backend/constants/userRoles'

const router = Router()

// Tạo phiên trò chuyện mới
router.post('/sessions', authorize(USER_GROUPS.ALL_USERS), createChatSession)
// Lấy danh sách phiên trò chuyện của người dùng
router.get('/sessions', authorize(USER_GROUPS.ALL_USERS), getUserChatSessions)
// Lấy thông tin chi tiết của một phiên trò chuyện
router.get('/sessions/:id', authorize(USER_GROUPS.ALL_USERS), getChatSessionById)
// Tạo tin nhắn mới trong phiên trò chuyện
router.post('/messages', authorize(USER_GROUPS.ALL_USERS), createChatMessage)
// Lấy danh sách tin nhắn trong phiên trò chuyện
router.get('/messages/:sessionId', authorize(USER_GROUPS.ALL_USERS), getMessagesBySession)
// Xóa phiên trò chuyện
router.delete('/sessions/:id', authorize(USER_GROUPS.ALL_USERS), deleteChatSession)

export default router
