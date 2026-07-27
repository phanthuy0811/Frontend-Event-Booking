const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import axios from "axios";
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";
import apiClient from "../axios";

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post("/auth/login", payload)
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post("/auth/register", payload)
}