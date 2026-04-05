import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import ResumeReader from "@/components/resume-reader"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ResumeReader />
      <CTA />
      <Footer />
    </main>
  )
}
