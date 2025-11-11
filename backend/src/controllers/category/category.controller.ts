import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { categories } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/categories
 * @desc Tạo danh mục sản phẩm
 * @access Private (admin)
 */
export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description } = req.body

        const [newCategory] = await db.insert(categories).values({ name, description }).returning()

        res.status(201).json({
            success: true,
            message: 'Danh mục được tạo thành công',
            data: newCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/categories
 * @desc Lấy danh sách danh mục
 * @access Public
 */
export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const categoriesList = await db.select().from(categories)

        res.status(200).json({ success: true, data: categoriesList })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT api/categories/:id
 * @desc Cập nhật danh mục
 * @access Private (admin)
 */
export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const [updatedCategory] = await db
            .update(categories)
            .set({ name, description, updatedAt: new Date() })
            .where(eq(categories.id, Number(id)))
            .returning()

        if (!updatedCategory) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' })

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: updatedCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/categories/:id
 * @desc Xóa một danh mục
 * @access Private (admin)
 */
export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const [deletedCategory] = await db
            .delete(categories)
            .where(eq(categories.id, Number(id)))
            .returning()

        if (!deletedCategory) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' })
        res.status(200).json({
            success: true,
            message: 'Danh mục đã được xóa',
            data: deletedCategory
        })
    } catch (error: unknown) {
        next(error)
    }
}
