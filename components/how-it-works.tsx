import { UserCircle2, Mic, BrainCircuit, TrendingUp } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserCircle2,
    title: "Pick your role & company",
    description: "Choose the job title, seniority level, and optionally the target company. We customize every question to match.",
    color: "blue",
  },
  {
    number: "02",
    icon: Mic,
    title: "Speak your answers out loud",
    description: "Your AI interviewer asks questions via voice. You respond naturally — just like a real phone or video interview.",
    color: "violet",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "AI analyzes your response",
    description: "Prepwise listens for structure, relevance, pacing, filler words, and confidence in real time as you speak.",
    color: "cyan",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Review & improve",
    description: "Get a detailed scorecard and actionable tips after every session. Retry until you feel truly ready.",
    color: "emerald",
  },
]

const colorMap: Record<string, { icon: string; border: string; bg: string; num: string }> = {
  blue: { icon: "text-blue-400", border: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.1)", num: "rgba(59,130,246,0.15)" },
  violet: { icon: "text-violet-400", border: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.08)", num: "rgba(139,92,246,0.15)" },
  cyan: { icon: "text-cyan-400", border: "rgba(34,211,238,0.28)", bg: "rgba(34,211,238,0.08)", num: "rgba(34,211,238,0.15)" },
  emerald: { icon: "text-emerald-400", border: "rgba(52,211,153,0.28)", bg: "rgba(52,211,153,0.08)", num: "rgba(52,211,153,0.15)" },
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute top-0 right-0 w-[700px] h-[600px] opacity-30"
          style={{
            background: "radial-gradient(ellipse at 100% 0%, rgba(59,130,246,0.12) 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px] opacity-20"
          style={{
            background: "radial-gradient(ellipse at 0% 100%, rgba(59,130,246,0.1) 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex justify-center mb-6">
            <span className="section-label">How It Works</span>
          </div>
          <h2
            className="font-sans font-extralight text-balance text-foreground mb-5 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            From signup to{" "}
            <span className="gradient-text font-bold">job-ready in minutes</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            No setup, no downloads. Just open the app, pick a role, and start talking.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden lg:block absolute top-[52px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px -z-0"
            style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(59,130,246,0.3), rgba(59,130,246,0.15))" }}
            aria-hidden
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            const c = colorMap[step.color]
            return (
              <div
                key={step.number}
                className="group relative z-10"
                style={{
                  opacity: 0,
                  animation: `fade-up 0.65s ease forwards`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 h-full transition-all duration-350 group-hover:-translate-y-1">
                  {/* Icon + connector dot */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="h-[52px] w-[52px] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}
                    >
                      <Icon className={`h-6 w-6 ${c.icon}`} />
                      {/* Dot on top for connector */}
                      <div
                        className="absolute -top-[13px] left-1/2 -translate-x-1/2 hidden lg:block h-2 w-2 rounded-full border"
                        style={{ background: c.bg, borderColor: c.border }}
                        aria-hidden
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md"
                        style={{ background: c.num, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}
                      >
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground font-sans text-sm leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
