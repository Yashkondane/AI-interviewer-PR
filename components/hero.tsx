"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, CheckCircle2 } from "lucide-react"
import { Component as Globe } from "@/components/ui/interactive-globe"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">

      {/* Deep layered background with non-symmetric orbs */}
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
        {/* Core radial base */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, #061022 0%, #030a16 100%)",
          }}
        />

        {/* Dynamic Blue Orbs */}
        <div className="hero-orb w-[600px] h-[600px] -top-20 -left-20 bg-blue-600 opacity-[0.12]" />
        <div className="hero-orb w-[500px] h-[500px] top-1/4 -right-20 bg-cyan-500 opacity-[0.08] delay-700" />
        <div className="hero-orb w-[700px] h-[700px] -bottom-32 left-1/3 bg-indigo-700 opacity-[0.1]" />
        <div className="hero-orb w-[400px] h-[400px] bottom-20 -left-10 bg-blue-400 opacity-[0.06]" />

        {/* Tech Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '3rem 3rem',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 80%)'
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-10 min-h-[500px]">
          {/* Left content */}
          <div className="flex-1 flex flex-col items-start gap-7 lg:max-w-[54%] relative z-10 animate-fade-up">
            
            {/* Shimmering Badge */}
            <div className="group relative inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-2 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all hover:border-blue-400/50 hover:bg-blue-500/20">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="relative">Advanced AI Mock Interviews</span>
            </div>

            <h1
              className="font-sans font-extralight text-foreground leading-[1.07] tracking-tight"
              style={{ fontSize: "clamp(2.9rem, 5vw, 4.5rem)" }}
            >
              Ace your next interview
              <br />
              <span className="gradient-text font-bold drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                with an AI
              </span>
              <br />
              <span className="gradient-text font-bold drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                that talks back.
              </span>
            </h1>

            <p className="text-muted-foreground leading-relaxed text-pretty max-w-[480px] text-base md:text-lg">
              Prepwise conducts real, voice-based mock interviews tailored to your role. Get instant feedback on clarity, pacing, and confidence — so you walk in prepared.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto btn-crystal text-white font-semibold px-8 gap-2 text-base rounded-xl"
                >
                  Start a Mock Interview
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto btn-crystal text-foreground/80 font-medium px-8 gap-2 text-base rounded-xl"
                >
                  <Mic className="h-4 w-4 text-blue-400" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Glassmorphism Stats Bar */}
            <div className="glass-card mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  100<span className="text-blue-500">+</span>
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/60">
                  Roles Supported
                </p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  Real
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/60">
                  Voice Session
                </p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col gap-1 hidden sm:flex">
                <p className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  Live
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/60">
                  Body Language AI
                </p>
              </div>
            </div>

          </div>

          {/* Right — Globe & Floating Widgets */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-0 min-h-[400px] w-full relative">
            {/* Ambient inner glow for the globe */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[500px] aspect-square relative z-0">
              <Globe
                size={500}
                className="w-full h-full"
                autoRotateSpeed={0.003}
              />
            </div>
            
            {/* Floating UI Widget - ATS Score */}
            <div className="absolute top-12 -left-6 lg:-left-12 glass-card hidden sm:flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl animate-float z-20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex flex-col pr-2">
                <p className="text-[10px] font-medium text-emerald-100/60 uppercase tracking-widest">Global ATS Match</p>
                <p className="text-lg font-bold text-white leading-tight">94/100</p>
              </div>
            </div>

            {/* Floating UI Widget - Speech Analysis */}
            <div className="absolute bottom-20 -right-4 lg:-right-8 glass-card hidden sm:flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl animate-float z-20" style={{ animationDelay: '1.5s' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)] gap-0.5 px-2">
                <div className="w-1 bg-blue-400 rounded-full h-3 wave-bar" />
                <div className="w-1 bg-blue-400 rounded-full h-5 wave-bar" />
                <div className="w-1 bg-blue-400 rounded-full h-2 wave-bar" />
                <div className="w-1 bg-blue-400 rounded-full h-4 wave-bar" />
              </div>
              <div className="flex flex-col pr-2">
                <p className="text-[10px] font-medium text-blue-100/60 uppercase tracking-widest">Speech Clarity</p>
                <p className="text-sm font-semibold text-blue-400 leading-tight">Processing...</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(216 42% 5%))" }}
        aria-hidden
      />
    </section>
  )
}
