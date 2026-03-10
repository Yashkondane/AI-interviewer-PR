import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="text-center rounded-3xl p-14 relative overflow-hidden"
          style={{
            background: "rgba(10, 18, 40, 0.7)",
            border: "1px solid rgba(59,130,246,0.18)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Background glow layers */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl" aria-hidden>
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "radial-gradient(ellipse at 50% 120%, rgba(59,130,246,0.22) 0%, transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "radial-gradient(ellipse at 50% -20%, rgba(59,130,246,0.08) 0%, transparent 55%)",
              }}
            />
          </div>

          {/* Animated top borderline */}
          <div
            className="absolute top-0 left-12 right-12 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(99,170,255,0.8), rgba(59,130,246,0.6), transparent)",
            }}
            aria-hidden
          />

          {/* Icon cluster */}
          <div className="relative inline-flex items-center justify-center mb-7">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.28)",
                boxShadow: "0 0 30px rgba(59,130,246,0.15)",
              }}
            >
              <Mic className="h-7 w-7 text-primary" />
            </div>
            {/* Floating sparkle */}
            <div
              className="absolute -top-2 -right-2 h-6 w-6 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>

          {/* Headline */}
          <h2
            className="font-sans font-extralight text-balance text-foreground mb-5 tracking-tight"
            style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}
          >
            Ready to walk into your interview{" "}
            <span className="gradient-text font-bold">with confidence?</span>
          </h2>

          {/* Sub text */}
          <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto text-base">
            Start your first mock interview in under 60 seconds. No credit card required.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="btn-primary-glow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-9 gap-2 text-base rounded-xl shadow-lg shadow-primary/25"
            >
              Start Interviewing Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-white/6 border border-white/10 font-medium px-9 rounded-xl"
            >
              View Demo
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
