import { Request, Response, NextFunction } from 'express'
import { db } from '@backend/db/client'
import { productCertifications } from '@backend/db/schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/product-certifications
 * @desc Thêm chứng nhận cho sản phẩm
 * @access Private (admin, owner)
 */
export async function addProductCertification(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, certName, issuer, issueDate, expiryDate, fileUrl, description } = req.body

        const [newCert] = await db
            .insert(productCertifications)
            .values({
                productId,
                certName,
                issuer,
                issueDate,
                expiryDate,
                fileUrl,
                description
            })
            .returning()

        res.status(201).json({
            success: true,
            message: 'Chứng nhận sản phẩm được thêm thành công',
            data: newCert
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET api/product-certifications/:productId
 * @desc Lấy danh sách chứng nhận của sản phẩm
 * @access Public
 */
export async function getProductCertifications(req: Request<{ productId: string }>, res: Response, next: NextFunction) {
    try {
        const { productId } = req.params

        const certs = await db
            .select()
            .from(productCertifications)
            .where(eq(productCertifications.productId, productId))

        res.status(200).json({ success: true, data: certs })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE api/product-certifications/:id
 * @desc Xóa chứng nhận sản phẩm
 * @access Private (admin, owner)
 */
export async function deleteProductCertification(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deleted = await db
            .delete(productCertifications)
            .where(eq(productCertifications.id, Number(id)))
            .returning()

        if (!deleted.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy chứng nhận' })
        }

        res.status(200).json({
            success: true,
            message: 'Chứng nhận sản phẩm đã được xóa',
            data: deleted[0]
        })
    } catch (error: unknown) {
        next(error)
    }
}
