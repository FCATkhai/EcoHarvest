import { pgTable, serial, integer, varchar, smallint, timestamp, uuid } from 'drizzle-orm/pg-core'
import { subCategories } from '../categories/sub_categories.schema'
import { timestamps } from '../../helpers'

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name').notNull(),
    description: varchar('description'),
    categoryId: serial('category_id').references(() => subCategories.id, { onDelete: 'set null' }),
    price: integer('price').default(0),
    unit: varchar('unit'), // don vi tinh
    quantity: integer('quantity').default(0).notNull(),
    sold: integer('sold').default(0).notNull(),
    origin: varchar('origin'), // noi san xuat
    status: smallint('status').default(1).notNull(), // 0 - ngung kinh doanh, 1 - kich hoat
    isDeleted: smallint('is_deleted').default(0).notNull(), // 0 - khong xoa, 1 - da xoa
    ...timestamps,
    deletedAt: timestamp('deleted_at', { withTimezone: true })
})

export type Product = typeof products.$inferSelect
