import { pgEnum } from 'drizzle-orm/pg-core'

// TypeScript enums (string enums) — exported for use across the codebase
export enum RoleName {
    Admin = 'admin',
    Customer = 'customer'
}

export enum OrderStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Shipped = 'shipped',
    Delivered = 'delivered',
    Cancelled = 'cancelled'
}

export enum PaymentStatus {
    Unpaid = 'unpaid',
    Paid = 'paid',
    Failed = 'failed'
}

export enum PaymentMethod {
    BankTransfer = 'bank_transfer',
    COD = 'COD'
}

// Helper to extract enum values as a readonly tuple, suitable for pgEnum
// Extract enum values as a mutable non-empty tuple to satisfy pgEnum overload.
function enumValues<T extends Record<string, string>>(e: T) {
    const vals = Object.values(e)
    // Ensure non-empty tuple assertion; drizzle expects [first, ...rest]
    if (vals.length === 0) throw new Error('Enum has no values')
    return vals as [string, ...string[]]
}

// Postgres enums derived from the TypeScript enums (single source of truth)
export const roleName = pgEnum('role_name', enumValues(RoleName))
export const orderStatus = pgEnum('order_status', enumValues(OrderStatus))
export const paymentStatus = pgEnum('payment_status', enumValues(PaymentStatus))
export const paymentMethod = pgEnum('payment_method', enumValues(PaymentMethod))
