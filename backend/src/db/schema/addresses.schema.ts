import { pgTable, varchar, timestamp, serial, text } from 'drizzle-orm/pg-core'
import { users } from './users.schema'
import { timestamps } from '../helpers'

export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    label: varchar('label'),
    province: varchar('province'),
    ward: varchar('ward'),
    detailAddress: varchar('detail_address'),
    ...timestamps
})

export type InsertAddress = typeof addresses.$inferInsert
export type TAddress = typeof addresses.$inferSelect
