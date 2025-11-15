import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import productCertificationApi, { type CreateProductCertificationDto } from '@/apis/product/productCertification.api'
import type { ProductCertification } from '@/types/schema.type'

const PRODUCT_CERTS_QUERY_KEY = (productId: string) => ['productCertifications', productId] as const

export function useProductCertifications(productId?: string) {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: productId ? PRODUCT_CERTS_QUERY_KEY(productId) : ['productCertifications', 'all'],
        queryFn: async () => {
            if (!productId) return [] as ProductCertification[]
            const res = await productCertificationApi.getByProduct(productId)
            return res
        },
        enabled: !!productId
    })

    const createMutation = useMutation({
        mutationFn: async (payload: CreateProductCertificationDto) => {
            const res = await productCertificationApi.create(payload)
            return res
        },
        onMutate: async (payload) => {
            if (!payload?.productId) return null
            const key = PRODUCT_CERTS_QUERY_KEY(payload.productId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<ProductCertification[]>(key) ?? []

            const tempId = -Date.now()
            const optimistic: ProductCertification = {
                id: tempId as unknown as number,
                productId: payload.productId,
                certName: payload.certName,
                issuer: payload.issuer ?? null,
                issueDate: payload.issueDate ?? null,
                expiryDate: payload.expiryDate ?? null,
                fileUrl: payload.fileUrl ?? null,
                description: payload.description ?? null,
                createdAt: new Date()
            }

            queryClient.setQueryData<ProductCertification[]>(key, [...previous, optimistic])

            return { key, previous, tempId }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous)
            }
        },
        onSuccess: (data, variables, context: any) => {
            // server returns ApiResponse<ProductCertification>
            const created = (data as any)?.data as ProductCertification | undefined
            if (context?.key && created) {
                queryClient.setQueryData<ProductCertification[]>(context.key, (old = []) => {
                    const replaced = old.map((it) => (String(it.id) === String(context.tempId) ? created : it))
                    const found = replaced.some((it) => String(it.id) === String(created.id))
                    if (!found) return [...replaced, created]
                    return replaced
                })
            }

            if (variables?.productId) {
                queryClient.invalidateQueries({ queryKey: PRODUCT_CERTS_QUERY_KEY(variables.productId) })
            } else {
                queryClient.invalidateQueries({ queryKey: ['productCertifications'] })
            }
        },
        onSettled: (_data, _error, variables) => {
            if (variables?.productId) {
                queryClient.invalidateQueries({ queryKey: PRODUCT_CERTS_QUERY_KEY(variables.productId) })
            } else {
                queryClient.invalidateQueries({ queryKey: ['productCertifications'] })
            }
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (vars: { id: number | string; productId?: string }) => {
            const res = await productCertificationApi.remove(vars.id)
            return res
        },
        onMutate: async (vars: { id: number | string; productId?: string }) => {
            if (!vars?.productId) return { key: null, previous: null }
            const key = PRODUCT_CERTS_QUERY_KEY(vars.productId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<ProductCertification[]>(key) ?? []

            queryClient.setQueryData<ProductCertification[]>(
                key,
                previous.filter((c) => String(c.id) !== String(vars.id))
            )

            return { key, previous }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous)
            }
        },
        onSettled: (_data, _error, vars) => {
            if (vars?.productId) {
                queryClient.invalidateQueries({ queryKey: PRODUCT_CERTS_QUERY_KEY(vars.productId) })
            } else {
                queryClient.invalidateQueries({ queryKey: ['productCertifications'] })
            }
        }
    })

    return {
        certifications: listQuery.data ?? ([] as ProductCertification[]),
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createCertification: createMutation.mutateAsync,
        removeCertification: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useProductCertifications
