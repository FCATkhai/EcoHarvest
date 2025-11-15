import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import batchApi, { type CreateBatchDto, type UpdateBatchDto } from '@/apis/batch/batch.api'
import type { Batch } from '@/types/schema.type'

const BATCHES_KEY = (filters: { productId?: string; importReceiptId?: number | string } = {}) =>
    ['batches', filters] as const
const BATCH_KEY = (id: string | number) => ['batch', String(id)] as const
const DEFAULT_STALE_TIME = 1000 * 60 * 5

export function useBatches(filters: { productId?: string; importReceiptId?: number | string } = {}) {
    const queryClient = useQueryClient()

    const listQuery: any = useQuery({
        queryKey: BATCHES_KEY(filters),
        queryFn: async () => {
            const data = await batchApi.getAll(filters)
            return data
        },
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const createMutation = useMutation({
        mutationFn: async (payload: CreateBatchDto) => {
            const res = await batchApi.create(payload)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number | string; payload: UpdateBatchDto }) => {
            const res = await batchApi.update(id, payload)
            return res
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] })
            if (variables?.id) queryClient.invalidateQueries({ queryKey: BATCH_KEY(variables.id) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number | string) => {
            const res = await batchApi.remove(id)
            return res
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] })
            if (id) queryClient.invalidateQueries({ queryKey: BATCH_KEY(id) })
        }
    })

    return {
        batches: (listQuery.data ?? []) as Batch[],
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createBatch: createMutation.mutateAsync,
        updateBatch: updateMutation.mutateAsync,
        deleteBatch: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export function useBatch(id?: number | string) {
    const queryClient = useQueryClient()

    const query: any = useQuery({
        queryKey: id ? BATCH_KEY(id) : ['batch', 'undefined'],
        queryFn: async () => {
            if (!id) return null
            const data = await batchApi.getById(id)
            return data
        },
        enabled: !!id,
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const updateMutation = useMutation({
        mutationFn: async ({ id: batchId, payload }: { id: number | string; payload: UpdateBatchDto }) => {
            const res = await batchApi.update(batchId, payload)
            return res
        },
        onSuccess: (_data, variables) => {
            if (variables?.id) queryClient.invalidateQueries({ queryKey: BATCH_KEY(variables.id) })
            queryClient.invalidateQueries({ queryKey: ['batches'] })
        }
    })

    return {
        batch: (query.data ?? null) as Batch | null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,

        updateBatch: updateMutation.mutateAsync,
        updating: updateMutation.isPending
    }
}

export default useBatches
