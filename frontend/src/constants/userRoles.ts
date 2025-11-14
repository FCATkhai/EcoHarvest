export const USER_ROLES = {
    Customer: 'customer',
    Admin: 'admin'
} as const

export const USER_GROUPS = {
    ALL_USERS: [USER_ROLES.Customer, USER_ROLES.Admin],
    ADMINS_ONLY: [USER_ROLES.Admin]
}
