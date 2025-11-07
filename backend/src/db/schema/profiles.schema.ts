import { sql } from 'drizzle-orm'
import { pgTable, serial, uuid, text, check } from 'drizzle-orm/pg-core'
import { roles } from './roles.schema'
import { timestamps } from '../helpers'

export const profiles = pgTable(
    'profiles',
    {
        id: uuid('id').primaryKey(),
        roleId: serial('role_id')
            .notNull()
            .references(() => roles.id),
        username: text('username').notNull(),
        ...timestamps
    },
    (table) => [check('username_length_check', sql`char_length(${table.username.name}) between 3 and 100`)]
)

export type InsertProfile = typeof profiles.$inferInsert
export type SelectProfile = typeof profiles.$inferSelect
