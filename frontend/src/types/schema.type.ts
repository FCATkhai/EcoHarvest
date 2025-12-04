import type { OrderStatus, PaymentStatus, PaymentMethod } from '@/constants/order'

export type Category = {
    id: number
    name: string
    description: string | null
    createdAt: Date | string
    updatedAt: Date | string
}

export type SubCategory = {
    id: number
    name: string
    createdAt: Date | string
    updatedAt: Date | string
    description: string | null
    parentId: number
}

// Product entity (align with backend schema; extend if more fields appear)
export interface Product {
    id: string
    name: string
    description: string | null
    categoryId: number
    price: number | string | null // numeric columns may arrive as string depending on pg driver
    unit: string | null
    quantity: number
    sold: number
    origin: string | null
    status: number
    isDeleted?: number
    createdAt?: string | Date
    updatedAt?: string | Date
    deletedAt?: string | Date | null
    // Primary image (attached in list) - may be null or an array from service
    image?: ProductImage | null
    // Full images array (attached in detail view)
    images?: ProductImage[]
    // Certifications attached in detail view
    certifications?: ProductCertification[]
}

export type ProductImage = {
    id: number
    productId: string
    imageUrl: string
    isPrimary: boolean
    altText?: string | null
    createdAt?: string | Date
}

export type ProductCertification = {
    id: number
    productId: string
    certName: string
    issuer: string | null
    issueDate: string | null
    expiryDate: string | null
    fileUrl: string | null
    description?: string | null
    createdAt?: string | Date
    updatedAt?: string | Date
}

export type Address = {
    id: number
    userId: string
    label?: string | null
    province?: string | null
    ward?: string | null
    detailAddress?: string | null
    createdAt?: string | Date
    updatedAt?: string | Date
}

export type ImportReceipt = {
    id: number
    supplierName: string | null
    totalAmount: number
    importDate?: string | Date | null
    notes?: string | null
    createdBy?: string | null
    createdAt?: string | Date
    updatedAt?: string | Date
}

export type Batch = {
    id: number
    productId: string
    importReceiptId: number
    batchCode?: string | null
    expiryDate?: string | Date | null
    quantityImported: number
    quantityRemaining: number
    unitCost: number
    notes?: string | null
    createdAt?: string | Date
    updatedAt?: string | Date
}

export type BatchDocument = {
    id: number
    createdAt: Date | string
    updatedAt: Date | string
    batchId: number
    documentType: string
    fileUrl: string
}

export type OrderItem = {
    id?: number
    orderId?: string
    productId?: string
    quantity: number
    price: number
}

export type PaymentDetail = {
    id?: number
    orderId?: string
    amount?: number
    status?: PaymentStatus
    method?: PaymentMethod
    createdAt?: Date | string
    updatedAt?: Date | string
}

export type Order = {
    id: string
    userId: string
    total: number
    status: OrderStatus
    deliveryAddress: string
    createdAt?: string | Date
    updatedAt?: string | Date
}

export type Cart = {
    id: number
    userId: string
    createdAt?: string | Date
    updatedAt?: string | Date
}

// add isChecked to CartItem
export type CartItem = {
    id: number
    cartId?: number
    productId?: string
    quantity: number
    name?: string | null
    price?: number | string | null
    image?: string | null
    createdAt: Date | string
    updatedAt: Date | string
}

export type CartItemWithCheck = CartItem & {
    isChecked: boolean
}

// chat types
export type ChatSession = {
    id: string
    userId: string
    createdAt?: string | Date
}

export type ChatMessage = {
    id: string
    sessionId: string
    sender: string
    content: string
    metadata?: any
    createdAt?: string | Date
}
