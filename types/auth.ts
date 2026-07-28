// types/auth.ts
export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    fullName: string
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string
    user: {
        id: string
        email: string
        name: string
    }
}
