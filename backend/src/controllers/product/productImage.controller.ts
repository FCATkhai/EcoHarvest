import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { productImages } from '@backend/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * @route POST api/product-images
 * @desc Thêm ảnh cho sản phẩm
 * @access Private (admin, owner)
 */
//TODO: xoá ảnh cũ trong supabase storage khi thêm ảnh mới hoặc xoá ảnh
export async function addProductImage(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, imageUrl, isPrimary, altText } = req.body
        console.log('Request body:', req.body)

        // Nếu ảnh mới được đánh dấu là primary, xóa ảnh primary cũ
        if (isPrimary) {
            await db
                .delete(productImages)
                .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, true)))
        }

        const [newImage] = await db
            .insert(productImages)
            .values({
                productId,
                imageUrl,
                isPrimary,
                altText
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Ảnh sản phẩm được thêm thành công',
            data: newImage
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/product-images/:productId
 * @desc Lấy danh sách ảnh của sản phẩm
 * @access Public
 */
export async function getProductImages(req: Request<{ productId: string }>, res: Response, next: NextFunction) {
    try {
        const { productId } = req.params

        const images = await db.select().from(productImages).where(eq(productImages.productId, productId))

        res.status(200).json({ success: true, data: images })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/product-images/:id
 * @desc Xóa ảnh sản phẩm
 * @access Private (admin, owner)
 */
export async function deleteProductImage(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deleted = await db
            .delete(productImages)
            .where(eq(productImages.id, Number(id)))
            .returning()

        if (!deleted.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' })
        }

        res.status(200).json({
            success: true,
            message: 'Ảnh sản phẩm đã được xóa',
            data: deleted[0]
        })
    } catch (error: unknown) {
        next(error)
    }
}
