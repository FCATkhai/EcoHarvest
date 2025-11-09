import { pgTable, integer, serial, text, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.schema'
import { products } from './product'
import { timestamps } from '../helpers'

export const cart = pgTable('cart', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.id),
    ...timestamps
})

export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    cartId: serial('cart_id').references(() => cart.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    quantity: integer('quantity'),
    ...timestamps
})
