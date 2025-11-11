import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/client'
import * as schemas from '@backend/db/schema'

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            ...schemas,
            user: schemas.users
        }
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
        enabled: true,
        minPasswordLength: 3 // for test
    },
    trustedOrigins: ['http://localhost:3000']
})

export type User = typeof auth.$Infer.Session.user
