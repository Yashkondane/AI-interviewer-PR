import { Mic2, BrainCircuit, MessageSquareText, BarChart3, RefreshCw, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Mic2,
    title: "Real Voice Conversations",
    description: "Your AI interviewer speaks and listens in real time — just like a phone screen. No typing, no scripts.",
    number: "01",
    accent: "from-blue-500/20 to-cyan-500/5",
  },
  {
    icon: BrainCircuit,
    title: "Role-Specific Questions",
    description: "Tailored question banks for SWE, PM, Design, Data, Marketing, Finance, and 50+ more roles.",
    number: "02",
    accent: "from-violet-500/20 to-blue-500/5",
  },
  {
    icon: MessageSquareText,
    title: "Instant Answer Feedback",
    description: "Get line-by-line feedback on clarity, structure (STAR method), and relevance after every answer.",
    number: "03",
    accent: "from-blue-500/20 to-indigo-500/5",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your improvement with scores on confidence, pacing, filler words, and answer completeness.",
    number: "04",
    accent: "from-cyan-500/20 to-blue-500/5",
  },
  {
    icon: RefreshCw,
    title: "Unlimited Practice Rounds",
    description: "Retry any interview as many times as you need until you feel completely ready to walk in.",
    number: "05",
    accent: "from-blue-500/20 to-sky-500/5",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description: "Your recordings are encrypted and never shared. Practice candidly without any concerns.",
    number: "06",
    accent: "from-emerald-500/15 to-blue-500/5",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute top-16 right-16 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
            filter: "blur(90px)",
            animation: "float 9s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-24 -left-32 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(99,170,255,0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "float 12s ease-in-out infinite 1.5s",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex justify-center mb-6">
            <span className="section-label">Features</span>
          </div>
          <h2
            className="font-sans font-extralight text-balance text-foreground mb-5 tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Everything you need to{" "}
            <span className="gradient-text font-bold">interview smarter</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-base">
            Built to simulate real interview conditions so you show up confident, prepared, and ready to impress.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group relative feature-card rounded-2xl overflow-hidden"
                style={{
                  opacity: 0,
                  animation: `fade-up 0.65s ease forwards`,
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                {/* Top gradient shine on hover */}
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${feat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                {/* Faint top border shine */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)" }}
                  aria-hidden
                />

                {/* Content */}
                <div className="p-7 h-full flex flex-col gap-5">
                  {/* Top row: icon + number */}
                  <div className="flex items-start justify-between">
                    {/* Icon */}
                    <div className="relative w-fit">
                      <div
                        className="absolute -inset-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                        style={{ background: "rgba(59,130,246,0.25)" }}
                        aria-hidden
                      />
                      <div
                        className="relative h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: "rgba(59,130,246,0.12)",
                          border: "1px solid rgba(59,130,246,0.25)",
                        }}
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    {/* Number */}
                    <span
                      className="font-bold text-3xl tabular-nums select-none"
                      style={{ color: "rgba(59,130,246,0.12)", letterSpacing: "-0.04em" }}
                    >
                      {feat.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    <h3 className="font-semibold text-foreground text-base font-sans leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Bottom hover accent */}
                  <div
                    className="h-px w-0 group-hover:w-10 transition-all duration-500 rounded-full"
                    style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.9), transparent)" }}
                    aria-hidden
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
