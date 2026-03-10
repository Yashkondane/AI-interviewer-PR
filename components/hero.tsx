"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic } from "lucide-react"
import { Component as Globe } from "@/components/ui/interactive-globe"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">

      {/* Deep layered background */}
      <div className="absolute inset-0 -z-20" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 60% 35%, #0b2550 0%, #061022 50%, #030a16 100%)",
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-10 min-h-[500px]">
          {/* Left content */}
          <div className="flex-1 flex flex-col items-start gap-7 lg:max-w-[54%] relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary mb-2 w-fit">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              AI Mock Interviews
            </div>

            <h1
              className="font-sans font-extralight text-foreground leading-[1.07] tracking-tight"
              style={{ fontSize: "clamp(2.9rem, 5vw, 4.5rem)" }}
            >
              Ace your next interview
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
                with an AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
                that talks back.
              </span>
            </h1>

            <p className="text-muted-foreground leading-relaxed text-pretty max-w-[480px] text-base md:text-lg">
              StormPrep conducts real, voice-based mock interviews tailored to your role. Get instant feedback on clarity, pacing, and confidence — so you walk in prepared.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto btn-primary-glow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 gap-2 text-base rounded-xl"
                >
                  Start a Mock Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-foreground/80 hover:text-foreground hover:bg-white/6 border border-white/10 font-medium px-8 gap-2 text-base rounded-xl transition-all duration-200"
                >
                  <Mic className="h-4 w-4 text-primary" />
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-6">
              <div>
                <p className="text-2xl font-bold text-foreground">100+</p>
                <p className="text-xs text-muted-foreground">Roles Supported</p>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div>
                <p className="text-2xl font-bold text-foreground">Real</p>
                <p className="text-xs text-muted-foreground">Voice Interaction</p>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div>
                <p className="text-2xl font-bold text-foreground">Live</p>
                <p className="text-xs text-muted-foreground">Body Language AI</p>
              </div>
            </div>
          </div>

          {/* Right — Globe */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-0 min-h-[400px] w-full relative">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="w-full max-w-[500px] aspect-square relative z-0">
              <Globe
                size={500}
                className="w-full h-full"
                autoRotateSpeed={0.003}
              />
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
