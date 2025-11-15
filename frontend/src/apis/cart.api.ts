import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Cart, CartItem } from '@/types/schema.type'
// Base path (axios instance already prefixes /api)
const API_URL = '/cart'

export interface AddCartItemDto {
    productId: string
    quantity: number
}

export const cartApi = {
    // GET /api/cart
    async getCart() {
        const res = await axios.get<ApiResponse<{ cart: Cart; items: CartItem[] }>>(API_URL)
        return res.data
    },

    // POST /api/cart/items
    async addItem(payload: AddCartItemDto) {
        const res = await axios.post<ApiResponse<CartItem>>(`${API_URL}/items`, payload)
        return res.data
    },

    // PATCH /api/cart/items/:itemId
    async updateItem(itemId: number | string, quantity: number) {
        const res = await axios.patch<ApiResponse<CartItem>>(`${API_URL}/items/${itemId}`, { quantity })
        return res.data
    },

    // DELETE /api/cart/items/:itemId
    async removeItem(itemId: number | string) {
        const res = await axios.delete<ApiResponse<{}>>(`${API_URL}/items/${itemId}`)
        return res.data
    },

    // DELETE /api/cart
    async clear() {
        const res = await axios.delete<ApiResponse<{}>>(API_URL)
        return res.data
    }
}

export default cartApi
