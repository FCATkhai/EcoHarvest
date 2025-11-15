import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AdminSidebar'
import { Navbar } from '@/components/Navbar'
import { Outlet } from 'react-router'

export default function AdminLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <Navbar />
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}
