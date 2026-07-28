import type { UserProfile } from "@/types/users";
import apiClient from "../axios";

export async function getProfileApi(): Promise<UserProfile> {
    return apiClient.get("/users/me")
}

export async function updateProfileApi(payload: { fullName: string }): Promise<UserProfile> {
    return apiClient.patch("/users/me", payload)
}