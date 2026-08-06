"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCamera } from "@/hooks/use-camera"
import { useSpeech } from "@/hooks/use-speech"
import { CameraFeed } from "@/components/interview/camera-feed"
import { Waveform } from "@/components/interview/waveform"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Video, Mic, MicOff, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"

export default function PreflightPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(216 42% 5%)" }}>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <PreflightContent />
        </Suspense>
    )
}

function PreflightContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const { videoRef, state: cameraState, startCamera, stopCamera } = useCamera()
    const { micVolume, micBlocked, startVolumeAnalyzer, stopVolumeAnalyzer } = useSpeech()
    const [isJoining, setIsJoining] = useState(false)
    const [hasChecked, setHasChecked] = useState(false)

    // Wait a brief moment before forcing the user to see the checks
    useEffect(() => {
        const t = setTimeout(() => setHasChecked(true), 2500)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        startCamera()
        startVolumeAnalyzer('real')
        return () => {
            stopCamera()
            stopVolumeAnalyzer()
        }
    }, [startCamera, stopCamera, startVolumeAnalyzer, stopVolumeAnalyzer])

    const handleJoin = () => {
        setIsJoining(true)
        // Cleanup media streams so the session page can acquire them
        stopCamera()
        stopVolumeAnalyzer()
        
        // Brief timeout ensures tracks are fully released before Next.js routing unmounts
        setTimeout(() => {
            router.push(`/interview/session?${searchParams.toString()}`)
        }, 300)
    }

    const allGood = cameraState.isActive && !cameraState.error && !micBlocked

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "hsl(216 42% 5%)" }}>
            {/* Background elements */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
            </div>

            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center bg-slate-900/60 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
                
                {/* Left Side: Video Preview */}
                <div className="w-full md:w-[500px] flex flex-col gap-4">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-inner flex items-center justify-center">
                        <CameraFeed videoRef={videoRef} stream={null} cameraState={cameraState} />
                        
                        {!cameraState.isActive && !cameraState.error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                                <p className="text-white font-medium">Starting camera...</p>
                            </div>
                        )}

                        {cameraState.error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-sm z-10 p-6 text-center">
                                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                                <p className="text-red-200 font-semibold mb-2">Camera Blocked</p>
                                <p className="text-red-300/70 text-sm">{cameraState.error}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${micBlocked ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                                {micBlocked ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5 text-emerald-500" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Microphone</span>
                                <span className="text-xs text-white/50">{micBlocked ? "Permission Denied" : "Testing audio levels..."}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-[3px] h-8 w-24">
                            {[...Array(12)].map((_, i) => {
                                // Threshold for this specific bar to light up (0-100 scale)
                                const threshold = (i / 11) * 100
                                const isActive = !micBlocked && micVolume > threshold
                                // Base height varies to look like a waveform curve
                                const baseHeight = 30 + Math.sin(i * 0.8) * 20 + (i / 11) * 30
                                // If active, it bounces higher based on volume
                                const activeHeight = isActive ? Math.max(baseHeight, micVolume * 0.8) : baseHeight * 0.3
                                
                                return (
                                    <div
                                        key={i}
                                        className={`w-1.5 rounded-full transition-all duration-100 ${
                                            micBlocked ? 'bg-red-500/30' : 
                                            isActive ? 'bg-emerald-400' : 'bg-emerald-500/20'
                                        }`}
                                        style={{ height: `${activeHeight}%` }}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Information & Action */}
                <div className="flex-1 flex flex-col gap-6 py-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Ready to join?</h1>
                        <p className="text-white/60 leading-relaxed">
                            Check your lighting and microphone levels before stepping into the interview. Our AI will analyze your body language and vocal delivery.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm font-medium">
                            {cameraState.isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                            <span className={cameraState.isActive ? "text-emerald-400" : "text-amber-400"}>Camera connected</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            {!micBlocked && micVolume > 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                            <span className={!micBlocked && micVolume > 0 ? "text-emerald-400" : "text-amber-400"}>Microphone detecting sound</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            {cameraState.isReady ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                            <span className={cameraState.isReady ? "text-emerald-400" : "text-amber-400"}>AI models initialized</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-4">
                        <Button
                            onClick={handleJoin}
                            disabled={isJoining || (!allGood && !hasChecked)}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] disabled:hover:scale-100"
                        >
                            {isJoining ? (
                                <>Joining <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
                            ) : (
                                <>Join Interview <ArrowRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>
                        <p className="text-xs text-center text-white/40 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            No media is recorded or saved to our servers.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
