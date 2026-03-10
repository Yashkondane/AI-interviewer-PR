"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Video, Briefcase, Clock, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

const ROLES = ["SWE", "PM", "Design", "Data", "Finance", "Marketing", "HR", "Other"]
const SENIORITIES = ["Junior", "Mid", "Senior", "Staff"]
const TYPES = ["Behavioral", "Technical", "Mixed"]
const DURATIONS = [15, 30, 45]

// ── Auth-check modal ─────────────────────────────────────────
function AuthCheckModal({
    onYes, onNo,
}: {
    onYes: () => void
    onNo: () => void
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(3,8,20,0.8)", backdropFilter: "blur(16px)" }}>
            <div
                className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6 relative"
                style={{
                    background: "rgba(12,22,44,0.9)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    boxShadow: "0 0 60px rgba(59,130,246,0.08)",
                }}
            >
                {/* Top glow line */}
                <div className="absolute top-0 left-10 right-10 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />

                <div className="flex flex-col gap-2 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                        <LogIn className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-foreground font-semibold text-xl mt-2">
                        Have you signed up before?
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Sessions are saved to your account so you can track your progress over time.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={onYes}
                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold gap-2"
                    >
                        <LogIn className="h-4 w-4" />
                        Yes — sign in to my account
                    </Button>
                    <Button
                        onClick={onNo}
                        variant="outline"
                        className="w-full h-11 rounded-xl border-white/10 bg-white/4 hover:bg-white/8 text-foreground gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        No — create an account first
                    </Button>
                    <button
                        onClick={onYes}
                        className="text-muted-foreground text-xs text-center hover:text-foreground transition-colors mt-1"
                    >
                        Continue without saving (guest mode)
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function SetupPage() {
    const router = useRouter()
    const [config, setConfig] = useState({
        role: "SWE",
        company: "",
        seniority: "Mid",
        interview_type: "Behavioral",
        duration_mins: 15,
    })
    const [showAuthCheck, setShowAuthCheck] = useState(false)
    const [loading, setLoading] = useState(false)

    const startSession = () => {
        setLoading(true)
        const params = new URLSearchParams({
            role: config.role,
            company: config.company,
            seniority: config.seniority,
            type: config.interview_type,
            duration: String(config.duration_mins),
        })
        router.push(`/interview/session?${params}`)
    }

    const set = (key: string, val: string | number) => setConfig(c => ({ ...c, [key]: val }))

    const SelectGroup = ({
        label, options, value, onChange,
    }: {
        label: string; options: (string | number)[]; value: string | number; onChange: (v: string) => void
    }) => (
        <div className="flex flex-col gap-2">
            <p className="text-foreground text-sm font-medium">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(String(opt))}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            background: value === opt ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${value === opt ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                            color: value === opt ? "#93c5fd" : "hsl(215 14% 60%)",
                        }}
                    >
                        {opt}{typeof opt === "number" ? " min" : ""}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <>
            {/* Auth check modal */}
            {showAuthCheck && (
                <AuthCheckModal
                    onYes={() => {
                        setShowAuthCheck(false)
                        router.push(`/auth/login?redirectTo=/interview/setup`)
                    }}
                    onNo={() => {
                        setShowAuthCheck(false)
                        router.push(`/auth/signup?redirectTo=/interview/setup`)
                    }}
                />
            )}

            <div className="min-h-screen flex items-center justify-center px-4 py-16"
                style={{ background: "hsl(216 42% 5%)" }}>
                {/* Background */}
                <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-15"
                        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.5) 0%, transparent 65%)", filter: "blur(80px)" }} />
                </div>

                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <span className="section-label">Interview Setup</span>
                        </div>
                        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Configure your session</h1>
                        <p className="text-muted-foreground text-sm mt-2">Tailored to your role, company, and goals.</p>
                    </div>

                    {/* Card */}
                    <div className="rounded-3xl p-8 flex flex-col gap-7"
                        style={{ background: "rgba(12,22,44,0.75)", border: "1px solid rgba(59,130,246,0.12)", backdropFilter: "blur(20px)" }}>

                        <SelectGroup label="Target Role" options={ROLES} value={config.role} onChange={v => set("role", v)} />

                        {/* Company */}
                        <div className="flex flex-col gap-2">
                            <p className="text-foreground text-sm font-medium">
                                Target Company <span className="text-muted-foreground font-normal">(optional)</span>
                            </p>
                            <input
                                type="text"
                                value={config.company}
                                onChange={e => set("company", e.target.value)}
                                placeholder="e.g. Google, Stripe, your startup…"
                                className="rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                        </div>

                        <SelectGroup label="Seniority" options={SENIORITIES} value={config.seniority} onChange={v => set("seniority", v)} />
                        <SelectGroup label="Interview Type" options={TYPES} value={config.interview_type} onChange={v => set("interview_type", v)} />
                        <SelectGroup label="Duration" options={DURATIONS} value={config.duration_mins} onChange={v => set("duration_mins", Number(v))} />

                        {/* Camera note */}
                        <div className="flex items-start gap-3 rounded-xl p-4"
                            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                            <Video className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                We&apos;ll ask for camera access to analyze your <strong className="text-foreground">eye contact, posture, and expression</strong> in real time. No recordings are stored.
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowAuthCheck(true)}
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-base gap-2"
                        >
                            {loading ? "Starting…" : "Start Interview"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Duration info */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~{config.duration_mins} minutes · {Math.floor(config.duration_mins * 1.2)} exchanges</span>
                    </div>
                </div>
            </div>
        </>
    )
}
