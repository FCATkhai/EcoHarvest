import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: 'http://localhost:5000',
    plugins: [
        inferAdditionalFields({
            user: {
                role: {
                    type: 'string'
                }
            }
        })
    ]
})
