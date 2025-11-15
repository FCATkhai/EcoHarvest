import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import useAuthStore from '@/store/useAuthStore'
import MainLayout from '@/layouts/MainLayout'
import RegisterLayout from '@/layouts/RegisterLayout'
import AdminLayout from '@/layouts/AdminLayout'
import AppPath from '@/constants/AppPath'
import Login from '@/pages/Login'
import SignUp from '@/pages/Register/SignUp'
import NotFound from '@/pages/NotFound'
import Forbidden from '@/pages/Forbidden'
import { USER_ROLES } from '@/constants/userRoles'
import About from '@/pages/About'

function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => !!state.user)
    return isAuthenticated ? <Outlet /> : <Navigate to={AppPath.signIn} />
}

function RejectedRoute() {
    const isAuthenticated = useAuthStore((state) => !!state.user)
    // return !isAuthenticated ? <Outlet /> : <Navigate to={AppPath.home} />
    if (!isAuthenticated) {
        return <Outlet />
    }
    console.log('User is authenticated, redirecting to home')
    return <Navigate to={AppPath.home} />
}

function AdminRoute() {
    const user = useAuthStore((state) => state.user)
    const isAdmin = user?.role === USER_ROLES.ADMIN
    return isAdmin ? <Outlet /> : <Navigate to={AppPath.forbidden} />
}

export const router = createBrowserRouter([
    {
        path: '',
        element: <MainLayout />,
        children: [
            {
                path: '/about',
                element: <About />
            }
        ]
    },
    {
        path: '',
        element: <RejectedRoute />,
        children: [
            {
                path: '',
                element: <RegisterLayout />,
                children: [
                    {
                        path: AppPath.signIn,
                        element: <Login />
                    },
                    {
                        path: AppPath.signUp,
                        element: <SignUp />
                    }
                ]
            }
        ]
    },
    {
        path: '',
        element: <ProtectedRoute />,
        children: [
            {
                path: '',
                element: <AdminRoute />,
                children: [
                    {
                        path: AppPath.admin,
                        element: <AdminLayout />
                    }
                ]
            }
        ]
    }
])
