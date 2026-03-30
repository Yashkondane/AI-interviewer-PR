"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Chrome, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(216 42% 5%)" }}>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const router = useRouter()
    const params = useSearchParams()
    const redirectTo = params.get("redirectTo") || "/dashboard"
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { toast.error(error.message); setLoading(false); return }
        router.push(redirectTo)
    }

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback?redirectTo=${redirectTo}` },
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(216 42% 5%)" }}>
            <div
                className="w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 relative"
                style={{
                    background: "rgba(12,22,44,0.75)",
                    border: "1px solid rgba(59,130,246,0.12)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 0 60px rgba(59,130,246,0.06)",
                }}
            >
                {/* Top glow line */}
                <div className="absolute top-0 left-12 right-12 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 w-fit">
                    <div className="h-7 w-7 rounded-lg bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                            <rect x="6" y="1" width="2" height="12" rx="1" fill="white" />
                            <rect x="3" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                            <rect x="9" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                        </svg>
                    </div>
                    <span className="font-bold text-foreground tracking-tight">Storm<span className="text-primary">Prep</span></span>
                </Link>

                <div>
                    <h1 className="text-foreground text-2xl font-semibold">Welcome back</h1>
                    <p className="text-muted-foreground text-sm mt-1">Sign in to continue your practice</p>
                </div>

                {/* Google OAuth */}
                <Button
                    onClick={handleGoogle}
                    variant="outline"
                    className="w-full rounded-xl border-white/10 bg-white/4 hover:bg-white/8 text-foreground gap-3 h-11"
                >
                    <Chrome className="h-4 w-4" />
                    Continue with Google
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                    <span className="text-muted-foreground text-xs">or</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Email form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-foreground text-sm font-medium">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-foreground text-sm font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={show ? "text" : "password"}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                            <button type="button" onClick={() => setShow(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary hover:bg-primary/90 font-semibold gap-2 h-11"
                    >
                        {loading ? "Signing in…" : "Sign In"}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                </form>

                <p className="text-muted-foreground text-sm text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-primary hover:underline font-medium">Sign up free</Link>
                </p>
            </div>
        </div>
    )
}
