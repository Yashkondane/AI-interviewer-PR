"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { 
    Plus, Star, LayoutDashboard, LogOut, User, 
    FileText, ScanSearch, ChevronRight, Zap, TrendingUp, Activity
} from "lucide-react"

interface Session {
    id: string
    role: string
    company: string | null
    seniority: string
    interview_type: string
    overall_score: number
    camera_score: number
    resume_alignment: number | null
    created_at: string
}

function ScoreBadge({ score }: { score: number }) {
    const color =
        score >= 80 ? { bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)", text: "#34d399", glow: "rgba(52,211,153,0.2)" } :
            score >= 60 ? { bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", glow: "rgba(96,165,250,0.2)" } :
                score >= 40 ? { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fbbf24", glow: "rgba(251,191,36,0.2)" } :
                    { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.3)", text: "#f87171", glow: "rgba(248,113,113,0.2)" }
    return (
        <div className="flex items-center justify-center text-sm font-bold w-10 h-10 rounded-xl"
            style={{ 
                background: color.bg, 
                border: `1px solid ${color.border}`, 
                color: color.text,
                boxShadow: `0 0 20px ${color.glow}`
            }}>
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
    const [useHybridScore, setUseHybridScore] = useState(false)

    useEffect(() => {
        const load = async () => {
            const { data: { user: u } } = await supabase.auth.getUser()
            if (!u) { router.push("/auth/login"); return }

            const { data: profile } = await supabase.from("profiles").select("full_name, resume_data").eq("id", u.id).single()
            setUser(profile)

            const { data: s } = await supabase
                .from("sessions")
                .select("id, role, company, seniority, interview_type, overall_score, camera_score, resume_alignment, created_at")
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

    const getScore = (s: Session) => {
        if (useHybridScore && s.resume_alignment != null && s.resume_alignment > 0) {
            return Math.round((s.overall_score || 0) * 0.8 + s.resume_alignment * 0.2)
        }
        return s.overall_score || 0
    }

    const avgScore = sessions.length
        ? Math.round(sessions.reduce((a, s) => a + getScore(s), 0) / sessions.length)
        : 0

    const bestScore = sessions.length
        ? Math.max(...sessions.map(s => getScore(s)))
        : 0

    const hasAnyResumeEvaluations = sessions.some(s => s.resume_alignment != null && s.resume_alignment > 0)

    const firstName = user?.full_name?.split(" ")[0] || "there"

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "hsl(222 47% 4%)" }}>
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)", filter: "blur(100px)" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)", filter: "blur(120px)" }} />
            </div>

            {/* Top Navigation */}
            <nav className="w-full border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="relative h-8 w-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                            <Image src="/logo.png" alt="Prepwise" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-foreground text-lg tracking-tight">
                            Prep<span className="text-violet-400">wise</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/dashboard/profile" className="flex items-center gap-2 group cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/50 transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium hidden sm:block">{firstName}</span>
                        </Link>
                        <div className="h-4 w-px bg-white/10" />
                        <button onClick={handleLogout} className="text-muted-foreground hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:block">Sign out</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                
                {/* Header Welcome */}
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                        Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">{firstName}</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">Ready to master your next interview?</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column - 8 span */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Start Banner */}
                        <Link href="/interview/setup" className="block group">
                            <div className="relative w-full rounded-[2rem] overflow-hidden p-8 sm:p-10 transition-all duration-500 hover:scale-[1.01]"
                                style={{
                                    background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.15) 100%)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    boxShadow: "inset 0 0 80px rgba(255,255,255,0.02), 0 20px 40px rgba(0,0,0,0.2)"
                                }}>
                                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                                    <Zap className="w-48 h-48 text-cyan-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold mb-6 border border-white/5 backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        Ai-Powered
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start a Mock Interview</h2>
                                    <p className="text-white/70 max-w-md text-sm sm:text-base mb-8 leading-relaxed">
                                        Jump right into a dynamic, voice-based interview simulation tailored specifically to your target role and resume context.
                                    </p>
                                    <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-8 h-12 gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        <Plus className="w-5 h-5" /> Start Now
                                    </Button>
                                </div>
                            </div>
                        </Link>

                        {/* Recent Sessions */}
                        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 sm:p-8 flex flex-col min-h-[400px]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                        <Activity className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Recent Activity</h2>
                                </div>
                                
                                {hasAnyResumeEvaluations && (
                                    <button
                                        onClick={() => setUseHybridScore(!useHybridScore)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs flex-shrink-0 font-medium transition-all duration-300"
                                        style={{
                                            background: useHybridScore ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                                            border: `1px solid ${useHybridScore ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
                                            color: useHybridScore ? "#c4b5fd" : "hsl(215 14% 60%)"
                                        }}
                                    >
                                        <div className={`w-2 h-2 rounded-full transition-colors ${useHybridScore ? "bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" : "bg-muted-foreground/30"}`} />
                                        Hybrid Scoring (80% + 20% Resume)
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mb-2">
                                        <Star className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-foreground font-medium">No sessions yet</p>
                                    <p className="text-muted-foreground text-sm max-w-[250px]">Start your first interview to see performance metrics here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {sessions.map(s => (
                                        <Link key={s.id} href={`/interview/results/${s.id}`}>
                                            <div className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:bg-white/5 border border-white/5 hover:border-white/10">
                                                {/* Hover Highlight */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                     style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.05) 0%, transparent 100%)" }} />
                                                
                                                <div className="flex-1 min-w-0 z-10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-foreground font-semibold text-base tracking-tight">{s.role}</span>
                                                        {s.company && <span className="text-muted-foreground text-xs px-2 py-0.5 rounded-md bg-white/5">@ {s.company}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.seniority}</span>
                                                        <span>•</span>
                                                        <span>{s.interview_type}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 flex-shrink-0 z-10">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <ScoreBadge score={getScore(s)} />
                                                        {s.camera_score != null && (
                                                            <span className="text-muted-foreground text-[10px] font-semibold bg-white/5 px-1.5 rounded">📷 {s.camera_score}</span>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - 4 span */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Stats Widgets */}
                        {sessions.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 bg-white/[0.02] backdrop-blur-3xl aspect-square relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors" />
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
                                    </div>
                                    <span className="text-5xl font-bold text-white tracking-tighter">{avgScore}</span>
                                </div>
                                <div className="grid grid-rows-2 gap-4">
                                    <div className="rounded-[1.5rem] p-5 flex flex-col justify-center border border-white/5 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total</span>
                                        <span className="text-3xl font-bold text-white tracking-tighter">{sessions.length}</span>
                                    </div>
                                    <div className="rounded-[1.5rem] p-5 flex flex-col justify-center border border-white/5 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Best</span>
                                        <span className="text-3xl font-bold text-white tracking-tighter">{bestScore}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resume Sync Widget */}
                        {!loading && !user?.resume_data && (
                            <Link href="/dashboard/profile" className="block group">
                                <div className="rounded-[2rem] p-6 relative overflow-hidden border border-rose-500/20 backdrop-blur-3xl transition-all duration-300 hover:border-rose-500/40"
                                    style={{ background: "linear-gradient(180deg, rgba(244,63,94,0.05) 0%, rgba(12,22,44,0.4) 100%)" }}>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />
                                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-4 text-rose-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mb-2">Resume Missing</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        Upload your resume so your interviewer can ask personalized experience-based questions.
                                    </p>
                                    <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                        Take action <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* ATS Scanner Widget */}
                        <Link href="/dashboard/ats-score" className="block group flex-1">
                            <div className="rounded-[2rem] p-6 h-full relative overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl transition-all duration-300 hover:bg-white/[0.04]"
                                style={{ boxShadow: "inset 0 0 40px rgba(255,255,255,0.01)" }}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors" />
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 mb-4 text-violet-400">
                                    <ScanSearch className="w-6 h-6" />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">ATS Resume Scanner</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    Get an instant, recruiter-grade score for your resume. Find missing keywords and formatting flaws securely.
                                </p>
                                <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold group-hover:translate-x-1 transition-transform mt-auto">
                                    Analyze Resume <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

