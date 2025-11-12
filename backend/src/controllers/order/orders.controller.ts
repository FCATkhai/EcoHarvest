import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { orders, orderItems, paymentDetails } from '@backend/db/schema/'
import { eq, and } from 'drizzle-orm'
import BatchService from '@backend/services/batch.service'

/**
 * @route POST api/orders
 * @desc Tạo đơn hàng mới (kèm order items và payment)
 * @access Private (customer)
 */
export async function createOrder(req: Request, res: Response, next: NextFunction) {
    const trx = db.transaction(async (tx) => {
        try {
            const userId = req.user.id
            const { items, total, paymentMethod } = req.body

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('Đơn hàng không có sản phẩm')
            }

            // 1) Tạo order
            const orderRows = await tx.insert(orders).values({ userId, total, status: 'pending' }).returning()

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

            return { order: newOrder, payment: newPayment }
        } catch (error) {
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

        const query =
            role === 'admin' ? db.select().from(orders) : db.select().from(orders).where(eq(orders.userId, userId))

        const result = await query
        res.status(200).json({ success: true, data: result })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/orders/:id
 * @desc Lấy chi tiết đơn hàng (bao gồm items và payment)
 * @access Private (admin hoặc chính chủ)
 */
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

        // Kiểm tra quyền
        if (role !== 'admin' && order.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập đơn hàng này' })
        }

        // Lấy chi tiết items + payment
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
        const [payment] = await db.select().from(paymentDetails).where(eq(paymentDetails.orderId, id))

        res.status(200).json({
            success: true,
            data: { order, items, payment }
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
 * @route PUT/PATCH api/payments/:orderId/status
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
