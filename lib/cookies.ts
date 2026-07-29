export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    return match ? match[2] : null
}

export function setCookie(name: string, value: string, maxAgeSeconds = 86400) {
    if (typeof document === "undefined") return
    document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

export function removeCookie(name: string) {
    if (typeof document === "undefined") return
    document.cookie = `${name}=; path=/; max-age=0`
}
