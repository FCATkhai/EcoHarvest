import { Router } from 'express'
import {
    createChatSession,
    getUserChatSessions,
    getChatSessionById,
    createChatMessage,
    getMessagesBySession,
    deleteChatSession
} from '@backend/controllers/chat.controller'

const router = Router()

// Tạo phiên trò chuyện mới
router.post('/sessions', createChatSession)
// Lấy danh sách phiên trò chuyện của người dùng
router.get('/sessions', getUserChatSessions)
// Lấy thông tin chi tiết của một phiên trò chuyện
router.get('/sessions/:id', getChatSessionById)
// Tạo tin nhắn mới trong phiên trò chuyện
router.post('/messages', createChatMessage)
// Lấy danh sách tin nhắn trong phiên trò chuyện
router.get('/messages/:id', getMessagesBySession)
// Xóa phiên trò chuyện
router.delete('/sessions/:id', deleteChatSession)

export default router
