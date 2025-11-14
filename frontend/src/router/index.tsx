import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import useAuthStore from '@/store/useAuthStore'
import MainLayout from '@/layouts/MainLayout'
import RegisterLayout from '@/layouts/RegisterLayout'
import AppPath from '@/constants/AppPath'
import Login from '@/pages/Login'
import SignUp from '@/pages/Register/SignUp'

function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => !!state.user)
    return isAuthenticated ? <Outlet /> : <Navigate to={AppPath.signIn} />
}

function RejectedRoute() {
    const isAuthenticated = useAuthStore((state) => !!state.user)
    return !isAuthenticated ? <Outlet /> : <Navigate to={AppPath.home} />
}

export const router = createBrowserRouter([
    {
        path: '',
        element: <MainLayout />
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
    }
])
