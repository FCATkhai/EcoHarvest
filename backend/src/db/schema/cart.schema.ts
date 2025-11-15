import { pgTable, integer, serial, text, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.schema'
import { products } from './products'
import { timestamps } from '../helpers'

export const cart = pgTable('cart', {
    id: serial('id').primaryKey(),
    userId: text('user_id')
        .references(() => users.id)
        .notNull(),
    ...timestamps
})

export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    cartId: serial('cart_id').references(() => cart.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
        .references(() => products.id, { onDelete: 'cascade' })
        .notNull(),
    quantity: integer('quantity').notNull(),
    ...timestamps
})

export type Cart = typeof cart.$inferSelect
export type CartItem = typeof cartItems.$inferSelect
