import apiClient from "@/lib/axios"
import type { Payment } from "@/types/order"

export async function initiatePayment(orderId: string): Promise<Payment> {
    return apiClient.post("/payments", { orderId })
}
export async function getPaymentByOrder(orderId: string): Promise<Payment> {
    return apiClient.get(`/payments/order/${orderId}`)
}