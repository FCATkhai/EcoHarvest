import { Outlet } from 'react-router'
import { RegisterHeader } from '@/components/RegisterHeader'
export default function RegisterLayout() {
    return (
        <div>
            <RegisterHeader />
            <Outlet />
        </div>
    )
}
