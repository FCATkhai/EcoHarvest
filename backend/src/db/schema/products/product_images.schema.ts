import { pgTable, serial, integer, varchar, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'
import { products } from './products.schema'

export const productImages = pgTable('product_images', {
    id: serial('id').primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    imageUrl: varchar('image_url').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    altText: varchar('alt_text'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export type ProductImage = typeof productImages.$inferSelect
