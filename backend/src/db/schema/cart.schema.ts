import { pgTable, integer, serial, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles.schema'
import { products } from './products.schema'
import { timestamps } from '../helpers'

export const cart = pgTable('cart', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => profiles.id),
    ...timestamps
})

export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    cartId: serial('cart_id').references(() => cart.id),
    productId: uuid('product_id').references(() => products.id),
    quantity: integer('quantity'),
    ...timestamps
})
