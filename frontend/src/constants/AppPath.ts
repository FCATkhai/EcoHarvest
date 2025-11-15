import { admin } from 'better-auth/plugins/admin'

const AppPath = {
    home: '/',
    signIn: '/sign-in',
    signUp: '/sign-up',
    products: '/products',
    productDetail: (id: string) => `/products/${id}`,
    cart: '/cart',
    profile: '/profile',
    admin: '/admin',
    adminCategories: '/admin/categories',
    adminBatches: '/admin/batches',
    adminProducts: '/admin/products',
    adminOrders: '/admin/orders',
    forbidden: '/forbidden',
    notFound: '/not-found'
} as const

export default AppPath
