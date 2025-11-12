import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { importReceipts } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/import-receipts
 * @desc Tạo phiếu nhập hàng mới
 * @access Private (admin, staff)
 */
export async function createImportReceipt(req: Request, res: Response, next: NextFunction) {
    try {
        const { supplierName, totalAmount, importDate, notes } = req.body
        const createdBy = req.user.id

        const [newReceipt] = await db
            .insert(importReceipts)
            .values({
                supplierName,
                totalAmount,
                importDate,
                createdBy,
                notes
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Tạo phiếu nhập hàng thành công',
            data: newReceipt
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/import-receipts
 * @desc Lấy danh sách phiếu nhập hàng
 * @access Private (admin, staff)
 */
export async function getAllImportReceipts(req: Request, res: Response, next: NextFunction) {
    try {
        const receiptList = await db.select().from(importReceipts)
        res.status(200).json({ success: true, data: receiptList })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/import-receipts/:id
 * @desc Lấy chi tiết phiếu nhập hàng theo id
 * @access Private (admin, staff)
 */
export async function getImportReceiptById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const [receipt] = await db
            .select()
            .from(importReceipts)
            .where(eq(importReceipts.id, Number(id)))

        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' })
        }

        res.status(200).json({ success: true, data: receipt })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/import-receipts/:id
 * @desc Cập nhật phiếu nhập hàng
 * @access Private (admin, staff)
 */
export async function updateImportReceipt(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const updates = req.body

        const [updatedReceipt] = await db
            .update(importReceipts)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(importReceipts.id, Number(id)))
            .returning()

        if (!updatedReceipt) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' })
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật phiếu nhập thành công',
            data: updatedReceipt
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/import-receipts/:id
 * @desc Xóa phiếu nhập hàng
 * @access Private (admin)
 */
export async function deleteImportReceipt(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deletedReceipt = await db
            .delete(importReceipts)
            .where(eq(importReceipts.id, Number(id)))
            .returning()
        if (!deletedReceipt.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' })
        }

        res.status(200).json({ success: true, message: 'Xóa phiếu nhập thành công' })
    } catch (error: unknown) {
        next(error)
    }
}
