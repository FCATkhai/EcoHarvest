import { pgTable, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core'
import { roleName } from './enums'

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    role: roleName('role').notNull().default('customer'),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull()
})

// import { sql } from 'drizzle-orm'
// import { pgTable, serial, uuid, text, check, varchar } from 'drizzle-orm/pg-core'
// import { roles } from './roles.schema'
// import { timestamps } from '../helpers'

// export const users = pgTable(
//     'users',
//     {
//         id: uuid('id').primaryKey(),
//         roleId: serial('role_id')
//             .notNull()
//             .references(() => roles.id),
//         username: text('username').notNull(),
//         email: varchar('email', { length: 150 }).unique().notNull(),
//         passwordHash: text('password_hash').notNull(),
//         ...timestamps
//     },
//     (table) => [check('username_length_check', sql`char_length(${table.username.name}) between 3 and 100`)]
// )

export type InsertUser = typeof users.$inferInsert
export type TUser = typeof users.$inferSelect
