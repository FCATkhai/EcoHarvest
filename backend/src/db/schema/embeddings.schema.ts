import { pgTable, text, jsonb, vector, bigserial, uuid } from 'drizzle-orm/pg-core'
import { products } from './products'

export const productEmbeddings = pgTable('product_embeddings', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    productId: uuid('product_id').references(() => products.id),
    content: text('content'),
    metadata: jsonb('metadata'),
    embedding: vector('embedding', { dimensions: 768 })
})

export const documentEmbeddings = pgTable('document_embeddings', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    content: text('content'),
    metadata: jsonb('metadata'),
    embedding: vector('embedding', { dimensions: 768 })
})
