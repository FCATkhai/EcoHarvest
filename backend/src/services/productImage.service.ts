import { db } from '@backend/db/client'
import { productImages, products } from '../db/schema'
import { eq, sql, asc, desc, and } from 'drizzle-orm'

class ProductImageService {
    async getPrimaryImageByProductId(productId: string) {
        if (!productId) {
            throw new Error('Product ID is required')
        }
        const primaryImage = await db
            .select()
            .from(productImages)
            .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, true)))
            .limit(1)
        if (primaryImage.length === 0) {
            throw new Error('No primary image found for the given product ID')
        }
        return primaryImage[0]
    }

    async getImagesByProductId(productId: string) {
        if (!productId) {
            throw new Error('Product ID is required')
        }
        const images = await db.select().from(productImages).where(eq(productImages.productId, productId))
        if (images.length === 0) {
            throw new Error('No images found for the given product ID')
        }
        return images
    }
}

export default new ProductImageService()
