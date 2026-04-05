"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive("#" + e.target.id)
        })
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-10 py-4 transition-all duration-300">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${scrolled ? "nav-glass shadow-2xl" : "bg-transparent"
          }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-10 md:h-12 md:w-12 group-hover:scale-105 transition-transform duration-300">
            <Image src="/logo.png" alt="Prepwise Logo" fill className="object-contain" priority />
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight hidden sm:block">
            Prep<span className="text-primary">wise</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active === link.href
                ? "text-foreground bg-white/6"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              {link.label}
              {active === link.href && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200 px-3 py-2"
          >
            Sign in
          </Link>
          <Button
            size="sm"
            className="btn-primary-glow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 rounded-xl gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            Get Started Free
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all duration-200"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-2xl nav-glass p-4 flex flex-col gap-1 animate-slide-down">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active === link.href
                ? "text-foreground bg-primary/10 border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border/40 my-1" />
          <Link
            href="/auth/login"
            className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full rounded-xl gap-2">
            <Zap className="h-4 w-4" />
            Get Started Free
          </Button>
        </div>
      )}
    </header>
  )
}
