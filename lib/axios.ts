import axios from "axios"

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem("accessToken")
        : null
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => response.data.data,
    (error) => {
        const message = error.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)

export default apiClient
