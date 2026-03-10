"use client"

import { useEffect, useRef } from "react"
import { CameraState } from "@/hooks/use-camera"

interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>
    stream: MediaStream | null
    cameraState: CameraState
}

const expressionColors = {
    confident: { dot: "#34d399", label: "Confident" },
    neutral: { dot: "#93c5fd", label: "Neutral" },
    nervous: { dot: "#f87171", label: "Nervous" },
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">{label}</span>
                <span className="text-foreground text-[11px] font-semibold">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, background: color }}
                />
            </div>
        </div>
    )
}

export function CameraFeed({ videoRef, stream, cameraState }: CameraFeedProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const ref = videoRef || localVideoRef

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream
            ref.current.play().catch(() => { })
        }
    }, [stream, ref])

    const { frameScore, sessionAvg, error, isReady } = cameraState
    const expr = expressionColors[frameScore.expression]

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Video */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                style={{ background: "rgba(8,14,30,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground text-xs text-center px-4">{error}</p>
                    </div>
                ) : (
                    <>
                        <video
                            ref={ref}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {/* Expression badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                            style={{ background: "rgba(8,14,30,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <div className="h-2 w-2 rounded-full" style={{ background: expr.dot }} />
                            <span className="text-foreground text-[11px] font-medium">{expr.label}</span>
                        </div>
                        {/* Loading overlay */}
                        {!isReady && !error && (
                            <div className="absolute inset-0 flex items-center justify-center"
                                style={{ background: "rgba(8,14,30,0.6)" }}>
                                <p className="text-muted-foreground text-xs">Loading AI…</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* HUD scores */}
            <div className="rounded-xl p-3 flex flex-col gap-2.5"
                style={{ background: "rgba(12,22,44,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ScoreBar label="👁 Eye Contact" value={frameScore.eyeContact} color="rgba(59,130,246,0.8)" />
                <ScoreBar label="🧍 Posture" value={frameScore.posture} color="rgba(52,211,153,0.8)" />
            </div>
        </div>
    )
}
