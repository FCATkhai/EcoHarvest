import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/apiResponse.type'
import type { Order, OrderItem, PaymentDetail } from '@/types/schema.type'
// Base path (axios instance already prefixes /api)
const API_URL = '/orders'

export interface CreateOrderDto {
    items: Array<{ productId: string; quantity: number; price: number }>
    total: number
    paymentMethod?: string
    deliveryAddress: string
}

export const orderApi = {
    // POST /api/orders
    async create(payload: CreateOrderDto) {
        const res = await axios.post<ApiResponse<{ order: Order; payment: PaymentDetail }>>(API_URL, payload)
        return res.data
    },

    // GET /api/orders
    async getAll() {
        const res = await axios.get<ApiResponse<Order[]>>(API_URL)
        return res.data
    },

    // GET /api/orders/:id -> controller returns { order, items, payment, orderOwner }
    async getById(id: string) {
        const res = await axios.get<
            ApiResponse<{ order: Order; items: OrderItem[]; payment?: PaymentDetail; orderOwner?: any }>
        >(`${API_URL}/${id}`)
        return res.data.data
    },

    // PATCH /api/orders/:id/status
    async updateStatus(id: string, status: string) {
        const res = await axios.patch<ApiResponse<Order>>(`${API_URL}/${id}/status`, { status })
        return res.data
    },

    // PATCH /api/orders/payments/:orderId/status
    async updatePaymentStatus(orderId: string, status: string) {
        const res = await axios.patch<ApiResponse<PaymentDetail>>(`${API_URL}/payments/${orderId}/status`, { status })
        return res.data
    },

    // DELETE /api/orders/:id
    async remove(id: string) {
        const res = await axios.delete<ApiResponse<{}>>(`${API_URL}/${id}`)
        return res.data
    }
}

export default orderApi
