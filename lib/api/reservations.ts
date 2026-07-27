import apiClient from "@/lib/axios"
import type { Reservation } from "@/types/order"
export async function createReservation(payload: {
    ticketTypeId: string
    quantity: number
}): Promise<Reservation> {
    return apiClient.post("/reservations", payload)
}