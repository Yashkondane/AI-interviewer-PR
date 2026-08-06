import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer
      className="px-6 pt-16 pb-10 relative flex flex-col items-center justify-center text-center"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent)" }}
        aria-hidden
      />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 w-fit group mb-4">
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
          Prep<span className="text-primary">Wise</span>
        </span>
      </Link>

      <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8">
        The AI-powered voice mock interviewer that helps you land your dream job.
      </p>

      {/* Bottom bar */}
      <div
        className="w-full max-w-md mx-auto pt-6 flex flex-col items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p className="text-muted-foreground text-xs">
          &copy; 2026 PrepWise Group Project. All rights reserved.
        </p>

      </div>
    </footer>
  )
}
