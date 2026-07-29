"use client"
import { useRouter } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { getCookie } from "@/lib/cookies"
import { Event } from "@/types/event"

interface BookEventButtonProps {
    eventId: string
}

export function BookEventButton({ eventId }: BookEventButtonProps) {
    const router = useRouter()

    const handleBookClick = () => {
        const token = getCookie("accessToken")

        if (!token) {
            router.push("/auth/login")
            return
        }

        router.push(`/events/${eventId}/book`)
    }
    return (
        <button
            onClick={handleBookClick}
            className={`${buttonVariants({ variant: "default", size: "lg" })} w-full font-bold text-base shadow-md hover:shadow-lg transition-all cursor-pointer`}
        >
            Đặt vé ngay 🎟️
        </button>
    )
}