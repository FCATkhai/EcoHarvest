import { pgTable, integer, uuid } from 'drizzle-orm/pg-core'
import { orderStatus } from '../enums'
import { profiles } from '../profiles.schema'
import { timestamps } from '../../helpers'

export const orders = pgTable('orders', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => profiles.id),
    total: integer('total'),
    status: orderStatus('status'),
    ...timestamps
})
