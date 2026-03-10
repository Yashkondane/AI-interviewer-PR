import { Check, Zap, Building2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out.",
    features: [
      "3 mock interviews / month",
      "Basic answer feedback",
      "5 roles available",
      "Text transcript",
    ],
    cta: "Get Started Free",
    highlighted: false,
    icon: Star,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    description: "For serious job seekers.",
    features: [
      "Unlimited mock interviews",
      "Voice + detailed AI feedback",
      "50+ roles & companies",
      "Performance analytics dashboard",
      "Filler word & pacing analysis",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    icon: Zap,
  },
  {
    name: "Teams",
    price: "$39",
    period: "/ month",
    description: "For bootcamps & coaches.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared analytics dashboard",
      "Custom question sets",
      "Dedicated account manager",
    ],
    cta: "Contact Us",
    highlighted: false,
    icon: Building2,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex justify-center mb-6">
            <span className="section-label">Pricing</span>
          </div>
          <h2
            className="font-sans font-extralight text-balance text-foreground mb-5 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            Simple,{" "}
            <span className="gradient-text font-bold">transparent pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => {
            const PlanIcon = plan.icon
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col gap-6 relative transition-all duration-350 ${plan.highlighted ? "pricing-card-pro" : "pricing-card"
                  }`}
                style={{
                  opacity: 0,
                  animation: `fade-up 0.65s ease forwards`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Invisible spacer on non-highlighted cards to match the badge height */}
                {!plan.highlighted && <div className="h-[0px]" aria-hidden />}

                {/* Popular badge */}
                {plan.highlighted && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg shadow-primary/30"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: plan.highlighted ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${plan.highlighted ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <PlanIcon className={`h-4 w-4 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {plan.name}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span
                        className="font-extrabold font-sans text-foreground"
                        style={{ fontSize: "2.5rem", letterSpacing: "-0.04em", lineHeight: 1 }}
                      >
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Separator */}
                <div
                  className="h-px"
                  style={{
                    background: plan.highlighted
                      ? "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)"
                      : "rgba(255,255,255,0.06)",
                  }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: plan.highlighted ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                        }}
                      >
                        <Check
                          className={`h-3 w-3 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <span className="text-foreground/80 leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full font-semibold rounded-xl transition-all duration-200"
                  style={
                    plan.highlighted
                      ? {
                        background: "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))",
                        color: "white",
                        boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
                      }
                      : {
                        background: "rgba(255,255,255,0.05)",
                        color: "hsl(210 18% 95%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-muted-foreground text-xs mt-10">
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  )
}
