import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Khai báo route nào cần login, route nào cần đúng role mới vào được
const PROTECTED_ROUTES: { prefix: string, role?: string[] }[] = [
    { prefix: '/organizer', role: ['ORGANIZER'] },
    { prefix: '/admin', role: ['ADMIN'] },
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const matched = PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix));

    // Nếu route không nằm trong danh sách bảo vệ thì cho qua luôn
    if (!matched) return NextResponse.next();

    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (matched.role && !matched.role.includes(payload.role as string)) {
            // dang nhap roi nhung sai role 
            return NextResponse.redirect(new URL('/', req.url));
        }
    } catch {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();

}

export const config = {
    matcher: ["/organizer/:path*", "/admin/:path*"],
};
