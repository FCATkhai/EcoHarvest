import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import addressApi, { type CreateAddressDto, type UpdateAddressDto } from '@/apis/address.api'
import type { Address } from '@/types/schema.type'

const ADDRESSES_KEY = (userId: string) => ['addresses', userId] as const
const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes

//TODO: add optimistic updates, update typescript, not any for listQuery
export function useAddresses(userId?: string) {
    const queryClient = useQueryClient()

    const listQuery: any = useQuery({
        queryKey: userId ? ADDRESSES_KEY(userId) : ['addresses', 'all'],
        queryFn: async () => {
            if (!userId) return [] as Address[]
            const res = await addressApi.getByUser(userId)
            return res
        },
        enabled: !!userId,
        staleTime: DEFAULT_STALE_TIME
    } as any)

    const createMutation = useMutation({
        mutationFn: async (payload: CreateAddressDto) => {
            const res = await addressApi.create(payload)
            return res
        },
        onMutate: async (payload) => {
            if (!userId) return null
            const key = ADDRESSES_KEY(userId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = (queryClient.getQueryData<Address[]>(key) ?? []) as Address[]

            const tempId = -Date.now()
            const optimistic: Address = {
                id: tempId as unknown as number,
                userId,
                label: payload.label ?? null,
                province: payload.province ?? null,
                ward: payload.ward ?? null,
                detailAddress: payload.detailAddress ?? null,
                createdAt: new Date()
            }

            queryClient.setQueryData<Address[]>(key, [...previous, optimistic])

            return { key, previous, tempId }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous)
            }
        },
        onSuccess: (data, _vars, context: any) => {
            // data is ApiResponse<Address>
            const created = (data as any)?.data as Address | undefined
            if (context?.key && created) {
                queryClient.setQueryData<Address[]>(context.key, (old = []) => {
                    const replaced = old.map((it) => (String(it.id) === String(context.tempId) ? created : it))
                    const found = replaced.some((it) => String(it.id) === String(created.id))
                    if (!found) return [...replaced, created]
                    return replaced
                })
            }

            if (userId) queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) })
        },
        onSettled: () => {
            if (userId) queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) })
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number | string; payload: UpdateAddressDto }) => {
            const res = await addressApi.update(id, payload)
            return res
        },
        onSuccess: (_data, variables) => {
            if (userId) queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) })
            if (variables?.id && userId) queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number | string) => {
            const res = await addressApi.remove(id)
            return res
        },
        onMutate: async (id: number | string) => {
            if (!userId) return { key: null, previous: null }
            const key = ADDRESSES_KEY(userId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = (queryClient.getQueryData<Address[]>(key) ?? []) as Address[]

            queryClient.setQueryData<Address[]>(
                key,
                previous.filter((a) => String(a.id) !== String(id))
            )

            return { key, previous }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) queryClient.setQueryData(context.key, context.previous)
        },
        onSettled: () => {
            if (userId) queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) })
        }
    })

    return {
        addresses: (listQuery.data ?? []) as Address[],
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createAddress: createMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useAddresses
