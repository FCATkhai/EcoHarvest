// Order statuses
export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUSES = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED
] as const

// Payment statuses
export const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUSES = [
    PAYMENT_STATUS.UNPAID,
    PAYMENT_STATUS.PAID,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED
] as const

// Payment methods
export const PAYMENT_METHOD = {
    BANK_TRANSFER: 'bank_transfer',
    COD: 'COD'
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
