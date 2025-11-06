export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export const USER_GROUPS = {
  ALL_USERS: [USER_ROLES.CUSTOMER, USER_ROLES.ADMIN],
  ADMINS_ONLY: [USER_ROLES.ADMIN],
};

// export const USER_ROLES = {
//     CUSTOMER: "customer",
//     RESTAURANT_OWNER: "restaurant_owner",
//     ADMIN: "admin",
// } as const;

// export const USER_GROUPS = {
//     ALL_USERS: [USER_ROLES.CUSTOMER, USER_ROLES.RESTAURANT_OWNER, USER_ROLES.ADMIN],
//     CUSTOMER_ADMIN: [USER_ROLES.CUSTOMER, USER_ROLES.ADMIN],
//     OWNER_ADMIN: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.ADMIN],
//     RESTAURANT_OWNER: [USER_ROLES.RESTAURANT_OWNER],
//     ADMIN_ONLY: [USER_ROLES.ADMIN],
// };

// export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
