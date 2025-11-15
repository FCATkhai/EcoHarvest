import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import importReceiptApi, {
    type CreateImportReceiptDto,
    type UpdateImportReceiptDto
} from '@/apis/batch/importReceipt.api'
import type { ImportReceipt } from '@/types/schema.type'

const IMPORT_RECEIPTS_KEY = ['importReceipts'] as const
const IMPORT_RECEIPT_KEY = (id: string | number) => ['importReceipt', String(id)] as const
const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes

//TODO: thêm pagination, filters, search, optimistic updates
export function useImportReceipts() {
    const queryClient = useQueryClient()

    const listQuery: any = useQuery({
        queryKey: IMPORT_RECEIPTS_KEY,
        queryFn: async () => {
            const data = await importReceiptApi.getAll()
            return data
        },
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const createMutation = useMutation({
        mutationFn: async (payload: CreateImportReceiptDto) => {
            const res = await importReceiptApi.create(payload)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPTS_KEY })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number | string; payload: UpdateImportReceiptDto }) => {
            const res = await importReceiptApi.update(id, payload)
            return res
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPTS_KEY })
            if (variables?.id) queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPT_KEY(variables.id) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number | string) => {
            const res = await importReceiptApi.remove(id)
            return res
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPTS_KEY })
            if (id) queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPT_KEY(id) })
        }
    })

    return {
        receipts: (listQuery.data ?? []) as ImportReceipt[],
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createImportReceipt: createMutation.mutateAsync,
        updateImportReceipt: updateMutation.mutateAsync,
        deleteImportReceipt: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export function useImportReceipt(id?: number | string) {
    const queryClient = useQueryClient()

    const query: any = useQuery({
        queryKey: id ? IMPORT_RECEIPT_KEY(id) : ['importReceipt', 'undefined'],
        queryFn: async () => {
            if (!id) return null
            const data = await importReceiptApi.getById(id)
            return data
        },
        enabled: !!id,
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const updateMutation = useMutation({
        mutationFn: async ({ id: receiptId, payload }: { id: number | string; payload: UpdateImportReceiptDto }) => {
            const res = await importReceiptApi.update(receiptId, payload)
            return res
        },
        onSuccess: (_data, variables) => {
            if (variables?.id) queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPT_KEY(variables.id) })
            queryClient.invalidateQueries({ queryKey: IMPORT_RECEIPTS_KEY })
        }
    })

    return {
        receipt: (query.data ?? null) as ImportReceipt | null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,

        updateImportReceipt: updateMutation.mutateAsync,
        updating: updateMutation.isPending
    }
}

export default useImportReceipts
