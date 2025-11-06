import { pgTable, integer, serial, timestamp } from 'drizzle-orm/pg-core'
import { paymentStatus } from './enums'
import { orders } from './orders.schema'
import { timestamps } from '../helpers'

export const paymentDetails = pgTable('payment_details', {
    id: serial('id').primaryKey(),
    orderId: serial('order_id').references(() => orders.id),
    amount: integer('amount'),
    status: paymentStatus('status'),
    ...timestamps
})
