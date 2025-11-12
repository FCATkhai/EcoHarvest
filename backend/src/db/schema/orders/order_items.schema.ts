import { pgTable, integer, serial, uuid } from 'drizzle-orm/pg-core'
import { orders } from './orders.schema'

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id'),
    quantity: integer('quantity'),
    price: integer('price')
})
