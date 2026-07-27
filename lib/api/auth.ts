const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import axios from "axios";
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, payload)
    return res.data

}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, payload)
    return res.data

}