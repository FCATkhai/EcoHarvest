import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { categories } from './categories.schema'
import { timestamps } from '../../helpers'

export const subCategories = pgTable('sub_categories', {
    id: serial('id').primaryKey(),
    parentId: serial('parent_id').references(() => categories.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    description: varchar('description'),
    ...timestamps
})

export type SubCategories = typeof subCategories.$inferSelect
