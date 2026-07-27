import apiClient from "@/lib/axios"
import type { Order } from "@/types/order"

export async function createOrder(payload: {
    reservationId: string
    reminderMinutesBefore?: number
}): Promise<Order> {
    return apiClient.post("/orders", payload)
}
export async function getOrderById(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`)
}
export async function getMyOrders(): Promise<Order[]> {
    return apiClient.get("/orders/my")
}