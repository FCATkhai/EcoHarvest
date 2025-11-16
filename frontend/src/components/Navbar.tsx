import AppLogo from '@/assets/logo.png'
import { UserDropdown } from '@/components/UserDropDown'
import CartIcon from './CartIcon'
import { Link } from 'react-router'
import AppPath from '@/constants/AppPath'
import useAuthStore from '@/store/useAuthStore'

export function Navbar({ children }: { children?: React.ReactNode }) {
    const user = useAuthStore((state) => state.user)

    return (
        <header className='w-full border-b bg-white'>
            <div className='container mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
                <div>
                    {children}
                    <Link to={AppPath.home} className='flex items-center gap-2 font-semibold'>
                        <img src={AppLogo} alt='EcoHarvest Logo' width={100} className='border-muted ' />
                    </Link>
                </div>
                <div className='flex items-center gap-4'>
                    <CartIcon />
                    {user ? <UserDropdown user={user} /> : <Link to={AppPath.signIn}>Đăng nhập</Link>}
                </div>
            </div>
        </header>
    )
}
