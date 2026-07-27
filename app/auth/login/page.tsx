import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-[#09090b] overflow-hidden p-6 md:p-10">

            {/* Lớp 1: Grid (Lưới) mờ dần từ trên xuống - Kỹ thuật Mask Image */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Lớp 2: Spotlight chính giữa (Aurora Glow) soi thẳng xuống Form */}
            <div className="absolute top-0 left-1/2 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-[120px] dark:bg-indigo-600/15 pointer-events-none"></div>

            {/* Lớp 3: Ánh sáng phụ ở góc dưới cân bằng thị giác */}
            <div className="absolute bottom-[-20%] right-[-10%] z-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-600/10 pointer-events-none"></div>

            {/* Khối Login Container - Z-index 10 để luôn nổi lên trên */}
            <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>

        </div>
    )
}