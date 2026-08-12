"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, ArrowLeft } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/types/notification"
import { getCookie } from "@/lib/cookies"

const TYPE_ICON: Record<string, string> = {
    booking_confirmed: "🎟️",
    event_reminder: "⏰",
    event_cancelled: "❌",
}

const TYPE_LABEL: Record<string, string> = {
    booking_confirmed: "Đặt vé thành công",
    event_reminder: "Nhắc lịch sự kiện",
    event_cancelled: "Sự kiện bị hủy",
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 1) return "Vừa xong"
    if (m < 60) return `${m} phút trước`
    if (h < 24) return `${h} giờ trước`
    return `${d} ngày trước`
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("vi-VN", {
        weekday: "long",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

function NotificationRow({
    notification,
    isActive,
    onClick,
}: {
    notification: Notification
    isActive: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left flex gap-3 px-4 py-4 border-b transition-colors
                ${isActive
                    ? "bg-primary/10 border-l-2 border-primary"
                    : notification.isRead
                        ? "hover:bg-muted/40"
                        : "bg-primary/5 hover:bg-primary/8 border-l-2 border-primary/40"
                }`}
        >
            <span className="flex-shrink-0 text-xl mt-0.5">{TYPE_ICON[notification.type] ?? "🔔"}</span>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${notification.isRead ? "text-foreground/70" : "text-foreground"}`}>
                    {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notification.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notification.createdAt)}</p>
            </div>
            {!notification.isRead && (
                <span className="flex-shrink-0 size-2 rounded-full bg-primary mt-2 animate-pulse" />
            )}
        </button>
    )
}

function NotificationDetail({ notification }: { notification: Notification }) {
    return (
        <div className="flex flex-col h-full">
            {/* Header chi tiết */}
            <div className="px-8 py-6 border-b">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{TYPE_ICON[notification.type] ?? "🔔"}</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {TYPE_LABEL[notification.type] ?? "Thông báo"}
                        </p>
                        <h1 className="text-xl font-bold mt-0.5">{notification.title}</h1>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
            </div>

            {/* Nội dung */}
            <div className="flex-1 px-8 py-8 overflow-y-auto">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {notification.message}
                </p>
            </div>

            {/* Footer trạng thái */}
            <div className="px-8 py-4 border-t bg-muted/20">
                {notification.isRead ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Đã đọc</span>
                ) : (
                    <span className="text-xs text-primary font-medium">● Chưa đọc</span>
                )}
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const router = useRouter()
    const [activeId, setActiveId] = useState<string | null>(null)
    const {
        notifications,
        isLoading,
        hasNextPage,
        loadMore,
        markAsRead,
    } = useNotifications()

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!getCookie("accessToken")) router.replace("/auth/login")
    }, [router])

    // Chọn thông báo đầu tiên mặc định trên desktop
    useEffect(() => {
        if (notifications.length > 0 && !activeId) {
            setActiveId(notifications[0].id)
        }
    }, [notifications, activeId])

    const handleSelect = (n: Notification) => {
        setActiveId(n.id)
        if (!n.isRead) markAsRead(n.id)
    }

    const activeNotification = notifications.find(n => n.id === activeId) ?? null

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Quay lại
                </button>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-sm font-medium">Thông báo</span>
            </div>

            <div className="border rounded-xl overflow-hidden bg-background shadow-sm min-h-[600px] grid grid-cols-[320px_1fr]">
                {/* Cột trái: danh sách */}
                <div className="border-r flex flex-col">
                    <div className="px-4 py-3.5 border-b bg-muted/30">
                        <h2 className="text-sm font-semibold text-foreground">Tất cả thông báo</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {notifications.filter(n => !n.isRead).length} chưa đọc
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading && notifications.length === 0 ? (
                            <div className="flex flex-col gap-0 divide-y">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-3 p-4 animate-pulse">
                                        <div className="size-8 rounded-full bg-muted flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 bg-muted rounded w-3/4" />
                                            <div className="h-2.5 bg-muted rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <Bell className="size-10 mb-3 opacity-30" />
                                <p className="text-sm">Không có thông báo</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    isActive={n.id === activeId}
                                    onClick={() => handleSelect(n)}
                                />
                            ))
                        )}

                        {hasNextPage && (
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="w-full py-3 text-xs text-muted-foreground hover:text-primary transition-colors hover:bg-muted/40 disabled:opacity-50"
                            >
                                {isLoading ? "Đang tải..." : "Xem thêm"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Cột phải: chi tiết */}
                <div className="flex flex-col">
                    {activeNotification ? (
                        <NotificationDetail notification={activeNotification} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <Bell className="size-12 opacity-20" />
                            <p className="text-sm">Chọn một thông báo để xem chi tiết</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
