import { pgTable, integer, varchar, timestamp, serial, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles.schema'

export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => profiles.id),
    label: varchar('label'),
    province: varchar('province'),
    ward: varchar('ward'),
    detailAddress: varchar('detail_address'),
    createdAt: timestamp('created_at')
})
