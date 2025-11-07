//TODO: Chỉ cần khi mở rộng chức năng

// Ý tưởng:

// Một phiếu nhập (import_receipts) có nhiều dòng (import_receipt_items).

// Mỗi dòng có thể liên kết với 1 batch cụ thể, hoặc chưa có (chờ nhập).

// batches chỉ tạo khi hàng thực sự về kho.

// Ưu điểm:
// ✅ Hỗ trợ nhiều trạng thái nhập hàng (planned, received, verified).
// ✅ Một sản phẩm có thể được nhập thành nhiều batch trong cùng phiếu.
// ✅ Dễ tách dữ liệu nhập → kiểm kho → ghi nhận batch sau.
// ✅ Thân thiện với báo cáo kế toán (phiếu nhập thể hiện chi tiết dòng sản phẩm).

// -- Liên kết phiếu nhập <-> lô hàng
// CREATE TABLE "import_receipt_items" (
//   "id" serial PRIMARY KEY,
//   "import_receipt_id" integer REFERENCES "import_receipts" ("id"),
//   "batch_id" integer REFERENCES "batches" ("id"),
//   "product_id" integer REFERENCES "products" ("id"),
//   "quantity" integer,
//   "unit_cost" numeric(10,2)
// );
// import { pgTable, serial, integer, uuid } from 'drizzle-orm/pg-core'
// import { importReceipts } from './import_receipts.schema'
// import { batches } from './batches.schema'
// import { products } from '../product'

// export const importReceiptItems = pgTable('import_receipt_items', {
//     id: serial('id').primaryKey(),
//     importReceiptId: serial('import_receipt_id').references(() => importReceipts.id),
//     batchId: serial('batch_id').references(() => batches.id),
//     productId: uuid('product_id').references(() => products.id),
//     quantity: integer('quantity').notNull().default(0),
//     unitCost: integer('unit_cost').notNull().default(0)
// })
