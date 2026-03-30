"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { ScoreGauge, ScoreBar } from "@/components/ats/score-gauge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    ArrowLeft, Upload, FileText, Loader2, Sparkles,
    CheckCircle2, XCircle, AlertTriangle, Lightbulb,
    ChevronDown, ChevronUp, ScanSearch, ClipboardPaste
} from "lucide-react"

interface ATSResult {
    final_score: number
    jd_match_score: number | null
    resume_quality_score: number
    jd_analysis: {
        matched_skills: string[]
        missing_skills: string[]
        keyword_coverage: number
        experience_match: number
        semantic_similarity: number
        tools_match: number
        education_match: number
        skill_match: number
    } | null
    resume_analysis: {
        bullet_strength: number
        action_verbs: number
        quantification: number
        clarity: number
        repetition_penalty: number
        grammar_score: number
        structure_score: number
        tech_stack_complexity: number
        experience_depth: number
        impact_score: number
        contact_completeness: number
        skill_alignment: number
        repetition_issues: string[]
        structure_issues: string[]
        grammar_issues: string[]
    }
    feedback: string[]
}

function ScoreBadgeInline({ score }: { score: number }) {
    const color =
        score >= 80 ? { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" } :
            score >= 60 ? { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)", text: "#60a5fa" } :
                score >= 40 ? { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" } :
                    { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" }
    return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
            style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}>
            {score}
        </span>
    )
}

function getGradeLabel(score: number): { label: string; color: string } {
    if (score >= 90) return { label: "Excellent", color: "#34d399" }
    if (score >= 75) return { label: "Strong", color: "#60a5fa" }
    if (score >= 60) return { label: "Good", color: "#60a5fa" }
    if (score >= 40) return { label: "Needs Work", color: "#fbbf24" }
    if (score >= 20) return { label: "Weak", color: "#f97316" }
    return { label: "Poor", color: "#f87171" }
}

export default function ATSScorePage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [hasResume, setHasResume] = useState(false)
    const [resumeData, setResumeData] = useState<any>(null)
    const [jobDescription, setJobDescription] = useState("")
    const [evaluating, setEvaluating] = useState(false)
    const [result, setResult] = useState<ATSResult | null>(null)
    const [uploadingNew, setUploadingNew] = useState(false)
    const [showJD, setShowJD] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        jd: true,
        quality: true,
        feedback: true,
    })

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push("/auth/login"); return }

            const { data: profile } = await supabase
                .from("profiles")
                .select("resume_data")
                .eq("id", user.id)
                .single()

            if (profile?.resume_data) {
                setHasResume(true)
                setResumeData(profile.resume_data)
            }
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file")
            return
        }

        setUploadingNew(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/profile/resume", { method: "POST", body: formData })
            const result = await res.json()
            if (result.success) {
                toast.success("Resume uploaded & parsed!")
                setResumeData(result.data)
                setHasResume(true)
            } else {
                throw new Error(result.error || "Failed to parse resume")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setUploadingNew(false)
        }
    }

    const handleEvaluate = async () => {
        if (!resumeData) {
            toast.error("Please upload a resume first")
            return
        }

        setEvaluating(true)
        setResult(null)

        try {
            const res = await fetch("/api/resume-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_data: resumeData,
                    job_description: jobDescription.trim() || null,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Evaluation failed")
            }

            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            toast.error(err.message || "Failed to evaluate resume")
        } finally {
            setEvaluating(false)
        }
    }

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: "hsl(216 42% 5%)" }}>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    const grade = result ? getGradeLabel(result.final_score) : null

    return (
        <div className="min-h-screen px-4 py-8 sm:py-10" style={{ background: "hsl(216 42% 5%)" }}>
            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-10"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.5) 0%, transparent 65%)", filter: "blur(80px)" }} />
                {result && (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-5"
                        style={{
                            background: `radial-gradient(circle, ${grade?.color || "rgba(59,130,246,0.5)"} 0%, transparent 70%)`,
                            filter: "blur(100px)"
                        }} />
                )}
            </div>

            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <ScanSearch className="h-5 w-5 text-primary" />
                        <span className="text-foreground font-semibold">ATS Resume Score</span>
                    </div>
                </div>

                {/* Input Section */}
                <AnimatePresence mode="wait">
                    {!result && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="flex flex-col gap-5"
                        >
                            {/* Resume Source Card */}
                            <div className="rounded-3xl p-6 space-y-5"
                                style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-foreground font-semibold">Resume Source</h2>
                                        <p className="text-muted-foreground text-xs">Use your profile resume or upload a new one</p>
                                    </div>
                                </div>

                                {hasResume ? (
                                    <div className="flex items-center gap-3 p-4 rounded-2xl"
                                        style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-green-400">
                                                {resumeData?.name || "Resume"} — Ready
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {resumeData?.skills?.length || 0} skills · {resumeData?.experience?.length || 0} experiences · {resumeData?.education?.length || 0} education entries
                                            </p>
                                        </div>
                                        <div className="relative flex-shrink-0">
                                            <input type="file" id="ats-upload" className="hidden" accept=".pdf"
                                                onChange={handleUploadNew} disabled={uploadingNew || evaluating} />
                                            <label htmlFor="ats-upload">
                                                <Button asChild variant="outline" size="sm" className="cursor-pointer rounded-xl text-xs"
                                                    disabled={uploadingNew || evaluating}>
                                                    <span>
                                                        {uploadingNew ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                                                        Replace
                                                    </span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-dashed border-white/10">
                                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                                        <div className="text-center">
                                            <p className="text-foreground font-medium text-sm">No resume found</p>
                                            <p className="text-muted-foreground text-xs mt-1">Upload a PDF to get started</p>
                                        </div>
                                        <div className="relative">
                                            <input type="file" id="ats-upload-new" className="hidden" accept=".pdf"
                                                onChange={handleUploadNew} disabled={uploadingNew} />
                                            <label htmlFor="ats-upload-new">
                                                <Button asChild className="cursor-pointer rounded-xl bg-primary hover:bg-primary/90"
                                                    disabled={uploadingNew}>
                                                    <span>
                                                        {uploadingNew ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                                        Upload Resume PDF
                                                    </span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Job Description Card */}
                            <div className="rounded-3xl p-6 space-y-4"
                                style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                <button
                                    onClick={() => setShowJD(!showJD)}
                                    className="flex items-center justify-between w-full group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                            <ClipboardPaste className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-foreground font-semibold">Job Description <span className="text-muted-foreground font-normal text-xs">(optional)</span></h2>
                                            <p className="text-muted-foreground text-xs">Paste a JD for targeted ATS matching analysis</p>
                                        </div>
                                    </div>
                                    {showJD ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </button>

                                <AnimatePresence>
                                    {showJD && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <textarea
                                                value={jobDescription}
                                                onChange={e => setJobDescription(e.target.value)}
                                                placeholder="Paste the full job description here... (requirements, responsibilities, qualifications)"
                                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                                                rows={6}
                                                disabled={evaluating}
                                            />
                                            {jobDescription.trim() && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {jobDescription.trim().split(/\s+/).length} words
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Evaluate Button */}
                            <Button
                                onClick={handleEvaluate}
                                disabled={!hasResume || evaluating}
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-semibold gap-2.5 text-base btn-primary-glow transition-all"
                            >
                                {evaluating ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Analyzing Resume…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        {jobDescription.trim() ? "Score Against Job Description" : "Evaluate Resume Quality"}
                                    </>
                                )}
                            </Button>

                            {evaluating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-3 py-4"
                                >
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-2 h-6 rounded-full bg-primary/40 wave-bar" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Running ATS evaluation pipeline…</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Try Again */}
                            <Button
                                variant="outline"
                                onClick={() => setResult(null)}
                                className="self-start rounded-xl text-xs gap-1.5"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Evaluate Again
                            </Button>

                            {/* Top Score Card */}
                            <div className="rounded-3xl p-8 flex flex-col items-center gap-6"
                                style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, type: "spring" }}
                                >
                                    <ScoreGauge score={result.final_score} size={200} label="Overall ATS Score" />
                                </motion.div>

                                <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <span className="text-2xl font-bold" style={{ color: grade?.color }}>
                                        {grade?.label}
                                    </span>
                                </motion.div>

                                {/* Sub-scores */}
                                <div className="grid grid-cols-2 gap-6 w-full max-w-md pt-4">
                                    <ScoreGauge
                                        score={result.resume_quality_score}
                                        size={120}
                                        label="Resume Quality"
                                        delay={0.3}
                                    />
                                    {result.jd_match_score !== null ? (
                                        <ScoreGauge
                                            score={result.jd_match_score}
                                            size={120}
                                            label="JD Match"
                                            delay={0.5}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                                            <div className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground text-center px-4">No JD<br />provided</span>
                                            </div>
                                            <span className="text-[0.7rem] text-muted-foreground tracking-wider uppercase font-semibold">JD Match</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* JD Analysis */}
                            {result.jd_analysis && (
                                <div className="rounded-3xl overflow-hidden"
                                    style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                    <button
                                        onClick={() => toggleSection("jd")}
                                        className="w-full flex items-center justify-between p-6 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ScanSearch className="h-5 w-5 text-primary" />
                                            <h3 className="text-foreground font-semibold">JD Match Analysis</h3>
                                            <ScoreBadgeInline score={result.jd_match_score!} />
                                        </div>
                                        {expandedSections.jd ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedSections.jd && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 space-y-6">
                                                    {/* Skills */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1.5 text-green-400">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                <span className="text-xs font-semibold">Matched Skills ({result.jd_analysis.matched_skills.length})</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {result.jd_analysis.matched_skills.length > 0 ? result.jd_analysis.matched_skills.map((s, i) => (
                                                                    <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                                                                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                                                                        {s}
                                                                    </span>
                                                                )) : (
                                                                    <span className="text-xs text-muted-foreground">None matched</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1.5 text-red-400">
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                <span className="text-xs font-semibold">Missing Skills ({result.jd_analysis.missing_skills.length})</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {result.jd_analysis.missing_skills.length > 0 ? result.jd_analysis.missing_skills.map((s, i) => (
                                                                    <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                                                                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5" }}>
                                                                        {s}
                                                                    </span>
                                                                )) : (
                                                                    <span className="text-xs text-muted-foreground">All matched!</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Score Bars */}
                                                    <div className="grid gap-3">
                                                        <ScoreBar label="Skill Match" score={result.jd_analysis.skill_match} delay={0.1} />
                                                        <ScoreBar label="Experience Match" score={result.jd_analysis.experience_match} delay={0.15} />
                                                        <ScoreBar label="Semantic Similarity" score={result.jd_analysis.semantic_similarity} delay={0.2} />
                                                        <ScoreBar label="Keyword Coverage" score={result.jd_analysis.keyword_coverage} delay={0.25} />
                                                        <ScoreBar label="Tools Match" score={result.jd_analysis.tools_match} delay={0.3} />
                                                        <ScoreBar label="Education Match" score={result.jd_analysis.education_match} delay={0.35} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Resume Quality Analysis */}
                            <div className="rounded-3xl overflow-hidden"
                                style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                <button
                                    onClick={() => toggleSection("quality")}
                                    className="w-full flex items-center justify-between p-6 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <h3 className="text-foreground font-semibold">Resume Quality Breakdown</h3>
                                        <ScoreBadgeInline score={result.resume_quality_score} />
                                    </div>
                                    {expandedSections.quality ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </button>

                                <AnimatePresence>
                                    {expandedSections.quality && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 space-y-6">
                                                {/* Score bars */}
                                                <div className="grid gap-3">
                                                    <ScoreBar label="Impact & Outcomes" score={result.resume_analysis.impact_score} delay={0.1} />
                                                    <ScoreBar label="Bullet Point Strength" score={result.resume_analysis.bullet_strength} delay={0.15} />
                                                    <ScoreBar label="Skill Alignment" score={result.resume_analysis.skill_alignment} delay={0.2} />
                                                    <ScoreBar label="Tech Stack Complexity" score={result.resume_analysis.tech_stack_complexity} delay={0.25} />
                                                    <ScoreBar label="Experience Depth" score={result.resume_analysis.experience_depth} delay={0.3} />
                                                    <ScoreBar label="Quantification (Metrics)" score={result.resume_analysis.quantification} delay={0.35} />
                                                    <ScoreBar label="Contact Completeness" score={result.resume_analysis.contact_completeness} delay={0.4} />
                                                    <ScoreBar label="Structure & Sections" score={result.resume_analysis.structure_score} delay={0.45} />
                                                    <ScoreBar label="Verb Repetition" score={result.resume_analysis.repetition_penalty} delay={0.5} />
                                                    <ScoreBar label="Grammar & Spelling" score={result.resume_analysis.grammar_score} delay={0.55} />
                                                </div>

                                                {/* Issues */}
                                                {(result.resume_analysis.repetition_issues.length > 0 ||
                                                    result.resume_analysis.structure_issues.length > 0 ||
                                                    result.resume_analysis.grammar_issues.length > 0) && (
                                                        <div className="space-y-4 pt-2">
                                                            <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Issues Detected</h4>

                                                            {result.resume_analysis.repetition_issues.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" /> Repetition Issues
                                                                    </span>
                                                                    {result.resume_analysis.repetition_issues.map((issue, i) => (
                                                                        <p key={i} className="text-xs text-slate-400 pl-4 border-l-2 border-amber-500/20">{issue}</p>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {result.resume_analysis.structure_issues.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <span className="text-[11px] font-medium text-orange-400 flex items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" /> Structure Issues
                                                                    </span>
                                                                    {result.resume_analysis.structure_issues.map((issue, i) => (
                                                                        <p key={i} className="text-xs text-slate-400 pl-4 border-l-2 border-orange-500/20">{issue}</p>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {result.resume_analysis.grammar_issues.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <span className="text-[11px] font-medium text-red-400 flex items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" /> Grammar Issues
                                                                    </span>
                                                                    {result.resume_analysis.grammar_issues.map((issue, i) => (
                                                                        <p key={i} className="text-xs text-slate-400 pl-4 border-l-2 border-red-500/20">{issue}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Actionable Feedback */}
                            {result.feedback.length > 0 && (
                                <div className="rounded-3xl overflow-hidden"
                                    style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                    <button
                                        onClick={() => toggleSection("feedback")}
                                        className="w-full flex items-center justify-between p-6 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Lightbulb className="h-5 w-5 text-amber-400" />
                                            <h3 className="text-foreground font-semibold">Improvement Suggestions</h3>
                                        </div>
                                        {expandedSections.feedback ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedSections.feedback && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 space-y-3">
                                                    {result.feedback.map((tip, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -12 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex gap-3 p-4 rounded-2xl"
                                                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                                                        >
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
