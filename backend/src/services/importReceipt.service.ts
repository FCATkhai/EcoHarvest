import { importReceipts, batches } from '@backend/db/schema'
import { db } from '@backend/db/client'
import { eq, sql } from 'drizzle-orm'
class ImportReceiptService {
    // cập nhật tổng tiền theo batchs liên quan
    async updateTotalCost(importReceiptId: number) {
        const totalRows = await db
            .select({ total: sql<number>`COALESCE(SUM(${batches.unitCost} * ${batches.quantityImported}), 0)` })
            .from(batches)
            .where(eq(batches.importReceiptId, importReceiptId))
        const totalCost = totalRows[0]?.total || 0

        await db
            .update(importReceipts)
            .set({ totalAmount: totalCost, updatedAt: new Date() })
            .where(eq(importReceipts.id, importReceiptId))
        return totalCost
    }
}

const importReceiptService = new ImportReceiptService()
export default importReceiptService
