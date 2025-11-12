import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { products, subCategories } from '@backend/db/schema'
import { eq, and, desc, asc, sql, or, count } from 'drizzle-orm'

/**
 * @route POST api/products
 * @desc Tạo sản phẩm mới
 * @access Private (admin, owner)
 */
export async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, categoryId, price, unit, quantity, origin, status } = req.body

        const [newProduct] = await db
            .insert(products)
            .values({
                name,
                description,
                categoryId,
                price,
                unit,
                quantity,
                origin,
                status
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Sản phẩm được tạo thành công',
            data: newProduct
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/products
 * @desc Lấy danh sách sản phẩm (lọc, tìm kiếm, phân trang, sắp xếp)
 * @access Public
 */
export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            page = '1',
            limit = '10',
            search = '',
            status = '1',
            categoryId,
            subCategoryId,
            sort_by = 'created_at',
            sort = 'desc'
        } = req.query

        const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
        const limitNum = Math.max(1, parseInt(limit as string, 10) || 10)
        const offset = (pageNum - 1) * limitNum

        // Điều kiện cơ bản (lọc sản phẩm chưa bị xóa)
        const whereConditions: any[] = [eq(products.isDeleted, 0)]

        // Trạng thái (nếu có) 0 - ngung kinh doanh, 1 - kich hoat
        if (status !== undefined && status !== '') {
            whereConditions.push(eq(products.status, Number(status)))
        }

        // Xử lý category / subCategory (ưu tiên subCategory)
        let categoryFilterCondition: any | null = null

        if (subCategoryId) {
            // Nếu có subCategoryId -> chỉ lấy sản phẩm trong subCategory đó
            categoryFilterCondition = eq(products.categoryId, Number(subCategoryId))
        } else if (categoryId) {
            // Nếu chỉ có categoryId -> tìm tất cả subCategory thuộc category đó
            const subRows = await db
                .select({ id: subCategories.id })
                .from(subCategories)
                .where(eq(subCategories.parentId, Number(categoryId)))

            const subIds = subRows.map((r) => r.id).filter(Boolean)

            if (subIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    total: 0,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: 0,
                    hasMore: false,
                    data: []
                })
            }

            // OR giữa các subCategoryId
            const subConds = subIds.map((id: number) => eq(products.categoryId, id))
            categoryFilterCondition = subConds.length === 1 ? subConds[0] : or(...subConds)
        }

        if (categoryFilterCondition) whereConditions.push(categoryFilterCondition)

        // Tìm kiếm (theo name và description)
        if (search && String(search).trim().length > 0) {
            const keyword = `%${String(search).toLowerCase()}%`
            whereConditions.push(
                sql`(lower(${products.name}) LIKE ${keyword} OR lower(${products.description}) LIKE ${keyword})`
            )
        }

        // Whitelist cho sort_by (chỉ cho phép price, created_at)
        const allowedSortFields = ['price', 'created_at']
        const safeSortBy = allowedSortFields.includes(String(sort_by)) ? String(sort_by) : 'created_at'
        const orderExpr = sort === 'desc' ? desc(sql.raw(safeSortBy)) : asc(sql.raw(safeSortBy))

        // Query dữ liệu
        const data = await db
            .select()
            .from(products)
            .where(and(...whereConditions))
            .orderBy(orderExpr)
            .limit(limitNum)
            .offset(offset)

        // Query tổng số lượng
        const totalRows = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(and(...whereConditions))

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
 * @route GET api/products/:id
 * @desc Lấy chi tiết 1 sản phẩm
 * @access Public
 */
export async function getProductById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const [product] = await db.select().from(products).where(eq(products.id, id))

        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
        }

        res.status(200).json({ success: true, data: product })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH api/products/:id
 * @desc Cập nhật thông tin sản phẩm
 * @access Private (admin, owner)
 */
export async function updateProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const updates = req.body

        const [updated] = await db
            .update(products)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning()

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: updated
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/products/:id
 * @desc Xóa mềm sản phẩm (đặt is_deleted = 1)
 * @access Private (admin)
 */
export async function deleteProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const [deleted] = await db
            .update(products)
            .set({ isDeleted: 1, deletedAt: new Date() })
            .where(eq(products.id, id))
            .returning()

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
        }

        res.status(200).json({
            success: true,
            message: 'Sản phẩm đã được đánh dấu xóa',
            data: deleted
        })
    } catch (error: unknown) {
        next(error)
    }
}
