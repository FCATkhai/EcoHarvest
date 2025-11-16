import * as React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/components/ui/sidebar'
import { useLocation, Link } from 'react-router'
import AppPath from '@/constants/AppPath'

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const isActive = (url: string) => {
        return location.pathname === url
    }

    const data = {
        navMain: [
            {
                title: 'Tổng quan',
                url: '#',
                items: [
                    {
                        title: 'Dashboard',
                        url: AppPath.admin,
                        isActive: isActive(AppPath.admin)
                    }
                ]
            },
            {
                title: 'Sản phẩm',
                url: '#',
                items: [
                    {
                        title: 'Quản lý danh mục',
                        url: AppPath.adminCategories,
                        isActive: isActive(AppPath.adminCategories)
                    },
                    {
                        title: 'Quản lý sản phẩm',
                        url: AppPath.adminProducts,
                        isActive: isActive(AppPath.adminProducts)
                    }
                ]
            },
            {
                title: 'Lô hàng',
                url: '#',
                items: [
                    {
                        title: 'Quản lý lô hàng',
                        url: AppPath.adminBatches,
                        isActive: isActive(AppPath.adminBatches)
                    }
                ]
            }
        ]
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <h1>
                    <Link to={AppPath.admin}>Admin Panel</Link>
                </h1>
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={item.isActive}>
                                            <Link to={item.url}>{item.title}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
