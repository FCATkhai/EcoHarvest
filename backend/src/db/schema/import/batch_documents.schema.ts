// -- bảng tài liệu liên quan đến lô hàng (giấy kiểm định, hóa đơn, chứng nhận VSATTP, v.v.)
// CREATE TABLE "batch_documents" (
//   "id" serial PRIMARY KEY,
//   "batch_id" integer REFERENCES "batches" ("id"),
//   "document_type" varchar,              -- "Giấy kiểm định", "Hóa đơn", "Chứng nhận VSATTP"
//   "file_url" varchar,                   -- link đến file PDF/JPG trong Supabase Storage
//   "uploaded_at" timestamp DEFAULT NOW()
// );

import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { batches } from './batches.schema'
import { timestamps } from '../../helpers'

export const batchDocuments = pgTable('batch_documents', {
    id: serial('id').primaryKey(),
    batchId: serial('batch_id')
        .notNull()
        .references(() => batches.id),
    documentType: varchar('document_type').notNull(),
    fileUrl: varchar('file_url').notNull(),
    ...timestamps
})
