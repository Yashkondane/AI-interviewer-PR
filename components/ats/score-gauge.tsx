"use client"

import { motion } from "framer-motion"

interface ScoreGaugeProps {
    score: number
    size?: number
    label?: string
    delay?: number
}

function getScoreColor(score: number): { stroke: string; glow: string; text: string } {
    if (score >= 80) return { stroke: "#34d399", glow: "rgba(52,211,153,0.3)", text: "#34d399" }
    if (score >= 60) return { stroke: "#60a5fa", glow: "rgba(96,165,250,0.3)", text: "#60a5fa" }
    if (score >= 40) return { stroke: "#fbbf24", glow: "rgba(251,191,36,0.3)", text: "#fbbf24" }
    return { stroke: "#f87171", glow: "rgba(248,113,113,0.3)", text: "#f87171" }
}

export function ScoreGauge({ score, size = 160, label, delay = 0 }: ScoreGaugeProps) {
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference
    const colors = getScoreColor(score)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className="flex flex-col items-center gap-3"
        >
            <div className="relative" style={{ width: size, height: size }}>
                {/* Glow background */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                        filter: "blur(20px)",
                    }}
                />

                <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Animated progress arc */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
                        style={{
                            filter: `drop-shadow(0 0 8px ${colors.glow})`,
                        }}
                    />
                </svg>

                {/* Center score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <motion.span
                        className="font-bold tabular-nums tracking-tight"
                        style={{ fontSize: size * 0.28, color: colors.text }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: delay + 0.6 }}
                    >
                        {score}
                    </motion.span>
                    <span
                        className="text-muted-foreground font-medium"
                        style={{ fontSize: size * 0.08 }}
                    >
                        / 100
                    </span>
                </div>
            </div>

            {label && (
                <motion.span
                    className="text-sm font-semibold text-muted-foreground tracking-wide uppercase"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: delay + 0.5 }}
                    style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}
                >
                    {label}
                </motion.span>
            )}
        </motion.div>
    )
}

interface ScoreBarProps {
    label: string
    score: number
    delay?: number
}

export function ScoreBar({ label, score, delay = 0 }: ScoreBarProps) {
    const colors = getScoreColor(score)

    return (
        <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">{label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: colors.text }}>
                    {score}
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${colors.stroke}cc, ${colors.stroke})`,
                        boxShadow: `0 0 12px ${colors.glow}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
                />
            </div>
        </motion.div>
    )
}
