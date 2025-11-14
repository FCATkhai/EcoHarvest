export interface User {
    id: string
    name: string
    email: string
    role?: string | undefined | null
    image?: string | undefined | null
    createdAt: Date
    updatedAt: Date
    emailVerified: boolean
}
