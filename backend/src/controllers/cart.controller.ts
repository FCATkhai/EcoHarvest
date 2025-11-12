import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { cart, cartItems, products } from '@backend/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * @route GET api/cart
 * @desc Lấy giỏ hàng của user (tự tạo nếu chưa có)
 * @access Private
 */
export async function getUserCart(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Bạn cần đăng nhập để xem giỏ hàng')
        }

        // Tìm hoặc tạo giỏ hàng cho user
        let [userCart] = await db.select().from(cart).where(eq(cart.userId, userId))

        if (!userCart) {
            ;[userCart] = await db.insert(cart).values({ userId }).returning()
        }
        if (!userCart) {
            res.status(500)
            throw new Error('Không thể tạo giỏ hàng cho người dùng')
        }

        // Lấy danh sách sản phẩm trong giỏ
        const items = await db
            .select({
                id: cartItems.id,
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                name: products.name,
                price: products.price,
                image: products.id // Có thể đổi sang cover image sau
            })
            .from(cartItems)
            .leftJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.cartId, userCart.id))

        res.status(200).json({
            success: true,
            data: {
                cart: userCart,
                items
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route POST api/cart/items
 * @desc Thêm sản phẩm vào giỏ hàng (cộng dồn nếu đã tồn tại)
 * @access Private
 */
export async function addItemToCart(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng')
        }

        const { productId, quantity } = req.body
        if (!productId || !quantity || quantity <= 0) {
            res.status(400)
            throw new Error('Thiếu productId hoặc quantity không hợp lệ')
        }

        // Tìm giỏ hàng hoặc tạo mới
        let [userCart] = await db.select().from(cart).where(eq(cart.userId, userId))
        if (!userCart) {
            ;[userCart] = await db.insert(cart).values({ userId }).returning()
        }
        if (!userCart) {
            res.status(500)
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

            res.status(200).json({
                success: true,
                message: 'Cập nhật số lượng sản phẩm trong giỏ hàng',
                data: updatedItem
            })
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

            res.status(201).json({
                success: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                data: newItem
            })
        }
    } catch (error) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/cart/items/:itemId
 * @desc Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access Private
 */
export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
        const { itemId } = req.params
        const { quantity } = req.body

        if (!quantity || quantity <= 0) {
            res.status(400)
            throw new Error('Số lượng không hợp lệ')
        }

        const [updated] = await db
            .update(cartItems)
            .set({ quantity, updatedAt: new Date() })
            .where(eq(cartItems.id, Number(itemId)))
            .returning()

        if (!updated) {
            res.status(404)
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng')
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm trong giỏ hàng thành công',
            data: updated
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route DELETE api/cart/items/:itemId
 * @desc Xóa 1 sản phẩm khỏi giỏ hàng
 * @access Private
 */
export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
        const { itemId } = req.params

        const deleted = await db
            .delete(cartItems)
            .where(eq(cartItems.id, Number(itemId)))
            .returning()

        if (!deleted.length) {
            res.status(404)
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng')
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route DELETE api/cart
 * @desc Xóa toàn bộ giỏ hàng của user
 * @access Private
 */
export async function clearUserCart(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Bạn cần đăng nhập để xóa giỏ hàng')
        }

        const [userCart] = await db.select().from(cart).where(eq(cart.userId, userId))
        if (!userCart) {
            res.status(404)
            throw new Error('Giỏ hàng không tồn tại')
        }

        await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id))

        res.status(200).json({
            success: true,
            message: 'Đã xóa toàn bộ sản phẩm trong giỏ hàng'
        })
    } catch (error) {
        next(error)
    }
}
