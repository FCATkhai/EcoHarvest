import { asc, between, count, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../client'
import { type SelectUser, usersTable } from '../schema/user.schema'

export async function getUsers(): Promise<
    Array<{
        id: string
        updated_at: Date | null
        username: string | null
        full_name: string | null
        avatar_url: string | null
    }>
> {
    return db.select().from(usersTable)
}
