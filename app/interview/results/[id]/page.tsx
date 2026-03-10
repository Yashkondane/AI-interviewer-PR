"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, RefreshCw, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react"

interface AnswerFeedback {
    question: string
    answer: string
    feedback: string
    score: number
}

interface Session {
    id: string
    role: string
    seniority: string
    interview_type: string
    overall_score: number
    clarity: number
    structure: number
    relevance: number
    pacing: number
    confidence: number
    camera_score: number
    eye_contact: number
    posture: number
    expression: number
    session_answers: AnswerFeedback[]
}

function ScoreGauge({ score }: { score: number }) {
    const r = 60
    const circ = Math.PI * r  // half circle
    const fill = (score / 100) * circ

    const color =
        score >= 80 ? "#34d399" :
            score >= 60 ? "#60a5fa" :
                score >= 40 ? "#fbbf24" : "#f87171"

    return (
        <div className="relative flex flex-col items-center">
            <svg width="160" height="92" viewBox="0 0 160 92">
                {/* Track */}
                <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Fill */}
                <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${circ}`}
                    strokeDashoffset={circ - fill}
                    style={{ transition: "stroke-dashoffset 1.2s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 6px ${color}70)` }}
                />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-foreground" style={{ letterSpacing: "-0.04em", color }}>{score}</span>
                <span className="text-muted-foreground text-xs mt-0.5">out of 100</span>
            </div>
        </div>
    )
}

function DimBar({ label, value }: { label: string; value: number }) {
    const color = value >= 75 ? "#34d399" : value >= 50 ? "#60a5fa" : "#fbbf24"
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">{label}</span>
                <span className="font-semibold" style={{ color }}>{value}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    )
}

function AnswerCard({ data, index }: { data: AnswerFeedback; index: number }) {
    const [open, setOpen] = useState(false)
    const score = data.score || 0
    const color = score >= 75 ? "#34d399" : score >= 50 ? "#60a5fa" : "#fbbf24"

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(12,22,44,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 text-left">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-muted-foreground text-sm font-bold tabular-nums flex-shrink-0">Q{index + 1}</span>
                    <p className="text-foreground text-sm truncate">{data.question}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
                    {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </button>
            {open && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="pt-4">
                        <p className="text-emerald-400 text-xs font-semibold mb-1.5">Your answer</p>
                        <p className="text-foreground/70 text-sm leading-relaxed">{data.answer || "No answer recorded"}</p>
                    </div>
                    <div className="rounded-xl p-4"
                        style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
                        <p className="text-primary text-xs font-semibold mb-1.5">AI Feedback</p>
                        <p className="text-foreground/80 text-sm leading-relaxed">{data.feedback || "Feedback not available"}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ResultsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createClient()
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from("sessions")
                .select("*, session_answers(*)")
                .eq("id", params.id)
                .single()
            setSession(data)
            setLoading(false)
        }
        load()
    }, [params.id, supabase])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(216 42% 5%)" }}>
            <div className="text-muted-foreground text-sm">Loading results…</div>
        </div>
    )

    if (!session) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(216 42% 5%)" }}>
            <div className="text-muted-foreground text-sm">Session not found.</div>
        </div>
    )

    const voiceDims = [
        { label: "Clarity", value: session.clarity || 0 },
        { label: "Structure", value: session.structure || 0 },
        { label: "Relevance", value: session.relevance || 0 },
        { label: "Pacing", value: session.pacing || 0 },
        { label: "Confidence", value: session.confidence || 0 },
    ]

    const cameraDims = [
        { label: "Eye Contact", value: session.eye_contact || 0 },
        { label: "Posture", value: session.posture || 0 },
        { label: "Expression", value: session.expression || 0 },
    ]

    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "hsl(216 42% 5%)" }}>
            <div className="max-w-2xl mx-auto flex flex-col gap-8">

                {/* Header */}
                <div className="text-center">
                    <span className="section-label mb-4 inline-flex">Interview Complete</span>
                    <h1 className="text-foreground text-3xl font-semibold tracking-tight mt-4">Your Results</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        {session.role} · {session.seniority} · {session.interview_type}
                    </p>
                </div>

                {/* Score gauge */}
                <div className="rounded-3xl p-8 flex flex-col items-center gap-6"
                    style={{ background: "rgba(12,22,44,0.75)", border: "1px solid rgba(59,130,246,0.12)", backdropFilter: "blur(20px)" }}>
                    <ScoreGauge score={session.overall_score || 0} />

                    {/* Two columns */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                            <p className="text-foreground text-xs font-semibold uppercase tracking-wider">🎤 Voice</p>
                            {voiceDims.map(d => <DimBar key={d.label} {...d} />)}
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="text-foreground text-xs font-semibold uppercase tracking-wider">📷 Body Language</p>
                            {cameraDims.map(d => <DimBar key={d.label} {...d} />)}
                        </div>
                    </div>
                </div>

                {/* Per-question feedback */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-foreground font-semibold">Question-by-Question Feedback</h2>
                    {(session.session_answers || []).map((ans, i) => (
                        <AnswerCard key={i} data={ans} index={i} />
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push("/interview/setup")}
                        variant="outline"
                        className="flex-1 rounded-xl border-white/10 bg-white/4 gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="flex-1 rounded-xl bg-primary hover:bg-primary/90 gap-2"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
