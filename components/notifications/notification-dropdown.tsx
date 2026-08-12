"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, BellRing, Check, CheckCheck, ChevronDown, X } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { useRouter } from "next/navigation"
import type { Notification } from "@/types/notification"

const TYPE_ICON: Record<string, string> = {
    booking_confirmed: "🎟️",
    event_reminder: "⏰",
    event_cancelled: "❌",
}

function getIcon(type: string) {
    return TYPE_ICON[type] ?? "🔔"
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

function NotificationItem({
    notification,
    onRead,
    onNavigate,
}: {
    notification: Notification
    onRead: (id: string) => void
    onNavigate: () => void
}) {
    const handleClick = () => {
        if (!notification.isRead) onRead(notification.id)
        onNavigate()
    }

    return (
        <div
            className={`group relative flex gap-3 px-4 py-3.5 transition-colors cursor-pointer
                ${notification.isRead
                    ? "hover:bg-muted/40"
                    : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                }`}
            onClick={handleClick}
        >
            <div className="flex-shrink-0 mt-0.5 text-xl leading-none">
                {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${notification.isRead ? "text-foreground/80" : "text-foreground"}`}>
                    {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                    {timeAgo(notification.createdAt)}
                </p>
            </div>

            {!notification.isRead && (
                <div className="flex-shrink-0 mt-2">
                    <span className="block size-2 rounded-full bg-primary animate-pulse" />
                </div>
            )}

            {/* Mark as read khi hover, không navigate */}
            {!notification.isRead && (
                <button
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
                    onClick={(e) => { e.stopPropagation(); onRead(notification.id) }}
                    title="Đánh dấu đã đọc"
                >
                    <Check className="size-3 text-muted-foreground" />
                </button>
            )}
        </div>
    )
}

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const {
        notifications,
        unreadCount,
        isLoading,
        hasNextPage,
        fetchNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
    } = useNotifications()

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleToggle = () => {
        if (!isOpen) fetchNotifications()
        setIsOpen(prev => !prev)
    }

    const handleNavigate = () => {
        setIsOpen(false)
        router.push("/notifications")
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Nút chuông */}
            <button
                id="notification-bell-btn"
                onClick={handleToggle}
                className="relative flex items-center justify-center size-9 rounded-full hover:bg-muted transition-colors"
                aria-label="Thông báo"
            >
                {unreadCount > 0
                    ? <BellRing className="size-5 text-primary" />
                    : <Bell className="size-5 text-foreground/70" />
                }
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-in zoom-in-50 duration-200">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel — chỉ preview nhanh */}
            {isOpen && (
                <div
                    id="notification-dropdown-panel"
                    className="absolute right-0 mt-2 w-80 max-h-[420px] flex flex-col rounded-xl border bg-background shadow-xl shadow-black/10 animate-in slide-in-from-top-2 duration-200 z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="text-sm font-semibold">Thông báo</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    title="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCheck className="size-3.5" />
                                    <span>Đọc tất cả</span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="size-3.5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* List preview */}
                    <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                        {isLoading && notifications.length === 0 ? (
                            <div className="flex flex-col gap-3 p-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="size-8 rounded-full bg-muted flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 bg-muted rounded w-3/4" />
                                            <div className="h-2.5 bg-muted rounded w-full" />
                                            <div className="h-2 bg-muted rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Bell className="size-10 mb-3 opacity-30" />
                                <p className="text-sm">Không có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(n => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={markAsRead}
                                    onNavigate={handleNavigate}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer: nút xem tất cả */}
                    <div className="border-t">
                        <button
                            onClick={handleNavigate}
                            className="w-full py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                        >
                            Xem tất cả thông báo →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
