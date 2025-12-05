import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { cart, cartItems, products, productImages } from '@backend/db/schema'
import { eq, and, or } from 'drizzle-orm'
import cartService from '@backend/services/cart.service'

/**
 * @route GET api/cart
 * @desc Lấy giỏ hàng của user (tự tạo nếu chưa có)
 * @access Private
 */
//TODO: pagination nếu có nhiều item, viết thành service riêng, viết lại query hợp lý hơn
export async function getUserCart(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401)
            throw new Error('Bạn cần đăng nhập để xem giỏ hàng')
        }

        const { userCart, items } = await cartService.getCartByUserId(userId)

        // Gắn ảnh primary cho mỗi sản phẩm, tránh N+1 bằng một truy vấn tổng hợp
        const productIds = items.map((i) => i.productId).filter((id): id is string => !!id)
        let itemsWithImages = items
        if (productIds.length) {
            const imgConds = productIds.map((id) => eq(productImages.productId, id))
            const whereCond =
                imgConds.length === 1
                    ? and(eq(productImages.isPrimary, true), imgConds[0])
                    : and(eq(productImages.isPrimary, true), or(...imgConds))
            const primaryImages = await db.select().from(productImages).where(whereCond)
            const imgMap = new Map<string, string>()
            for (const img of primaryImages) {
                if (img.productId) imgMap.set(img.productId, img.imageUrl)
            }
            itemsWithImages = items.map((it) => ({ ...it, image: imgMap.get(it.productId ?? '') || null }))
        }

        res.status(200).json({
            success: true,
            data: {
                cart: userCart,
                items: itemsWithImages
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

        const addedCartItem = await cartService.addItemToCart(userId, productId, quantity)
        if (!addedCartItem) {
            res.status(500)
            throw new Error('Không thể thêm sản phẩm vào giỏ hàng')
        }
        res.status(200).json({
            success: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            data: addedCartItem
        })
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

//--------------------------------
// ai agent routes handled in ai-agent service
//--------------------------------
/**
 * @route GET api/agent/cart
 * @desc Lấy giỏ hàng của user bằng ai agent (tự tạo nếu chưa có)
 * @access AI Agent Private
 */
export async function aiGetUserCart(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.body
        if (!userId) {
            res.status(400)
            throw new Error('Thiếu userId trong yêu cầu')
        }
        const { userCart, items } = await cartService.getCartByUserId(userId)
        res.status(200).json({
            success: true,
            data: {
                cart: userCart,
                items: items
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * @route POST api/agent/cart/items
 * @desc Thêm sản phẩm vào giỏ hàng (cộng dồn nếu đã tồn tại)
 * @access AI Agent Private
 */
export async function aiAddItemToCart(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, productId, quantity } = req.body
        if (!userId || !productId || !quantity || quantity <= 0) {
            res.status(400)
            throw new Error('Thiếu userId, productId hoặc quantity không hợp lệ trong yêu cầu')
        }
        const addedCartItem = await cartService.addItemToCart(userId, productId, quantity)
        if (!addedCartItem) {
            res.status(500)
            throw new Error('Không thể thêm sản phẩm vào giỏ hàng')
        }
        res.status(200).json({
            success: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            data: addedCartItem
        })
    } catch (error) {
        next(error)
    }
}
