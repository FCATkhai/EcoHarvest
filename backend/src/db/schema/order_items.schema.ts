import { pgTable, integer, serial } from 'drizzle-orm/pg-core'
import { orders } from './orders.schema'

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: serial('order_id').references(() => orders.id),
    productId: integer('product_id'),
    quantity: integer('quantity'),
    price: integer('price')
})
