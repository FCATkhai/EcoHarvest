import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { batchDocuments } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/batch-documents
 * @desc Thêm chứng từ / tài liệu cho lô hàng
 * @access Private (admin, staff)
 */
export async function addBatchDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const { batchId, documentType, fileUrl } = req.body

        const [newDoc] = await db.insert(batchDocuments).values({ batchId, documentType, fileUrl }).returning()

        res.status(201).json({
            success: true,
            message: 'Thêm tài liệu cho lô hàng thành công',
            data: newDoc
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/batch-documents/:batchId
 * @desc Lấy danh sách tài liệu của lô hàng
 * @access Private (admin, staff)
 */
export async function getBatchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
        const { batchId } = req.params

        const docs = await db
            .select()
            .from(batchDocuments)
            .where(eq(batchDocuments.batchId, Number(batchId)))

        res.status(200).json({ success: true, data: docs })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/batch-documents/:id
 * @desc Xóa tài liệu của lô hàng
 * @access Private (admin, staff)
 */
export async function deleteBatchDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deleted = await db
            .delete(batchDocuments)
            .where(eq(batchDocuments.id, Number(id)))
            .returning()

        if (!deleted.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' })
        }

        res.status(200).json({
            success: true,
            message: 'Xóa tài liệu thành công',
            data: deleted[0]
        })
    } catch (error: unknown) {
        next(error)
    }
}
