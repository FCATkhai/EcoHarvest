import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { categories } from './categories.schema'

export const subCategories = pgTable('sub_categories', {
    id: serial('id').primaryKey(),
    parentId: serial('parent_id').references(() => categories.id),
    name: varchar('name'),
    description: varchar('description'),
    createdAt: timestamp('created_at'),
    deletedAt: timestamp('deleted_at')
})
