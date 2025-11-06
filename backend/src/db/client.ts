import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

const client = postgres(process.env.SUPABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
