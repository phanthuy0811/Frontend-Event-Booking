"use client"

import { useEffect, useState, useCallback } from "react"
import { Shield, CalendarDays, Users, CheckCircle2, XCircle, Ban, Lock, Search, AlertTriangle, Clock, FileEdit, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminEventsApi, approveEventApi, rejectEventApi, cancelEventApi, closeEventApi, updateUserRoleApi } from "@/lib/api/admin"
import type { Event } from "@/types/event"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    DRAFT: { label: "Bản nháp", color: "text-slate-500", bg: "bg-slate-100", icon: FileEdit },
    PENDING_APPROVAL: { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
    PUBLISHED: { label: "Đã đăng", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
    REJECTED: { label: "Bị từ chối", color: "text-red-500", bg: "bg-red-100", icon: XCircle },
    CLOSED: { label: "Đã đóng", color: "text-gray-500", bg: "bg-gray-100", icon: Lock },
    CANCELLED: { label: "Đã hủy", color: "text-destructive", bg: "bg-destructive/10", icon: Ban },
}

const STATUS_TABS = [
    { key: "", label: "Tất cả" },
    { key: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { key: "PUBLISHED", label: "Đã đăng" },
    { key: "DRAFT", label: "Bản nháp" },
    { key: "REJECTED", label: "Bị từ chối" },
    { key: "CLOSED", label: "Đã đóng" },
    { key: "CANCELLED", label: "Đã hủy" },
]

export default function AdminDashboardPage() {
    // Event list state
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // User actions
    const [userId, setUserId] = useState("")
    const [selectedRole, setSelectedRole] = useState("USER")
    const [userLoading, setUserLoading] = useState(false)
    const [userResult, setUserResult] = useState<{ success: boolean; message: string } | null>(null)

    const fetchEvents = useCallback(async () => {
        setIsLoading(true)
        try {
            const params: any = { page, limit: 15 }
            if (filterStatus) params.status = filterStatus
            if (searchQuery.trim()) params.search = searchQuery.trim()
            const res = await getAdminEventsApi(params)
            setEvents(res.items ?? [])
            setTotalPages(res.totalPages ?? 1)
            setTotal(res.total ?? 0)
        } catch {
            setEvents([])
        } finally {
            setIsLoading(false)
        }
    }, [page, filterStatus, searchQuery])

    useEffect(() => { fetchEvents() }, [fetchEvents])

    // Debounce search
    const [searchInput, setSearchInput] = useState("")
    useEffect(() => {
        const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1) }, 400)
        return () => clearTimeout(t)
    }, [searchInput])

    const handleEventAction = async (id: string, action: "approve" | "reject" | "cancel" | "close") => {
        const labels = { approve: "Duyệt", reject: "Từ chối", cancel: "Hủy", close: "Đóng" }
        if (!confirm(`${labels[action]} sự kiện này?`)) return
        setActionLoading(id + "_" + action)
        try {
            const actionMap = { approve: approveEventApi, reject: rejectEventApi, cancel: cancelEventApi, close: closeEventApi }
            await actionMap[action](id)
            await fetchEvents()
        } catch (err: any) {
            alert(err.message || "Thao tác thất bại")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateRole = async () => {
        if (!userId.trim()) return
        setUserLoading(true)
        setUserResult(null)
        try {
            const updated = await updateUserRoleApi(userId.trim(), selectedRole)
            setUserResult({ success: true, message: `Đã cập nhật role thành ${updated.role} cho user ${updated.email}` })
            setUserId("")
        } catch (err: any) {
            setUserResult({ success: false, message: err.message || "Cập nhật role thất bại" })
        } finally {
            setUserLoading(false)
        }
    }

    return (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Shield className="size-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Quản lý sự kiện và người dùng</p>
                </div>
            </div>

            {/* ==================== EVENT MANAGEMENT ==================== */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="size-5 text-primary" />
                    <h2 className="text-lg font-semibold">Quản lý sự kiện</h2>
                    <span className="text-xs text-muted-foreground ml-1">({total} sự kiện)</span>
                </div>

                {/* Filter & Search */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setFilterStatus(tab.key); setPage(1) }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === tab.key
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên sự kiện..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="pl-9 h-10 rounded-xl"
                        />
                    </div>
                </div>

                {/* Event List */}
                {isLoading ? (
                    <div className="py-12 text-center text-muted-foreground">Đang tải...</div>
                ) : events.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                        <CalendarDays className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-muted-foreground text-sm">Không có sự kiện nào.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map(event => {
                            const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT
                            const StatusIcon = cfg.icon
                            const isPending = event.status === "PENDING_APPROVAL"
                            const isPublished = event.status === "PUBLISHED"
                            const isCancellable = !["CANCELLED", "CLOSED"].includes(event.status)
                            const organizer = (event as any).organizer

                            return (
                                <div key={event.id} className="p-5 rounded-2xl border bg-card hover:shadow-sm transition-shadow space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-base truncate">{event.title}</h3>
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                                    <StatusIcon className="size-3" />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                📍 {event.location} &nbsp;·&nbsp;
                                                🗓️ {new Date(event.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                            {organizer && (
                                                <p className="text-xs text-muted-foreground">
                                                    👤 {organizer.fullName} ({organizer.email})
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground font-mono">
                                                ID: {event.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                                        {isPending && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEventAction(event.id, "approve")}
                                                    disabled={!!actionLoading}
                                                    className="rounded-lg gap-1.5 font-medium text-xs h-8"
                                                >
                                                    <CheckCircle2 className="size-3.5" />
                                                    {actionLoading === event.id + "_approve" ? "Đang duyệt..." : "Duyệt"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEventAction(event.id, "reject")}
                                                    disabled={!!actionLoading}
                                                    className="rounded-lg gap-1.5 font-medium text-xs h-8 text-amber-600 border-amber-300 hover:bg-amber-50"
                                                >
                                                    <XCircle className="size-3.5" />
                                                    {actionLoading === event.id + "_reject" ? "Đang từ chối..." : "Từ chối"}
                                                </Button>
                                            </>
                                        )}
                                        {isPublished && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEventAction(event.id, "close")}
                                                disabled={!!actionLoading}
                                                className="rounded-lg gap-1.5 font-medium text-xs h-8"
                                            >
                                                <Lock className="size-3.5" />
                                                {actionLoading === event.id + "_close" ? "Đang đóng..." : "Đóng sự kiện"}
                                            </Button>
                                        )}
                                        {isCancellable && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEventAction(event.id, "cancel")}
                                                disabled={!!actionLoading}
                                                className="rounded-lg gap-1.5 font-medium text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Ban className="size-3.5" />
                                                {actionLoading === event.id + "_cancel" ? "Đang hủy..." : "Hủy"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="rounded-lg gap-1 h-8"
                                >
                                    <ChevronLeft className="size-4" /> Trước
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Trang {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="rounded-lg gap-1 h-8"
                                >
                                    Sau <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ==================== USER MANAGEMENT ==================== */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
                </div>

                <div className="p-6 rounded-2xl border bg-card space-y-5">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <p>
                            Backend chưa có API liệt kê danh sách người dùng.
                            Nhập User ID để đổi role. Tính năng danh sách sẽ bổ sung sau.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">User ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nhập User ID..."
                                    value={userId}
                                    onChange={e => setUserId(e.target.value)}
                                    className="pl-9 h-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role mới</label>
                            <select
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value)}
                                className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                            >
                                <option value="USER">USER</option>
                                <option value="ORGANIZER">ORGANIZER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpdateRole}
                        disabled={!userId.trim() || userLoading}
                        className="rounded-xl gap-1.5 font-semibold"
                    >
                        <Users className="size-4" />
                        {userLoading ? "Đang cập nhật..." : "Cập nhật Role"}
                    </Button>

                    {userResult && (
                        <div className={`p-3 rounded-xl text-sm ${userResult.success
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                            }`}>
                            {userResult.message}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
