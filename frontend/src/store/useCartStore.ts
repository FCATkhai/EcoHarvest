import { create } from 'zustand'
import cartApi, { type AddCartItemDto } from '@/apis/cart.api'
import type { Cart, CartItem, CartItemWithCheck } from '@/types/schema.type'
import { persist } from 'zustand/middleware'
interface CartState {
    cart: Cart | null
    items: CartItemWithCheck[]
    loading: boolean
    initialized: boolean

    fetchCart: () => Promise<void>
    addItem: (payload: AddCartItemDto) => Promise<void>
    updateItem: (itemId: number, quantity: number) => Promise<void>
    removeItem: (itemId: number) => Promise<void>

    toggleItemChecked: (itemId: number) => void
    toggleAllItemsChecked: (checked: boolean) => void

    clearCart: () => Promise<void>
    clearCartSession: () => void
}

const normalizeCartItems = (items: Array<CartItem & Partial<{ isChecked: boolean }>>): CartItemWithCheck[] => {
    return items.map((item) => ({
        ...item,
        isChecked: item.isChecked ?? false
    }))
}

/**
 * useCartStore quản lý giỏ hàng: tải, thêm, sửa, xóa và xóa toàn bộ.
 */
const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            items: [],
            loading: false,
            initialized: false,

            fetchCart: async () => {
                set({ loading: true })
                try {
                    const res = await cartApi.getCart()
                    if (res && res.data) {
                        set({ cart: res.data.cart ?? null, items: normalizeCartItems(res.data.items ?? []) })
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

            toggleItemChecked: (itemId: number) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
                    )
                }))
            },

            toggleAllItemsChecked: (checked: boolean) => {
                set((state) => ({
                    items: state.items.map((item) => ({ ...item, isChecked: checked }))
                }))
            },

            getCheckedItemIds: () => {
                return get()
                    .items.filter((it) => it.isChecked)
                    .map((it) => it.id)
            },

            getCheckedItems: () => {
                return get().items.filter((it) => it.isChecked)
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
            },

            //do not clear cart data on backend
            clearCartSession: () => {
                set({ cart: null, items: [], initialized: false })
            }
        }),
        { name: 'cart-storage' }
    )
)

export default useCartStore

// Derived selectors
export const selectItemCount = (s: ReturnType<typeof useCartStore.getState>) =>
    (s.items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0)
export const selectSubtotal = (s: ReturnType<typeof useCartStore.getState>) =>
    (s.items ?? []).reduce((sum, it) => sum + Number(it.price ?? 0) * (it.quantity ?? 0), 0)
