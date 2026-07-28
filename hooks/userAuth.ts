"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginApi, logoutApi, registerApi } from "@/lib/api/auth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

export function useAuth() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        setIsLoggedIn(!!token)
    }, [])

    const login = async (payload: LoginPayload) => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await loginApi(payload)
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem("refreshToken", data.refreshToken)
            setIsLoggedIn(true)
            window.location.href = "/"
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Da xay ra loi, vui long thu lai')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (payload: RegisterPayload) => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await registerApi(payload)
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem("refreshToken", data.refreshToken)
            setIsLoggedIn(true)
            window.location.href = "/"
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Da xay ra loi, vui long thu lai')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        const accessToken = localStorage.getItem("accessToken")
        const refreshToken = localStorage.getItem("refreshToken")

        if (accessToken && refreshToken) {
            try {
                await logoutApi(refreshToken, accessToken)
            } catch {
                console.warn("Logout API failed, clearing local tokens anyway")
            }
        }

        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setIsLoggedIn(false)
        router.push("/")
    }

    return { login, register, logout, isLoggedIn, isLoading, error }
}