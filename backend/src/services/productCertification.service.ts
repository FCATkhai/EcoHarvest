import { db } from '@backend/db/client'
import { productCertifications } from '../db/schema'
import { eq } from 'drizzle-orm'

class ProductCertificationService {
    async getCertificationsByProductId(productId: string) {
        if (!productId) {
            throw new Error('Product ID is required')
        }
        const certifications = await db
            .select()
            .from(productCertifications)
            .where(eq(productCertifications.productId, productId))
        if (certifications.length === 0) {
            throw new Error('No certifications found for the given product ID')
        }
        return certifications
    }
}

export default new ProductCertificationService()
