import { pgTable, integer, serial, uuid } from 'drizzle-orm/pg-core'
import { paymentStatus } from '../enums'
import { orders } from './orders.schema'
import { timestamps } from '../../helpers'

export const paymentDetails = pgTable('payment_details', {
    id: serial('id').primaryKey(),
    orderId: uuid('order_id').references(() => orders.id),
    amount: integer('amount'),
    status: paymentStatus('status'),
    ...timestamps
})
