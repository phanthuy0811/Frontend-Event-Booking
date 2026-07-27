// app/orders/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getOrderById } from "@/lib/api/orders"
import type { Order } from "@/types/order"
import Link from "next/link"
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { use } from "react"

interface OrderPageProps {
    params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderPageProps) {
    const { id } = use(params)
    const [order, setOrder] = useState<Order | null>(null)
    const [isPolling, setIsPolling] = useState(true)

    useEffect(() => {
        // Poll mỗi 3 giây chờ order chuyển PAID (mock gateway ~5 giây)
        const interval = setInterval(async () => {
            try {
                const data = await getOrderById(id)
                setOrder(data)

                if (data.status !== "PENDING") {
                    // Có kết quả rồi — dừng polling
                    setIsPolling(false)
                    clearInterval(interval)
                }
            } catch {
                setIsPolling(false)
                clearInterval(interval)
            }
        }, 3000)

        // Fetch ngay lần đầu
        getOrderById(id).then(data => {
            setOrder(data)
            if (data.status !== "PENDING") setIsPolling(false)
        }).catch(() => setIsPolling(false))

        return () => clearInterval(interval)
    }, [id])

    // Tính tổng từ items nếu có
    const totalDisplay = order?.totalAmount
        ? `${Number(order.totalAmount).toLocaleString("vi-VN")}đ`
        : "—"

    if (!order) {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Đang tải đơn hàng...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 max-w-lg mx-auto px-4 py-16">

            {/* Status Icon & Title */}
            <div className="text-center mb-8">
                {order.status === "PAID" ? (
                    <>
                        <CheckCircle className="size-20 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            Đặt vé thành công! 🎉
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Vé của bạn đã được xác nhận. Kiểm tra email để nhận vé điện tử.
                        </p>
                    </>
                ) : order.status === "CANCELLED" ? (
                    <>
                        <XCircle className="size-20 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-extrabold text-destructive">
                            Đặt vé thất bại
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Đơn hàng đã bị hủy. Có thể do hết thời gian giữ chỗ hoặc lỗi thanh toán.
                        </p>
                    </>
                ) : (
                    // PENDING — đang chờ
                    <>
                        <div className="relative mx-auto size-20 mb-4">
                            <Clock className="size-20 text-primary/30 mx-auto" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin size-12 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold">
                            Đang xử lý thanh toán...
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Hệ thống đang xử lý. Trang sẽ tự cập nhật, vui lòng chờ.
                        </p>
                    </>
                )}
            </div>

            {/* Chi tiết đơn */}
            <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-4 mb-6">
                <h2 className="font-bold text-base">Chi tiết đơn hàng</h2>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã đơn</span>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {order.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Trạng thái</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : order.status === "CANCELLED"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-amber-500/10 text-amber-600"
                            }`}>
                            {order.status === "PAID" ? "Đã thanh toán"
                                : order.status === "CANCELLED" ? "Đã hủy"
                                    : "Chờ thanh toán"}
                        </span>
                    </div>

                    {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">
                                Vé × {item.quantity}
                            </span>
                            <span>
                                {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    ))}

                    <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{totalDisplay}</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
                {order.status === "PAID" ? (
                    <Link href="/events" className={`${buttonVariants({ variant: "default" })} w-full justify-center`}>
                        Khám phá thêm sự kiện
                    </Link>
                ) : order.status === "CANCELLED" ? (
                    <Link href="/events" className={`${buttonVariants({ variant: "default" })} w-full justify-center`}>
                        Tìm sự kiện khác
                    </Link>
                ) : null}

                <Link href="/events" className={`${buttonVariants({ variant: "outline" })} w-full justify-center text-muted-foreground`}>
                    <ArrowLeft className="size-4 mr-1" />
                    Về trang sự kiện
                </Link>
            </div>
        </main>
    )
}
