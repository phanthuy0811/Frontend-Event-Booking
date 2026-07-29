import axios from "axios"
import { getCookie, setCookie, removeCookie } from "@/lib/cookies"

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

apiClient.interceptors.request.use((config) => {
    const token = getCookie("accessToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false

let failedQueue: Array<{
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response.data.data,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                }).catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true
            const refreshToken = getCookie("refreshToken")

            if (!refreshToken) {
                isRefreshing = false
                removeCookie("accessToken")
                removeCookie("refreshToken")
                window.location.href = "/auth/login"
                return Promise.reject(new Error('Phiên đăng nhập đã hết hạn'))
            }

            try {
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    {},
                    { headers: { Authorization: `Bearer ${refreshToken}` } }
                )
                const newAccessToken = res.data.data.accessToken
                const newRefreshToken = res.data.data.refreshToken

                setCookie("accessToken", newAccessToken, 86400)
                setCookie("refreshToken", newRefreshToken, 604800)

                apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

                processQueue(null, newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return apiClient(originalRequest)
            } catch (err) {
                processQueue(err as Error, null)
                removeCookie("accessToken")
                removeCookie("refreshToken")
                window.location.href = "/auth/login"
                return Promise.reject(new Error("Phiên đăng nhập đã hết hạn"))
            } finally {
                isRefreshing = false
            }
        }
        const message = error.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)

export default apiClient
