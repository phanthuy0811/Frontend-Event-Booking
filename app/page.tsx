// app/page.tsx

import { getPublishEvents } from "@/lib/api/events"
import { EventCard } from "@/components/events/event-card"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

// Đây là Server Component — Next.js tự fetch khi render, không cần useEffect
export default async function HomePage() {
  // Lấy tối đa 6 sự kiện mới nhất để hiển thị ở trang chủ
  const events = await getPublishEvents()
  const featuredEvents = events.slice(0, 6)

  return (
    <main className="flex-1">
      {/* === HERO SECTION === */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Khám phá & Đặt vé <br />
            <span className="text-primary">Sự kiện hấp dẫn</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Hàng ngàn sự kiện đang chờ bạn — concert, hội thảo, workshop và nhiều hơn nữa.
          </p>
          <div className="flex gap-4">
            <Link href="/events" className={buttonVariants({ variant: "default" })}>Xem tất cả sự kiện</Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Sự kiện sắp diễn ra</h2>
          <Link href="/events" className="text-sm text-primary hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {featuredEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">
            Chưa có sự kiện nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
