import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import batchDocumentApi, { type CreateBatchDocumentDto } from '@/apis/batch/batchDocument.api'

// local type to avoid depending on schema exports
export type BatchDocument = {
    id: number
    batchId: number
    documentType: string
    fileUrl: string
    createdAt?: string | Date
}

const BATCH_DOCUMENTS_KEY = (batchId: string | number) => ['batchDocuments', String(batchId)] as const
const DEFAULT_STALE_TIME = 1000 * 60 * 5

export function useBatchDocuments(batchId?: number | string) {
    const queryClient = useQueryClient()

    const listQuery: any = useQuery({
        queryKey: batchId ? BATCH_DOCUMENTS_KEY(batchId) : ['batchDocuments', 'all'],
        queryFn: async () => {
            if (!batchId) return [] as BatchDocument[]
            const data = await batchDocumentApi.getByBatch(batchId)
            return data
        },
        enabled: !!batchId,
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const createMutation = useMutation({
        mutationFn: async (payload: CreateBatchDocumentDto) => {
            const res = await batchDocumentApi.create(payload)
            return res
        },
        onMutate: async (payload: CreateBatchDocumentDto) => {
            const key = BATCH_DOCUMENTS_KEY(payload.batchId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = (queryClient.getQueryData<BatchDocument[]>(key) ?? []) as BatchDocument[]

            const tempId = -Date.now()
            const optimistic: BatchDocument = {
                id: tempId as unknown as number,
                batchId: payload.batchId,
                documentType: payload.documentType,
                fileUrl: payload.fileUrl,
                createdAt: new Date()
            }

            queryClient.setQueryData<BatchDocument[]>(key, [...previous, optimistic])

            return { key, previous, tempId }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) queryClient.setQueryData(context.key, context.previous)
        },
        onSuccess: (data, _vars, context: any) => {
            const created = (data as any)?.data as BatchDocument | undefined
            if (context?.key && created) {
                queryClient.setQueryData<BatchDocument[]>(context.key, (old = []) => {
                    const replaced = old.map((it) => (String(it.id) === String(context.tempId) ? created : it))
                    const found = replaced.some((it) => String(it.id) === String(created.id))
                    if (!found) return [...replaced, created]
                    return replaced
                })
            }

            if (context?.key) queryClient.invalidateQueries({ queryKey: context.key })
        },
        onSettled: (_data, _error, vars) => {
            const key = vars?.batchId ? BATCH_DOCUMENTS_KEY(vars.batchId) : undefined
            if (key) queryClient.invalidateQueries({ queryKey: key })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (vars: { id: number | string; batchId?: number | string }) => {
            const res = await batchDocumentApi.remove(vars.id)
            return res
        },
        onMutate: async (vars: { id: number | string; batchId?: number | string }) => {
            if (!vars?.batchId) return { key: null, previous: null }
            const key = BATCH_DOCUMENTS_KEY(vars.batchId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = (queryClient.getQueryData<BatchDocument[]>(key) ?? []) as BatchDocument[]

            queryClient.setQueryData<BatchDocument[]>(
                key,
                previous.filter((d) => String(d.id) !== String(vars.id))
            )

            return { key, previous }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) queryClient.setQueryData(context.key, context.previous)
        },
        onSettled: (_data, _error, vars) => {
            if (vars?.batchId) {
                queryClient.invalidateQueries({ queryKey: BATCH_DOCUMENTS_KEY(vars.batchId) })
            } else {
                queryClient.invalidateQueries({ queryKey: ['batchDocuments'] })
            }
        }
    })

    return {
        documents: (listQuery.data ?? []) as BatchDocument[],
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createDocument: createMutation.mutateAsync,
        removeDocument: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useBatchDocuments
