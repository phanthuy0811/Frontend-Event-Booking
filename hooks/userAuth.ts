"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginApi, logoutApi, registerApi } from "@/lib/api/auth";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

export function useAuth() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        const token = getCookie("accessToken")
        setIsLoggedIn(!!token)
        if (token) {
            try {
                const payloadBase64 = token.split(".")[1]
                if (payloadBase64) {
                    const decoded = JSON.parse(atob(payloadBase64))
                    setRole(decoded.role || null)
                }
            } catch {
                setRole(null)
            }
        }
    }, [])

    const login = async (payload: LoginPayload) => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await loginApi(payload)
            setCookie("accessToken", data.accessToken, 86400)
            setCookie("refreshToken", data.refreshToken, 604800)
            setIsLoggedIn(true)

            let targetUrl = "/"
            try {
                const payloadBase64 = data.accessToken.split(".")[1]
                if (payloadBase64) {
                    const decoded = JSON.parse(atob(payloadBase64))
                    if (decoded.role === "ORGANIZER") {
                        targetUrl = "/organizer"
                    }
                }
            } catch { }

            window.location.href = targetUrl
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
            setCookie("accessToken", data.accessToken, 86400)
            setCookie("refreshToken", data.refreshToken, 604800)
            setIsLoggedIn(true)

            let targetUrl = "/"
            try {
                const payloadBase64 = data.accessToken.split(".")[1]
                if (payloadBase64) {
                    const decoded = JSON.parse(atob(payloadBase64))
                    if (decoded.role === "ORGANIZER") {
                        targetUrl = "/organizer"
                    }
                }
            } catch { }

            window.location.href = targetUrl
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
        const accessToken = getCookie("accessToken")
        const refreshToken = getCookie("refreshToken")

        if (accessToken && refreshToken) {
            try {
                await logoutApi(refreshToken, accessToken)
            } catch {
                console.warn("Logout API failed, clearing local tokens anyway")
            }
        }

        removeCookie("accessToken")
        removeCookie("refreshToken")
        setIsLoggedIn(false)
        router.push("/")
    }

    return { login, register, logout, isLoggedIn, role, isLoading, error }
}