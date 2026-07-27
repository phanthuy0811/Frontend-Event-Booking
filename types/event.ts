export interface TicketType {
    id: string,
    name: string,
    price: number,
    quantity: number,
    sold: number
}

export interface Event {
    id: string
    title: string
    description?: string
    bannerUrl?: string
    location: string
    category?: string
    startTime: string
    endTime: string
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CANCELLED'
    organizerId: string
    ticketTypes: TicketType[]
}

export interface EventsQuery {
    search?: string
    category?: string
    location?: string
}