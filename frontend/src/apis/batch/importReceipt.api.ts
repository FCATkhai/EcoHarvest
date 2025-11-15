import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { ImportReceipt } from '@/types/schema.type'
const API_URL = '/import-receipts'

export type CreateImportReceiptDto = {
    supplierName: string
    totalAmount: number
    importDate?: string
    notes?: string
}

export type UpdateImportReceiptDto = Partial<CreateImportReceiptDto>

export const importReceiptApi = {
    // POST /api/import-receipts
    async create(payload: CreateImportReceiptDto) {
        const res = await axios.post<ApiResponse<ImportReceipt>>(API_URL, payload)
        return res.data
    },

    // GET /api/import-receipts
    async getAll() {
        const res = await axios.get<ApiResponse<ImportReceipt[]>>(API_URL)
        return res.data.data
    },

    // GET /api/import-receipts/:id
    async getById(id: number | string) {
        const res = await axios.get<ApiResponse<ImportReceipt>>(`${API_URL}/${id}`)
        return res.data.data
    },

    // PATCH /api/import-receipts/:id
    async update(id: number | string, payload: UpdateImportReceiptDto) {
        const res = await axios.patch<ApiResponse<ImportReceipt>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/import-receipts/:id
    async remove(id: number | string) {
        const res = await axios.delete<ApiResponse<null>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default importReceiptApi
