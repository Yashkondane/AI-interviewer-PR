"use client"

import { useRef, useState, useCallback } from "react"
import { useSpeech } from "./use-speech"
import { useCamera } from "./use-camera"
import { createClient } from "@/lib/supabase/client"

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
    const maxExchangesRef = useRef(Math.floor(config.duration_mins * 1.2))

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
                const res = await fetch("/api/interview/scorecard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conversation: currentExchanges,
                        role: config.role,
                        seniority: config.seniority,
                    }),
                })
                if (res.ok) {
                    scorecard = await res.json()
                }
            } catch (_) { /* ignore scoring errors */ }
        }

        if (currentSessionId && scorecard) {
            await supabase.from("sessions").update({
                status: "completed",
                completed_at: new Date().toISOString(),
                overall_score: scorecard.overall_score,
                clarity: scorecard.dimensions?.clarity,
                structure: scorecard.dimensions?.structure,
                relevance: scorecard.dimensions?.relevance,
                pacing: scorecard.dimensions?.pacing,
                confidence: scorecard.dimensions?.confidence,
                camera_score: cameraScore,
                eye_contact: cameraAvg.eye_contact,
                posture: cameraAvg.posture,
                expression: cameraAvg.expression,
            }).eq("id", currentSessionId)

            if (scorecard.answers) {
                for (const ans of scorecard.answers) {
                    await supabase.from("session_answers")
                        .update({ feedback: ans.feedback, score: ans.score })
                        .eq("session_id", currentSessionId)
                        .eq("question", ans.question)
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
        if (exchangeCountRef.current >= maxExchangesRef.current) {
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
                    history: historyRef.current,
                    currentAnswer: userAnswer,
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

        setCurrentQuestion(aiText)
        historyRef.current.push({ role: "assistant", content: aiText })

        updateExchanges(prev => [...prev, { question: aiText, answer: "" }])
        exchangeCountRef.current++

        setStatus("ai-speaking")
        await speechRef.current.speak(aiText)

        if (isEndingRef.current) return

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
        maxExchangesRef.current = Math.floor(config.duration_mins * 1.2)

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
            setElapsedSeconds(s => s + 1)
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
