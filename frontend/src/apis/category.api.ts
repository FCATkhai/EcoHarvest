import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Category } from '@/types/schema.type'
const API_URL = '/categories'

export type CreateCategoryDto = {
    name: string
    description?: string
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>

export const categoryApi = {
    // GET /api/categories
    async getAll() {
        const res = await axios.get<ApiResponse<Category[]>>(API_URL)
        return res.data
    },

    // POST /api/categories
    async create(payload: CreateCategoryDto) {
        const res = await axios.post<ApiResponse<Category>>(API_URL, payload)
        return res.data
    },

    // PATCH /api/categories/:id (matches PUT/PATCH handler)
    async update(id: number, payload: UpdateCategoryDto) {
        const res = await axios.patch<ApiResponse<Category>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/categories/:id
    async remove(id: number) {
        const res = await axios.delete<ApiResponse<Category>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default categoryApi
