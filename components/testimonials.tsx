const testimonials = [
  {
    name: "Priya S.",
    role: "SWE — Offer from Google",
    quote: "I did 14 mock interviews on StormPrep before my actual Google loop. The voice feedback on my pacing was a game changer.",
    avatar: "PS",
    rating: 5,
    company: "Google",
  },
  {
    name: "Marcus T.",
    role: "Product Manager — Offer from Stripe",
    quote: "The AI's follow-up questions caught me completely off guard — in a good way. Best interview prep I've ever done.",
    avatar: "MT",
    rating: 5,
    company: "Stripe",
  },
  {
    name: "Lin C.",
    role: "Data Analyst — Offer from Meta",
    quote: "I used to ramble in interviews. StormPrep's feedback on filler words helped me become concise. Got my offer in 3 weeks.",
    avatar: "LC",
    rating: 5,
    company: "Meta",
  },
  {
    name: "Jordan K.",
    role: "Frontend Engineer — Offer from Shopify",
    quote: "It feels like a real interview, not a quiz app. The voice back-and-forth made me actually comfortable on video calls.",
    avatar: "JK",
    rating: 5,
    company: "Shopify",
  },
  {
    name: "Aisha R.",
    role: "UX Designer — Offer from Airbnb",
    quote: "Super impressed by how well the AI understood my design portfolio walk-through and gave meaningful, specific critique.",
    avatar: "AR",
    rating: 5,
    company: "Airbnb",
  },
  {
    name: "David M.",
    role: "ML Engineer — Offer from OpenAI",
    quote: "Asked me system design questions at exactly the right difficulty level. Really helped me feel prepared and confident.",
    avatar: "DM",
    rating: 5,
    company: "OpenAI",
  },
]

const avatarColors = [
  { bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.3)", text: "#60a5fa" },
  { bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.3)", text: "#a78bfa" },
  { bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.28)", text: "#22d3ee" },
  { bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.28)", text: "#34d399" },
  { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.28)", text: "#fbbf24" },
  { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.28)", text: "#f87171" },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill={i < count ? "#fbbf24" : "rgba(255,255,255,0.1)"}
          />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
  const color = avatarColors[i % avatarColors.length]
  return (
    <div
      className="w-[300px] flex-shrink-0 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "rgba(12,22,44,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Rating */}
      <StarRating count={t.rating} />

      {/* Quote */}
      <p className="text-sm text-foreground/75 leading-relaxed flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto pt-1 border-t border-white/5">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const row1 = [...testimonials, ...testimonials]
  const row2 = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)]

  return (
    <section id="testimonials" className="py-28 overflow-hidden relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px]"
          style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.09) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <div className="inline-flex justify-center mb-6">
          <span className="section-label">Testimonials</span>
        </div>
        <h2
          className="font-sans font-extralight text-balance text-foreground"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.025em" }}
        >
          Real people,{" "}
          <span className="gradient-text font-bold">real offers</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md mx-auto text-sm leading-relaxed">
          2,400+ job seekers landed offers at top companies after practicing with StormPrep.
        </p>
      </div>

      {/* Row 1 — forward */}
      <div className="relative mb-4">
        <div className="flex gap-4 animate-marquee w-max">
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} i={i % testimonials.length} />
          ))}
        </div>
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-28"
          style={{ background: "linear-gradient(to right, hsl(216 42% 5%), transparent)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-28"
          style={{ background: "linear-gradient(to left, hsl(216 42% 5%), transparent)" }}
          aria-hidden
        />
      </div>

      {/* Row 2 — reverse */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee-reverse w-max">
          {row2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} i={(i + 2) % testimonials.length} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-28"
          style={{ background: "linear-gradient(to right, hsl(216 42% 5%), transparent)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-28"
          style={{ background: "linear-gradient(to left, hsl(216 42% 5%), transparent)" }}
          aria-hidden
        />
      </div>
    </section>
  )
}
