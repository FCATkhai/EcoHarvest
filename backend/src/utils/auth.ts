import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/client'
import { users } from '../db/schema'

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg'
    }),
    user: {
        additionalFields: {
            role: {
                type: 'string',
                input: false
            }
        }
    },
    emailAndPassword: {
        enabled: true
    }
})
