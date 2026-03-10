"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
    Target, TrendingUp, RefreshCw, Briefcase,
    Code2, BarChart3, Palette, DollarSign, Megaphone, Users,
    ArrowRight, ArrowLeft, X, Plus, Check,
    Flame, Zap, Calendar, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────
interface OnboardingData {
    goal: string
    role: string
    companies: string[]
    urgency: string
    weakness: string
}

// ── Step configs ───────────────────────────────────────────────
const goals = [
    { id: "land_offer", icon: Target, label: "Land a specific job offer", sub: "I have interviews coming up" },
    { id: "level_up", icon: TrendingUp, label: "Level up my interview skills", sub: "I want to get better overall" },
    { id: "stay_sharp", icon: RefreshCw, label: "Stay sharp with regular practice", sub: "I interview periodically" },
    { id: "switching", icon: Briefcase, label: "Switching careers / new industry", sub: "Entering a new field" },
]

const roles = [
    { id: "SWE", icon: Code2, label: "Software Engineer" },
    { id: "PM", icon: BarChart3, label: "Product Manager" },
    { id: "Design", icon: Palette, label: "UX / Product Design" },
    { id: "Data", icon: BarChart3, label: "Data / Analytics" },
    { id: "Finance", icon: DollarSign, label: "Finance / Banking" },
    { id: "Marketing", icon: Megaphone, label: "Marketing / Growth" },
    { id: "HR", icon: Users, label: "HR / Recruiting" },
    { id: "Other", icon: Briefcase, label: "Other" },
]

const urgencies = [
    { id: "this_week", label: "In less than 1 week", icon: Flame },
    { id: "1_2_weeks", label: "1–2 weeks", icon: Zap },
    { id: "3_4_weeks", label: "3–4 weeks", icon: Calendar },
    { id: "exploring", label: "Just exploring for now", icon: Search },
]

const weaknesses = [
    { id: "structure", label: "Structuring my answers clearly" },
    { id: "calm", label: "Staying calm under pressure" },
    { id: "depth", label: "Giving too little technical depth" },
    { id: "concise", label: "Rambling / going on too long" },
    { id: "unsure", label: "Not sure yet" },
]

