import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { batches } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/batches
 * @desc Tạo lô hàng mới cho sản phẩm (gắn với phiếu nhập)
 * @access Private (admin, staff)
 */
export async function createBatch(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            productId,
            importReceiptId,
            batchCode,
            importDate,
            expiryDate,
            quantityImported,
            quantityRemaining,
            unitCost,
            notes
        } = req.body

        const [newBatch] = await db
            .insert(batches)
            .values({
                productId,
                importReceiptId,
                batchCode,
                importDate,
                expiryDate,
                quantityImported,
                quantityRemaining,
                unitCost,
                notes
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Lô hàng được tạo thành công',
            data: newBatch
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/batches?productId=&importReceiptId=
 * @desc Lấy danh sách tất cả lô hàng (có thể lọc theo productId hoặc importReceiptId)
 * @access Private (admin, staff)
 */
export async function getAllBatches(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, importReceiptId } = req.query

        let query = db.select().from(batches).$dynamic()

        if (productId) {
            query = query.where(eq(batches.productId, String(productId)))
        } else if (importReceiptId) {
            query = query.where(eq(batches.importReceiptId, Number(importReceiptId)))
        }

        const batchList = await query
        res.status(200).json({ success: true, data: batchList })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/batches/:id
 * @desc Lấy chi tiết lô hàng
 * @access Private (admin, staff)
 */
export async function getBatchById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const [batch] = await db
            .select()
            .from(batches)
            .where(eq(batches.id, Number(id)))

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng' })
        }

        res.status(200).json({ success: true, data: batch })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/batches/:id
 * @desc Cập nhật thông tin lô hàng
 * @access Private (admin, staff)
 */
export async function updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const updates = req.body

        const [updatedBatch] = await db
            .update(batches)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(batches.id, Number(id)))
            .returning()

        if (!updatedBatch) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng' })
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật lô hàng thành công',
            data: updatedBatch
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/batches/:id
 * @desc Xóa lô hàng
 * @access Private (admin)
 */
export async function deleteBatch(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deletedBatch = await db
            .delete(batches)
            .where(eq(batches.id, Number(id)))
            .returning()
        if (!deletedBatch.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng' })
        }

        res.status(200).json({ success: true, message: 'Xóa lô hàng thành công' })
    } catch (error: unknown) {
        next(error)
    }
}
