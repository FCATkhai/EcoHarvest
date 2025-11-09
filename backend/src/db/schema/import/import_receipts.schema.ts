// -- bảng phiếu nhập hàng
// Một phiếu nhập có thể gồm nhiều sản phẩm (và mỗi sản phẩm là một lô)
import { pgTable, serial, varchar, date, integer, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../helpers'
import { users } from '../users.schema'

export const importReceipts = pgTable('import_receipts', {
    id: serial('id').primaryKey(),
    supplierName: varchar('supplier_name'),
    totalAmount: integer('total_amount').notNull().default(0),
    importDate: date('import_date').defaultNow(),
    createdBy: text('created_by').references(() => users.id),
    notes: text('notes'),
    ...timestamps
})
