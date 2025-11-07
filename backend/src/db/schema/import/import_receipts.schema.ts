// -- bảng phiếu nhập hàng
// Một phiếu nhập có thể gồm nhiều sản phẩm (và mỗi sản phẩm là một lô)
import { pgTable, serial, varchar, date, integer, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from '../../helpers'
import { profiles } from '../profiles.schema'

export const importReceipts = pgTable('import_receipts', {
    id: serial('id').primaryKey(),
    supplierName: varchar('supplier_name'),
    totalAmount: integer('total_amount').notNull().default(0),
    importDate: date('import_date').defaultNow(),
    createdBy: uuid('created_by').references(() => profiles.id),
    notes: text('notes'),
    ...timestamps
})
