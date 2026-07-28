"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Shield, Calendar, Ticket, LogOut, ArrowRight, Edit2, Check, X, Loader2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/userAuth"
import { getProfileApi, updateProfileApi } from "@/lib/api/users"
import type { UserProfile } from "@/types/users"

export default function ProfilePage() {
    const router = useRouter()
    const { logout } = useAuth()

    const [userInfo, setUserInfo] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [editFullName, setEditFullName] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (!token) {
            router.push("/auth/login")
            return
        }

        const fetchProfile = async () => {
            try {
                setIsLoading(true)
                const data = await getProfileApi()
                setUserInfo(data)
                setEditFullName(data.fullName)
            } catch {
                setFetchError("Không thể tải thông tin. Vui lòng thử đăng nhập lại.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    // 2. Gọi API PATCH /users/me khi bấm Lưu
    const handleSave = async () => {
        if (!editFullName.trim() || editFullName.trim().length < 2) {
            alert("Họ tên phải có ít nhất 2 ký tự!")
            return
        }

        try {
            setIsSaving(true)
            const updated = await updateProfileApi({ fullName: editFullName.trim() })
            setUserInfo(updated)
            setIsEditing(false)
            setSuccessMsg("✅ Cập nhật thành công!")
            setTimeout(() => setSuccessMsg(null), 3000)
        } catch {
            alert("Cập nhật thất bại! Vui lòng thử lại.")
        } finally {
            setIsSaving(false)
        }
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Đang tải thông tin cá nhân...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
            <div className="border border-border/80 rounded-3xl p-8 bg-card shadow-sm space-y-8">

                {/* Thông báo cập nhật thành công */}
                {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-medium flex items-center gap-2">
                        <Check className="size-4 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Thông báo lỗi khi tải dữ liệu */}
                {fetchError && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        {fetchError}
                    </div>
                )}

                {/* Header Avatar + Tên */}
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left pb-6 border-b border-border/60">
                    <div className="size-20 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                        <User className="size-10" />
                    </div>

                    <div className="flex-1 w-full">
                        {/* Chế độ chỉnh sửa họ tên */}
                        {isEditing ? (
                            <div className="flex items-center gap-2 max-w-sm mx-auto sm:mx-0">
                                <input
                                    type="text"
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                    placeholder="Nhập họ tên mới..."
                                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                    disabled={isSaving}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                />
                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-9 px-3 rounded-lg text-xs font-bold">
                                    {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                    <span className="ml-1">Lưu</span>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditFullName(userInfo?.fullName || "") }} disabled={isSaving} className="h-9 px-2 rounded-lg">
                                    <X className="size-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <h1 className="text-2xl font-extrabold">{userInfo?.fullName || "Người dùng"}</h1>
                                <button onClick={() => setIsEditing(true)} title="Chỉnh sửa họ tên" className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                    <Edit2 className="size-4" />
                                </button>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                                    {userInfo?.role || "USER"}
                                </span>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                            <Mail className="size-4" />
                            {userInfo?.email || "Chưa có email"}
                        </p>
                    </div>
                </div>

                {/* Các mục thông tin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Shield className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Loại tài khoản</p>
                            <p className="text-sm font-bold">
                                {userInfo?.role === "ADMIN" ? "Quản trị viên" : userInfo?.role === "ORGANIZER" ? "Ban tổ chức" : "Khách hàng"}
                            </p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <Calendar className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Trạng thái</p>
                            <p className="text-sm font-bold text-emerald-600">Đang hoạt động</p>
                        </div>
                    </div>
                </div>

                {/* Lối tắt quản lý */}
                <div className="space-y-3 pt-2">
                    <Link href="/orders/my" className={`${buttonVariants({ variant: "outline" })} w-full h-12 justify-between px-5 rounded-xl font-semibold`}>
                        <span className="flex items-center gap-2.5">
                            <Ticket className="size-4 text-primary" />
                            Vé của tôi
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                </div>

                {/* Đăng xuất */}
                <div className="pt-4 border-t border-border/60 flex justify-end">
                    <Button variant="destructive" onClick={logout} className="h-10 px-6 rounded-xl font-semibold shadow-md">
                        <LogOut className="size-4 mr-2" />
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </main>
    )
}
