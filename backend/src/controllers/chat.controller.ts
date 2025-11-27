import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { chatSessions, chatMessages } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { chatService } from '@backend/services/chat.service'
import axios from '@backend/utils/axios'

const AI_URL = process.env.AI_URL || 'http://localhost:8000'
/**
 * @route POST api/chat/sessions
 * @desc Tạo phiên chat mới cho user
 * @access Private
 */
export async function createChatSession(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Chưa đăng nhập')
        }

        const [session] = await db.insert(chatSessions).values({ userId }).returning()

        res.status(201).json({
            success: true,
            message: 'Tạo phiên chat mới thành công',
            data: session
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route GET api/chat/sessions
 * @desc Lấy danh sách các phiên chat của user
 * @access Private
 */
export async function getUserChatSessions(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Chưa đăng nhập')
        }

        const sessions = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.userId, userId))
            .orderBy(desc(chatSessions.createdAt))

        res.status(200).json({
            success: true,
            data: sessions
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route GET api/chat/sessions/:id
 * @desc Lấy chi tiết 1 phiên chat + danh sách tin nhắn
 * @access Private
 */
export async function getChatSessionById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        if (!id) {
            res.status(400)
            throw new Error('Thiếu id phiên chat')
        }
        const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id))

        if (!session) {
            res.status(404)
            throw new Error('Không tìm thấy phiên chat')
        }

        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, id))
            .orderBy(desc(chatMessages.createdAt))

        res.status(200).json({
            success: true,
            data: { session, messages }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route POST api/chat/messages
 * @desc Gửi tin nhắn trong phiên chat (tự tạo session nếu chưa có)
 * @access Private
 */
//TODO: thiết kết hợp lý hơn, logic gọi AI agent ra service riêng
export async function createChatMessage(req: Request, res: Response, next: NextFunction) {
    try {
        let { sessionId, content, sender, metadata } = req.body
        const userId = req.user?.id

        if (!content) {
            res.status(400)
            throw new Error('Thiếu nội dung tin nhắn')
        }

        // Nếu không có sessionId, tự tạo mới
        if (!sessionId) {
            const [newSession] = await db.insert(chatSessions).values({ userId }).returning()
            if (!newSession) {
                res.status(500)
                throw new Error('Không thể tạo phiên chat mới')
            }
            sessionId = newSession.id
        }

        // 📨 Lưu tin nhắn của user vào DB
        const [userMessage] = await db
            .insert(chatMessages)
            .values({
                sessionId,
                sender,
                content,
                metadata: metadata || null
            })
            .returning()

        const historyMessages = await chatService.getMessagesBySessionId(sessionId)
        const history = historyMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }))

        const aiAgentResponse = await axios.post(`${AI_URL}/invoke`, {
            session_id: sessionId,
            user_id: userId,
            message: content,
            // chỉ lấy 10 tin nhắn gần nhất và loại bỏ tin nhắn cuối cùng vì nó là tin nhắn hiện tại
            history: history.slice(Math.max(history.length - 11, 0), -1)
        })

        const assistantMessage = aiAgentResponse.data.reply
        const [botMessage] = await db
            .insert(chatMessages)
            .values({
                sessionId,
                sender: 'assistant',
                content: assistantMessage,
                metadata: aiAgentResponse.data.metadata || null
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Tin nhắn đã được gửi thành công',
            data: {
                botMessage,
                sessionId
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route GET api/chat/messages/:sessionId
 * @desc Lấy tất cả tin nhắn trong 1 phiên chat
 * @access Private
 */
export async function getMessagesBySession(req: Request, res: Response, next: NextFunction) {
    try {
        const { sessionId } = req.params
        if (!sessionId) {
            res.status(400)
            throw new Error('Thiếu sessionId')
        }

        const messages = await chatService.getMessagesBySessionId(sessionId)

        res.status(200).json({
            success: true,
            data: messages
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route DELETE api/chat/sessions/:id
 * @desc Xóa 1 phiên chat và toàn bộ tin nhắn
 * @access Private
 */
export async function deleteChatSession(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        if (!id) {
            res.status(400)
            throw new Error('Thiếu id phiên chat')
        }

        await db.delete(chatSessions).where(eq(chatSessions.id, id))

        res.status(200).json({
            success: true,
            message: 'Đã xóa phiên chat và các tin nhắn liên quan'
        })
    } catch (error) {
        next(error)
    }
}
