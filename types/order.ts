export interface Reservation {
    id: string
    ticketTypeId: string
    userId: string
    quantity: number
    status: 'HOLDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED'
    expiresAt: string
}

export interface OrderItem {
    id: string
    ticketTypeId: string
    quantity: number
    unitPrice: number
}

export interface Order {
    id: string
    userId: string
    reservationId: string
    totalAmount: number
    status: 'PENDING' | 'PAID' | 'CANCELLED'
    createdAt: string
    items: OrderItem[]
}

export interface Payment {
    id: string
    orderId: string
    provider: string
    referenceId: string
    amount: number
    status: 'PENDING' | 'PAID' | 'FAILED'
    paidAt?: string
}
