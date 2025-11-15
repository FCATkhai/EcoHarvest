import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Batch } from '@/types/schema.type'
const API_URL = '/batches'

export type CreateBatchDto = {
    productId?: string
    importReceiptId?: number
    batchCode?: string
    expiryDate?: string
    quantityImported?: number
    quantityRemaining?: number
    unitCost?: number
    notes?: string
}

export type UpdateBatchDto = Partial<CreateBatchDto>

export const batchApi = {
    // POST /api/batches
    async create(payload: CreateBatchDto) {
        const res = await axios.post<ApiResponse<Batch>>(API_URL, payload)
        return res.data
    },

    // GET /api/batches?productId=&importReceiptId=
    async getAll(query: { productId?: string; importReceiptId?: number | string } = {}) {
        const res = await axios.get<ApiResponse<Batch[]>>(API_URL, { params: query })
        return res.data.data
    },

    // GET /api/batches/:id
    async getById(id: number | string) {
        const res = await axios.get<ApiResponse<Batch>>(`${API_URL}/${id}`)
        return res.data.data
    },

    // PATCH /api/batches/:id
    async update(id: number | string, payload: UpdateBatchDto) {
        const res = await axios.patch<ApiResponse<Batch>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/batches/:id
    async remove(id: number | string) {
        const res = await axios.delete<ApiResponse<null>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default batchApi
