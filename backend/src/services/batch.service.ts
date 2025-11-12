import { db } from '@backend/db/client'
import { batches, orderItems, products } from '../db/schema'
import { eq, sql, asc, desc } from 'drizzle-orm'
//TODO: dùng log để ghi nhận các thay đổi về tồn kho theo lô hàng, giúp cập nhật cancel order... chính xác
// thêm trigger để cập nhật giá trị tổng tồn kho trong bảng products khi có thay đổi trong bảng batches
// chỉnh sửa 
/**
 * BatchService
 * Dịch vụ quản lý tồn kho theo lô hàng
 */
class BatchService {
    /** Đồng bộ lại tổng tồn kho vào bảng products */
    async syncProductQuantity(productId: string) {
        const totalRows =
            (await db
                .select({ total: sql<number>`COALESCE(SUM(${batches.quantityRemaining}), 0)` })
                .from(batches)
                .where(eq(batches.productId, productId))) || []

        const totalQuantity = totalRows[0]?.total || 0

        await db
            .update(products)
            .set({ quantity: totalQuantity, updatedAt: new Date() })
            .where(eq(products.id, productId))

        return totalQuantity
    }

    /**
     * Lấy tổng số lượng tồn kho của 1 sản phẩm
     */
    async getTotalStockByProduct(productId: string) {
        const totalRows = await db
            .select({ total: sql<number>`COALESCE(SUM(${batches.quantityRemaining}), 0)` })
            .from(batches)
            .where(eq(batches.productId, productId))

        const total = totalRows[0]?.total ?? 0
        return total
    }

    /**
     * Tăng / giảm số lượng trong 1 lô hàng cụ thể
     * @param batchId id của lô
     * @param delta số lượng thay đổi (+ tăng, - giảm)
     */
    async updateBatchQuantity(batchId: number, delta: number) {
        const [batch] = await db.select().from(batches).where(eq(batches.id, batchId))
        if (!batch) throw new Error(`Batch ${batchId} không tồn tại`)

        const newQuantity = Math.max(0, batch.quantityRemaining + delta)

        const [updated] = await db
            .update(batches)
            .set({ quantityRemaining: newQuantity, updatedAt: new Date() })
            .where(eq(batches.id, batchId))
            .returning()

        await this.syncProductQuantity(batch.productId)

        return updated
    }

    /**
     * Giảm số lượng tồn kho khi khách hàng đặt hàng
     * FIFO: trừ dần từ các lô hàng cũ nhất
     */
    async deductStockByOrder(productId: string, quantityNeeded: number) {
        const batchList = await db
            .select()
            .from(batches)
            .where(eq(batches.productId, productId))
            .orderBy(asc(batches.importDate))

        if (!batchList.length) {
            throw new Error(`Không còn lô hàng nào cho sản phẩm ${productId}`)
        }

        let remainingToDeduct = quantityNeeded
        const updatedBatches: any[] = []

        for (const batch of batchList) {
            if (remainingToDeduct <= 0) break

            const available = batch.quantityRemaining
            const deductAmount = Math.min(available, remainingToDeduct)
            const newRemaining = available - deductAmount

            const [updated] = await db
                .update(batches)
                .set({ quantityRemaining: newRemaining, updatedAt: new Date() })
                .where(eq(batches.id, batch.id))
                .returning()

            updatedBatches.push({ id: batch.id, deducted: deductAmount })
            remainingToDeduct -= deductAmount
        }

        if (remainingToDeduct > 0) {
            throw new Error(`Không đủ tồn kho cho sản phẩm ${productId} (thiếu ${remainingToDeduct} đơn vị)`)
        }

        await this.syncProductQuantity(productId)

        return {
            success: true,
            message: 'Đã trừ tồn kho thành công',
            updatedBatches
        }
    }

    /**
     * Hoàn kho khi đơn hàng bị hủy
     * - Lấy tất cả sản phẩm trong order
     * - Hoàn lại số lượng vào các lô hàng mới nhất (LIFO)
     */
    async restoreStockAfterCancel(orderId: string) {
        // 1. Lấy danh sách sản phẩm trong đơn hàng
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId))
        if (!items.length) throw new Error(`Đơn hàng ${orderId} không có sản phẩm`)

        const restoredDetails: any[] = []

        for (const item of items) {
            const { productId, quantity } = item
            let remainingToRestore = quantity

            if (productId == null || remainingToRestore == null) continue

            // 2. Lấy các lô hàng gần nhất (mới nhập gần đây nhất)
            const batchList = await db
                .select()
                .from(batches)
                .where(eq(batches.productId, productId))
                .orderBy(desc(batches.importDate))

            if (!batchList.length) continue

            for (const batch of batchList) {
                if (remainingToRestore <= 0) break

                // Hoàn lại hàng vào batch
                const newQuantity = batch.quantityRemaining + remainingToRestore
                const [updated] = await db
                    .update(batches)
                    .set({ quantityRemaining: newQuantity, updatedAt: new Date() })
                    .where(eq(batches.id, batch.id))
                    .returning()

                restoredDetails.push({
                    productId,
                    batchId: batch.id,
                    restored: remainingToRestore
                })

                // Hết hàng cần hoàn
                remainingToRestore = 0
            }
            await this.syncProductQuantity(productId)
        }

        return {
            success: true,
            message: 'Đã hoàn kho thành công sau khi hủy đơn hàng',
            details: restoredDetails
        }
    }
}

export default new BatchService()
