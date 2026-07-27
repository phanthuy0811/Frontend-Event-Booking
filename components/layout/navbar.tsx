"use client"

import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight">
                    🎟️ EventBook
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/events" className="hover:text-primary transition-colors">
                        Sự kiện
                    </Link>
                </nav>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    <Link href="/auth/login" className={buttonVariants({ variant: "ghost" })}>
                        Đăng nhập
                    </Link>
                    <Link href="/auth/register" className={buttonVariants()}>
                        Đăng ký
                    </Link>
                </div>
            </div>
        </header>
    )
}
