import Link from "next/link"
import { Github, Twitter, Linkedin, ArrowRight } from "lucide-react"

const links = {
  Product: ["Features", "How It Works", "Pricing", "Changelog"],
  Resources: ["Blog", "Interview Tips", "Role Guides", "Support"],
  Company: ["About", "Privacy", "Terms", "Contact"],
}

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
]

export default function Footer() {
  return (
    <footer
      className="px-6 pt-16 pb-10 relative"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent)" }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Brand column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit group">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200"
              style={{ background: "rgba(59,130,246,0.9)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="6" y="1" width="2" height="12" rx="1" fill="white" />
                <rect x="3" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                <rect x="9" y="3" width="2" height="8" rx="1" fill="white" opacity="0.7" />
                <rect x="0" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4" />
                <rect x="12" y="5" width="2" height="4" rx="1" fill="white" opacity="0.4" />
              </svg>
            </div>
            <span className="font-bold text-foreground text-lg font-sans tracking-tight">
              Storm<span className="text-primary">Prep</span>
            </span>
          </Link>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
            The AI-powered voice mock interviewer that helps you land your dream job.
          </p>

          {/* Newsletter */}
          <div className="mt-1">
            <p className="text-foreground text-xs font-semibold mb-2.5">Get interview tips weekly</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              />
              <button
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0"
                style={{
                  background: "rgba(59,130,246,0.85)",
                  border: "1px solid rgba(59,130,246,0.5)",
                }}
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2 mt-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading} className="flex flex-col gap-3">
              <p className="font-semibold text-foreground/90 text-xs uppercase tracking-wider mb-1">
                {heading}
              </p>
              {items.map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p className="text-muted-foreground text-xs">
          &copy; 2026 StormPrep. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">Privacy</Link>
          <span className="text-border/60 text-xs">·</span>
          <Link href="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">Terms</Link>
          <span className="text-border/60 text-xs">·</span>
          <p className="text-muted-foreground text-xs">Built with AI, for job seekers.</p>
        </div>
      </div>
    </footer>
  )
}
