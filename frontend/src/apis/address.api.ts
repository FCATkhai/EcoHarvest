import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Address } from '@/types/schema.type'
const API_URL = '/addresses'

export interface CreateAddressDto {
    label?: string
    province?: string
    ward?: string
    detailAddress?: string
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export const addressApi = {
    // POST /api/addresses
    async create(payload: CreateAddressDto) {
        const res = await axios.post<ApiResponse<Address>>(API_URL, payload)
        return res.data
    },

    // GET /api/addresses/:userId
    async getByUser(userId: string) {
        const res = await axios.get<ApiResponse<Address[]>>(`${API_URL}/${userId}`)
        return res.data.data
    },

    // PATCH /api/addresses/:id
    async update(id: number | string, payload: UpdateAddressDto) {
        const res = await axios.patch<ApiResponse<Address>>(`${API_URL}/${id}`, payload)
        return res.data
    },

    // DELETE /api/addresses/:id
    async remove(id: number | string) {
        const res = await axios.delete<ApiResponse<null>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default addressApi
