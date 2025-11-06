import { pgTable, integer, varchar, timestamp, uuid } from 'drizzle-orm/pg-core'
import { roles } from './roles.schema'
import { timestamps } from '../helpers'
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey(),
    roleId: varchar('role_id')
        .notNull()
        .references(() => roles.id),
    username: varchar('username'),
    ...timestamps
})

export type InsertProfile = typeof profiles.$inferInsert
export type SelectProfile = typeof profiles.$inferSelect
