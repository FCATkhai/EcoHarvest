import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import chatApi, { type SendMessageDto } from '@/apis/chat.api'
import type { ChatSession, ChatMessage } from '@/types/schema.type'

const CHAT_SESSIONS_KEY = ['chat', 'sessions'] as const
const CHAT_SESSION_KEY = (id: string) => ['chat', 'session', id] as const
const CHAT_MESSAGES_KEY = (sessionId: string) => ['chat', 'messages', sessionId] as const

export function useChatSessions() {
    const queryClient = useQueryClient()

    const sessionsQuery = useQuery({
        queryKey: CHAT_SESSIONS_KEY,
        queryFn: async () => {
            const res = await chatApi.getSessions()
            return res.data
        }
    })

    const createSession = useMutation({
        mutationFn: async () => {
            const res = await chatApi.createSession()
            // res is ApiResponse<ChatSession>, so res.data is ChatSession
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
        }
    })

    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            const res = await chatApi.deleteSession(id)
            return res.data
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
            if (id) queryClient.removeQueries({ queryKey: CHAT_SESSION_KEY(id) })
            if (id) queryClient.removeQueries({ queryKey: CHAT_MESSAGES_KEY(id) })
        }
    })

    return {
        sessions: sessionsQuery.data ?? ([] as ChatSession[]),
        isLoading: sessionsQuery.isLoading,
        isError: sessionsQuery.isError,
        refetch: sessionsQuery.refetch,

        createSession: createSession.mutateAsync,
        deletingSession: deleteSession.mutateAsync,
        creating: createSession.isPending,
        deleting: deleteSession.isPending
    }
}

export function useChatSession(sessionId?: string) {
    const queryClient = useQueryClient()

    const sessionQuery = useQuery({
        queryKey: sessionId ? CHAT_SESSION_KEY(sessionId) : ['chat', 'session', 'undefined'],
        queryFn: async () => {
            if (!sessionId) return null
            const res = await chatApi.getSessionById(sessionId)
            return res
        },
        enabled: !!sessionId
    })

    return {
        sessionData: (sessionQuery.data ?? null) as { session: ChatSession; messages: ChatMessage[] } | null,
        isLoading: sessionQuery.isLoading,
        isError: sessionQuery.isError,
        error: sessionQuery.error,
        refetch: sessionQuery.refetch,

        invalidate: () => {
            if (sessionId) queryClient.invalidateQueries({ queryKey: CHAT_SESSION_KEY(sessionId) })
        }
    }
}

export function useChatMessages(sessionId?: string) {
    const queryClient = useQueryClient()

    const messagesQuery = useQuery({
        queryKey: sessionId ? CHAT_MESSAGES_KEY(sessionId) : ['chat', 'messages', 'undefined'],
        queryFn: async () => {
            if (!sessionId) return [] as ChatMessage[]
            const res = await chatApi.getMessages(sessionId)
            return res.data
        },
        enabled: !!sessionId
    })

    const sendMutation = useMutation({
        mutationFn: async (payload: SendMessageDto) => {
            const res = await chatApi.sendMessage(payload)
            return res.data
        },
        onMutate: async (variables) => {
            // Optimistically add the user's message to the cache
            await queryClient.cancelQueries({
                queryKey: variables?.sessionId
                    ? CHAT_MESSAGES_KEY(String(variables.sessionId))
                    : ['chat', 'messages', 'undefined']
            })

            const key = variables?.sessionId
                ? CHAT_MESSAGES_KEY(String(variables.sessionId))
                : ['chat', 'messages', 'undefined']

            const previous = queryClient.getQueryData<ChatMessage[]>(key)

            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                sessionId: String(variables?.sessionId ?? ''),
                sender: variables?.sender ?? 'user',
                content: variables?.content ?? '',
                metadata: variables?.metadata,
                createdAt: new Date().toISOString()
            }

            queryClient.setQueryData<ChatMessage[]>(key, (old) => {
                const current = old ?? []
                return [...current, tempMessage]
            })

            return { previous, key, tempId: tempMessage.id }
        },
        onError: (_err, _variables, context) => {
            // Rollback to previous messages in case of error
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous ?? [])
            }
        },
        onSuccess: (_data, variables) => {
            // invalidate messages and session list
            if (variables?.sessionId) {
                queryClient.invalidateQueries({ queryKey: CHAT_MESSAGES_KEY(String(variables.sessionId)) })
                queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
                queryClient.invalidateQueries({ queryKey: CHAT_SESSION_KEY(String(variables.sessionId)) })
            }
        },
        onSettled: (_data, _error, variables, _context) => {
            if (variables?.sessionId) {
                queryClient.invalidateQueries({ queryKey: CHAT_MESSAGES_KEY(String(variables.sessionId)) })
            }
        }
    })

    return {
        messages: messagesQuery.data ?? ([] as ChatMessage[]),
        isLoading: messagesQuery.isLoading,
        isError: messagesQuery.isError,
        refetch: messagesQuery.refetch,

        sendMessage: sendMutation.mutateAsync,
        sending: sendMutation.isPending
    }
}

export default useChatMessages
