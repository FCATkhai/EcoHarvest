import { pgEnum } from 'drizzle-orm/pg-core'

export const roleName = pgEnum('role_name', ['admin', 'customer'])
export const orderStatus = pgEnum('order_status', ['pending', 'processing', 'shipped', 'completed', 'cancelled'])
export const paymentStatus = pgEnum('payment_status', ['unpaid', 'paid', 'failed', 'refunded'])
export const paymentMethod = pgEnum('payment_method', ['bank_transfer', 'COD'])
