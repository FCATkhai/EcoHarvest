// CREATE TABLE "product_certifications" (
//   "id" serial PRIMARY KEY,
//   "product_id" integer NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
//   "cert_name" varchar NOT NULL,        -- tên chứng nhận: OCOP, VietGAP,...
//   "issuer" varchar,                    -- đơn vị cấp (VD: Sở NN&PTNT)
//   "issue_date" date,                   -- ngày cấp
//   "expiry_date" date,                  -- nếu có
//   "file_url" varchar,                  -- liên kết file chứng nhận
//   "description" text,                  -- mô tả ngắn
//   "created_at" timestamp DEFAULT NOW()
// );
import { pgTable, serial, integer, varchar, date, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { products } from './products.schema'
import { timestamps } from '../../helpers'

export const productCertifications = pgTable('product_certifications', {
    id: serial('id').primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    certName: varchar('cert_name').notNull(),
    issuer: varchar('issuer'),
    issueDate: date('issue_date'),
    expiryDate: date('expiry_date'),
    fileUrl: varchar('file_url'),
    description: text('description'),
    ...timestamps
})
