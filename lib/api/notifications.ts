import apiClient from "@/lib/axios"
import type { NotificationCursorResponse } from "@/types/notification"

export async function getMyNotifications(cursor?: string): Promise<NotificationCursorResponse> {
    const params = new URLSearchParams({ limit: "10" })
    if (cursor) params.append("cursor", cursor)
    return apiClient.get(`/notifications/my?${params.toString()}`)
}

export async function markNotificationRead(id: string): Promise<void> {
    return apiClient.patch(`/notifications/${id}/read`)
}
