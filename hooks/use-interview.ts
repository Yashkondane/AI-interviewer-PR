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
    const { speak, startListening, stopListening, isSpeaking, isListening, resetTranscript, interimTranscript } = useSpeech()
    const { videoRef, state: cameraState, startCamera, stopCamera, scoreHistory } = useCamera()

    const [status, setStatus] = useState<InterviewStatus>("idle")
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const historyRef = useRef<{ role: "assistant" | "user"; content: string }[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const sessionStartRef = useRef<Date | null>(null)
    const exchangeCountRef = useRef(0)
    const maxExchanges = Math.floor(config.duration_mins * 1.2) // ~1.2 exchanges per minute

    // ── Start the interview ──────────────────────────────────────
    const startInterview = useCallback(async () => {
        setStatus("processing")
        await startCamera()

        // Create session in Supabase
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
            if (session) setSessionId(session.id)
        }

        // Start timer
        sessionStartRef.current = new Date()
        timerRef.current = setInterval(() => {
            setElapsedSeconds(s => s + 1)
        }, 1000)

        // Get first AI question
        await conductTurn(null)
    }, [config, startCamera])

    // ── One turn: AI speaks, user responds ──────────────────────
    const conductTurn = useCallback(async (userAnswer: string | null) => {
        if (exchangeCountRef.current >= maxExchanges) {
            await endInterview()
            return
        }

        setStatus("processing")

        // Build payload
        const payload = {
            role: config.role,
            history: historyRef.current,
            currentAnswer: userAnswer,
        }

        // Get AI response
        const res = await fetch("/api/interview/converse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        const { response: aiText } = await res.json()
        if (!aiText) { await endInterview(); return }

        setCurrentQuestion(aiText)
        historyRef.current.push({ role: "assistant", content: aiText })

        if (userAnswer !== null) {
            // Record the exchange
            setExchanges(prev => {
                const last = prev[prev.length - 1]
                if (last && !last.answer) {
                    return [...prev.slice(0, -1), { ...last, answer: userAnswer }]
                }
                return prev
            })
        }

        // Add question to exchanges
        setExchanges(prev => [...prev, { question: aiText, answer: "" }])
        exchangeCountRef.current++

        // AI speaks
        setStatus("ai-speaking")
        await speak(aiText)

        // User listens
        setStatus("user-listening")
        resetTranscript()
        const answer = await startListening()

        historyRef.current.push({ role: "user", content: answer })

        // Update last exchange with answer
        setExchanges(prev => {
            const last = prev[prev.length - 1]
            return [...prev.slice(0, -1), { ...last, answer }]
        })

        // Save to Supabase
        if (sessionId) {
            await supabase.from("session_answers").insert({
                session_id: sessionId,
                question: aiText,
                answer,
                turn_index: exchangeCountRef.current,
            })
        }

        // Next turn
        await conductTurn(answer)
    }, [config, speak, startListening, resetTranscript, sessionId, maxExchanges])

    // ── End interview ────────────────────────────────────────────
    const endInterview = useCallback(async () => {
        setStatus("processing")
        stopListening()
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

        // Get AI scorecard
        const currentExchanges = exchanges.filter(e => e.answer)
        let scorecard = null
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
            scorecard = await res.json()
        } catch (_) { }

        // Update session in Supabase
        if (sessionId && scorecard) {
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
            }).eq("id", sessionId)

            // Update answers with feedback
            if (scorecard.answers) {
                for (const ans of scorecard.answers) {
                    await supabase.from("session_answers")
                        .update({ feedback: ans.feedback, score: ans.score })
                        .eq("session_id", sessionId)
                        .eq("question", ans.question)
                }
            }
        }

        setStatus("done")
        return { sessionId, scorecard, cameraAvg, cameraScore }
    }, [exchanges, config, sessionId, scoreHistory, stopListening, stopCamera])

    return {
        // State
        status,
        exchanges,
        currentQuestion,
        sessionId,
        elapsedSeconds,
        isSpeaking,
        isListening,
        interimTranscript,
        cameraState,
        videoRef,
        // Actions
        startInterview,
        endInterview,
    }
}
