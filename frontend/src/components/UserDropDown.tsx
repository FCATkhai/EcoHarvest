import { LogOutIcon, ShieldIcon, UserIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from './ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu'
import type { User } from '@/types/user.type'
import { Link, useNavigate } from 'react-router'
import AppPath from '@/constants/AppPath'
import useAuthStore from '@/store/useAuthStore'
import { USER_ROLES } from '@/constants/userRoles'

interface UserDropdownProps {
    user: User
}

export function UserDropdown({ user }: UserDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                    <UserIcon />
                    <span className='max-w-[12rem] truncate'>{user.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to={AppPath.profile}>
                        <UserIcon className='size-4' /> <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                {user.role === USER_ROLES.ADMIN && <AdminItem />}
                <SignOutItem />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function AdminItem() {
    return (
        <DropdownMenuItem asChild>
            <Link to={AppPath.admin}>
                <ShieldIcon className='size-4' /> <span>Admin</span>
            </Link>
        </DropdownMenuItem>
    )
}

function SignOutItem() {
    const navigate = useNavigate()
    const signOut = useAuthStore((state) => state.signOut)

    async function handleSignOut() {
        try {
            await signOut()
            toast.success('Đăng xuất thành công')
            navigate(AppPath.home)
        } catch {
            toast.error('Đăng xuất thất bại')
            return
        }
    }

    return (
        <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon className='size-4' /> <span>Đăng xuất</span>
        </DropdownMenuItem>
    )
}
