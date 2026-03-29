"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Plus, Star, LayoutDashboard, LogOut, User, FileText } from "lucide-react"

interface Session {
    id: string
    role: string
    company: string | null
    seniority: string
    interview_type: string
    overall_score: number
    camera_score: number
    created_at: string
}

function ScoreBadge({ score }: { score: number }) {
    const color =
        score >= 80 ? { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" } :
            score >= 60 ? { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)", text: "#60a5fa" } :
                score >= 40 ? { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" } :
                    { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" }
    return (
        <div className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
            style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}>
            {score}
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [sessions, setSessions] = useState<Session[]>([])
    const [user, setUser] = useState<{ full_name: string; resume_data: any } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data: { user: u } } = await supabase.auth.getUser()
            if (!u) { router.push("/auth/login"); return }

            const { data: profile } = await supabase.from("profiles").select("full_name, resume_data").eq("id", u.id).single()
            setUser(profile)

            const { data: s } = await supabase
                .from("sessions")
                .select("id, role, company, seniority, interview_type, overall_score, camera_score, created_at")
                .eq("user_id", u.id)
                .eq("status", "completed")
                .order("created_at", { ascending: false })
                .limit(20)
            setSessions(s || [])
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    const avgScore = sessions.length
        ? Math.round(sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length)
        : 0

    const bestScore = sessions.length
        ? Math.max(...sessions.map(s => s.overall_score || 0))
        : 0

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "hsl(216 42% 5%)" }}>
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.5) 0%, transparent 65%)", filter: "blur(80px)" }} />
            </div>

            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        <span className="text-foreground font-semibold">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/profile">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1.5 transition-colors">
                                <User className="h-4 w-4" />
                                Profile
                            </Button>
                        </Link>
                        {user && <span className="text-muted-foreground text-sm">Hi, {user.full_name?.split(" ")[0] || "there"} 👋</span>}
                        <Button onClick={handleLogout} variant="ghost" size="sm"
                            className="text-muted-foreground hover:text-foreground gap-1.5">
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </Button>
                    </div>
                </div>

                {/* Resume Status CTA */}
                {!loading && !user?.resume_data && (
                    <Link href="/dashboard/profile">
                        <div className="rounded-3xl p-6 flex items-center justify-between group transition-all duration-300 hover:scale-[1.005]"
                            style={{ 
                                background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(37,99,235,0.1))", 
                                border: "1px solid rgba(59,130,246,0.2)",
                                boxShadow: "0 0 40px rgba(59,130,246,0.05)"
                            }}>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-foreground font-semibold">Complete your profile</h3>
                                    <p className="text-muted-foreground text-sm">Upload your resume for a more personalized interview experience.</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                Upload Resume
                            </Button>
                        </div>
                    </Link>
                )}

                {/* Stats */}
                {sessions.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Sessions", value: sessions.length },
                            { label: "Avg Score", value: avgScore },
                            { label: "Best Score", value: bestScore },
                        ].map(stat => (
                            <div key={stat.label} className="rounded-2xl p-5 flex flex-col gap-1"
                                style={{ background: "rgba(12,22,44,0.6)", border: "1px solid rgba(59,130,246,0.1)" }}>
                                <span className="text-muted-foreground text-xs">{stat.label}</span>
                                <span className="text-foreground text-3xl font-bold tracking-tight">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Start interview CTA */}
                <Link href="/interview/setup">
                    <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold gap-2 text-base">
                        <Plus className="h-5 w-5" />
                        Start New Interview
                    </Button>
                </Link>

                {/* Session list */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-foreground font-semibold">Past Sessions</h2>
                    {loading ? (
                        <p className="text-muted-foreground text-sm text-center py-8">Loading…</p>
                    ) : sessions.length === 0 ? (
                        <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
                            style={{ background: "rgba(12,22,44,0.4)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                            <Star className="h-10 w-10 text-muted-foreground/30" />
                            <div>
                                <p className="text-foreground font-medium">No interviews yet</p>
                                <p className="text-muted-foreground text-sm mt-1">Start your first session to see your results here</p>
                            </div>
                        </div>
                    ) : (
                        sessions.map(s => (
                            <Link key={s.id} href={`/interview/results/${s.id}`}>
                                <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                    style={{ background: "rgba(12,22,44,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground font-semibold text-sm">{s.role}</span>
                                            {s.company && <span className="text-muted-foreground text-xs">@ {s.company}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-muted-foreground text-xs">{s.seniority} · {s.interview_type}</span>
                                            <span className="text-muted-foreground text-xs">·</span>
                                            <span className="text-muted-foreground text-xs">
                                                {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(s.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <ScoreBadge score={s.overall_score || 0} />
                                            {s.camera_score != null && (
                                                <span className="text-muted-foreground text-[10px]">📷 {s.camera_score}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
