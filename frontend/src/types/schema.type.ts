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
