"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AiOrb } from "@/components/interview/ai-orb"
import { Waveform } from "@/components/interview/waveform"
import { CameraFeed } from "@/components/interview/camera-feed"
import { useInterview } from "@/hooks/use-interview"
import { useSpeech } from "@/hooks/use-speech"
import { createClient } from "@/lib/supabase/client"
import {
    PhoneOff, Mic, MicOff, VideoOff, Video,
    Loader2, AlertTriangle, WifiOff
} from "lucide-react"

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
    idle: { text: "Preparing…", color: "rgba(148,163,184,0.8)" },
    "ai-speaking": { text: "AI Interviewer is speaking…", color: "rgba(59,130,246,0.9)" },
    "user-listening": { text: "Your turn — speak now", color: "rgba(52,211,153,0.9)" },
    processing: { text: "Processing…", color: "rgba(251,191,36,0.9)" },
    done: { text: "Interview complete", color: "rgba(52,211,153,0.9)" },
}

// ── Mic indicator bar (like Google Meet) ───────────────────────
function MicIndicator({ volume, blocked, active }: { volume: number; blocked: boolean; active: boolean }) {
    const bars = 5
    // If volume > 0, always show at least one bar so user knows it's working
    const filledBars = blocked ? 0 : volume > 0 ? Math.max(1, Math.ceil((volume / 100) * bars)) : 0

    return (
        <div
            className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{
                background: blocked ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${blocked ? "rgba(248,113,113,0.3)" : active ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: active && volume > 10 ? `0 0 15px rgba(52,211,153,0.1)` : "none"
            }}
        >
            {blocked
                ? <MicOff className="h-4 w-4 text-red-400 flex-shrink-0" />
                : active
                    ? <Mic className="h-4 w-4 text-emerald-400 animate-pulse flex-shrink-0" />
                    : <Mic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            }

            {/* Volume bars */}
            <div className="flex items-end gap-[3px] h-4">
                {[...Array(bars)].map((_, i) => (
                    <div
                        key={i}
                        className="w-1.5 rounded-sm transition-all duration-75"
                        style={{
                            height: `${(i + 1) * 20}%`,
                            background: blocked
                                ? "rgba(248,113,113,0.3)"
                                : i < filledBars
                                    ? (volume > 75 ? "#34d399" : volume > 40 ? "#60a5fa" : "#10b981")
                                    : "rgba(255,255,255,0.1)",
                            boxShadow: !blocked && i < filledBars ? `0 0 8px ${volume > 75 ? "#34d39960" : "#10b98160"}` : "none"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

// ── Camera pill ────────────────────────────────────────────────
function CamIndicator({ active, error }: { active: boolean; error: string | null }) {
    const blocked = !!error
    return (
        <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{
                background: blocked ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${blocked ? "rgba(248,113,113,0.3)" : active ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
        >
            {blocked
                ? <VideoOff className="h-3.5 w-3.5 text-red-400" />
                : active
                    ? <Video className="h-3.5 w-3.5 text-emerald-400" />
                    : <Video className="h-3.5 w-3.5 text-muted-foreground" />
            }
            <span className="text-xs" style={{ color: blocked ? "#f87171" : active ? "#34d399" : "var(--muted-foreground)" }}>
                {blocked ? "Camera off" : active ? "Camera on" : "Camera…"}
            </span>
        </div>
    )
}

export default function SessionPage() {
    const router = useRouter()
    const params = useSearchParams()
    const supabase = createClient()
    const started = useRef(false)
    const [cameraEnded, setCameraEnded] = useState(false)
    const cameraWasActive = useRef(false)
    const [userName, setUserName] = useState("")

    // Fetch user name on mount
    useEffect(() => {
        const fetchName = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single()
                if (profile?.full_name) {
                    setUserName(profile.full_name.split(" ")[0]) // First name only
                }
            }
        }
        fetchName()
    }, [supabase])

    const config = {
        role: params.get("role") || "SWE",
        company: params.get("company") || "",
        seniority: params.get("seniority") || "Mid",
        interview_type: params.get("type") || "Behavioral",
        duration_mins: Number(params.get("duration") || 15),
        userName: userName || undefined,
        focus: params.get("focus") || "topic",
        custom_topics: params.get("custom_topics") || "",
    }

    const {
        status, exchanges, currentQuestion, sessionId,
        elapsedSeconds, isSpeaking, isListening,
        interimTranscript,
        cameraState, videoRef,
        startInterview, endInterview,
    } = useInterview(config)

    // Get mic volume from a separate speech hook instance (just for volume meter)
    const { micVolume, micBlocked, startVolumeAnalyzer, stopVolumeAnalyzer } = useSpeech()

    useEffect(() => {
        if (!started.current) {
            started.current = true
            startVolumeAnalyzer()
            startInterview()
        }
        return () => stopVolumeAnalyzer()
    }, [startInterview, startVolumeAnalyzer, stopVolumeAnalyzer])

    // Auto-redirect to results when interview is done
    useEffect(() => {
        if (status === "done" && sessionId) {
            router.push(`/interview/results/${sessionId}`)
        }
    }, [status, sessionId, router])

    // Watch for camera being turned off mid-interview
    // Only trigger if camera was previously active (avoids false positives on startup)
    useEffect(() => {
        if (cameraState.isActive) {
            cameraWasActive.current = true
        }
        if (cameraWasActive.current && !cameraState.isActive && cameraState.error && status !== "idle" && status !== "done") {
            setCameraEnded(true)
        }
    }, [cameraState.isActive, cameraState.error, status])

    const handleEnd = async () => {
        stopVolumeAnalyzer()
        const result = await endInterview()
        if (result?.sessionId) {
            router.push(`/interview/results/${result.sessionId}`)
        } else {
            router.push("/dashboard")
        }
    }

    const label = STATUS_LABELS[status] || STATUS_LABELS.idle

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: "hsl(216 42% 5%)" }}>
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                <div className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(18,40,90,0.8) 0%, transparent 70%)" }} />
            </div>

            {/* ── Mic blocked banner ── */}
            {micBlocked && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-3"
                    style={{ background: "rgba(239,68,68,0.15)", borderBottom: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(10px)" }}>
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm font-medium">
                        Microphone access is blocked — please click the 🔒 icon in your browser address bar and allow microphone access
                    </p>
                </div>
            )}

            {/* ── Camera turned off mid-interview banner ── */}
            {cameraEnded && !cameraState.isActive && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-3"
                    style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.3)", backdropFilter: "blur(10px)" }}>
                    <VideoOff className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <p className="text-amber-300 text-sm font-medium">
                        Camera turned off — please re-enable your camera to continue. Body language scoring is paused.
                    </p>
                </div>
            )}

            {/* ── Camera denied at start → full-screen block ── */}
            {!cameraState.isActive && cameraState.error && !cameraEnded && status !== "idle" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(5,10,20,0.9)", backdropFilter: "blur(20px)" }}>
                    <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                            <VideoOff className="h-8 w-8 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-foreground font-semibold text-lg">Camera access required</h3>
                            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                                StormPrep needs your camera to analyze body language. Please allow camera access and refresh the page.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button onClick={() => router.push("/interview/setup")} variant="outline"
                                className="flex-1 rounded-xl border-white/10">
                                Go Back
                            </Button>
                            <Button onClick={() => window.location.reload()}
                                className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LEFT PANEL ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 relative">

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-primary/90 flex items-center justify-center">
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
                                <rect x="6" y="1" width="2" height="12" rx="1" fill="white" />
                                <rect x="3" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                                <rect x="9" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                            </svg>
                        </div>
                        <span className="text-foreground text-sm font-semibold">Storm<span className="text-primary">Prep</span></span>
                    </div>

                    {/* Status strip + timer */}
                    <div className="flex items-center gap-3">
                        {/* Mic + camera indicators */}
                        <MicIndicator volume={micVolume} blocked={micBlocked} active={isListening} />
                        <CamIndicator active={cameraState.isActive} error={cameraState.error} />

                        <div className="text-muted-foreground text-sm font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatTime(elapsedSeconds)}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <span className="text-xs" style={{ color: label.color }}>●</span>
                            <span className="text-foreground/70 text-xs">{label.text}</span>
                        </div>
                    </div>
                </div>

                {/* Exchange counter */}
                <div className="text-muted-foreground text-xs mt-16">
                    {exchanges.length > 0 ? `Exchange ${exchanges.length}` : "Starting…"}
                </div>

                {/* AI Orb */}
                <AiOrb
                    isSpeaking={status === "ai-speaking"}
                    isListening={status === "user-listening"}
                    isProcessing={status === "processing"}
                />

                {/* Current question text */}
                {currentQuestion && (
                    <div className="max-w-md text-center px-4">
                        <p className="text-foreground/90 text-base leading-relaxed">&ldquo;{currentQuestion}&rdquo;</p>
                    </div>
                )}

                {/* ── Live speech-to-text display ── */}
                <div
                    className="w-full max-w-md min-h-[56px] rounded-2xl px-5 py-3 transition-all duration-300"
                    style={{
                        background: status === "user-listening" ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${status === "user-listening" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                >
                    {status === "user-listening" ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Mic className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">Speaking…</span>
                            </div>
                            {/* Final transcript from last exchange */}
                            {exchanges[exchanges.length - 1]?.answer ? (
                                <p className="text-foreground text-sm leading-relaxed">
                                    {exchanges[exchanges.length - 1].answer}
                                </p>
                            ) : null}
                            {/* Interim transcript (live in real time) */}
                            <p className="text-foreground/50 text-sm italic leading-relaxed">
                                {interimTranscript || "Waiting for speech…"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground/40 text-sm text-center">
                            {status === "ai-speaking" ? "AI is speaking — your turn next…" : "Your response will appear here"}
                        </p>
                    )}
                </div>

                {/* Waveform + mic status */}
                <div className="flex flex-col items-center gap-3">
                    <Waveform
                        isActive={status === "user-listening" && !micBlocked}
                        color={micBlocked ? "rgba(248,113,113,0.5)" : "rgba(52,211,153,0.8)"}
                    />
                    {status === "user-listening" && micBlocked && (
                        <div className="flex items-center gap-2 text-red-400 text-xs">
                            <MicOff className="h-3.5 w-3.5" />
                            <span>Mic blocked — we can&apos;t hear you. Please allow microphone access.</span>
                        </div>
                    )}
                    {status === "processing" && (
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing your answer…</span>
                        </div>
                    )}
                </div>

                {/* End button */}
                <Button
                    onClick={handleEnd}
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 gap-2 rounded-xl border border-white/8"
                >
                    <PhoneOff className="h-4 w-4" />
                    End Interview
                </Button>
            </div>

            {/* ── RIGHT PANEL — Camera + Transcript ─────────────────── */}
            <div className="w-80 flex flex-col gap-4 p-5 border-l" style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                {/* Camera */}
                <CameraFeed
                    videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                    stream={null}
                    cameraState={cameraState}
                />

                {/* Transcript */}
                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Full Transcript
                    </p>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1" style={{ maxHeight: "340px" }}>
                        {exchanges.length === 0 ? (
                            <p className="text-muted-foreground text-xs text-center mt-8 opacity-50">
                                Conversation will appear here…
                            </p>
                        ) : (
                            exchanges.map((ex, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="rounded-xl p-3"
                                        style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)" }}>
                                        <p className="text-primary text-[11px] font-semibold mb-1">Interviewer</p>
                                        <p className="text-foreground/80 text-xs leading-relaxed">{ex.question}</p>
                                    </div>
                                    {ex.answer ? (
                                        <div className="rounded-xl p-3 ml-3"
                                            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                                            <p className="text-emerald-400 text-[11px] font-semibold mb-1">You</p>
                                            <p className="text-foreground/75 text-xs leading-relaxed">{ex.answer}</p>
                                        </div>
                                    ) : status === "user-listening" && i === exchanges.length - 1 ? (
                                        <div className="rounded-xl p-3 ml-3"
                                            style={{ background: "rgba(52,211,153,0.04)", border: "1px dashed rgba(52,211,153,0.2)" }}>
                                            <p className="text-emerald-400 text-[11px] font-semibold mb-1">You — speaking</p>
                                            <p className="text-foreground/40 text-xs italic">
                                                {interimTranscript || "Listening…"}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
