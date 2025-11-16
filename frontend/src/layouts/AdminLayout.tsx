import { AdminSidebar } from '@/components/AdminSidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Outlet } from 'react-router'
import { UserDropdown } from '@/components/UserDropDown'
import useAuthStore from '@/store/useAuthStore'
interface AdminLayoutProps {
    pageTitle?: string
}

export default function AdminLayout({ pageTitle }: AdminLayoutProps) {
    const user = useAuthStore((state) => state.user)

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className='flex justify-between h-16 items-center border-b px-4'>
                    <div className='flex items-center shrink-0 gap-2'>
                        <SidebarTrigger className='-ml-1' />
                        <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
                        <h1 className='text-lg font-medium'>{pageTitle || 'Admin Dashboard'}</h1>
                    </div>
                    {user && <UserDropdown user={user} />}
                </header>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
