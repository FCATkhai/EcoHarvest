import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import productImageApi, { type CreateProductImageDto } from '@/apis/product/productImage.api'
import type { ProductImage } from '@/types/schema.type'

const PRODUCT_IMAGES_QUERY_KEY = (productId: string | number) => ['productImages', String(productId)] as const

export function useProductImages(productId?: string | number) {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: productId ? PRODUCT_IMAGES_QUERY_KEY(productId) : ['productImages', 'all'],
        queryFn: async () => {
            if (!productId) return [] as ProductImage[]
            const res = await productImageApi.getByProduct(String(productId))
            return res.data
        },
        enabled: !!productId
    })

    const createMutation = useMutation({
        mutationFn: async (payload: { productId: string; fileUrl: string; isPrimary?: boolean; altText?: string }) => {
            // The UI handles uploading to Supabase and passes back the file URL (fileUrl)
            const dto: CreateProductImageDto = {
                productId: payload.productId,
                imageUrl: payload.fileUrl,
                isPrimary: payload.isPrimary,
                altText: payload.altText
            }
            const res = await productImageApi.create(dto)
            return res.data
        },
        // Optimistic update: insert a temporary image into the cache immediately
        onMutate: async (payload) => {
            const key = PRODUCT_IMAGES_QUERY_KEY(payload.productId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<ProductImage[]>(key) ?? []

            const tempId = -Date.now()
            const optimistic: ProductImage = {
                id: tempId as unknown as number,
                productId: payload.productId,
                imageUrl: payload.fileUrl,
                isPrimary: !!payload.isPrimary,
                altText: payload.altText
            }

            queryClient.setQueryData<ProductImage[]>(key, [...previous, optimistic])

            return { key, previous, tempId }
        },
        onError: (_err, _variables, context: any) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous)
            }
        },
        onSuccess: (data, variables, context: any) => {
            // Replace optimistic item (tempId) with server data when available
            if (context?.key) {
                queryClient.setQueryData<ProductImage[]>(context.key, (old = []) => {
                    // replace item's id === tempId with real data.id, otherwise append if not found
                    const replaced = old.map((it) => (String(it.id) === String(context.tempId) ? data : it))
                    const found = replaced.some((it) => String(it.id) === String(data.id))
                    if (!found) {
                        return [...replaced, data]
                    }
                    return replaced
                })
            }

            // ensure final sync
            queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY(variables.productId) })
        }
        // onSettled: (_data, _error, variables) => {
        //     // fallback sync if something unexpected happened
        //     queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY(variables.productId) })
        // }
    })

    const deleteMutation = useMutation({
        // Expect an object so we can optimistically remove from the correct product cache
        mutationFn: async (vars: { id: number | string; productId: string }) => {
            const res = await productImageApi.remove(vars.id)
            return res.data
        },
        onMutate: async (vars: { id: number | string; productId: string }) => {
            const key = PRODUCT_IMAGES_QUERY_KEY(vars.productId)
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<ProductImage[]>(key) ?? []

            queryClient.setQueryData<ProductImage[]>(
                key,
                previous.filter((img) => String(img.id) !== String(vars.id))
            )

            return { key, previous }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous)
            }
        },
        onSettled: (_data, _error, vars) => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY(vars.productId) })
        }
    })

    return {
        images: listQuery.data ?? ([] as ProductImage[]),
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        error: listQuery.error,
        refetch: listQuery.refetch,

        createImage: createMutation.mutateAsync,
        removeImage: deleteMutation.mutateAsync,

        creating: createMutation.isPending,
        deleting: deleteMutation.isPending
    }
}

export default useProductImages
