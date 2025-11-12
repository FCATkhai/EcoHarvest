import { Router } from 'express'
import addressRoutes from './address.routes'
import batchRoutes from './batchDocument.routes'
import batchDocumentRoutes from './batch.routes'
import importReceiptRoutes from './importReceipt.routes'
import orderRoutes from './order.routes'
import paymentRoutes from './payment.routes'
import cartRoutes from './cart.routes'
import productRoutes from './product.routes'
import chatRoutes from './chat.routes'
import categoryRoutes from './category.routes'
import subCategoryRoutes from './subCategory.routes'

const router = Router()

router.use('/addresses', addressRoutes)
router.use('/batch-documents', batchDocumentRoutes)
router.use('/batches', batchRoutes)
router.use('/import-receipts', importReceiptRoutes)
router.use('/orders', orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/cart', cartRoutes)
router.use('/products', productRoutes)
router.use('/chats', chatRoutes)
router.use('/categories', categoryRoutes)
router.use('/sub-categories', subCategoryRoutes)

export default router
