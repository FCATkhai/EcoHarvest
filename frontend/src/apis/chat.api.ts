import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { ChatSession, ChatMessage } from '@/types/schema.type'

// Base path (axios instance already prefixes /api)
// Backend routes mount chat controller under '/api/chats'
const API_URL = '/chats'

export interface SendMessageDto {
    sessionId?: string | null
    content: string
    sender?: 'user' | 'assistant' | string
    metadata?: any
}

export const chatApi = {
    // POST /api/chat/sessions
    async createSession() {
        const res = await axios.post<ApiResponse<ChatSession>>(`${API_URL}/sessions`)
        return res.data
    },

    // GET /api/chat/sessions
    async getSessions() {
        const res = await axios.get<ApiResponse<ChatSession[]>>(`${API_URL}/sessions`)
        return res.data
    },

    // GET /api/chat/sessions/:id -> returns { session, messages }
    async getSessionById(id: string) {
        const res = await axios.get<ApiResponse<{ session: ChatSession; messages: ChatMessage[] }>>(
            `${API_URL}/sessions/${id}`
        )
        return res.data.data
    },

    // POST /api/chat/messages -> send a message (backend will call AI and return bot message)
    async sendMessage(payload: SendMessageDto) {
        const res = await axios.post<ApiResponse<{ botMessage: ChatMessage; sessionId: string }>>(
            `${API_URL}/messages`,
            payload
        )
        return res.data
    },

    // GET /api/chat/messages/:sessionId
    async getMessages(sessionId: string) {
        const res = await axios.get<ApiResponse<ChatMessage[]>>(`${API_URL}/messages/${sessionId}`)
        return res.data
    },

    // DELETE /api/chat/sessions/:id
    async deleteSession(id: string) {
        const res = await axios.delete<ApiResponse<{}>>(`${API_URL}/sessions/${id}`)
        return res.data
    }
}

export default chatApi
