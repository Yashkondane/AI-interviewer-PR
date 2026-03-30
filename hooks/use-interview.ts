"use client"

import { useRef, useState, useCallback } from "react"
import { useSpeech } from "./use-speech"
import { useCamera } from "./use-camera"
import { createClient } from "@/lib/supabase/client"

/**
 * Reconstruct a text resume from structured resume_data JSON
 */
function resumeDataToText(d: any): string {
    const lines: string[] = []
    if (d.name) lines.push(d.name)
    if (d.summary) lines.push(`\nSummary: ${d.summary}`)
    if (d.skills?.length) lines.push(`\nSkills: ${d.skills.join(", ")}`)
    if (d.experience?.length) {
        lines.push("\nExperience:")
        for (const exp of d.experience) {
            lines.push(`  ${exp.role} at ${exp.company} (${exp.duration})`)
            for (const h of exp.highlights || []) lines.push(`    • ${h}`)
        }
    }
    if (d.projects?.length) {
        lines.push("\nProjects:")
        for (const proj of d.projects) {
            lines.push(`  ${proj.name} [${(proj.tech_stack || []).join(", ")}]`)
            for (const h of proj.highlights || []) lines.push(`    • ${h}`)
        }
    }
    return lines.join("\n")
}

export type InterviewStatus =
    | "idle"
    | "ai-speaking"
    | "user-listening"
    | "processing"
    | "done"

export interface Exchange {
    question: string
    answer: string
}

export interface InterviewConfig {
    role: string
    company?: string
    seniority: string
    interview_type: string
    duration_mins: number
    userName?: string
    focus?: string
    custom_topics?: string
}

