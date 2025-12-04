import { Outlet } from 'react-router'
import { Navbar } from '@/components/Navbar'
import Chat from '@/components/Chat'
import useAuthStore from '@/store/useAuthStore'

export default function MainLayout() {
    const user = useAuthStore((state) => state.user)
    return (
        <div>
            <Navbar />
            {user && <Chat />}
            <Outlet />
        </div>
    )
}
