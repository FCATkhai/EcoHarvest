import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core'
import { roleName } from './enums'

export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: roleName('name')
})
