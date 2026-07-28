export interface UserProfile {
    id: string
    email: string
    fullName: string
    role: "USER" | "ADMIN" | "ORGANIZER"
}