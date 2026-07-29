"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, CalendarDays, Users, Ticket, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, FileEdit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMyEventsApi, submitEventApi, cancelEventApi } from "@/lib/api/organizer"
import { getCookie } from "@/lib/cookies"
import type { Event } from "@/types/event"

const STATUS_CONFIG = {
    DRAFT: { label: "Bản nháp", color: "text-slate-500", bg: "bg-slate-100", icon: FileEdit },
    PENDING_APPROVAL: { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
    PUBLISHED: { label: "Đã đăng", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
    CANCELLED: { label: "Đã hủy", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
}

export default function OrganizerDashboardPage() {
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        const token = getCookie("accessToken")
        if (!token) { router.push("/auth/login"); return }

        getMyEventsApi()
            .then(setEvents)
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [router])

    const handleSubmit = async (id: string) => {
        if (!confirm("Gửi sự kiện này để Admin xét duyệt?")) return
        setActionLoading(id + "_submit")
        try {
            const updated = await submitEventApi(id)
            setEvents(prev => prev.map(e => e.id === id ? { ...e, status: updated.status } : e))
        } catch { alert("Gửi duyệt thất bại!") }
        finally { setActionLoading(null) }
    }

    const handleCancel = async (id: string) => {
        if (!confirm("Bạn chắc chắn muốn HỦY sự kiện này? Hành động này không thể hoàn tác.")) return
        setActionLoading(id + "_cancel")
        try {
            const updated = await cancelEventApi(id)
            setEvents(prev => prev.map(e => e.id === id ? { ...e, status: updated.status } : e))
        } catch { alert("Hủy sự kiện thất bại!") }
        finally { setActionLoading(null) }
    }

    const stats = {
        total: events.length,
        published: events.filter(e => e.status === "PUBLISHED").length,
        pending: events.filter(e => e.status === "PENDING_APPROVAL").length,
        draft: events.filter(e => e.status === "DRAFT").length,
    }

    return (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý sự kiện</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Quản lý toàn bộ sự kiện của bạn</p>
                </div>
                <Link href="/organizer/events/create">
                    <Button className="gap-2 rounded-xl font-semibold shadow-sm">
                        <Plus className="size-4" />
                        Tạo sự kiện mới
                    </Button>
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Tổng sự kiện", value: stats.total, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Đang đăng", value: stats.published, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                    { label: "Chờ duyệt", value: stats.pending, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
                    { label: "Bản nháp", value: stats.draft, icon: FileEdit, color: "text-slate-500", bg: "bg-slate-100" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="p-5 rounded-2xl border bg-card flex items-center gap-4">
                        <div className={`size-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Event list */}
            {isLoading ? (
                <div className="py-16 text-center text-muted-foreground">Đang tải danh sách sự kiện...</div>
            ) : events.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20 space-y-3">
                    <CalendarDays className="size-12 mx-auto text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">Bạn chưa có sự kiện nào.</p>
                    <Link href="/organizer/events/create">
                        <Button variant="outline" className="mt-2 rounded-xl font-semibold gap-2">
                            <Plus className="size-4" />
                            Tạo sự kiện đầu tiên
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map(event => {
                        const cfg = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
                        const StatusIcon = cfg.icon
                        const isDraft = event.status === "DRAFT"
                        const isCancellable = event.status !== "CANCELLED"

                        return (
                            <div key={event.id} className="p-5 rounded-2xl border bg-card hover:shadow-sm transition-shadow space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="font-semibold text-base truncate">{event.title}</h2>
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                                <StatusIcon className="size-3" />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            📍 {event.location} &nbsp;·&nbsp;
                                            🗓️ {new Date(event.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            🎫 {event.ticketTypes?.length ?? 0} loại vé
                                        </p>
                                    </div>
                                </div>

                                {/* Hành động */}
                                <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                                    <Link href={`/organizer/events/${event.id}`}>
                                        <Button variant="outline" size="sm" className="rounded-lg gap-1.5 font-medium text-xs h-8">
                                            <Ticket className="size-3.5" />
                                            Quản lý vé
                                        </Button>
                                    </Link>

                                    {isDraft && (
                                        <Link href={`/organizer/events/${event.id}/edit`}>
                                            <Button variant="outline" size="sm" className="rounded-lg gap-1.5 font-medium text-xs h-8">
                                                <FileEdit className="size-3.5" />
                                                Chỉnh sửa
                                            </Button>
                                        </Link>
                                    )}

                                    {isDraft && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSubmit(event.id)}
                                            disabled={actionLoading === event.id + "_submit"}
                                            className="rounded-lg gap-1.5 font-medium text-xs h-8"
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            {actionLoading === event.id + "_submit" ? "Đang gửi..." : "Gửi duyệt"}
                                        </Button>
                                    )}

                                    {isCancellable && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancel(event.id)}
                                            disabled={actionLoading === event.id + "_cancel"}
                                            className="rounded-lg gap-1.5 font-medium text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <XCircle className="size-3.5" />
                                            {actionLoading === event.id + "_cancel" ? "Đang hủy..." : "Hủy"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
