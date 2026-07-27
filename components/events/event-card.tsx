import type { Event } from "@/types/event"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface EventCardProps {
    event: Event
}

export function EventCard({ event }: EventCardProps) {
    const minPrice = event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.price))
        : null

    const formattedDate = new Date(event.startTime).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const formattedTime = new Date(event.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <Link href={`/events/${event.id}`} className="group block">
            <Card className="overflow-hidden border-0 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5 cursor-pointer bg-card">
                {/* Ảnh banner */}
                <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    {event.bannerUrl ? (
                        <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                            🎟️
                        </div>
                    )}
                    {/* Gradient overlay nhẹ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge category */}
                    {event.category && (
                        <span className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            {event.category}
                        </span>
                    )}
                </div>

                <CardContent className="p-4 flex flex-col gap-3">
                    <h3 className="font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {event.title}
                    </h3>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>📅</span>
                            <span>{formattedDate} • {formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>📍</span>
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    {/* Giá vé */}
                    <div className="pt-2 border-t flex items-center justify-between">
                        {minPrice !== null ? (
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Từ</p>
                                <p className="text-base font-bold text-primary">
                                    {minPrice === 0 ? "Miễn phí" : `${minPrice.toLocaleString("vi-VN")}đ`}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Chưa có vé</p>
                        )}
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            Xem →
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
