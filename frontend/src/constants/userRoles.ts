export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin'
} as const

export const USER_GROUPS = {
    ALL_USERS: [USER_ROLES.CUSTOMER, USER_ROLES.ADMIN],
    ADMINS_ONLY: [USER_ROLES.ADMIN]
}
