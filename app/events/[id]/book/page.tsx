// app/events/[id]/book/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { getEventById } from "@/lib/api/events"
import { createReservation } from "@/lib/api/reservations"
import { createOrder } from "@/lib/api/orders"
import { initiatePayment } from "@/lib/api/payments"
import { Button } from "@/components/ui/button"
import type { TicketType } from "@/types/event"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, ShieldCheck, Clock } from "lucide-react"
import { useState, useEffect, use } from "react"


interface BookPageProps {
    params: Promise<{ id: string }>
}

// ⚠️ Vì cần fetch event nhưng component phải là "use client" (có state),
// ta dùng React.use() để unwrap Promise params
export default function BookPage({ params }: BookPageProps) {
    const { id } = use(params)
    const router = useRouter()

    const [event, setEvent] = useState<Awaited<ReturnType<typeof getEventById>> | null>(null)
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<"loading" | "select" | "processing" | "error">("loading")
    const [errorMsg, setErrorMsg] = useState("")


    useEffect(() => {
        if (typeof window !== "undefined" && !localStorage.getItem("accessToken")) {
            router.push("/auth/login")
            return
        }
        getEventById(id)
            .then(data => {
                setEvent(data)
                setStep("select")
            })
            .catch(() => setStep("error"))
    }, [id, router])

    const handleBook = async () => {
        if (!selectedTicket) return
        setIsLoading(true)
        setStep("processing")

        try {
            // B1: Giữ chỗ
            const reservation = await createReservation({
                ticketTypeId: selectedTicket.id,
                quantity,
            })

            // B2: Tạo đơn hàng từ reservation
            const order = await createOrder({
                reservationId: reservation.id,
            })

            // B3: Khởi tạo thanh toán (mock)
            await initiatePayment(order.id)

            // B4: Chuyển sang trang đơn hàng để chờ xác nhận
            router.push(`/orders/${order.id}`)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra"
            setErrorMsg(message)
            setStep("error")
            setIsLoading(false)
        }
    }

    if (step === "loading") {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-muted-foreground">
                    <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    Đang tải thông tin sự kiện...
                </div>
            </main>
        )
    }

    if (step === "processing") {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <div className="animate-spin size-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="font-semibold text-lg">Đang xử lý đặt vé...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Đang giữ chỗ, tạo đơn hàng và khởi tạo thanh toán. Vui lòng không tắt trang.
                    </p>
                </div>
            </main>
        )
    }

    if (step === "error") {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <p className="text-2xl mb-3">😵</p>
                    <p className="font-semibold text-lg text-destructive">Đã có lỗi xảy ra</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">{errorMsg || "Không thể tải thông tin sự kiện"}</p>
                    <Link href={`/events/${id}`} className="text-primary text-sm hover:underline">
                        ← Quay lại sự kiện
                    </Link>
                </div>
            </main>
        )
    }

    if (!event) return null

    const remaining = selectedTicket ? selectedTicket.remainingQuantity : 0

    const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0

    return (
        <main className="flex-1 max-w-2xl mx-auto px-4 py-10">
            {/* Breadcrumb */}
            <Link
                href={`/events/${id}`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="size-4" />
                Quay lại chi tiết sự kiện
            </Link>

            <h1 className="text-2xl font-extrabold mb-1">Đặt vé</h1>
            <p className="text-muted-foreground text-sm mb-8">{event.title}</p>

            {/* Bước 1: Chọn loại vé */}
            <section className="mb-8">
                <h2 className="font-semibold mb-4 flex items-center gap-2 text-base">
                    <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                    Chọn loại vé
                </h2>

                {event.ticketTypes.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-6 text-center border rounded-xl">
                        Sự kiện này chưa có loại vé nào.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {event.ticketTypes.map(ticket => {
                            const ticketRemaining = ticket.remainingQuantity
                            const isSoldOut = ticketRemaining <= 0
                            const isSelected = selectedTicket?.id === ticket.id

                            return (
                                <button
                                    key={ticket.id}
                                    disabled={isSoldOut}
                                    onClick={() => {
                                        setSelectedTicket(ticket)
                                        setQuantity(1)
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSoldOut
                                        ? "opacity-50 cursor-not-allowed bg-muted/30 border-dashed"
                                        : isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{ticket.name}</p>
                                            <p className="text-primary font-bold text-lg mt-0.5">
                                                {ticket.price === 0
                                                    ? "Miễn phí"
                                                    : `${ticket.price.toLocaleString("vi-VN")}đ`
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {isSoldOut ? (
                                                <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                                                    Hết vé
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Còn {ticketRemaining} vé
                                                </span>
                                            )}
                                            {isSelected && !isSoldOut && (
                                                <p className="text-xs text-primary font-semibold mt-1">✓ Đã chọn</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Bước 2: Chọn số lượng (chỉ hiện khi đã chọn vé) */}
            {selectedTicket && (
                <section className="mb-8">
                    <h2 className="font-semibold mb-4 flex items-center gap-2 text-base">
                        <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                        Số lượng vé
                    </h2>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="size-10 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(q => Math.min(remaining, q + 1))}
                            disabled={quantity >= remaining}
                            className="size-10 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                        >
                            <Plus className="size-4" />
                        </button>
                        <span className="text-sm text-muted-foreground ml-2">
                            (tối đa {remaining})
                        </span>
                    </div>
                </section>
            )}

            {/* Tóm tắt đơn & Nút xác nhận */}
            {selectedTicket && (
                <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-4">
                    <h2 className="font-bold text-base">Tóm tắt đơn hàng</h2>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{selectedTicket.name} × {quantity}</span>
                            <span className="font-medium">
                                {(selectedTicket.price * quantity).toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-base">
                            <span>Tổng cộng</span>
                            <span className="text-primary">
                                {totalPrice === 0 ? "Miễn phí" : `${totalPrice.toLocaleString("vi-VN")}đ`}
                            </span>
                        </div>
                    </div>

                    {/* Cảnh báo thời gian giữ chỗ */}
                    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900 p-3 rounded-lg">
                        <Clock className="size-4 shrink-0 mt-0.5" />
                        <span>
                            Sau khi xác nhận, hệ thống sẽ <strong>giữ chỗ 10 phút</strong> cho bạn.
                            Vui lòng hoàn tất thanh toán trước khi hết hạn.
                        </span>
                    </div>

                    <Button
                        onClick={handleBook}
                        disabled={isLoading}
                        className="w-full h-12 text-base font-bold"
                    >
                        {isLoading ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-emerald-500" />
                        Thanh toán bảo mật qua cổng Mock Gateway
                    </div>
                </div>
            )}
        </main>
    )
}
