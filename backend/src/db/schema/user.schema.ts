import { integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('profiles', {
    id: uuid('id').primaryKey(),
    updated_at: timestamp('updated_at'),
    username: text('username'),
    full_name: text('full_name'),
    avatar_url: text('avatar_url')
})

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect
