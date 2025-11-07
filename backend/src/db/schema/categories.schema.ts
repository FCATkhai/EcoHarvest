import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers'

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name'),
    description: varchar('description'),
    ...timestamps,
    deletedAt: timestamp('deleted_at', { withTimezone: true })
})
