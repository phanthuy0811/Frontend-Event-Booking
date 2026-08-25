import apiClient from "../axios"
import type { Event } from "@/types/event"

export async function getMyEventsApi(): Promise<Event[]> {
    const res = await apiClient.get("/events/organizer")
    return (res as any).items ?? res
}

export async function createEventApi(payload: {
    title: string
    description?: string
    bannerUrl?: string
    location: string
    category?: string
    startTime: string
    endTime: string
}): Promise<Event> {
    return apiClient.post("/events/create", payload)
}

export async function updateEventApi(id: string, payload: Partial<{
    title: string
    description: string
    bannerUrl: string
    location: string
    category: string
    startTime: string
    endTime: string
}>): Promise<Event> {
    return apiClient.patch(`/events/${id}/update`, payload)
}

export async function submitEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/submit`)
}

export async function cancelEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/cancel`)
}

export async function createTicketTypeApi(eventId: string, payload: {
    name: string
    price: number
    totalQuantity: number
    salesStart?: string
    salesEnd?: string
}) {
    return apiClient.post(`/ticket-type/${eventId}/create`, payload)
}

export async function updateTicketTypeApi(eventId: string, ticketTypeId: string, payload: Partial<{
    name: string
    price: number
    totalQuantity: number
    salesStart: string
    salesEnd: string
}>) {
    return apiClient.patch(`/ticket-type/${eventId}/${ticketTypeId}/update`, payload)
}

export async function deleteTicketTypeApi(eventId: string, ticketTypeId: string) {
    return apiClient.delete(`/ticket-type/${eventId}/${ticketTypeId}/delete`)
}
