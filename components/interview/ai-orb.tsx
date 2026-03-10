"use client"

interface AiOrbProps {
    isSpeaking: boolean
    isListening: boolean
    isProcessing: boolean
}

export function AiOrb({ isSpeaking, isListening, isProcessing }: AiOrbProps) {
    const getColor = () => {
        if (isSpeaking) return "rgba(59,130,246,0.9)"
        if (isListening) return "rgba(52,211,153,0.9)"
        if (isProcessing) return "rgba(251,191,36,0.9)"
        return "rgba(59,130,246,0.5)"
    }

    const glowColor = () => {
        if (isSpeaking) return "rgba(59,130,246,0.4)"
        if (isListening) return "rgba(52,211,153,0.35)"
        if (isProcessing) return "rgba(251,191,36,0.3)"
        return "rgba(59,130,246,0.15)"
    }

    const isActive = isSpeaking || isListening || isProcessing

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse ring */}
            {isActive && (
                <>
                    <div
                        className="absolute rounded-full animate-ping"
                        style={{
                            width: 180,
                            height: 180,
                            background: `radial-gradient(circle, ${glowColor()} 0%, transparent 70%)`,
                            animationDuration: isSpeaking ? "1s" : "1.5s",
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 160,
                            height: 160,
                            background: `radial-gradient(circle, ${glowColor()} 0%, transparent 70%)`,
                            animation: "ping-slow 2s ease-out infinite",
                        }}
                    />
                </>
            )}

            {/* Mid ring */}
            <div
                className="absolute rounded-full transition-all duration-500"
                style={{
                    width: 130,
                    height: 130,
                    border: `1.5px solid ${getColor()}`,
                    opacity: isActive ? 0.4 : 0.15,
                    boxShadow: isActive ? `0 0 30px ${glowColor()}` : "none",
                }}
            />

            {/* Core */}
            <div
                className="relative flex items-center justify-center rounded-full transition-all duration-500"
                style={{
                    width: 96,
                    height: 96,
                    background: `radial-gradient(circle at 35% 35%, ${getColor()}, rgba(10,20,50,0.9))`,
                    boxShadow: `0 0 ${isActive ? "40px" : "20px"} ${glowColor()}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
            >
                {/* Icon */}
                <svg width="32" height="32" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <rect x="6" y="1" width="2" height="12" rx="1" fill="white"
                        style={{ transformOrigin: "center", animation: isActive ? "wave-bar 1s ease-in-out infinite" : "none" }} />
                    <rect x="3" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7"
                        style={{ transformOrigin: "center", animation: isActive ? "wave-bar 1s ease-in-out infinite 0.1s" : "none" }} />
                    <rect x="9" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7"
                        style={{ transformOrigin: "center", animation: isActive ? "wave-bar 1s ease-in-out infinite 0.2s" : "none" }} />
                    <rect x="0" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4"
                        style={{ transformOrigin: "center", animation: isActive ? "wave-bar 1s ease-in-out infinite 0.15s" : "none" }} />
                    <rect x="12" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4"
                        style={{ transformOrigin: "center", animation: isActive ? "wave-bar 1s ease-in-out infinite 0.25s" : "none" }} />
                </svg>
            </div>
        </div>
    )
}
