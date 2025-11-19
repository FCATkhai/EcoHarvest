import './App.css'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'
import useAuthStore from './store/useAuthStore.ts'
import { router } from './router/index.tsx'
import { useEffect } from 'react'

function App() {
    const user = useAuthStore((state) => state.user)
    const fetchSession = useAuthStore((state) => state.fetchSession)
    const clearSession = useAuthStore((state) => state.clearSession)
    useEffect(() => {
        // chỉ fetch 1 lần khi app mount
        fetchSession()
        return () => {
            clearSession()
        }
    }, [])

    return (
        <>
            <Toaster />
            <RouterProvider router={router} />
        </>
    )
}

export default App
