import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import categoryApi, { type CreateCategoryDto, type UpdateCategoryDto } from '@/apis/category.api'
import type { Category } from '@/types/schema.type'

const CATEGORY_QUERY_KEY = ['categories'] as const

export function useCategories() {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: CATEGORY_QUERY_KEY,
        queryFn: async () => {
            const res = await categoryApi.getAll()
            return res.data
        }
    })

    const createMutation = useMutation({
        mutationFn: async (payload: CreateCategoryDto) => {
            const res = await categoryApi.create(payload)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateCategoryDto }) => {
            const res = await categoryApi.update(id, data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await categoryApi.remove(id)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY })
        }
    })

    return {
        categories: listQuery.data ?? ([] as Category[]),
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createCategory: createMutation.mutateAsync,
        updateCategory: updateMutation.mutateAsync,
        deleteCategory: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useCategories
