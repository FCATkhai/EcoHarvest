import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import productApi, {
    type CreateProductDto,
    type UpdateProductDto,
    type ListProductQuery
} from '@/apis/product/product.api'
import type { Product } from '@/types/schema.type'

const PRODUCTS_LIST_KEY = ['products'] as const
const PRODUCT_KEY = (id: string) => ['product', id] as const

//TODO: add stale time, keep previous data
export function useProducts(query: ListProductQuery = {}) {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: [...PRODUCTS_LIST_KEY, query] as const,
        queryFn: async () => {
            const res = await productApi.getAll(query)
            return res
        }
    })

    const createMutation = useMutation({
        mutationFn: async (payload: CreateProductDto) => {
            const res = await productApi.create(payload)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
            const res = await productApi.update(id, data)
            return res
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY })
            if (variables?.id) queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(variables.id) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await productApi.remove(id)
            return res
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY })
            if (id) queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(String(id)) })
        }
    })

    return {
        // list data: ProductListResponse
        list: listQuery.data ?? null,
        products: (listQuery.data?.data as Product[]) ?? ([] as Product[]),
        total: listQuery.data?.total ?? 0,
        page: listQuery.data?.page ?? 1,
        limit: listQuery.data?.limit ?? 10,
        totalPages: listQuery.data?.totalPages ?? 0,
        hasMore: listQuery.data?.hasMore ?? false,

        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createProduct: createMutation.mutateAsync,
        updateProduct: updateMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export function useProduct(id?: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: id ? PRODUCT_KEY(id) : ['product', 'undefined'],
        queryFn: async () => {
            if (!id) return null
            const res = await productApi.getById(id)
            return res
        },
        enabled: !!id
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id: productId, data }: { id: string; data: UpdateProductDto }) => {
            const res = await productApi.update(productId, data)
            return res
        },
        onSuccess: (_data, variables) => {
            if (variables?.id) queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(variables.id) })
            queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY })
        }
    })

    return {
        product: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,

        updateProduct: updateMutation.mutateAsync,
        updating: updateMutation.isPending
    }
}

export default useProducts
