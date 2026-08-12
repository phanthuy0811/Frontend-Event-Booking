export interface Notification {
    id: string
    userId: string
    type: 'booking_confirmed' | 'event_reminder' | 'event_cancelled' | string
    title: string
    message: string
    isRead: boolean
    createdAt: string
}

export interface NotificationCursorResponse {
    items: Notification[]
    nextCursor: string | null
    hasNextPage: boolean
}
