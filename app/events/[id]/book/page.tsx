"use client"

import { useRouter } from "next/navigation"
import { getEventById } from "@/lib/api/events"
import { createReservation } from "@/lib/api/reservations"
import { createOrder } from "@/lib/api/orders"
import { getCookie } from "@/lib/cookies"
import { Button } from "@/components/ui/button"
import type { TicketType } from "@/types/event"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, ShieldCheck, Clock, Ticket, CheckCircle2, Sparkles } from "lucide-react"
import { useState, useEffect, use } from "react"

interface BookPageProps {
    params: Promise<{ id: string }>
}

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
        if (!getCookie("accessToken")) {
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
            const reservation = await createReservation({
                ticketTypeId: selectedTicket.id,
                quantity,
            })

            const order = await createOrder({
                reservationId: reservation.id,
            })

            router.push(`/orders/${order.id}/payment`)
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
                <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
                    <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm font-medium">Đang tải thông tin sự kiện...</p>
                </div>
            </main>
        )
    }

    if (step === "processing") {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm p-8 rounded-3xl border bg-card shadow-lg space-y-4">
                    <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <h2 className="font-semibold text-xl">Đang xử lý đặt vé...</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Hệ thống đang giữ chỗ và tạo đơn hàng cho bạn. Vui lòng không đóng trang này.
                    </p>
                </div>
            </main>
        )
    }

    if (step === "error") {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm p-8 rounded-3xl border bg-card shadow-lg space-y-4">
                    <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto text-3xl">
                        😵
                    </div>
                    <h2 className="font-semibold text-xl text-destructive">Đã có lỗi xảy ra</h2>
                    <p className="text-sm text-muted-foreground">{errorMsg || "Không thể tải thông tin sự kiện"}</p>
                    <Link
                        href={`/events/${id}`}
                        className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Quay lại sự kiện
                    </Link>
                </div>
            </main>
        )
    }

    if (!event) return null

    const remaining = selectedTicket ? selectedTicket.remainingQuantity : 0
    const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0

    return (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
            <div className="mb-8">
                <Link
                    href={`/events/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-muted/40 hover:bg-muted px-3.5 py-2 rounded-xl"
                >
                    <ArrowLeft className="size-4" />
                    Quay lại chi tiết sự kiện
                </Link>

                <div className="mt-4 flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Ticket className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Đặt vé</h1>
                        <p className="text-muted-foreground text-sm sm:text-base font-normal mt-0.5">{event.title}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <div className="lg:col-span-7 space-y-8">

                    <section className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <span className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm">
                                1
                            </span>
                            <h2 className="font-semibold text-lg">Chọn hạng vé của bạn</h2>
                        </div>

                        {event.ticketTypes.length === 0 ? (
                            <div className="text-muted-foreground text-sm py-10 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                                Sự kiện này chưa có loại vé nào đang mở bán.
                            </div>
                        ) : (
                            <div className="grid gap-3.5">
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
                                            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${isSoldOut
                                                ? "opacity-50 cursor-not-allowed bg-muted/40 border-dashed"
                                                : isSelected
                                                    ? "border-primary bg-primary/[0.04] shadow-sm scale-[1.01]"
                                                    : "border-border hover:border-primary/40 bg-card hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-base group-hover:text-primary transition-colors">
                                                            {ticket.name}
                                                        </p>
                                                        {isSelected && !isSoldOut && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                                                <CheckCircle2 className="size-3" />
                                                                Đang chọn
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-primary font-bold text-lg">
                                                        {ticket.price === 0
                                                            ? "Miễn phí"
                                                            : `${ticket.price.toLocaleString("vi-VN")}đ`
                                                        }
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    {isSoldOut ? (
                                                        <span className="text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                                                            Hết vé
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                                            Còn {ticketRemaining} vé
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {selectedTicket && (
                        <section className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-2.5">
                                <span className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm">
                                    2
                                </span>
                                <h2 className="font-semibold text-lg">Số lượng vé</h2>
                            </div>

                            <div className="p-6 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-sm">{selectedTicket.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Tối đa {remaining} vé
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted hover:border-primary/40 disabled:opacity-30 disabled:hover:border-border transition-all font-medium"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="text-lg font-bold w-10 text-center select-none">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(remaining, q + 1))}
                                        disabled={quantity >= remaining}
                                        className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted hover:border-primary/40 disabled:opacity-30 disabled:hover:border-border transition-all font-medium"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <div className="sticky top-24 border border-border/80 rounded-3xl p-7 bg-card shadow-lg shadow-black/[0.02] space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles className="size-5 text-amber-500" />
                                Tóm tắt đơn hàng
                            </h2>
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                                Bước 1/2
                            </span>
                        </div>

                        {selectedTicket ? (
                            <div className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>{selectedTicket.name} × {quantity}</span>
                                        <span className="font-medium text-foreground">
                                            {(selectedTicket.price * quantity).toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>

                                    <div className="border-t pt-3 flex justify-between items-baseline font-bold text-base">
                                        <span>Tổng thanh toán</span>
                                        <span className="text-xl text-primary font-bold">
                                            {totalPrice === 0 ? "Miễn phí" : `${totalPrice.toLocaleString("vi-VN")}đ`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-xs text-amber-700 bg-amber-500/10 dark:text-amber-400 border border-amber-500/20 p-3.5 rounded-2xl leading-relaxed font-normal">
                                    <Clock className="size-4 shrink-0 mt-0.5 text-amber-500" />
                                    <span>
                                        Hệ thống sẽ tự động <strong className="font-semibold">giữ chỗ 10 phút</strong> cho vé của bạn sau khi nhấn nút xác nhận bên dưới.
                                    </span>
                                </div>

                                <Button
                                    onClick={handleBook}
                                    disabled={isLoading}
                                    className="w-full h-12 text-base font-semibold rounded-2xl shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all"
                                >
                                    {isLoading ? "Đang tạo đơn hàng..." : "Đặt vé ngay"}
                                </Button>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm space-y-2">
                                <Ticket className="size-10 mx-auto text-muted-foreground/40" />
                                <p>Vui lòng chọn một hạng vé bên trái để tiếp tục đặt vé.</p>
                            </div>
                        )}

                        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-normal text-muted-foreground">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                            <span>Thanh toán an toàn, mã hoá thông tin 100%</span>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}
