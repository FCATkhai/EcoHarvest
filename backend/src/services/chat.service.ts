import { db } from '@backend/db/client'
import { chatMessages, chatSessions } from '../db/schema/chat.schema'
import { eq, desc } from 'drizzle-orm'

class ChatService {
    // lấy tất cả message của một phiên chat
    async getMessagesBySessionId(sessionId: string) {
        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sessionId))
            .orderBy(desc(chatMessages.createdAt))
        return messages
    }
}

export const chatService = new ChatService()
