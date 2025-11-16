import './App.css'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'
import useAuthStore from './store/useAuthStore.ts'
import useCartStore from './store/useCartStore.ts'
import { router } from './router/index.tsx'
import { useEffect } from 'react'
function App() {
    useEffect(() => {
        // chỉ fetch 1 lần khi app mount
        useAuthStore.getState().fetchSession()
    }, [])

    useEffect(() => {
        // chỉ fetch 1 lần khi app mount
        useCartStore.getState().fetchCart()
    }, [])

    return (
        <>
            <Toaster />
            <RouterProvider router={router} />
        </>
    )
}

export default App
