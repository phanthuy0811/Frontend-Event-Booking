"use client"

import { useState, useEffect, useCallback } from "react"
import { getMyNotifications, markNotificationRead } from "@/lib/api/notifications"
import type { Notification } from "@/types/notification"
import { getCookie } from "@/lib/cookies"

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(!!getCookie("accessToken"))
    }, [])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const fetchNotifications = useCallback(async () => {
        if (!isLoggedIn) return
        setIsLoading(true)
        try {
            const res = await getMyNotifications()
            setNotifications(res.items)
            setNextCursor(res.nextCursor)
            setHasNextPage(res.hasNextPage)
        } catch {
            // ignore nếu chưa đăng nhập
        } finally {
            setIsLoading(false)
        }
    }, [isLoggedIn])

    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoading) return
        setIsLoading(true)
        try {
            const res = await getMyNotifications(nextCursor)
            setNotifications(prev => [...prev, ...res.items])
            setNextCursor(res.nextCursor)
            setHasNextPage(res.hasNextPage)
        } finally {
            setIsLoading(false)
        }
    }, [nextCursor, isLoading])

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update: cập nhật UI trước, gọi API sau
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        )
        try {
            await markNotificationRead(id)
        } catch {
            // Rollback nếu API lỗi
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false } : n)
            )
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        const unread = notifications.filter(n => !n.isRead)
        if (unread.length === 0) return
        // Optimistic update tất cả
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        try {
            await Promise.all(unread.map(n => markNotificationRead(n.id)))
        } catch {
            // Không rollback toàn bộ, chỉ refetch
            fetchNotifications()
        }
    }, [notifications, fetchNotifications])

    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications()
        }
    }, [isLoggedIn, fetchNotifications])

    return {
        notifications,
        unreadCount,
        isLoading,
        hasNextPage,
        fetchNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
    }
}
