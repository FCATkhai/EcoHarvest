import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Product } from '@/types/schema.type'
// Base path (axios instance already prefixes /api)
const API_URL = '/products'

export interface ProductListResponse {
    success: boolean
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
    data: Product[]
}

export interface CreateProductDto {
    name: string
    description?: string
    categoryId: number | string
    price: number | string
    unit: string
    quantity: number
    origin?: string
    status: number | string
}

export type UpdateProductDto = Partial<CreateProductDto>

export interface ListProductQuery {
    page?: number
    limit?: number
    search?: string
    status?: number | string
    categoryId?: number | string
    subCategoryId?: number | string
    sort_by?: 'price' | 'created_at'
    sort?: 'asc' | 'desc'
}

export const productApi = {
    // GET /api/products (with query params)
    async getAll(query: ListProductQuery = {}) {
        const res = await axios.get<ProductListResponse>(API_URL, {
            params: query
        })
        return res.data
    },

    // POST /api/products
    async create(payload: CreateProductDto) {
        const res = await axios.post<ApiResponse<Product>>(API_URL, payload)
        return res.data
    },

    // GET /api/products/:id
    // Controller returns { success: true, data: { product: Product } }
    async getById(id: string) {
        const res = await axios.get<ApiResponse<{ product: Product }>>(`${API_URL}/${id}`)
        return res.data.data.product
    },

    // PATCH /api/products/:id (controller supports PUT/PATCH)
    async update(id: string, payload: UpdateProductDto) {
        const res = await axios.patch<ApiResponse<Product>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/products/:id (soft delete)
    async remove(id: string) {
        const res = await axios.delete<ApiResponse<Product>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default productApi
