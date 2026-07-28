// app/events/[id]/page.tsx

import { getEventById } from "@/lib/api/events"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
    Calendar,
    MapPin,
    Clock,
    Ticket,
    ArrowLeft,
    ShieldCheck,
    Share2,
    Heart,
    Info,
    Sparkles
} from "lucide-react"
import { BookEventButton } from "@/components/events/book-event-button"

interface EventDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = await params
    let event
    try {
        event = await getEventById(id)
    } catch {
        notFound()
    }

    const startDateObj = new Date(event.startTime)
    const endDateObj = new Date(event.endTime)

    const formattedDate = startDateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const formattedTime = `${startDateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} – ${endDateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`

    // Tìm giá vé thấp nhất
    const minPrice = event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.price))
        : null

    return (
        <main className="flex-1 bg-background pb-20">
            {/* === BREADCRUMB & TOP NAV === */}
            <div className="border-b bg-muted/30">
                <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Link
                            href="/events"
                            className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
                        >
                            <ArrowLeft className="size-4" />
                            Danh sách sự kiện
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium truncate max-w-[240px] sm:max-w-md">
                            {event.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                            <Share2 className="size-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-colors">
                            <Heart className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* === HERO BANNER & TITLE HEADER === */}
            <div className="max-w-6xl mx-auto px-4 pt-6">
                <div className="relative w-full h-[280px] sm:h-[400px] rounded-2xl overflow-hidden bg-muted shadow-lg border border-border/50">
                    {event.bannerUrl ? (
                        <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                            <Sparkles className="size-16 text-primary/40 animate-pulse" />
                            <span className="text-sm font-medium text-muted-foreground">Sự kiện chưa có ảnh bìa</span>
                        </div>
                    )}

                    {/* Gradient Overlay sang trọng */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Title & Badge trên Banner */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {event.category && (
                                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                    <Ticket className="size-3.5" />
                                    {event.category}
                                </span>
                            )}
                            <span className="bg-black/40 backdrop-blur-md text-white/90 border border-white/10 text-xs px-3 py-1 rounded-full font-medium">
                                Đang mở bán vé
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
                            {event.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* === MAIN CONTENT LAYOUT === */}
            <div className="max-w-6xl mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- CỘT TRÁI (8/12) — THÔNG TIN CHI TIẾT --- */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Event Info Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl border bg-card/60 shadow-xs">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                                    <Calendar className="size-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Thời gian tổ chức
                                    </p>
                                    <p className="font-semibold text-base text-foreground capitalize">
                                        {formattedDate}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3.5" /> {formattedTime}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl border bg-card/60 shadow-xs">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                                    <MapPin className="size-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Địa điểm
                                    </p>
                                    <p className="font-semibold text-base text-foreground leading-snug">
                                        {event.location}
                                    </p>
                                    <p className="text-xs text-primary font-medium hover:underline cursor-pointer">
                                        Xem trên Google Maps →
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-border/60" />

                        {/* Description Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="size-5 text-primary" />
                                <h2 className="text-xl font-bold tracking-tight">
                                    Giới thiệu sự kiện
                                </h2>
                            </div>

                            {event.description ? (
                                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line bg-muted/20 p-6 rounded-2xl border border-border/40">
                                    {event.description}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm py-4">
                                    Sự kiện này chưa có thông tin giới thiệu chi tiết.
                                </p>
                            )}
                        </section>
                    </div>

                    {/* --- CỘT PHẢI (4/12) — TICKET BOOKING WIDGET (STICKY) --- */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-20 rounded-2xl border bg-card p-6 shadow-sm space-y-6">

                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        Giá vé khởi điểm
                                    </p>
                                    <p className="text-2xl font-black text-primary">
                                        {minPrice === null
                                            ? "Chưa mở bán"
                                            : minPrice === 0
                                                ? "Miễn phí"
                                                : `${minPrice.toLocaleString("vi-VN")}đ`
                                        }
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                    Có sẵn vé
                                </span>
                            </div>

                            {/* Ticket Types List */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold flex items-center gap-1.5">
                                    <Ticket className="size-4 text-primary" />
                                    Danh sách loại vé ({event.ticketTypes.length})
                                </p>

                                {event.ticketTypes.length === 0 ? (
                                    <div className="p-4 text-center rounded-xl bg-muted/40 text-sm text-muted-foreground">
                                        Hiện chưa có thông tin vé cho sự kiện này.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                                        {event.ticketTypes.map(ticket => {
                                            // Tính trực tiếp từ totalQuantity và remainingQuantity
                                            const remaining = ticket.remainingQuantity
                                            const sold = ticket.totalQuantity - ticket.remainingQuantity
                                            const isSoldOut = remaining <= 0
                                            const percent = ticket.totalQuantity > 0
                                                ? Math.round((sold / ticket.totalQuantity) * 100)
                                                : 0
                                            const isAlmostSoldOut = remaining <= 5 && !isSoldOut

                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className={`p-3.5 rounded-xl border transition-all ${isSoldOut
                                                        ? "bg-muted/30 opacity-60 border-dashed"
                                                        : "bg-card hover:border-primary/40 hover:shadow-2xs"
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {ticket.name}
                                                        </span>
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSoldOut
                                                            ? "bg-destructive/10 text-destructive"
                                                            : isAlmostSoldOut
                                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                                : "bg-primary/10 text-primary"
                                                            }`}>
                                                            {isSoldOut ? "Hết vé" : `Còn ${remaining} vé`}
                                                        </span>
                                                    </div>

                                                    <p className="font-bold text-primary text-base">
                                                        {Number(ticket.price) === 0
                                                            ? "Miễn phí"
                                                            : `${Number(ticket.price).toLocaleString("vi-VN")}đ`
                                                        }
                                                    </p>

                                                    {/* Progress bar */}
                                                    <div className="mt-2 space-y-1">
                                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${isSoldOut ? "bg-destructive" : "bg-primary"
                                                                    }`}
                                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                                                            <span>Đã bán {percent}%</span>
                                                            <span>Tổng {ticket.totalQuantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="space-y-2.5 pt-2">
                                <BookEventButton eventId={event.id} />
                                <Link
                                    href="/events"
                                    className={`${buttonVariants({ variant: "outline" })} w-full text-xs text-muted-foreground`}
                                >
                                    ← Quay lại danh sách sự kiện
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
