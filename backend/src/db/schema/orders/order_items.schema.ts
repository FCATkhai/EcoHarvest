import { pgTable, integer, serial, uuid } from 'drizzle-orm/pg-core'
import { orders } from './orders.schema'
import { products } from '@backend/db/schema'

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    quantity: integer('quantity'),
    price: integer('price')
})

export type OrderItem = typeof orderItems.$inferSelect
