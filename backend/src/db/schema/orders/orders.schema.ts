import { pgTable, integer, uuid, text } from 'drizzle-orm/pg-core'
import { orderStatus } from '../enums'
import { users } from '../users.schema'
import { timestamps } from '../../helpers'

export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id),
    total: integer('total'),
    status: orderStatus('status').default('pending').notNull(),
    ...timestamps
})
