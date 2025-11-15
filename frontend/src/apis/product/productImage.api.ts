import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { ProductImage } from '@/types/schema.type'

const API_URL = '/product-images'

export type CreateProductImageDto = {
    productId: string
    imageUrl: string
    isPrimary?: boolean
    altText?: string
}

export const productImageApi = {
    // POST /api/product-images
    async create(payload: CreateProductImageDto) {
        const res = await axios.post<ApiResponse<ProductImage>>(API_URL, payload)
        return res.data
    },

    // GET /api/product-images/:productId
    async getByProduct(productId: string) {
        const res = await axios.get<ApiResponse<ProductImage[]>>(`${API_URL}/${productId}`)
        return res.data
    },

    // DELETE /api/product-images/:id
    async remove(id: number | string) {
        const res = await axios.delete<ApiResponse<ProductImage>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default productImageApi
