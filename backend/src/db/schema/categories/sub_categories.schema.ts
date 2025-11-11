import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { categories } from './categories.schema'
import { timestamps } from '../../helpers'

export const subCategories = pgTable('sub_categories', {
    id: serial('id').primaryKey(),
    parentId: serial('parent_id').references(() => categories.id),
    name: varchar('name'),
    description: varchar('description'),
    ...timestamps
})
