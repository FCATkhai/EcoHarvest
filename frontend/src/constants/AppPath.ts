const AppPath = {
    home: '/',
    signIn: '/sign-in',
    signUp: '/sign-up',
    products: '/products',
    productDetail: (id: string) => `/products/${id}`,
    cart: '/cart',
    profile: '/profile',
    admin: '/admin'
} as const

export default AppPath
