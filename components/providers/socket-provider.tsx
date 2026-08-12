"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import { getCookie } from "@/lib/cookies"

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const token = getCookie("accessToken")
        
        // Luôn connect kể cả không có token để nhận các sự kiện public (VD: số lượng vé)
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
            auth: { token },
            transports: ["websocket"], // ưu tiên websocket
        })
        socketRef.current = socket

        socket.on("connect", () => {
            console.log("WebSocket connected:", socket.id)
        })

        // Lắng nghe sự kiện thông báo cá nhân (từ Backend: WS_SERVER_EVENTS.NOTIFICATION)
        socket.on("notification", (data: any) => {
            console.log("Received real-time notification:", data)
            
            let icon = "🔔"
            if (data.type === "booking_confirmed") icon = "🎟️"
            if (data.type === "event_reminder") icon = "⏰"
            if (data.type === "event_cancelled") icon = "❌"

            // Hiển thị toast
            toast(data.title, {
                description: data.message,
                icon: icon,
                duration: 5000, // 5s
                action: {
                    label: "Xem",
                    onClick: () => {
                        window.location.href = "/notifications"
                    }
                },
            })
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return <>{children}</>
}
