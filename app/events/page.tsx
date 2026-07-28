"use client"

import { useState, useEffect } from "react"
import { getPublishEvents } from "@/lib/api/events"
import { EventCard } from "@/components/events/event-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"

const CATEGORIES = ["Tất cả", "Âm nhạc", "Thể thao", "Hội thảo", "Workshop", "Triển lãm"]

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Tất cả")
    const [location, setLocation] = useState("")

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const data = await getPublishEvents({
                search: search || undefined,
                category: selectedCategory !== "Tất cả" ? selectedCategory : undefined,
                location: location || undefined,
            })
            setEvents(data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchEvents()
    }

    return (
        <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Tất cả sự kiện</h1>

            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <Input
                    placeholder="Tìm kiếm sự kiện..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Input
                    placeholder="Địa điểm..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="max-w-xs"
                />
                <Button type="submit">Tìm kiếm</Button>
            </form>

            <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setSelectedCategory(cat)
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                            ${selectedCategory === cat
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-muted"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    Không tìm thấy sự kiện nào.
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tìm thấy {events.length} sự kiện
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </>
            )}
        </main>
    )
}
