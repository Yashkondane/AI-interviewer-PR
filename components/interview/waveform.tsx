"use client"

interface WaveformProps {
    isActive: boolean
    color?: string
    barCount?: number
}

export function Waveform({ isActive, color = "rgba(59,130,246,0.8)", barCount = 12 }: WaveformProps) {
    return (
        <div className="flex items-center justify-center gap-[3px]" aria-hidden>
            {[...Array(barCount)].map((_, i) => (
                <div
                    key={i}
                    className={isActive ? "wave-bar" : ""}
                    style={{
                        width: 3,
                        height: isActive ? undefined : 4,
                        minHeight: 4,
                        maxHeight: 32,
                        borderRadius: 2,
                        background: color,
                        transform: isActive ? undefined : "scaleY(0.25)",
                        transformOrigin: "center",
                        animationDelay: isActive ? `${(i * 0.08).toFixed(2)}s` : undefined,
                        transition: "height 0.2s ease",
                    }}
                />
            ))}
        </div>
    )
}
