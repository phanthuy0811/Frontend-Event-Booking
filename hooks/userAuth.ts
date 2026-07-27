"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginApi, registerApi } from "@/lib/api/auth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

export function useAuth() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (payload: LoginPayload) => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await loginApi(payload)
            localStorage.setItem('accessToken', data.accessToken)
            router.push("/")
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
            router.push("/")
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
    return { login, register, isLoading, error }
}