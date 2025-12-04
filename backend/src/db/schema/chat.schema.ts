import { pgTable, varchar, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const chatSessions = pgTable('chat_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'set null' })
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
        .references(() => chatSessions.id, { onDelete: 'cascade' })
        .notNull(),
    sender: varchar('sender', { length: 10 }).notNull(), // 'user' | 'assistant'
    metadata: jsonb('metadata'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export type ChatSession = typeof chatSessions.$inferSelect
export type ChatMessage = typeof chatMessages.$inferSelect
