import { create } from 'zustand'
import cartApi, { type AddCartItemDto } from '@/apis/cart.api'
import type { Cart, CartItem } from '@/types/schema.type'

interface CartState {
    cart: Cart | null
    items: CartItem[]
    loading: boolean
    initialized: boolean
    fetchCart: () => Promise<void>
    addItem: (payload: AddCartItemDto) => Promise<void>
    updateItem: (itemId: number, quantity: number) => Promise<void>
    removeItem: (itemId: number) => Promise<void>
    clearCart: () => Promise<void>
}

/**
 * useCartStore quản lý giỏ hàng: tải, thêm, sửa, xóa và xóa toàn bộ.
 */

/*
Usage:
- Read state:
const cart = useCartStore(s => s.cart)
const items = useCartStore(s => s.items)
const count = useCartStore(selectItemCount)
const subtotal = useCartStore(selectSubtotal)
- Call actions:
const { fetchCart, addItem, updateItem, removeItem, clearCart } = useCartStore(selectCartActions)
- Initialize on mount:
useEffect(() => { fetchCart() }, [fetchCart])
*/
const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    items: [],
    loading: false,
    initialized: false,

    fetchCart: async () => {
        set({ loading: true })
        try {
            const res = await cartApi.getCart()
            if (res && res.data) {
                set({ cart: res.data.cart ?? null, items: res.data.items ?? [] })
            } else {
                set({ cart: null, items: [] })
            }
        } catch (err) {
            set({ cart: null, items: [] })
            throw err
        } finally {
            set({ loading: false, initialized: true })
        }
    },

    addItem: async (payload) => {
        set({ loading: true })
        try {
            const res = await cartApi.addItem(payload)
            if (res && res.data) {
                // refresh cart to get consistent state (including server-calculated fields)
                await get().fetchCart()
            }
        } catch (err) {
            throw err
        } finally {
            set({ loading: false })
        }
    },

    updateItem: async (itemId, quantity) => {
        set({ loading: true })
        try {
            const res = await cartApi.updateItem(itemId, quantity)
            if (res && res.data) {
                await get().fetchCart()
            }
        } catch (err) {
            throw err
        } finally {
            set({ loading: false })
        }
    },

    removeItem: async (itemId) => {
        set({ loading: true })
        try {
            await cartApi.removeItem(itemId)
            await get().fetchCart()
        } catch (err) {
            throw err
        } finally {
            set({ loading: false })
        }
    },

    clearCart: async () => {
        set({ loading: true })
        try {
            await cartApi.clear()
            set({ cart: null, items: [] })
        } catch (err) {
            throw err
        } finally {
            set({ loading: false })
        }
    }
}))

export default useCartStore

// Selectors for convenient usage in components (no extra wrapper hook needed)
export const selectCart = (s: ReturnType<typeof useCartStore.getState>) => s.cart
export const selectItems = (s: ReturnType<typeof useCartStore.getState>) => s.items
export const selectLoading = (s: ReturnType<typeof useCartStore.getState>) => s.loading
export const selectInitialized = (s: ReturnType<typeof useCartStore.getState>) => s.initialized

// Derived selectors
export const selectItemCount = (s: ReturnType<typeof useCartStore.getState>) =>
    (s.items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0)
export const selectSubtotal = (s: ReturnType<typeof useCartStore.getState>) =>
    (s.items ?? []).reduce((sum, it) => sum + Number(it.price ?? 0) * (it.quantity ?? 0), 0)

// Action selector to grab stable action references at once
export const selectCartActions = (s: ReturnType<typeof useCartStore.getState>) => ({
    fetchCart: s.fetchCart,
    addItem: s.addItem,
    updateItem: s.updateItem,
    removeItem: s.removeItem,
    clearCart: s.clearCart
})
