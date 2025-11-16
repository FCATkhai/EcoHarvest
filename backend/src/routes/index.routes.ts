import { Router } from 'express'
import addressRoutes from './address.routes'
import batchDocumentRoutes from './batchDocument.routes'
import batchRoutes from './batch.routes'
import importReceiptRoutes from './importReceipt.routes'
import orderRoutes from './order.routes'
import cartRoutes from './cart.routes'
import productRoutes from './product.routes'
import chatRoutes from './chat.routes'
import categoryRoutes from './category.routes'
import subCategoryRoutes from './subCategory.routes'
import productImageRoutes from './productImage.routes'
import productCertificationRoutes from './productCertification.routes'

const router = Router()

router.use('/addresses', addressRoutes)
router.use('/batches', batchRoutes)
router.use('/batch-documents', batchDocumentRoutes)
router.use('/import-receipts', importReceiptRoutes)
router.use('/orders', orderRoutes)
router.use('/cart', cartRoutes)
router.use('/products', productRoutes)
router.use('/product-images', productImageRoutes)
router.use('/product-certifications', productCertificationRoutes)
router.use('/chats', chatRoutes)
router.use('/categories', categoryRoutes)
router.use('/sub-categories', subCategoryRoutes)

export default router
