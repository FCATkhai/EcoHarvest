import { create } from 'zustand'
import { authClient } from '../lib/auth-client'
import type { User } from '@/types/user.type'
import { persist } from 'zustand/middleware'

interface AuthState {
    user: User | null
    loading: boolean
    initialized: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (data: { name: string; email: string; password: string }) => Promise<void>
    signOut: () => Promise<void>
    fetchSession: () => Promise<void>
}

/**
 * useAuthStore quản lý phiên đăng nhập, đăng ký và session bằng Better Auth client.
 */
const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            initialized: false,

            /** Đăng nhập */
            signIn: async (email, password) => {
                set({ loading: true })
                try {
                    const { data, error } = await authClient.signIn.email({ email, password })
                    if (error) throw error
                    await get().fetchSession()
                    console.log('SignIn successful:', get().user)
                    // optional redirect handling
                    // if (data?.redirect && data.url) window.location.href = data.url
                } catch (err) {
                    // console.error('SignIn failed:', err)
                    throw err
                } finally {
                    set({ loading: false })
                }
            },

            /** Đăng ký tài khoản mới */
            signUp: async ({ name, email, password }) => {
                set({ loading: true })
                try {
                    const { data, error } = await authClient.signUp.email({ name, email, password })
                    if (error) throw error
                    await get().fetchSession()
                } catch (err) {
                    // console.error('SignUp failed:', err)
                    throw err
                } finally {
                    set({ loading: false })
                }
            },

            /** Đăng xuất */
            signOut: async () => {
                set({ loading: true })
                try {
                    const { error } = await authClient.signOut()
                    if (error) throw error
                    set({ user: null })
                } catch (err) {
                    // console.error('SignOut failed:', err)
                    throw err
                } finally {
                    set({ loading: false })
                }
            },

            /** Lấy session từ backend (nếu cookie/token còn hiệu lực) */
            fetchSession: async () => {
                set({ loading: true })
                try {
                    const session = await authClient.getSession()
                    if (session.error) throw session.error
                    if (session.data?.user) set({ user: session.data.user })
                    else set({ user: null })
                } catch (err) {
                    // console.error('Fetch session failed:', err)
                    set({ user: null })
                    throw err
                } finally {
                    set({ loading: false, initialized: true })
                }
            }
        }),
        { name: 'auth-storage' }
    )
)

// const useAuthStore = create<AuthState>((set, get) => ({
//     user: null,
//     loading: false,
//     initialized: false,

//     /** Đăng nhập */
//     signIn: async (email, password) => {
//         set({ loading: true })
//         try {
//             const { data, error } = await authClient.signIn.email({ email, password })
//             if (error) throw error
//             await get().fetchSession()
//             console.log('SignIn successful:', get().user)
//             // optional redirect handling
//             // if (data?.redirect && data.url) window.location.href = data.url
//         } catch (err) {
//             // console.error('SignIn failed:', err)
//             throw err
//         } finally {
//             set({ loading: false })
//         }
//     },

//     /** Đăng ký tài khoản mới */
//     signUp: async ({ name, email, password }) => {
//         set({ loading: true })
//         try {
//             const { data, error } = await authClient.signUp.email({ name, email, password })
//             if (error) throw error
//             await get().fetchSession()
//         } catch (err) {
//             // console.error('SignUp failed:', err)
//             throw err
//         } finally {
//             set({ loading: false })
//         }
//     },

//     /** Đăng xuất */
//     signOut: async () => {
//         set({ loading: true })
//         try {
//             const { error } = await authClient.signOut()
//             if (error) throw error
//             set({ user: null })
//         } catch (err) {
//             // console.error('SignOut failed:', err)
//             throw err
//         } finally {
//             set({ loading: false })
//         }
//     },

//     /** Lấy session từ backend (nếu cookie/token còn hiệu lực) */
//     fetchSession: async () => {
//         set({ loading: true })
//         try {
//             const session = await authClient.getSession()
//             if (session.error) throw session.error
//             if (session.data?.user) set({ user: session.data.user })
//             else set({ user: null })
//         } catch (err) {
//             // console.error('Fetch session failed:', err)
//             set({ user: null })
//             throw err
//         } finally {
//             set({ loading: false, initialized: true })
//         }
//     }
// }))

export default useAuthStore
