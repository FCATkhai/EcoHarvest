import { pgTable, varchar, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const chatSessions = pgTable('chat_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id),
    sessionId: uuid('session_id').unique(),
    createdAt: timestamp('created_at').defaultNow()
})

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id').references(() => chatSessions.sessionId),
    sender: varchar('sender'),
    metadata: jsonb('metadata'),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow()
})
