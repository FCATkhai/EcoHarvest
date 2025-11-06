import { pgEnum } from 'drizzle-orm/pg-core'

export const roleName = pgEnum('role_name', ['admin', 'customer'])
export const orderStatus = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
export const paymentStatus = pgEnum('payment_status', ['unpaid', 'paid', 'failed'])
export const paymentMethod = pgEnum('payment_method', ['bank_transfer', 'COD'])
