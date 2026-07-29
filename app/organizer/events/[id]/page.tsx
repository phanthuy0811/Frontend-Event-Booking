"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Pencil, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    createTicketTypeApi,
    updateTicketTypeApi,
    deleteTicketTypeApi
} from "@/lib/api/organizer"
import apiClient from "@/lib/axios"
import { getCookie } from "@/lib/cookies"
import type { TicketType } from "@/types/event"

interface PageProps { params: Promise<{ id: string }> }

interface TicketForm {
    name: string
    price: string
    totalQuantity: string
    salesStart: string
    salesEnd: string
}

const emptyForm = (): TicketForm => ({ name: "", price: "", totalQuantity: "", salesStart: "", salesEnd: "" })

export default function OrganizerEventDetailPage({ params }: PageProps) {
    const { id: eventId } = use(params)
    const router = useRouter()

    const [tickets, setTickets] = useState<TicketType[]>([])
    const [eventTitle, setEventTitle] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    // Form tạo mới
    const [showAddForm, setShowAddForm] = useState(false)
    const [addForm, setAddForm] = useState<TicketForm>(emptyForm())
    const [isAdding, setIsAdding] = useState(false)
    const [addError, setAddError] = useState<string | null>(null)

    // Form chỉnh sửa
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<TicketForm>(emptyForm())
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // Xóa
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        const token = getCookie("accessToken")
        if (!token) { router.push("/auth/login"); return }

        // Lấy tất cả ticket-types của event này
        apiClient.get(`/ticket-type/${eventId}`)
            .then((data: any) => {
                // Nếu axios interceptor đã unwrap thì data là mảng
                const arr = Array.isArray(data) ? data : (data?.data ?? [])
                setTickets(arr)
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))

        // Lấy tên event từ danh sách my events để hiển thị tiêu đề
        apiClient.get("/events/organizer")
            .then((events: any) => {
                const arr = Array.isArray(events) ? events : []
                const ev = arr.find((e: any) => e.id === eventId)
                if (ev) setEventTitle(ev.title)
            })
            .catch(() => { })
    }, [eventId, router])

    // === THÊM loại vé ===
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addForm.name || !addForm.price || !addForm.totalQuantity) {
            setAddError("Vui lòng điền đủ Tên, Giá và Số lượng.")
            return
        }
        setIsAdding(true)
        setAddError(null)
        try {
            const created = await createTicketTypeApi(eventId, {
                name: addForm.name,
                price: Number(addForm.price),
                totalQuantity: Number(addForm.totalQuantity),
                salesStart: addForm.salesStart || undefined,
                salesEnd: addForm.salesEnd || undefined,
            })
            setTickets(prev => [...prev, created as any])
            setAddForm(emptyForm())
            setShowAddForm(false)
        } catch {
            setAddError("Thêm loại vé thất bại!")
        } finally {
            setIsAdding(false)
        }
    }

    // === SỬA loại vé ===
    const startEdit = (ticket: TicketType) => {
        setEditingId(ticket.id)
        setEditForm({
            name: ticket.name,
            price: String(ticket.price),
            totalQuantity: String(ticket.totalQuantity),
            salesStart: ticket.salesStart ? ticket.salesStart.slice(0, 16) : "",
            salesEnd: ticket.salesEnd ? ticket.salesEnd.slice(0, 16) : "",
        })
    }

    const handleSaveEdit = async () => {
        if (!editingId) return
        setIsSavingEdit(true)
        try {
            const updated = await updateTicketTypeApi(eventId, editingId, {
                name: editForm.name,
                price: Number(editForm.price),
                totalQuantity: Number(editForm.totalQuantity),
                salesStart: editForm.salesStart || undefined,
                salesEnd: editForm.salesEnd || undefined,
            })
            setTickets(prev => prev.map(t => t.id === editingId ? { ...t, ...(updated as any) } : t))
            setEditingId(null)
        } catch {
            alert("Cập nhật thất bại!")
        } finally {
            setIsSavingEdit(false)
        }
    }

    // === XÓA loại vé ===
    const handleDelete = async (ticketId: string) => {
        if (!confirm("Xóa loại vé này?")) return
        setDeletingId(ticketId)
        try {
            await deleteTicketTypeApi(eventId, ticketId)
            setTickets(prev => prev.filter(t => t.id !== ticketId))
        } catch {
            alert("Xóa thất bại!")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
            <Link
                href="/organizer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft className="size-4" />
                Quay lại Dashboard
            </Link>

            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold">Quản lý loại vé</h1>
                    {eventTitle && <p className="text-sm text-muted-foreground mt-0.5">{eventTitle}</p>}
                </div>
                <Button
                    onClick={() => { setShowAddForm(true); setAddError(null) }}
                    className="gap-2 rounded-xl font-semibold text-sm h-9"
                    disabled={showAddForm}
                >
                    <Plus className="size-4" />
                    Thêm loại vé
                </Button>
            </div>

            {/* Form thêm loại vé mới */}
            {showAddForm && (
                <form
                    onSubmit={handleAdd}
                    className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/[0.02] space-y-4 mb-6"
                >
                    <h2 className="font-semibold text-sm text-primary">Thêm loại vé mới</h2>

                    {addError && (
                        <p className="text-sm text-destructive">{addError}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-3">
                            <label className="text-xs font-medium text-muted-foreground">Tên loại vé *</label>
                            <Input
                                value={addForm.name}
                                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="VD: Vé VIP, Vé Thường..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Giá (đ) *</label>
                            <Input
                                type="number"
                                min={0}
                                value={addForm.price}
                                onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Số lượng *</label>
                            <Input
                                type="number"
                                min={1}
                                value={addForm.totalQuantity}
                                onChange={e => setAddForm(p => ({ ...p, totalQuantity: e.target.value }))}
                                placeholder="100"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Mở bán từ</label>
                            <Input
                                type="datetime-local"
                                value={addForm.salesStart}
                                onChange={e => setAddForm(p => ({ ...p, salesStart: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Kết thúc bán</label>
                            <Input
                                type="datetime-local"
                                value={addForm.salesEnd}
                                onChange={e => setAddForm(p => ({ ...p, salesEnd: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isAdding} className="h-9 rounded-xl text-sm font-semibold gap-1.5">
                            {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                            Lưu loại vé
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddForm(false)}
                            className="h-9 rounded-xl text-sm font-medium"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </form>
            )}

            {/* Danh sách loại vé */}
            {isLoading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">Đang tải...</div>
            ) : tickets.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20 text-muted-foreground text-sm space-y-2">
                    <p>Sự kiện này chưa có loại vé nào.</p>
                    <p className="text-xs">Bấm "Thêm loại vé" ở trên để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="p-5 rounded-2xl border bg-card space-y-3">
                            {editingId === ticket.id ? (
                                /* Chế độ chỉnh sửa inline */
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1 sm:col-span-3">
                                            <label className="text-xs font-medium text-muted-foreground">Tên</label>
                                            <Input
                                                value={editForm.name}
                                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Giá (đ)</label>
                                            <Input
                                                type="number"
                                                value={editForm.price}
                                                onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Số lượng</label>
                                            <Input
                                                type="number"
                                                value={editForm.totalQuantity}
                                                onChange={e => setEditForm(p => ({ ...p, totalQuantity: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Mở bán từ</label>
                                            <Input
                                                type="datetime-local"
                                                value={editForm.salesStart}
                                                onChange={e => setEditForm(p => ({ ...p, salesStart: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Kết thúc bán</label>
                                            <Input
                                                type="datetime-local"
                                                value={editForm.salesEnd}
                                                onChange={e => setEditForm(p => ({ ...p, salesEnd: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSaveEdit} disabled={isSavingEdit} size="sm" className="h-8 rounded-lg text-xs gap-1.5">
                                            {isSavingEdit ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                            Lưu
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 rounded-lg text-xs">
                                            Hủy
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Chế độ xem */
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-sm">{ticket.name}</p>
                                        <p className="text-primary font-bold text-base mt-0.5">
                                            {ticket.price === 0 ? "Miễn phí" : `${ticket.price.toLocaleString("vi-VN")}đ`}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tổng: {ticket.totalQuantity} vé &nbsp;·&nbsp; Còn: {ticket.remainingQuantity} vé
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(ticket)}
                                            className="h-8 w-8 p-0 rounded-lg hover:text-primary"
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(ticket.id)}
                                            disabled={deletingId === ticket.id}
                                            className="h-8 w-8 p-0 rounded-lg hover:text-destructive"
                                        >
                                            {deletingId === ticket.id
                                                ? <Loader2 className="size-3.5 animate-spin" />
                                                : <Trash2 className="size-3.5" />
                                            }
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
