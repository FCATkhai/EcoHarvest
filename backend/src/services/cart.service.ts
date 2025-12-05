import { db } from '@backend/db/client'
import { cart, cartItems, products } from '@backend/db/schema'
import { eq, inArray, and } from 'drizzle-orm'

//TODO: dùng using trong PostgreSQL cho delete có join, tiết kiệm 1 truy vấn
class CartService {
    async getCartByUserId(userId: string) {
        if (!userId) {
            throw new Error('User ID is required')
        }
        // Tìm hoặc tạo giỏ hàng cho user
        let [userCart] = await db.select().from(cart).where(eq(cart.userId, userId))

        if (!userCart) {
            ;[userCart] = await db.insert(cart).values({ userId }).returning()
        }
        if (!userCart) {
            throw new Error('Không thể tạo giỏ hàng cho người dùng')
        }

        // Lấy danh sách sản phẩm trong giỏ (chưa gắn ảnh)
        const items = await db
            .select({
                id: cartItems.id,
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                name: products.name,
                price: products.price
            })
            .from(cartItems)
            .leftJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.cartId, userCart.id))

        return { userCart, items }
    }

    async addItemToCart(userId: string, productId: string, quantity: number) {
        if (!userId) {
            throw new Error('User ID is required to add item to cart')
        }
        // Tìm giỏ hàng hoặc tạo mới
        let [userCart] = await db.select().from(cart).where(eq(cart.userId, userId))
        if (!userCart) {
            ;[userCart] = await db.insert(cart).values({ userId }).returning()
        }
        if (!userCart) {
            throw new Error('Không thể tạo giỏ hàng cho người dùng')
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const [existingItem] = await db
            .select()
            .from(cartItems)
            .where(and(eq(cartItems.cartId, userCart.id), eq(cartItems.productId, productId)))

        if (existingItem) {
            // Cộng thêm số lượng
            const newQuantity = existingItem.quantity + quantity
            const [updatedItem] = await db
                .update(cartItems)
                .set({ quantity: newQuantity, updatedAt: new Date() })
                .where(eq(cartItems.id, existingItem.id))
                .returning()
            return updatedItem
        } else {
            // Thêm sản phẩm mới vào giỏ
            const [newItem] = await db
                .insert(cartItems)
                .values({
                    cartId: userCart.id,
                    productId,
                    quantity
                })
                .returning()
            return newItem
        }
    }

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
