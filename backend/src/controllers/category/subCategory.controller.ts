import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { subCategories } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/sub-categories
 * @desc Tạo danh mục con
 * @access Private (admin)
 */
export async function createSubCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { parentId, name, description } = req.body

        const [newSubCategory] = await db.insert(subCategories).values({ parentId, name, description }).returning()

        res.status(201).json({
            success: true,
            message: 'Danh mục con được tạo thành công',
            data: newSubCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/sub-categories?parentId=<parentId>
 * @desc Lấy danh sách danh mục con (có thể lọc theo parentId)
 * @access Public
 */
export async function getAllSubCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const { parentId } = req.query
        let query = db.select().from(subCategories).$dynamic()

        if (!parentId || isNaN(Number(parentId))) {
            res.status(400).json({ success: false, message: 'parentId không hợp lệ' })
            return
        }
        query = query.where(eq(subCategories.parentId, Number(parentId)))

        const subCategoriesList = await query
        res.status(200).json({ success: true, data: subCategoriesList })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/sub-categories/:id
 * @desc Cập nhật danh mục con
 * @access Private (admin)
 */
export async function updateSubCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const { parentId, name, description } = req.body

        const [updatedSubCategory] = await db
            .update(subCategories)
            .set({ parentId, name, description, updatedAt: new Date() })
            .where(eq(subCategories.id, Number(id)))
            .returning()

        if (!updatedSubCategory) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục con' })

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục con thành công',
            data: updatedSubCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/sub-categories/:id
 * @desc Xóa một danh mục con
 * @access Private (admin)
 */
export async function deleteSubCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const [deletedSubCategory] = await db
            .delete(subCategories)
            .where(eq(subCategories.id, Number(id)))
            .returning()

        if (!deletedSubCategory) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục con' })

        res.status(200).json({
            success: true,
            message: 'Danh mục con đã được xóa',
            data: deletedSubCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}
