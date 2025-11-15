import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../../helpers'

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    description: varchar('description'),
    ...timestamps
})

export type Categories = typeof categories.$inferSelect
