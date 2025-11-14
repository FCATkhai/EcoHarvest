import AppLogo from '@/assets/logo.png'
import { UserDropdown } from '@/components/UserDropDown'
import { Link } from 'react-router'
import AppPath from '@/constants/AppPath'
import useAuthStore from '@/store/useAuthStore'

export function Navbar() {
    const user = useAuthStore((state) => state.user)

    return (
        <header className='w-full border-b bg-white'>
            <div className='container mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
                <Link to={AppPath.home} className='flex items-center gap-2 font-semibold'>
                    <img src={AppLogo} alt='EcoHarvest Logo' width={100} className='border-muted ' />
                </Link>
                {user ? <UserDropdown user={user} /> : <Link to={AppPath.signIn}>Đăng nhập</Link>}
            </div>
        </header>
    )
}
