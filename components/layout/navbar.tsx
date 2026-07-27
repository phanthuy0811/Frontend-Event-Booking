// components/layout/navbar.tsx
"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/userAuth"
import { Ticket, LogOut } from "lucide-react"

export function Navbar() {
    const { isLoggedIn, logout } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                    🎟️ EventBook
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/events" className="hover:text-primary transition-colors">
                        Sự kiện
                    </Link>
                    {/* Đã đăng nhập thì hiện "Vé của tôi" */}
                    {isLoggedIn && (
                        <Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-1.5">
                            <Ticket className="size-4" />
                            Vé của tôi
                        </Link>
                    )}
                </nav>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        // Đã đăng nhập: hiện nút Đăng xuất
                        <button
                            onClick={logout}
                            className={`${buttonVariants({ variant: "outline" })} flex items-center gap-1.5`}
                        >
                            <LogOut className="size-4" />
                            Đăng xuất
                        </button>
                    ) : (
                        // Chưa đăng nhập: hiện Đăng nhập + Đăng ký
                        <>
                            <Link href="/auth/login" className={buttonVariants({ variant: "ghost" })}>
                                Đăng nhập
                            </Link>
                            <Link href="/auth/register" className={buttonVariants()}>
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
