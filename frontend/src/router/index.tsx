import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import useAuthStore from '@/store/useAuthStore'
import MainLayout from '@/layouts/MainLayout'
import RegisterLayout from '@/layouts/RegisterLayout'
import AdminLayout from '@/layouts/AdminLayout'

import ManageCategory from '@/pages/Admin/ManageCategory'
import Dashboard from '@/pages/Admin/Dashboard/Dashboard'
import ManageBatch from '@/pages/Admin/ManageBatch'

import AppPath from '@/constants/AppPath'
import Login from '@/pages/Login'
import SignUp from '@/pages/Register/SignUp'
import NotFound from '@/pages/NotFound'
import Forbidden from '@/pages/Forbidden'

import Home from '@/pages/Home'
import Products from '@/pages/Products/Products'
import ProductDetail from '@/pages/ProductDetail'
import CardDetail from '@/pages/CartDetail'
import Checkout from '@/pages/Checkout'
import OrderPage from '@/pages/OrderPage'

import { USER_ROLES } from '@/constants/userRoles'
import About from '@/pages/About'
import ManageProduct from '@/pages/Admin/ManageProduct/ManageProduct'

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
                path: AppPath.home,
                element: <Home />
            },
            {
                path: AppPath.products,
                element: <Products />
            },
            {
                path: AppPath.productDetail(':id'),
                element: <ProductDetail />
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
                        path: '',
                        element: <AdminLayout />,
                        children: [
                            {
                                path: AppPath.admin,
                                element: <Dashboard />
                            },
                            {
                                path: AppPath.adminCategories,
                                element: <ManageCategory />
                            },
                            {
                                path: AppPath.adminProducts,
                                element: <ManageProduct />
                            },
                            {
                                path: AppPath.adminBatches,
                                element: <ManageBatch />
                            }
                        ]
                    },
                    {
                        path: '',
                        element: <MainLayout />,
                        children: [
                            {
                                path: AppPath.cart,
                                element: <CardDetail />
                            },
                            {
                                path: AppPath.checkout,
                                element: <Checkout />
                            },
                            {
                                path: AppPath.orders,
                                element: <OrderPage />
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: AppPath.forbidden,
        element: <Forbidden />
    },
    {
        path: '*',
        element: <NotFound />
    }
])
