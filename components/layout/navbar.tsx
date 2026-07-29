"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/userAuth"
import { Ticket, LogOut, User } from "lucide-react"

export function Navbar() {
    const { isLoggedIn, logout, role } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (isLoggedIn && role === "ORGANIZER" && pathname === "/") {
            router.replace("/organizer")
        }
    }, [isLoggedIn, role, pathname, router])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                <Link href={role === "ORGANIZER" ? "/organizer" : "/"} className="text-xl font-bold tracking-tight flex items-center gap-2">
                    🎟️ EventBook
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/events" className="hover:text-primary transition-colors">
                        Sự kiện
                    </Link>
                    {isLoggedIn && (
                        <Link href="/orders/my" className="hover:text-primary transition-colors flex items-center gap-1.5">
                            <Ticket className="size-4" />
                            Vé của tôi
                        </Link>
                    )}
                    {isLoggedIn && role === "ORGANIZER" && (
                        <Link href="/organizer" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-2.5">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/profile"
                                className={`${buttonVariants({ variant: "secondary" })} flex items-center gap-1.5 font-semibold text-xs h-9 px-3.5 rounded-full`}
                            >
                                <User className="size-4.5 text-primary" />

                            </Link>

                            <button
                                onClick={logout}
                                className={`${buttonVariants({ variant: "outline" })} flex items-center gap-1.5 text-xs h-9 px-3.5 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30`}
                            >
                                <LogOut className="size-3.5" />
                                <span>Đăng xuất</span>
                            </button>
                        </>
                    ) : (
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
