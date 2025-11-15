import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { BatchDocument } from '@/types/schema.type'

const API_URL = '/batch-documents'

export type CreateBatchDocumentDto = {
    batchId: number
    documentType: string
    fileUrl: string
}

export const batchDocumentApi = {
    // POST /api/batch-documents
    async create(payload: CreateBatchDocumentDto) {
        const res = await axios.post<ApiResponse<BatchDocument>>(API_URL, payload)
        return res.data
    },

    // GET /api/batch-documents/:batchId
    async getByBatch(batchId: number | string) {
        const res = await axios.get<ApiResponse<BatchDocument[]>>(`${API_URL}/${batchId}`)
        return res.data.data
    },

    // DELETE /api/batch-documents/:id
    async remove(id: number | string) {
        const res = await axios.delete<ApiResponse<BatchDocument>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default batchDocumentApi
