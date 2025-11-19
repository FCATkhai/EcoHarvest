import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { orders, orderItems, paymentDetails, products, productImages } from '@backend/db/schema/'
import { eq, and, sql, asc, desc } from 'drizzle-orm'
import BatchService from '@backend/services/batch.service'
import UserService from '@backend/services/user.service'
import CartService from '@backend/services/cart.service'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@backend/constants/order'
import { USER_ROLES } from '@backend/constants/userRoles'

/**
 * @route POST api/orders
 * @desc Tạo đơn hàng mới (kèm order items và payment)
 * @access Private (customer)
 */
export async function createOrder(req: Request, res: Response, next: NextFunction) {
    const trx = db.transaction(async (tx) => {
        let isDeductStock = false
        try {
            const userId = req.user.id
            const { items, total, paymentMethod, deliveryAddress } = req.body

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('Đơn hàng không có sản phẩm')
            }

            if (!deliveryAddress) {
                throw new Error('Địa chỉ giao hàng không được để trống')
            }

            // 1) Tạo order
            const orderRows = await tx
                .insert(orders)
                .values({ userId, total, status: 'pending', deliveryAddress })
                .returning()

            const newOrder = orderRows[0]
            if (!newOrder) throw new Error('Không thể tạo đơn hàng')

            // 2) Thêm các sản phẩm trong đơn hàng
            const orderItemsData = items.map((item: any) => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
            await tx.insert(orderItems).values(orderItemsData)
            // Trừ tồn kho trong các lô hàng
            await Promise.all(
                items.map(async (item: any) => {
                    await BatchService.deductStockByOrder(item.productId, item.quantity)
                })
            )
            isDeductStock = true

            // 3) Thêm thông tin thanh toán
            const paymentRows = await tx
                .insert(paymentDetails)
                .values({
                    orderId: newOrder.id,
                    amount: total,
                    status: 'unpaid',
                    method: paymentMethod || 'COD'
                })
                .returning()

            const newPayment = paymentRows[0]
            if (!newPayment) throw new Error('Không thể tạo thông tin thanh toán')

            // 4) Xoá các sản phẩm đã đặt khỏi giỏ hàng
            //filter những item có cartItemId hợp lệ, bỏ qua những item không có cartItemId
            const cartItemIds = items
                .map((item: any) => item.cartItemId)
                .filter((id: unknown) => typeof id === 'number' && !Number.isNaN(id))

            if (cartItemIds.length) {
                await CartService.deleteCartItemsByIds(userId, cartItemIds as number[])
            }

            return { order: newOrder, payment: newPayment }
        } catch (error) {
            if (isDeductStock) {
                // Rollback tồn kho nếu có lỗi xảy ra sau khi đã trừ
                const items = req.body.items
                await Promise.all(
                    items.map(async (item: any) => {
                        await BatchService.restoreStockByOrder(item.productId, item.quantity)
                    })
                )
            }
            throw error
        }
    })

    try {
        const createOrder = await trx
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: createOrder
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/orders
 * @desc Lấy danh sách đơn hàng (admin thấy tất cả, user chỉ thấy của mình)
 * @access Private (admin, customer)
 */
export async function getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const role = req.user.role
        const userId = req.user.id

        // Query params
        const {
            page = '1',
            limit = '10',
            search = '', // search by order id or user id (admin only also userId)
            order_status = '', // filter order status
            payment_status = '', // filter payment status
            sort_by = 'created_at', // created_at | updated_at
            sort = 'desc' // asc | desc
        } = req.query as Record<string, string>

        const pageNum = Math.max(1, parseInt(page, 10) || 1)
        const limitNum = Math.max(1, parseInt(limit, 10) || 10)
        const offset = (pageNum - 1) * limitNum

        // Build conditions
        const whereConditions: any[] = []

        // Role-based visibility
        if (role !== USER_ROLES.ADMIN) {
            whereConditions.push(eq(orders.userId, userId))
        }

        // Order status filter
        const allowedOrderStatuses = ORDER_STATUSES
        if (order_status && allowedOrderStatuses.includes(order_status as any)) {
            whereConditions.push(eq(orders.status, order_status as any))
        }

        // Payment status filter (requires join)
        const allowedPaymentStatuses = PAYMENT_STATUSES
        const filterPaymentStatus = payment_status && allowedPaymentStatuses.includes(payment_status as any)
        if (filterPaymentStatus) {
            whereConditions.push(eq(paymentDetails.status, payment_status as any))
        }

        // Search (order id or user id / delivery address)
        if (search && search.trim().length > 0) {
            const keyword = `%${search.toLowerCase()}%`
            // Cast uuid to text for LIKE search
            whereConditions.push(
                role === 'admin'
                    ? sql`(lower(${orders.id}::text) LIKE ${keyword} OR lower(${orders.userId}::text) LIKE ${keyword} OR lower(${orders.deliveryAddress}) LIKE ${keyword})`
                    : sql`(lower(${orders.id}::text) LIKE ${keyword} OR lower(${orders.deliveryAddress}) LIKE ${keyword})`
            )
        }

        // Sorting
        const allowedSortFields = ['created_at', 'updated_at']
        const safeSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at'
        const sortColumn = safeSortBy === 'updated_at' ? orders.updatedAt : orders.createdAt
        const orderExpr = sort === 'asc' ? asc(sortColumn) : desc(sortColumn)

        // Base query with left join payment details
        const baseQueryBuilder = db
            .select({
                id: orders.id,
                userId: orders.userId,
                total: orders.total,
                status: orders.status,
                deliveryAddress: orders.deliveryAddress,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                paymentStatus: paymentDetails.status
            })
            .from(orders)
            .leftJoin(paymentDetails, eq(paymentDetails.orderId, orders.id))
            .$dynamic()

        const finalQuery =
            whereConditions.length > 0 ? baseQueryBuilder.where(and(...whereConditions)) : baseQueryBuilder

        const data = await finalQuery.orderBy(orderExpr).limit(limitNum).offset(offset)

        // Count total
        const countQueryBuilder = db
            .select({ count: sql<number>`count(*)` })
            .from(orders)
            .leftJoin(paymentDetails, eq(paymentDetails.orderId, orders.id))
            .$dynamic()

        const finalCountQuery =
            whereConditions.length > 0 ? countQueryBuilder.where(and(...whereConditions)) : countQueryBuilder

        const totalRows = await finalCountQuery
        const total = Number(totalRows[0]?.count || 0)
        const totalPages = Math.ceil(total / limitNum)
        const hasMore = pageNum < totalPages

        res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasMore,
            data
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/orders/:id
 * @desc Lấy chi tiết đơn hàng (bao gồm items và payment)
 * @access Private (admin hoặc chính chủ)
 */
//TODO: lấy ảnh của item trong order
export async function getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const role = req.user.role
        const userId = req.user.id

        if (!id) return res.status(400).json({ success: false, message: 'Missing id' })

        // Lấy thông tin order
        const [order] = await db.select().from(orders).where(eq(orders.id, id))
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
        }

        // Lấy chi tiết items + payment (kèm ảnh chính của sản phẩm nếu có)
        const items = await db
            .select({
                id: orderItems.id,
                orderId: orderItems.orderId,
                productId: orderItems.productId,
                quantity: orderItems.quantity,
                price: orderItems.price,
                imageUrl: productImages.imageUrl
            })
            .from(orderItems)
            .leftJoin(
                productImages,
                and(eq(productImages.productId, orderItems.productId), eq(productImages.isPrimary, true))
            )
            .where(eq(orderItems.orderId, id))
        const [payment] = await db.select().from(paymentDetails).where(eq(paymentDetails.orderId, id))
        const orderOwner = await UserService.getUserById(userId)

        res.status(200).json({
            success: true,
            data: { order, items, payment, orderOwner }
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/orders/:id/status
 * @desc Cập nhật trạng thái đơn hàng (pending → processing → shipped → completed || cancelled)
 * @access Private (admin)
 */
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const { status } = req.body
        if (!id) return res.status(400).json({ success: false, message: 'Missing id' })
        if (!status) return res.status(400).json({ success: false, message: 'Missing status' })

        const [updated] = await db
            .update(orders)
            .set({ status, updatedAt: new Date() })
            .where(eq(orders.id, id))
            .returning()

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
        }
        // Hoàn kho khi hủy đơn
        if (status === 'cancelled') {
            await BatchService.restoreStockAfterCancel(id)
        }
        if (status === 'completed') {
            // Cập nhật số lượng đã bán cho sản phẩm
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
            await Promise.all(
                items.map(async (item) => {
                    //TODO: tạm thời bỏ qua null productId, cần viết lại service riêng để xử lý trường hợp này
                    if (!item.productId) return
                    const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1)
                    if (product.length) {
                        const updatedProduct = product[0]
                        if (!updatedProduct || item.quantity == null || !item.productId) return
                        await db
                            .update(products)
                            .set({
                                sold: updatedProduct.sold + item.quantity,
                                updatedAt: new Date()
                            })
                            .where(eq(products.id, item.productId))
                    }
                })
            )
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: updated
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/orders/payments/:orderId/status
 * @desc Cập nhật trạng thái thanh toán (unpaid → paid/failed → refunded)
 * @access Private (admin)
 */
export async function updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId } = req.params
        const { status } = req.body
        if (!orderId) return res.status(400).json({ success: false, message: 'Missing orderId' })
        if (!status) return res.status(400).json({ success: false, message: 'Missing status' })

        const [updated] = await db
            .update(paymentDetails)
            .set({ status, updatedAt: new Date() })
            .where(eq(paymentDetails.orderId, orderId))
            .returning()

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán cho đơn hàng' })
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công',
            data: updated
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/orders/:id
 * @desc Xóa đơn hàng (cascades sang orderItems và paymentDetails)
 * @access Private (admin)
 */
export async function deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ success: false, message: 'Missing id' })

        const deleted = await db.delete(orders).where(eq(orders.id, id)).returning()

        if (!deleted.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
        }

        res.status(200).json({
            success: true,
            message: 'Đơn hàng đã được xóa thành công'
        })
    } catch (error: unknown) {
        next(error)
    }
}
