import { auth } from './auth'

export const seedAdminUser = async () => {
    try {
        await auth.api.signUpEmail({
            body: {
                email: 'admin@gmail.com',
                password: 'admin',
                name: 'Admin'
                // role: 'admin'
            }
        })
        console.log('Admin user created:')
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message)
        } else {
            console.log(String(error) || 'something went wrong')
        }
    }
}