// ── Slide animation ────────────────────────────────────────────
const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ── Main component ─────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [dir, setDir] = useState(1)
    const [data, setData] = useState<OnboardingData>({
        goal: "", role: "", companies: [], urgency: "", weakness: "",
    })
    const [companyInput, setCompanyInput] = useState("")

    const totalSteps = 5

    const go = (next: number) => {
        setDir(next > step ? 1 : -1)
        setStep(next)
    }

    const canNext = () => {
        if (step === 0) return !!data.goal
        if (step === 1) return !!data.role
        if (step === 2) return true                  // companies optional
        if (step === 3) return !!data.urgency
        if (step === 4) return !!data.weakness
        return true
    }

    const next = () => {
        if (step < totalSteps - 1) { go(step + 1); return }
        // Save to sessionStorage so signup page picks it up
        sessionStorage.setItem("onboarding", JSON.stringify(data))
        router.push("/auth/signup?from=onboarding")
    }

    const addCompany = () => {
        const name = companyInput.trim()
        if (!name || data.companies.includes(name)) return
        setData(d => ({ ...d, companies: [...d.companies, name] }))
        setCompanyInput("")
    }

    const removeCompany = (c: string) =>
        setData(d => ({ ...d, companies: d.companies.filter(x => x !== c) }))

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
            style={{ background: "hsl(216 42% 5%)" }}
        >
            {/* Background orb */}
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-20"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.5) 0%, transparent 65%)",
                    filter: "blur(80px)",
                }}
                aria-hidden
            />

            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
                <div className="h-8 w-8 rounded-xl bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <rect x="6" y="1" width="2" height="12" rx="1" fill="white" />
                        <rect x="3" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                        <rect x="9" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                        <rect x="0" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4" />
                        <rect x="12" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4" />
                    </svg>
                </div>
                <span className="font-bold text-foreground text-lg tracking-tight">
                    Storm<span className="text-primary">Prep</span>
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-lg mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-xs">Step {step + 1} of {totalSteps}</span>
                    <span className="text-muted-foreground text-xs">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                            width: `${((step + 1) / totalSteps) * 100}%`,
                            background: "linear-gradient(90deg, rgba(59,130,246,0.8), rgba(99,170,255,0.9))",
                        }}
                    />
                </div>
            </div>

            {/* Card */}
            <div
                className="w-full max-w-lg rounded-3xl p-8 overflow-hidden relative"
                style={{
                    background: "rgba(12,22,44,0.7)",
                    border: "1px solid rgba(59,130,246,0.12)",
                    backdropFilter: "blur(20px)",
                    minHeight: "420px",
                }}
            >
                <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                    >

                        {/* ── Step 0: Goal ── */}
                        {step === 0 && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Getting started</p>
                                    <h2 className="text-foreground font-semibold text-2xl leading-snug">What's your main goal?</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {goals.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setData(d => ({ ...d, goal: g.id }))}
                                            className="flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200"
                                            style={{
                                                background: data.goal === g.id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${data.goal === g.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <div
                                                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: data.goal === g.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                                                    border: `1px solid ${data.goal === g.id ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.08)"}`,
                                                }}
                                            >
                                                <g.icon className={`h-5 w-5 ${data.goal === g.id ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${data.goal === g.id ? "text-foreground" : "text-foreground/75"}`}>{g.label}</p>
                                                <p className="text-muted-foreground text-xs">{g.sub}</p>
                                            </div>
                                            {data.goal === g.id && (
                                                <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Role ── */}
                        {step === 1 && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Your target role</p>
                                    <h2 className="text-foreground font-semibold text-2xl leading-snug">What role are you targeting?</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {roles.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => setData(d => ({ ...d, role: r.id }))}
                                            className="flex items-center gap-3 rounded-xl p-3.5 text-left transition-all duration-200"
                                            style={{
                                                background: data.role === r.id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${data.role === r.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <r.icon className={`h-4 w-4 flex-shrink-0 ${data.role === r.id ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className={`text-sm font-medium ${data.role === r.id ? "text-foreground" : "text-foreground/75"}`}>{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Companies ── */}
                        {step === 2 && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Target companies</p>
                                    <h2 className="text-foreground font-semibold text-2xl leading-snug">Which companies are you interviewing at?</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Type any company name — optional, you can skip this.</p>
                                </div>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={companyInput}
                                        onChange={e => setCompanyInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCompany() } }}
                                        placeholder="e.g. Google, Stripe, Figma…"
                                        className="flex-1 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={addCompany}
                                        className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105"
                                        style={{ background: "rgba(59,130,246,0.85)", border: "1px solid rgba(59,130,246,0.5)" }}
                                        aria-label="Add company"
                                    >
                                        <Plus className="h-4 w-4 text-white" />
                                    </button>
                                </div>

                                {/* Tags */}
                                {data.companies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {data.companies.map(c => (
                                            <div
                                                key={c}
                                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                                                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}
                                            >
                                                {c}
                                                <button onClick={() => removeCompany(c)} aria-label={`Remove ${c}`}>
                                                    <X className="h-3.5 w-3.5 opacity-70 hover:opacity-100 transition-opacity" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.companies.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4 opacity-50">
                                        No companies added yet — that's fine, you can skip
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── Step 3: Urgency ── */}
                        {step === 3 && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Your timeline</p>
                                    <h2 className="text-foreground font-semibold text-2xl leading-snug">When is your interview?</h2>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {urgencies.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => setData(d => ({ ...d, urgency: u.id }))}
                                            className="flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200"
                                            style={{
                                                background: data.urgency === u.id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${data.urgency === u.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <div
                                                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: data.urgency === u.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                                                    border: `1px solid ${data.urgency === u.id ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.08)"}`,
                                                }}
                                            >
                                                <u.icon className={`h-4 w-4 ${data.urgency === u.id ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                            <span className={`font-medium text-sm ${data.urgency === u.id ? "text-foreground" : "text-foreground/75"}`}>{u.label}</span>
                                            {data.urgency === u.id && (
                                                <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Weakness ── */}
                        {step === 4 && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Self awareness</p>
                                    <h2 className="text-foreground font-semibold text-2xl leading-snug">What's your biggest interview weakness?</h2>
                                    <p className="text-muted-foreground text-sm mt-1">We'll focus your practice here.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {weaknesses.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => setData(d => ({ ...d, weakness: w.id }))}
                                            className="flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200"
                                            style={{
                                                background: data.weakness === w.id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${data.weakness === w.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <span className={`text-sm font-medium flex-1 ${data.weakness === w.id ? "text-foreground" : "text-foreground/75"}`}>{w.label}</span>
                                            {data.weakness === w.id && (
                                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="w-full max-w-lg flex items-center justify-between mt-6">
                <Button
                    variant="ghost"
                    onClick={() => step === 0 ? router.push("/") : go(step - 1)}
                    className="text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {step === 0 ? "Back to home" : "Back"}
                </Button>

                <Button
                    onClick={next}
                    disabled={!canNext()}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-7 rounded-xl gap-2 disabled:opacity-40"
                >
                    {step === totalSteps - 1 ? "Create my account" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
