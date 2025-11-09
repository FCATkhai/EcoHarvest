export const ROLE_NAME = {
  Admin: "admin",
  Customer: "customer",
} as const;

export const ORDER_STATUS = {
  Pending: "pending",
  Confirmed: "confirmed",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  Unpaid: "unpaid",
  Paid: "paid",
  Failed: "failed",
} as const;

export const PAYMENT_METHOD = {
  BankTransfer: "bank_transfer",
  COD: "COD",
} as const;

// export const RESTAURANT_STATUSES = {
//     CLOSING: 'closing',
//     OPENING: 'opening',
//     SUSPENDED: 'suspended',
// } as const;

// export const RESTAURANT_STATUS_VALUES = [
//     RESTAURANT_STATUSES.CLOSING,
//     RESTAURANT_STATUSES.OPENING,
//     RESTAURANT_STATUSES.SUSPENDED
// ] as const;

// export type RestaurantStatus = typeof RESTAURANT_STATUSES[keyof typeof RESTAURANT_STATUSES];

// export const ORDER_STATUSES = {
//     PENDING: 'pending',
//     PROCESSING: 'processing',
//     ORDERING: 'ordering',
//     COMPLETED: 'completed',
//     REVIEWED: 'reviewed',
//     CANCELLED: 'cancelled',
// } as const;

// export const ORDER_STATUS_VALUES = [
//     ORDER_STATUSES.PENDING,
//     ORDER_STATUSES.PROCESSING,
//     ORDER_STATUSES.ORDERING,
//     ORDER_STATUSES.COMPLETED,
//     ORDER_STATUSES.REVIEWED,
//     ORDER_STATUSES.CANCELLED,
// ] as const;

// export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
