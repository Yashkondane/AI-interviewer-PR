"use client"

import { useRef, useState, useCallback, useEffect } from "react"

export interface FrameScore {
    eyeContact: number   // 0–100
    posture: number      // 0–100
    expression: "confident" | "neutral" | "nervous"
}

export interface CameraState {
    isReady: boolean
    isActive: boolean
    error: string | null
    frameScore: FrameScore
    sessionAvg: { eyeContact: number; posture: number; expression: number }
}

const DEFAULT_SCORE: FrameScore = { eyeContact: 0, posture: 0, expression: "neutral" }

export function useCamera() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const rafRef = useRef<number>(0)
    const faceLandmarkerRef = useRef<any>(null)
    const poseLandmarkerRef = useRef<any>(null)

    const [state, setState] = useState<CameraState>({
        isReady: false,
        isActive: false,
        error: null,
        frameScore: DEFAULT_SCORE,
        sessionAvg: { eyeContact: 0, posture: 0, expression: 50 },
    })

    const scoreHistory = useRef<FrameScore[]>([])

    // Load MediaPipe models lazily
    const loadModels = useCallback(async () => {
        try {
            const { FaceLandmarker, PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision")

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            )

            const [face, pose] = await Promise.all([
                FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                    outputFacialTransformationMatrixes: true,
                }),
                PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numPoses: 1,
                }),
            ])

            faceLandmarkerRef.current = face
            poseLandmarkerRef.current = pose
            return true
        } catch (err) {
            console.error("MediaPipe load error:", err)
            return false
        }
    }, [])

    // Analyze a single video frame
    const analyzeFrame = useCallback((video: HTMLVideoElement): FrameScore => {
        const face = faceLandmarkerRef.current
        const pose = poseLandmarkerRef.current
        if (!face || !pose || video.readyState < 2) return DEFAULT_SCORE

        const now = performance.now()

        let eyeContact = 50
        let posture = 50
        let expression: FrameScore["expression"] = "neutral"

        try {
            // ── Face Analysis ──────────────────────────────────────────
            const faceResult = face.detectForVideo(video, now)
            if (faceResult?.faceLandmarks?.[0]) {
                const landmarks = faceResult.faceLandmarks[0]

                // Eye contact: use nose tip (landmark 1) as head direction proxy
                // Landmark 1 is nose tip. If it's centered (x≈0.5, y≈0.4), user is looking at cam
                const noseTip = landmarks[1]
                if (noseTip) {
                    const dx = Math.abs(noseTip.x - 0.5)  // 0 = center
                    const dy = Math.abs(noseTip.y - 0.38) // 0.38 = approx natural cam position
                    const deviation = Math.sqrt(dx * dx + dy * dy)
                    eyeContact = Math.round(Math.max(0, Math.min(100, 100 - deviation * 280)))
                }

                // Expression: use lip corner distance + brow raise
                // Lip corners: 61 (left), 291 (right). Brow: 107, 336
                const lipLeft = landmarks[61]
                const lipRight = landmarks[291]
                const browLeft = landmarks[107]
                if (lipLeft && lipRight && browLeft) {
                    const lipWidth = Math.abs(lipRight.x - lipLeft.x)
                    const browY = browLeft.y

                    // Smile (wider lips) → confident, furrowed brow → nervous
                    if (lipWidth > 0.18 && browY < 0.35) expression = "confident"
                    else if (browY > 0.42) expression = "nervous"
                    else expression = "neutral"
                }
            }

            // ── Pose Analysis ─────────────────────────────────────────
            const poseResult = pose.detectForVideo(video, now)
            if (poseResult?.landmarks?.[0]) {
                const lm = poseResult.landmarks[0]
                // Shoulders: 11 (left), 12 (right). Hips: 23 (left), 24 (right)
                const lShoulder = lm[11]
                const rShoulder = lm[12]
                const lHip = lm[23]

                if (lShoulder && rShoulder && lHip) {
                    // Posture: shoulders should be level + above hips
                    const shoulderDiff = Math.abs(lShoulder.y - rShoulder.y)  // level = 0
                    const shoulderAboveHip = lHip.y - lShoulder.y               // positive = upright

                    const levelScore = Math.max(0, 100 - shoulderDiff * 800)
                    const uprightScore = shoulderAboveHip > 0.15
                        ? Math.min(100, 40 + shoulderAboveHip * 200) : 30

                    posture = Math.round((levelScore + uprightScore) / 2)
                }
            }
        } catch (_) {
            // Ignore per-frame errors
        }

        return { eyeContact, posture, expression }
    }, [])

    // Main camera loop
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false,
            })
            streamRef.current = stream

            // Attach stream to video element so it actually renders
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play().catch(() => { })
            }

            setState(s => ({ ...s, isActive: true, error: null }))

            const modelsLoaded = await loadModels()
            if (modelsLoaded) {
                setState(s => ({ ...s, isReady: true }))
            }

            let lastAnalysis = 0
            const loop = () => {
                const video = videoRef.current
                if (!video || !video.srcObject) return
                const now = Date.now()

                // Analyze every 500ms to avoid performance impact
                if (now - lastAnalysis > 500) {
                    lastAnalysis = now
                    const score = analyzeFrame(video)
                    scoreHistory.current.push(score)

                    // Keep last 60 samples (30 seconds)
                    if (scoreHistory.current.length > 60) scoreHistory.current.shift()

                    // Compute running average
                    const avg = scoreHistory.current.reduce(
                        (acc, s) => ({
                            eyeContact: acc.eyeContact + s.eyeContact,
                            posture: acc.posture + s.posture,
                            expression: acc.expression + (s.expression === "confident" ? 80 : s.expression === "neutral" ? 50 : 25),
                        }),
                        { eyeContact: 0, posture: 0, expression: 0 }
                    )
                    const n = scoreHistory.current.length

                    setState(s => ({
                        ...s,
                        frameScore: score,
                        sessionAvg: {
                            eyeContact: Math.round(avg.eyeContact / n),
                            posture: Math.round(avg.posture / n),
                            expression: Math.round(avg.expression / n),
                        },
                    }))
                }

                rafRef.current = requestAnimationFrame(loop)
            }

            rafRef.current = requestAnimationFrame(loop)
        } catch (err: any) {
            setState(s => ({
                ...s,
                error: err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access."
                    : "Could not access camera.",
            }))
        }
    }, [loadModels, analyzeFrame])

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setState(s => ({ ...s, isActive: false, isReady: false }))
    }, [])

    useEffect(() => () => { stopCamera() }, [stopCamera])

    return { videoRef, state, startCamera, stopCamera, scoreHistory: scoreHistory.current }
}
