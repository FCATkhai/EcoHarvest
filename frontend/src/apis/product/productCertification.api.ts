import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { ProductCertification } from '@/types/schema.type'

// Base path (axios instance already prefixes /api)
const API_URL = '/product-certifications'

export interface CreateProductCertificationDto {
    productId: string
    certName: string
    issuer?: string | null
    issueDate?: string | null
    expiryDate?: string | null
    fileUrl?: string | null
    description?: string | null
}

export const productCertificationApi = {
    // POST /api/product-certifications
    async create(payload: CreateProductCertificationDto) {
        const res = await axios.post<ApiResponse<ProductCertification>>(API_URL, payload)
        return res.data
    },

    // GET /api/product-certifications/:productId
    async getByProduct(productId: string) {
        const res = await axios.get<ApiResponse<ProductCertification[]>>(`${API_URL}/${productId}`)
        return res.data.data
    },

    // DELETE /api/product-certifications/:id
    async remove(id: string | number) {
        const res = await axios.delete<ApiResponse<ProductCertification>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default productCertificationApi
