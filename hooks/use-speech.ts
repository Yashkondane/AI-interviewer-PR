"use client"

import { useRef, useState, useCallback, useEffect } from "react"

// ── Web Speech API type shims (not in default TS lib) ─────────
type SpeechRecognitionEvent = Event & {
    resultIndex: number
    results: SpeechRecognitionResultList
}
type SpeechRecognitionErrorEvent = Event & {
    error: string
    message: string
}


interface SpeechOptions {
    onEnd?: () => void
}

export function useSpeech(options: SpeechOptions = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const [micVolume, setMicVolume] = useState(0)   // 0–100, for visualizer
    const [micBlocked, setMicBlocked] = useState(false) // true if browser denied mic

    const recognitionRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const analyzerRef = useRef<AnalyserNode | null>(null)
    const micStreamRef = useRef<MediaStream | null>(null)
    const rafRef = useRef<number>(0)

    // ── Volume analyzer via Web Audio API ───────────────────────
    const startVolumeAnalyzer = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            micStreamRef.current = stream

            const ctx = new AudioContext()
            const source = ctx.createMediaStreamSource(stream)
            const analyzer = ctx.createAnalyser()
            analyzer.fftSize = 256
            source.connect(analyzer)
            analyzerRef.current = analyzer

            const data = new Uint8Array(analyzer.frequencyBinCount)
            const tick = () => {
                analyzer.getByteFrequencyData(data)
                const avg = data.reduce((a, b) => a + b, 0) / data.length
                setMicVolume(Math.round(Math.min(100, avg * 2.2)))
                rafRef.current = requestAnimationFrame(tick)
            }
            rafRef.current = requestAnimationFrame(tick)
            setMicBlocked(false)
        } catch (err: any) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setMicBlocked(true)
            }
            setMicVolume(0)
        }
    }, [])

    const stopVolumeAnalyzer = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        micStreamRef.current?.getTracks().forEach(t => t.stop())
        micStreamRef.current = null
        analyzerRef.current = null
        setMicVolume(0)
    }, [])

    // ── Google TTS speak ─────────────────────────────────────────
    const speak = useCallback(async (text: string): Promise<void> => {
        return new Promise(async (resolve) => {
            try {
                setIsSpeaking(true)
                const res = await fetch("/api/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                })
                if (!res.ok) throw new Error("TTS failed")
                const { audioContent } = await res.json()

                const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)
                audioRef.current = audio
                audio.onended = () => { setIsSpeaking(false); resolve(); options.onEnd?.() }
                audio.onerror = () => { setIsSpeaking(false); resolve() }
                await audio.play()
            } catch (err) {
                console.error("TTS error:", err)
                setIsSpeaking(false)
                resolve()
            }
        })
    }, [options])

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
        setIsSpeaking(false)
    }, [])

    // ── Web Speech API listen ────────────────────────────────────
    const startListening = useCallback((): Promise<string> => {
        return new Promise((resolve) => {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            if (!SpeechRecognition) {
                resolve("Speech recognition not supported in this browser.")
                return
            }

            const recognition = new SpeechRecognition()
            recognitionRef.current = recognition
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = "en-US"
            let finalTranscript = ""

            recognition.onstart = () => setIsListening(true)

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interim = ""
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const chunk = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += chunk + " "
                    } else {
                        interim = chunk
                    }
                }
                setTranscript(finalTranscript.trim())
                setInterimTranscript(interim)

                // Auto-stop after 2.5s of silence
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = setTimeout(() => recognition.stop(), 2500)
            }

            recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
                if (e.error === "not-allowed") setMicBlocked(true)
                setIsListening(false)
                resolve(finalTranscript.trim() || "")
            }

            recognition.onend = () => {
                setIsListening(false)
                setInterimTranscript("")
                resolve(finalTranscript.trim())
            }

            recognition.start()
        })
    }, [])

    const stopListening = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        recognitionRef.current?.stop()
        setIsListening(false)
    }, [])

    const resetTranscript = useCallback(() => {
        setTranscript("")
        setInterimTranscript("")
    }, [])

    useEffect(() => () => { stopVolumeAnalyzer() }, [stopVolumeAnalyzer])

    return {
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        resetTranscript,
        startVolumeAnalyzer,
        stopVolumeAnalyzer,
        isSpeaking,
        isListening,
        transcript,
        interimTranscript,
        micVolume,
        micBlocked,
    }
}
