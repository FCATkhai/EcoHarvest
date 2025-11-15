import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderApi, { type CreateOrderDto } from '@/apis/order.api'
import type { Order, OrderItem, PaymentDetail } from '@/types/schema.type'

const ORDERS_LIST_KEY = ['orders'] as const
const ORDER_KEY = (id: string) => ['order', id] as const

//TODO: add stale time, keep previous data, remove any types
export function useOrders() {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: ORDERS_LIST_KEY,
        queryFn: async () => {
            const res = await orderApi.getAll()
            return res
        }
    })

    const createMutation = useMutation({
        mutationFn: async (payload: CreateOrderDto) => {
            const res = await orderApi.create(payload)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY })
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await orderApi.updateStatus(id, status)
            return res
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY })
            if (variables?.id) queryClient.invalidateQueries({ queryKey: ORDER_KEY(variables.id) })
        }
    })

    const updatePaymentMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const res = await orderApi.updatePaymentStatus(orderId, status)
            return res
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY })
            if (variables?.orderId) queryClient.invalidateQueries({ queryKey: ORDER_KEY(variables.orderId) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await orderApi.remove(id)
            return res
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY })
            if (id) queryClient.invalidateQueries({ queryKey: ORDER_KEY(String(id)) })
        }
    })

    return {
        list: listQuery.data ?? null,
        orders: (listQuery.data?.data as Order[]) ?? ([] as Order[]),

        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createOrder: createMutation.mutateAsync,
        updateOrderStatus: updateStatusMutation.mutateAsync,
        updatePaymentStatus: updatePaymentMutation.mutateAsync,
        deleteOrder: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updatingStatus: updateStatusMutation.isPending,
        updatingPayment: updatePaymentMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export function useOrder(id?: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: id ? ORDER_KEY(id) : ['order', 'undefined'],
        queryFn: async () => {
            if (!id) return null
            const res = await orderApi.getById(id)
            return res
        },
        enabled: !!id
    })

    return {
        orderDetails: (query.data ?? null) as {
            order: Order
            items: OrderItem[]
            payment?: PaymentDetail
            orderOwner?: any
        } | null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,

        invalidate: () => {
            if (id) queryClient.invalidateQueries({ queryKey: ORDER_KEY(id) })
        }
    }
}

export default useOrders
