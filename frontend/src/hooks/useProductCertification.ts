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
        onSuccess: (_data, variables) => {
            // invalidate the specific product's certifications
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
        onSuccess: (_data, vars) => {
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
