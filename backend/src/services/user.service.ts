import { db } from '@backend/db/client'
import { users } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

class UserService {
    async getUserById(userId: string) {
        if (!userId) {
            throw new Error('User ID is required')
        }
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
        if (user.length === 0) {
            throw new Error('No user found with the given ID')
        }
        return user[0]
    }
}

export default new UserService()
