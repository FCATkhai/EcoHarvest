export const ORDER_STATUS = {
    Pending: 'pending',
    Processing: 'processing',
    Shipped: 'shipped',
    Completed: 'completed',
    Cancelled: 'cancelled'
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const PAYMENT_STATUS = {
    Unpaid: 'unpaid',
    Paid: 'paid',
    Failed: 'failed',
    Refunded: 'refunded'
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_METHOD = {
    BankTransfer: 'bank_transfer',
    COD: 'COD'
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
