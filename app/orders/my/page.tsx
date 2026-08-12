// app/orders/my/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getMyOrders, cancelOrder } from "@/lib/api/orders"
import { getCookie } from "@/lib/cookies"
import { initiatePayment } from "@/lib/api/payments"
import type { Order } from "@/types/order"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard,
    Trash2,
    Ticket,
    Calendar,
    ArrowRight,
    ShoppingBag,
    AlertCircle
} from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"

export default function MyOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [payingId, setPayingId] = useState<string | null>(null)
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    useEffect(() => {
        if (!getCookie("accessToken")) {
            router.push("/auth/login")
            return
        }
        getMyOrders()
            .then(data => setOrders(data.items ?? []))
            .catch(() => setOrders([]))
            .finally(() => setIsLoading(false))
    }, [router])

    const handlePayOrder = async (orderId: string) => {
        setPayingId(orderId)
        try {
            await initiatePayment(orderId)
            router.push(`/orders/${orderId}`)
        } catch {
            setPayingId(null)
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return
        setCancellingId(orderId)
        try {
            await cancelOrder(orderId)
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o)
            )
        } catch {
            alert("Hủy đơn hàng thất bại, vui lòng thử lại sau.")
        } finally {
            setCancellingId(null)
        }
    }

    const statusConfig = {
        PAID: {
            label: "Đã thanh toán",
            icon: CheckCircle2,
            badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
            border: "border-l-4 border-l-emerald-500"
        },
        PENDING: {
            label: "Chờ thanh toán",
            icon: Clock,
            badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
            border: "border-l-4 border-l-amber-500"
        },
        CANCELLED: {
            label: "Đã hủy",
            icon: XCircle,
            badge: "bg-destructive/15 text-destructive border-destructive/30",
            border: "border-l-4 border-l-destructive/50"
        },
    }

    // -- STATE LOADING --
    if (isLoading) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center min-h-[65vh] gap-4">
                <div className="relative flex items-center justify-center">
                    <div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <Ticket className="size-5 text-primary absolute animate-pulse" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Đang tải danh sách vé của bạn...</p>
            </main>
        )
    }

    return (
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 md:py-14">
            {/* -- HEADER -- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Đơn hàng của tôi</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Quản lý và theo dõi trạng thái thanh toán các sự kiện bạn đã đặt vé
                    </p>
                </div>
                {orders.length > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-semibold w-fit">
                        <ShoppingBag className="size-3.5" />
                        <span>Tổng: {orders.length} đơn</span>
                    </div>
                )}
            </div>

            {/* -- EMPTY STATE (CHƯA CÓ ĐƠN HÀNG) -- */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary">
                        <Ticket className="size-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Bạn chưa có đơn hàng nào</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-8">
                        Có rất nhiều sự kiện hấp dẫn đang chờ bạn khám phá. Hãy chọn cho mình một sự kiện yêu thích nhé!
                    </p>
                    <Link
                        href="/events"
                        className={`${buttonVariants({ size: "lg" })} font-semibold px-8 shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5`}
                    >
                        Khám phá sự kiện ngay
                        <ArrowRight className="size-4 ml-2" />
                    </Link>
                </div>
            ) : (
                /* -- DANH SÁCH ĐƠN HÀNG -- */
                <div className="space-y-5">
                    {orders.map(order => {
                        const cfg = statusConfig[order.status]
                        const StatusIcon = cfg.icon
                        const isPaying = payingId === order.id
                        const isCancelling = cancellingId === order.id

                        return (
                            <div
                                key={order.id}
                                className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border ${cfg.border}`}
                            >
                                {/* 1. HEADER CARD: Mã đơn & Huy hiệu trạng thái */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-foreground font-mono text-xs font-bold tracking-wide">
                                            <Ticket className="size-3 text-primary" />
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="size-3.5" />
                                            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${cfg.badge}`}>
                                        <StatusIcon className="size-3.5" />
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* 2. BODY CARD: Danh sách vé trong đơn */}
                                <div className="py-4 space-y-3">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2.5">
                                                <span className="size-2 rounded-full bg-primary/60" />
                                                <span className="font-semibold text-foreground">
                                                    {item.ticketType?.name ?? "Vé sự kiện"}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                    × {item.quantity}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-muted-foreground">
                                                {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 3. FOOTER CARD: Tổng thanh toán & Các nút hành động */}
                                <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Tổng thanh toán:
                                        </span>
                                        <span className="text-xl font-extrabold text-primary">
                                            {Number(order.totalAmount).toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>

                                    {/* Action Buttons theo trạng thái */}
                                    <div className="flex items-center gap-2.5">
                                        {order.status === "PENDING" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    disabled={isCancelling || !!payingId}
                                                    className="h-10 px-4 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                                >
                                                    <Trash2 className="size-3.5 mr-1.5" />
                                                    {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePayOrder(order.id)}
                                                    disabled={isPaying || !!cancellingId}
                                                    className="h-10 px-5 text-xs font-bold shadow-md shadow-primary/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <CreditCard className="size-4 mr-2" />
                                                    {isPaying ? "Đang xử lý..." : "Thanh toán ngay"}
                                                </Button>
                                            </>
                                        )}

                                        {order.status === "PAID" && (
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className={`${buttonVariants({ variant: "secondary", size: "sm" })} h-10 px-5 text-xs font-semibold group/btn transition-all hover:bg-primary hover:text-primary-foreground`}
                                            >
                                                Xem chi tiết
                                                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-0.5" />
                                            </Link>
                                        )}

                                        {order.status === "CANCELLED" && (
                                            <span className="text-xs font-medium text-muted-foreground italic flex items-center gap-1">
                                                <AlertCircle className="size-3.5" />
                                                Đơn hàng đã được hủy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
