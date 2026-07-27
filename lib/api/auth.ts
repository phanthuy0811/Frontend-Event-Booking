const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import axios from "axios";

export interface LoginPayload {
    email: string,
    password: string
}

export interface RegisterPayload {
    fullName: string,
    email: string,
    password: string
}

export interface AuthResponse {
    accessToken: string,
    user: {
        id: string,
        email: string,
        name: string
    }
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, payload)
    return res.data

}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, payload)
    return res.data

}