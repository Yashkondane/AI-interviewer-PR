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
    const shouldRestartRef = useRef(true)

    // ── Volume analyzer via Web Audio API ───────────────────────
    const startVolumeAnalyzer = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            micStreamRef.current = stream

            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            if (ctx.state === "suspended") await ctx.resume()
            
            const source = ctx.createMediaStreamSource(stream)
            const analyzer = ctx.createAnalyser()
            analyzer.fftSize = 256
            source.connect(analyzer)
            analyzerRef.current = analyzer

            const data = new Uint8Array(analyzer.frequencyBinCount)
            const tick = () => {
                analyzer.getByteFrequencyData(data)
                // Root Mean Square (RMS) would be better, but average is fine for a simple meter
                const avg = data.reduce((a, b) => a + b, 0) / data.length
                // Increase sensitivity (3.5x multiplier) and add a small floor
                const vol = Math.round(Math.min(100, Math.max(0, avg - 2) * 3.5))
                setMicVolume(vol)
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

    // ── Browser SpeechSynthesis fallback (free, no API key) ────
    const speakWithBrowser = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!("speechSynthesis" in window)) {
                resolve()
                return
            }
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.0
            utterance.pitch = 1.0
            utterance.volume = 1.0
            utterance.lang = "en-US"

            // Try to pick a good English voice
            const voices = window.speechSynthesis.getVoices()
            const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"))
                || voices.find(v => v.lang.startsWith("en-US"))
                || voices.find(v => v.lang.startsWith("en"))
            if (preferred) utterance.voice = preferred

            utterance.onend = () => { setIsSpeaking(false); resolve(); options.onEnd?.() }
            utterance.onerror = () => { setIsSpeaking(false); resolve() }
            window.speechSynthesis.speak(utterance)
        })
    }, [options])

    // ── Speak: try Google TTS first, fall back to browser ─────
    const speak = useCallback(async (text: string): Promise<void> => {
        setIsSpeaking(true)
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) throw new Error("API TTS failed")

            const { audioContent } = await res.json()
            if (!audioContent) throw new Error("No audio content")

            return new Promise((resolve) => {
                const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)
                audioRef.current = audio
                audio.onended = () => { setIsSpeaking(false); resolve(); options.onEnd?.() }
                audio.onerror = () => { setIsSpeaking(false); resolve() }
                audio.play().catch(() => { setIsSpeaking(false); resolve() })
            })
        } catch {
            // Fallback to free browser TTS
            console.info("Google TTS unavailable, using browser speech synthesis")
            return speakWithBrowser(text)
        }
    }, [options, speakWithBrowser])

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
        if ("speechSynthesis" in window) window.speechSynthesis.cancel()
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
            recognition.maxAlternatives = 1
            let finalTranscript = ""
            shouldRestartRef.current = true  // Allow auto-restart
            let lastSpeechTime = Date.now()

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
                lastSpeechTime = Date.now()

                // Auto-stop after 5s of silence (increased from 2.5s for longer answers)
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = setTimeout(() => {
                    shouldRestartRef.current = false  // This is a genuine end from silence
                    recognition.stop()
                }, 5000)
            }

            recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
                if (e.error === "not-allowed") setMicBlocked(true)
                // "no-speech" and "network" errors are recoverable — let onend restart
                if (e.error === "not-allowed" || e.error === "aborted") {
                    shouldRestartRef.current = false
                    setIsListening(false)
                    resolve(finalTranscript.trim() || "")
                }
            }

            recognition.onend = () => {
                // Chrome's Web Speech API often fires onend prematurely during long speech
                // (network blips, breath pauses, etc). Auto-restart if we haven't
                // explicitly asked to stop.
                const timeSinceLastSpeech = Date.now() - lastSpeechTime

                if (shouldRestartRef.current && timeSinceLastSpeech < 5000) {
                    // Premature end — restart to keep capturing
                    try {
                        recognition.start()
                        return
                    } catch {
                        // If restart fails, fall through and resolve
                    }
                }

                // Genuine end (silence timeout or explicit stop)
                setIsListening(false)
                setInterimTranscript("")
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

                // If transcript is very short, it might be a false capture
                const result = finalTranscript.trim()
                resolve(result || "")
            }

            recognition.start()
        })
    }, [])

    const stopListening = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        shouldRestartRef.current = false  // Prevent auto-restart
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