export function useInterview(config: InterviewConfig) {
    const supabase = createClient()
    const speechHook = useSpeech()
    const { videoRef, state: cameraState, startCamera, stopCamera, scoreHistory } = useCamera()

    const [status, setStatus] = useState<InterviewStatus>("idle")
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    // ── Refs for mutable values (avoids stale closure issues) ──
    const historyRef = useRef<{ role: "assistant" | "user"; content: string }[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const exchangesRef = useRef<Exchange[]>([])
    const exchangeCountRef = useRef(0)
    const isEndingRef = useRef(false)
    const maxExchangesRef = useRef(Math.max(8, Math.ceil(config.duration_mins * 2)))
    const elapsedSecondsRef = useRef(0)

    // Keep a ref to the latest speech hook so recursive calls always get fresh references
    const speechRef = useRef(speechHook)
    speechRef.current = speechHook

    // Helper: update exchanges in both state and ref
    const updateExchanges = useCallback((updater: (prev: Exchange[]) => Exchange[]) => {
        setExchanges(prev => {
            const next = updater(prev)
            exchangesRef.current = next
            return next
        })
    }, [])

    // ── End interview ────────────────────────────────────────────
    const doEndInterview = useCallback(async () => {
        if (isEndingRef.current) return null
        isEndingRef.current = true

        setStatus("processing")
        speechRef.current.stopSpeaking()
        speechRef.current.stopListening()
        stopCamera()
        if (timerRef.current) clearInterval(timerRef.current)

        // Calculate camera averages
        const cameraAvg = scoreHistory.length > 0
            ? {
                eye_contact: Math.round(scoreHistory.reduce((a, s) => a + s.eyeContact, 0) / scoreHistory.length),
                posture: Math.round(scoreHistory.reduce((a, s) => a + s.posture, 0) / scoreHistory.length),
                expression: Math.round(scoreHistory.reduce((a, s) => a + (s.expression === "confident" ? 80 : s.expression === "neutral" ? 50 : 25), 0) / scoreHistory.length),
            }
            : { eye_contact: 0, posture: 0, expression: 50 }

        const cameraScore = Math.round((cameraAvg.eye_contact + cameraAvg.posture + cameraAvg.expression) / 3)

        const currentExchanges = exchangesRef.current.filter(e => e.answer)
        const currentSessionId = sessionIdRef.current

        let scorecard = null
        if (currentExchanges.length > 0) {
            try {
                // Fetch resume data to pass as context
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("resume_data")
                    .eq("id", (await supabase.auth.getUser()).data.user?.id)
                    .single()
                
                const resume_text = profile?.resume_data ? resumeDataToText(profile.resume_data) : ""

                // Number the exchanges so the scorecard can reference them
                const numberedConversation = currentExchanges.map((e, i) => ({
                    turn_index: i + 1,
                    question: e.question,
                    answer: e.answer,
                }))
                const res = await fetch("/api/interview/scorecard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conversation: numberedConversation,
                        role: config.role,
                        seniority: config.seniority,
                        resume_text
                    }),
                })
                if (res.ok) {
                    scorecard = await res.json()
                }
            } catch (_) { /* ignore scoring errors */ }
        }

        if (currentSessionId) {
            try {
                const updatePayload: any = {
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    camera_score: cameraScore,
                    eye_contact: cameraAvg.eye_contact,
                    posture: cameraAvg.posture,
                    expression: cameraAvg.expression,
                    // New dimensions - putting in a JSON or existing cols
                    resume_alignment: scorecard?.dimensions?.resume_alignment,
                    fluency: scorecard?.dimensions?.fluency,
                }
                
                if (scorecard) {
                    updatePayload.overall_score = scorecard.overall_score
                    updatePayload.clarity = scorecard.dimensions?.clarity
                    updatePayload.structure = scorecard.dimensions?.structure
                    updatePayload.relevance = scorecard.dimensions?.relevance
                    updatePayload.pacing = scorecard.dimensions?.pacing
                    updatePayload.confidence = scorecard.dimensions?.confidence
                    updatePayload.overall_summary = scorecard.summary
                    updatePayload.top_strengths = scorecard.top_strengths
                    updatePayload.areas_to_improve = scorecard.areas_to_improve
                }
                
                await supabase.from("sessions").update(updatePayload).eq("id", currentSessionId)
                
            } catch (err) {
                console.error("Failed to update session scores:", err)
                // Fallback: at least mark as completed if possible
                await supabase.from("sessions").update({ status: "completed" }).eq("id", currentSessionId)
            }

            if (scorecard?.answers && scorecard.answers.length > 0) {
                // Fetch ALL session answers ordered by turn_index
                const { data: dbAnswers } = await supabase
                    .from("session_answers")
                    .select("id, turn_index")
                    .eq("session_id", currentSessionId)
                    .order("turn_index", { ascending: true })

                if (dbAnswers && dbAnswers.length > 0) {
                    // Match scorecard answers to DB rows by position
                    for (let i = 0; i < scorecard.answers.length && i < dbAnswers.length; i++) {
                        try {
                            await supabase.from("session_answers")
                                .update({
                                    feedback: scorecard.answers[i].feedback,
                                    score: scorecard.answers[i].score,
                                })
                                .eq("id", dbAnswers[i].id)
                        } catch (_) { }
                    }
                }
            }
        }

        setStatus("done")
        return { sessionId: currentSessionId, scorecard, cameraAvg, cameraScore }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, scoreHistory, stopCamera])

    // ── Single turn (NOT useCallback — stored in a ref for recursion) ──
    const doTurn = async (userAnswer: string | null): Promise<void> => {
        if (isEndingRef.current) return

        // Only end by exchange count if we're also past 80% of the scheduled time
        const totalSecs = config.duration_mins * 60
        const timeRemaining = totalSecs - elapsedSecondsRef.current
        if (exchangeCountRef.current >= maxExchangesRef.current && timeRemaining < 30) {
            await doEndInterview()
            return
        }

        setStatus("processing")

        if (userAnswer !== null) {
            updateExchanges(prev => {
                const last = prev[prev.length - 1]
                if (last && !last.answer) {
                    return [...prev.slice(0, -1), { ...last, answer: userAnswer }]
                }
                return prev
            })
        }

        let aiText = ""
        try {
            const res = await fetch("/api/interview/converse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: config.role,
                    interviewType: config.interview_type,
                    seniority: config.seniority,
                    durationMins: config.duration_mins,
                    elapsedSeconds: elapsedSecondsRef.current,
                    exchangeCount: exchangeCountRef.current,
                    history: historyRef.current,
                    currentAnswer: userAnswer,
                    userName: config.userName || "the candidate",
                    focus: config.focus,
                    customTopics: config.custom_topics,
                }),
            })
            const data = await res.json()
            aiText = data.response || ""
        } catch (err) {
            console.error("Converse API error:", err)
        }

        if (!aiText || isEndingRef.current) {
            if (!isEndingRef.current) await doEndInterview()
            return
        }

        // ── Check for concluding keywords ──
        // Only trigger if we're past 80% of the scheduled time to prevent premature endings
        const totalSecs2 = config.duration_mins * 60
        const pctDone = (elapsedSecondsRef.current / totalSecs2) * 100
        const lowerAi = aiText.toLowerCase()
        const isConcluding = pctDone >= 80 && (
            (lowerAi.includes("concl") && (lowerAi.includes("interview") || lowerAi.includes("session"))) ||
            lowerAi.includes("thank you for your time today") ||
            (lowerAi.includes("best of luck") && exchangeCountRef.current > 3)
        )

        setCurrentQuestion(aiText)
        historyRef.current.push({ role: "assistant", content: aiText })

        updateExchanges(prev => [...prev, { question: aiText, answer: "" }])
        exchangeCountRef.current++

        setStatus("ai-speaking")
        await speechRef.current.speak(aiText)

        if (isEndingRef.current) return

        // If the AI just gave its final closing statement, end here
        if (isConcluding) {
            await doEndInterview()
            return
        }

        setStatus("user-listening")
        speechRef.current.resetTranscript()
        const answer = await speechRef.current.startListening()

        if (isEndingRef.current) return

        historyRef.current.push({ role: "user", content: answer })

        updateExchanges(prev => {
            const last = prev[prev.length - 1]
            return [...prev.slice(0, -1), { ...last, answer }]
        })

        const currentSessionId = sessionIdRef.current
        if (currentSessionId) {
            try {
                await supabase.from("session_answers").insert({
                    session_id: currentSessionId,
                    question: aiText,
                    answer,
                    turn_index: exchangeCountRef.current,
                })
            } catch (err) {
                console.error("Failed to save answer:", err)
            }
        }

        await doTurn(answer)
    }

    const doTurnRef = useRef(doTurn)
    doTurnRef.current = doTurn

    const startInterview = useCallback(async () => {
        setStatus("processing")
        isEndingRef.current = false
        exchangeCountRef.current = 0
        historyRef.current = []
        maxExchangesRef.current = Math.max(8, Math.ceil(config.duration_mins * 2))

        await startCamera()

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: session } = await supabase
                .from("sessions")
                .insert({
                    user_id: user.id,
                    role: config.role,
                    company: config.company || null,
                    seniority: config.seniority,
                    interview_type: config.interview_type,
                    duration_mins: config.duration_mins,
                    status: "in_progress",
                })
                .select("id")
                .single()
            if (session) {
                sessionIdRef.current = session.id
                setSessionId(session.id)
            }
        }

        timerRef.current = setInterval(() => {
            setElapsedSeconds(s => {
                const next = s + 1
                elapsedSecondsRef.current = next
                
                // Auto-end safety: if we're 45s past the scheduled time, trigger end
                const maxSeconds = config.duration_mins * 60 + 45
                if (next >= maxSeconds && !isEndingRef.current && status !== "done") {
                    doEndInterview()
                }
                
                return next
            })
        }, 1000)

        await doTurnRef.current(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, startCamera])

    return {
        status,
        exchanges,
        currentQuestion,
        sessionId,
        elapsedSeconds,
        isSpeaking: speechHook.isSpeaking,
        isListening: speechHook.isListening,
        interimTranscript: speechHook.interimTranscript,
        cameraState,
        videoRef,
        startInterview,
        endInterview: doEndInterview,
    }
}
