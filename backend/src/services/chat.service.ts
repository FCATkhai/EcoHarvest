import { db } from '@backend/db/client'
import { chatMessages, chatSessions } from '../db/schema/chat.schema'
import { eq, asc } from 'drizzle-orm'

class ChatService {
    // lấy tất cả message của một phiên chat
    async getMessagesBySessionId(sessionId: string) {
        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sessionId))
            .orderBy(asc(chatMessages.createdAt))
        return messages
    }
}

export const chatService = new ChatService()
