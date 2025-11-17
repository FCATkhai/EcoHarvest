import { db } from '@backend/db/client'
import { cart, cartItems } from '@backend/db/schema'
import { eq, inArray, and } from 'drizzle-orm'

//TODO: dùng using trong PostgreSQL cho delete có join, tiết kiệm 1 truy vấn
class CartService {
    async deleteCartItemsByIds(userId: string, cartItemIds: number[]) {
        if (!userId) {
            throw new Error('User ID is required')
        }
        if (!cartItemIds || cartItemIds.length === 0) {
            throw new Error('No cart item IDs provided')
        }

        // Step 1: Verify cart items belong to the user
        const authorizedItems = await db
            .select({ cartItemId: cartItems.id })
            .from(cartItems)
            .innerJoin(cart, eq(cartItems.cartId, cart.id))
            .where(and(inArray(cartItems.id, cartItemIds), eq(cart.userId, userId)))

        if (authorizedItems.length === 0) {
            throw new Error('No cart items found for this user')
        }

        const authorizedItemIds = authorizedItems.map((item) => item.cartItemId)

        // Step 2: Delete only authorized cart items
        const result = await db.delete(cartItems).where(inArray(cartItems.id, authorizedItemIds))

        return {
            success: true,
            deletedCount: result.length
        }
    }
}

export default new CartService()
