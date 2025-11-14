import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import AppPath from '@/constants/AppPath'
import AppLogo from '@/assets/logo.png'

export function RegisterHeader() {
    return (
        <header className='w-full border-b bg-white'>
            <div className='container mx-auto max-w-6xl flex items-center justify-center px-4 py-3'>
                {/* <div className='text-2xl font-bold text-green-600'>EcoHarvest</div>
                 */}
                <Link to={AppPath.home} className='flex items-center gap-2 font-semibold'>
                    <img src={AppLogo} alt='EcoHarvest Logo' width={100} className='border-muted ' />
                </Link>
            </div>
        </header>
    )
}
