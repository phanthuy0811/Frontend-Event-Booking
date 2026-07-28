"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { getOrderById } from "@/lib/api/orders"
import { initiatePayment } from "@/lib/api/payments"
import type { Order } from "@/types/order"
import Link from "next/link"
import { CreditCard, Clock, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"

interface PaymentPageProps {
    params: Promise<{ id: string }>
}

export default function PaymentPage({ params }: PaymentPageProps) {
    const { id } = use(params)
    const router = useRouter()

    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        getOrderById(id)
            .then(data => {
                setOrder(data)
                if (data.status === "PAID") {
                    router.replace(`/orders/${id}`)
                }
            })
            .catch(() => setError("Không thể tải thông tin đơn hàng"))
            .finally(() => setIsPageLoading(false))
    }, [id, router])

    const handlePayNow = async () => {
        if (!order) return
        setIsLoading(true)
        setError("")

        try {
            await initiatePayment(order.id)
            router.push(`/orders/${order.id}`)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Thanh toán thất bại, vui lòng thử lại")
            setIsLoading(false)
        }
    }

    if (isPageLoading) {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Đang tải...</p>
                </div>
            </main>
        )
    }

    if (error && !order) {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <p className="text-2xl mb-3">😵</p>
                    <p className="font-semibold text-lg text-destructive">{error}</p>
                    <Link href="/orders/my" className="text-primary text-sm hover:underline mt-4 block">
                        ← Xem đơn hàng của tôi
                    </Link>
                </div>
            </main>
        )
    }

    if (!order) return null

    const totalDisplay = `${Number(order.totalAmount).toLocaleString("vi-VN")}đ`

    return (
        <main className="flex-1 max-w-lg mx-auto px-4 py-12">
            <h1 className="text-2xl font-extrabold mb-2">Thanh toán đơn hàng</h1>
            <p className="text-muted-foreground text-sm mb-8">
                Mã đơn: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    {order.id.slice(0, 8).toUpperCase()}
                </span>
            </p>

            <div className="border rounded-2xl p-5 bg-card shadow-sm mb-6 space-y-3">
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                    Chi tiết đơn hàng
                </h2>

                <div className="space-y-2 text-sm">
                    {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">Vé × {item.quantity}</span>
                            <span className="font-medium">
                                {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{totalDisplay}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                <Button
                    onClick={handlePayNow}
                    disabled={isLoading || order.status !== "PENDING"}
                    className="w-full h-12 text-base font-bold"
                >
                    <CreditCard className="size-5 mr-2" />
                    {isLoading ? "Đang xử lý..." : "Thanh toán ngay"}
                </Button>

                <Link
                    href="/orders/my"
                    className={`${buttonVariants({ variant: "outline" })} w-full h-11 flex items-center justify-center gap-2 text-muted-foreground`}
                >
                    <Clock className="size-4" />
                    Để sau — Xem danh sách đơn hàng
                    <ChevronRight className="size-4 ml-auto" />
                </Link>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-5">
                Đơn hàng sẽ bị hủy nếu không thanh toán trong 10 phút.
            </p>
        </main>
    )
}
