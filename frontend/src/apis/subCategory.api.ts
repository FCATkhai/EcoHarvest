import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { SubCategory } from '@/types/schema.type'

const API_URL = '/sub-categories'

export type CreateSubCategoryDto = {
    parentId: number
    name: string
    description?: string
}

export type UpdateSubCategoryDto = Partial<Pick<CreateSubCategoryDto, 'parentId' | 'name' | 'description'>>

export const subCategoryApi = {
    // GET /api/sub-categories?parentId=<id>
    async getAll(parentId: number) {
        const res = await axios.get<ApiResponse<SubCategory[]>>(API_URL, {
            params: { parentId }
        })
        return res.data
    },

    // POST /api/sub-categories
    async create(payload: CreateSubCategoryDto) {
        const res = await axios.post<ApiResponse<SubCategory>>(API_URL, payload)
        return res.data
    },

    // PATCH /api/sub-categories/:id (matches PUT/PATCH handler)
    async update(id: number, payload: UpdateSubCategoryDto) {
        const res = await axios.patch<ApiResponse<SubCategory>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/sub-categories/:id
    async remove(id: number) {
        const res = await axios.delete<ApiResponse<SubCategory>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default subCategoryApi
