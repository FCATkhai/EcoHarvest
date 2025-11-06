import { pgTable, serial, integer, varchar, smallint, timestamp, uuid } from 'drizzle-orm/pg-core'
import { subCategories } from './sub_categories.schema'
import { timestamps } from '../helpers'

export const products = pgTable('products', {
    id: uuid('id').primaryKey(),
    name: varchar('name').notNull(),
    description: varchar('description'),
    categoryId: serial('category_id').references(() => subCategories.id),
    price: integer('price').default(0),
    unit: varchar('unit'), // don vi tinh
    quantity: integer('quantity').default(0),
    sold: integer('sold').default(0),
    origin: varchar('origin'), // noi san xuat
    status: smallint('status'), // 0 - ngung kinh doanh, 1 - kich hoat
    ...timestamps,
    deletedAt: timestamp('deleted_at')
})
