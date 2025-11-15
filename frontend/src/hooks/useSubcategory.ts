import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import subCategoryApi, { type CreateSubCategoryDto, type UpdateSubCategoryDto } from '@/apis/subCategory.api'
import type { SubCategory } from '@/types/schema.type'

// Build a stable query key incorporating the parent category id
const key = (parentId: number) => ['subCategories', parentId] as const

export interface UseSubCategoriesOptions {
    enabled?: boolean
}

export function useSubCategories(parentId: number, options: UseSubCategoriesOptions = {}) {
    const queryClient = useQueryClient()
    const { enabled = true } = options

    const listQuery = useQuery({
        queryKey: key(parentId),
        enabled: enabled && Number.isFinite(parentId),
        queryFn: async () => {
            const res = await subCategoryApi.getAll(parentId)
            return res.data
        }
    })

    const createMutation = useMutation({
        mutationFn: async (payload: CreateSubCategoryDto) => {
            const res = await subCategoryApi.create(payload)
            return res.data
        },
        onSuccess: (_created) => {
            queryClient.invalidateQueries({ queryKey: key(parentId) })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateSubCategoryDto }) => {
            const res = await subCategoryApi.update(id, data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key(parentId) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await subCategoryApi.remove(id)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key(parentId) })
        }
    })

    return {
        subCategories: listQuery.data ?? ([] as SubCategory[]),
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createSubCategory: createMutation.mutateAsync,
        updateSubCategory: updateMutation.mutateAsync,
        deleteSubCategory: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useSubCategories
