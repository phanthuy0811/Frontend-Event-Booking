import apiClient from "../axios"
import type { Event } from "@/types/event"

// === Event Management ===

export async function getAdminEventsApi(params?: {
    status?: string
    search?: string
    page?: number
    limit?: number
}): Promise<{ items: Event[]; total: number; page: number; totalPages: number }> {
    return apiClient.get("/events/admin", { params })
}

export async function approveEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/approval`)
}

export async function rejectEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/reject`)
}

export async function cancelEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/cancel`)
}

export async function closeEventApi(id: string): Promise<Event> {
    return apiClient.patch(`/events/${id}/close`)
}

// === User Management ===

export async function updateUserRoleApi(userId: string, role: string): Promise<{ id: string; email: string; fullName: string; role: string }> {
    return apiClient.patch(`/users/admin/${userId}/role`, { role })
}
