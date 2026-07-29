"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createEventApi } from "@/lib/api/organizer"

const CATEGORIES = ["Âm nhạc", "Thể thao", "Hội thảo", "Workshop", "Triển lãm", "Khác"]

export default function CreateEventPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: "",
        description: "",
        bannerUrl: "",
        location: "",
        category: "",
        startTime: "",
        endTime: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.location || !form.startTime || !form.endTime) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc (*).")
            return
        }
        if (new Date(form.endTime) <= new Date(form.startTime)) {
            setError("Thời gian kết thúc phải sau thời gian bắt đầu.")
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const event = await createEventApi({
                title: form.title,
                description: form.description || undefined,
                bannerUrl: form.bannerUrl || undefined,
                location: form.location,
                category: form.category || undefined,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            })
            router.push(`/organizer/events/${event.id}`)
        } catch {
            setError("Tạo sự kiện thất bại. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10">
            <Link
                href="/organizer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft className="size-4" />
                Quay lại Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarDays className="size-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Tạo sự kiện mới</h1>
                    <p className="text-sm text-muted-foreground">Điền thông tin và thêm loại vé sau khi tạo xong.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tên sự kiện <span className="text-destructive">*</span></label>
                    <Input name="title" value={form.title} onChange={handleChange} placeholder="Ví dụ: Đêm nhạc Mùa Hè 2026" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mô tả</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Mô tả chi tiết về sự kiện..."
                        className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Link ảnh Banner (URL)</label>
                    <Input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} placeholder="https://..." />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Địa điểm <span className="text-destructive">*</span></label>
                    <Input name="location" value={form.location} onChange={handleChange} placeholder="Ví dụ: Sân vận động Mỹ Đình, Hà Nội" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Danh mục</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full h-10 px-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">-- Không có --</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Thời gian bắt đầu <span className="text-destructive">*</span></label>
                        <Input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Thời gian kết thúc <span className="text-destructive">*</span></label>
                        <Input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} />
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <Button type="submit" disabled={isLoading} className="flex-1 h-11 rounded-xl font-semibold">
                        {isLoading ? "Đang tạo..." : "Tạo sự kiện"}
                    </Button>
                    <Link href="/organizer">
                        <Button type="button" variant="outline" className="h-11 rounded-xl font-medium">Hủy</Button>
                    </Link>
                </div>
            </form>
        </main>
    )
}
