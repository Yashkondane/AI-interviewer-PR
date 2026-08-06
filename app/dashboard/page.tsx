"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { 
    Plus, Star, LayoutDashboard, LogOut, User, 
    FileText, ScanSearch, ChevronRight, Zap, TrendingUp, Activity, ArrowRight, Video
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
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

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

    const totalPages = Math.ceil(sessions.length / itemsPerPage)
    const paginatedSessions = sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "#040814" }}>
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                {/* Top left violet glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-30"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)", filter: "blur(120px)" }} />
                {/* Bottom right cyan glow */}
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 60%)", filter: "blur(150px)" }} />
                {/* Center subtle glow */}
                <div className="absolute top-[30%] left-[30%] w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", filter: "blur(100px)" }} />
            </div>

            {/* Top Navigation */}
            <nav className="w-full border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
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
                <div className="mb-12 flex flex-col gap-1">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">{firstName}</span>
                    </h1>
                    <p className="text-muted-foreground/80 text-lg mt-1 font-medium">Ready to master your next interview?</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column - 8 span */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Start Banner */}
                        <Link href="/interview/setup" className="block group">
                            <div className="relative w-full rounded-[2.5rem] overflow-hidden p-8 sm:p-12 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_80px_-20px_rgba(139,92,246,0.3)]"
                                style={{
                                    background: "linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(12,22,44,0.8) 100%)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)"
                                }}>
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-[80px] group-hover:bg-violet-500/30 transition-colors duration-500" />
                                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-[60px] group-hover:bg-cyan-500/30 transition-colors duration-500" />
                                
                                <div className="relative z-10 flex flex-col items-start">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/90 text-xs font-semibold mb-6 border border-white/10 backdrop-blur-md shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        Ai-Powered
                                    </div>
                                    <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">Start a Mock Interview</h2>
                                    <p className="text-white/60 max-w-lg text-base sm:text-lg mb-10 leading-relaxed font-medium">
                                        Jump right into a dynamic, voice-based interview simulation tailored specifically to your target role and resume context.
                                    </p>
                                    <Button className="rounded-2xl bg-white text-black hover:bg-white/90 font-bold px-8 h-14 text-base gap-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all duration-300 transform group-hover:-translate-y-1">
                                        <Zap className="w-5 h-5 text-violet-600" /> Start Now
                                    </Button>
                                </div>
                            </div>
                        </Link>

                        {/* Recent Sessions */}
                        <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl p-8 sm:p-10 flex flex-col min-h-[400px] shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                        <Activity className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
                                </div>
                                
                                {hasAnyResumeEvaluations && (
                                    <button
                                        onClick={() => setUseHybridScore(!useHybridScore)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs flex-shrink-0 font-bold transition-all duration-300"
                                        style={{
                                            background: useHybridScore ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${useHybridScore ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.05)"}`,
                                            color: useHybridScore ? "#c4b5fd" : "hsl(215 14% 60%)",
                                            boxShadow: useHybridScore ? "inset 0 1px 1px rgba(255,255,255,0.1), 0 0 20px rgba(139,92,246,0.1)" : "none"
                                        }}
                                    >
                                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${useHybridScore ? "bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)] scale-110" : "bg-muted-foreground/30"}`} />
                                        Hybrid Scoring (80% + 20% Resume)
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center relative z-10">
                                    <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 mb-2 shadow-inner">
                                        <Star className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-white font-bold text-lg">No sessions yet</p>
                                    <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">Start your first interview to see performance metrics here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 relative z-10">
                                    {paginatedSessions.map(s => (
                                        <Link key={s.id} href={`/interview/results/${s.id}`}>
                                            <div className="group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5">
                                                {/* Hover Highlight */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                                     style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.03) 0%, transparent 100%)" }} />
                                                
                                                <div className="flex-1 min-w-0 z-10">
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <span className="text-white font-bold text-lg tracking-tight truncate">{s.role}</span>
                                                        {s.company && <span className="text-violet-200/70 text-xs px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 font-medium truncate">@ {s.company}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase">
                                                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {s.seniority}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span>{s.interview_type}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span>
                                                            {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-5 flex-shrink-0 z-10">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <ScoreBadge score={getScore(s)} />
                                                        {s.camera_score != null && (
                                                            <span className="text-muted-foreground/70 text-[10px] font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Video className="w-3 h-3" /> {s.camera_score}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 mt-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-bold hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-bold hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - 4 span */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Stats Widgets */}
                        {sessions.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[2rem] p-7 flex flex-col justify-between border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl aspect-square relative overflow-hidden group shadow-lg hover:border-cyan-500/20 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-500" />
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">Avg Score</span>
                                    </div>
                                    <span className="text-6xl font-extrabold text-white tracking-tighter drop-shadow-sm">{avgScore}</span>
                                </div>
                                <div className="grid grid-rows-2 gap-4">
                                    <div className="rounded-[1.5rem] p-5 flex flex-col justify-center border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl relative overflow-hidden group shadow-md hover:border-violet-500/20 transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors duration-500" />
                                        <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Total</span>
                                        <span className="text-3xl font-extrabold text-white tracking-tighter">{sessions.length}</span>
                                    </div>
                                    <div className="rounded-[1.5rem] p-5 flex flex-col justify-center border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl relative overflow-hidden group shadow-md hover:border-emerald-500/20 transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
                                        <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Best</span>
                                        <span className="text-3xl font-extrabold text-white tracking-tighter">{bestScore}</span>
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
                        <Link href="/dashboard/ats-score" className="block group">
                            <div className="rounded-[2.5rem] p-8 relative overflow-hidden border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl transition-all duration-500 hover:bg-[#0c1429] hover:border-violet-500/30 hover:shadow-[0_20px_60px_-20px_rgba(139,92,246,0.2)] flex flex-col"
                                style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors duration-500" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-colors duration-500" />
                                
                                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 mb-6 shadow-inner text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <ScanSearch className="w-7 h-7" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-3 tracking-tight">ATS Resume Scanner</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
                                    Get an instant, recruiter-grade score for your resume. Find missing keywords and formatting flaws securely.
                                </p>
                                <div className="flex items-center gap-2 text-violet-400 text-sm font-bold group-hover:gap-3 transition-all mt-auto">
                                    Analyze Resume <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

