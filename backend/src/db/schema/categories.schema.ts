import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name'),
    description: varchar('description'),
    createdAt: timestamp('created_at'),
    deletedAt: timestamp('deleted_at')
})
