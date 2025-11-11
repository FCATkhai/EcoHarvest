import { pgTable, serial, integer, varchar, date, text, uuid } from 'drizzle-orm/pg-core'
import { products } from '../products'
import { timestamps } from '../../helpers'
import { importReceipts } from './import_receipts.schema'

export const batches = pgTable('batches', {
    id: serial('id').primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id),
    importReceiptId: serial('import_receipt_id')
        .notNull()
        .references(() => importReceipts.id),
    batchCode: varchar('batch_code').unique(),
    importDate: date('import_date').notNull(),
    expiryDate: date('expiry_date'),
    quantityImported: integer('quantity_imported').notNull(),
    quantityRemaining: integer('quantity_remaining').notNull(),
    unitCost: integer('unit_cost').notNull().default(0), // giá nhập theo đơn vị
    notes: text('notes'),
    ...timestamps
})
