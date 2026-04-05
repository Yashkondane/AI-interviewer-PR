"use client"

import { FileSearch, Target, TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"

const analyzerFeatures = [
  {
    icon: FileSearch,
    title: "STRICT ATS Evaluation",
    description: "Our AI acts as a top-tier recruiter, penalizing word repetition and vague bullets while rewarding experience depth and company prestige.",
    accent: "from-blue-500/20 to-cyan-500/5",
  },
  {
    icon: Target,
    title: "Dynamic JD Matching",
    description: "Upload a Job Description to get a precise match score based on required skills, seniority, and toolset overlap.",
    accent: "from-emerald-500/20 to-blue-500/5",
  },
  {
    icon: TrendingUp,
    title: "Impact & Quantification",
    description: "Every bullet is analyzed for 'Action Verbs' and 'Hard Metrics'. We ensure you're showing outcomes, not just duties.",
    accent: "from-blue-500/20 to-indigo-500/5",
  },
  {
    icon: AlertCircle,
    title: "Skill Gap Discovery",
    description: "Identify exactly which keywords and technologies are missing from your profile based on real-world Job Descriptions.",
    accent: "from-cyan-600/20 to-blue-500/5",
  },
]

export default function ResumeReader() {
  return (
    <section id="resume-reader" className="py-24 px-6 relative overflow-hidden">
      {/* Background radial glow matching the original Blue theme */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: Text Content */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex">
              <span className="section-label">
                New Feature
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                The AI <span className="gradient-text">Resume Reader</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                Most resumes are rejected by ATS before a human ever sees them. Our AI-powered evaluator uses recruiter-grade strictness to score your resume, identify missing skills, and ensure every bullet point hits with maximum impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {analyzerFeatures.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Visual "Scanner" Mockup */}
          <div className="relative group">
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative glass-card rounded-[2rem] overflow-hidden border-blue-500/20 border shadow-2xl">
              {/* Fake UI Header */}
              <div className="h-12 border-b border-blue-500/10 bg-blue-500/[0.05] flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400/60 font-bold font-mono">Resume Analysis Engine v2.5</span>
                </div>
              </div>

              {/* Fake UI Body */}
              <div className="p-8 flex flex-col gap-6 font-mono">
                {/* Score Circle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Global ATS Score</span>
                    <span className="text-3xl font-bold text-foreground">84<span className="text-blue-500">/100</span></span>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin-slow flex items-center justify-center p-2 relative">
                    <span className="text-xs font-bold text-blue-500">GOOD</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col gap-4">
                  {[
                    { label: "JD Match", value: 92, color: "bg-emerald-500" },
                    { label: "Bullet Strength", value: 76, color: "bg-blue-400" },
                    { label: "Impact Score", value: 88, color: "bg-cyan-500" },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-blue-300/70">
                        <span>{m.label}</span>
                        <span>{m.value}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis Log */}
                <div className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px]">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Strong action verbs detected (Led, Built, Optimized)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px]">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Quantification found in 80% of bullets</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 text-[10px]">
                    <AlertCircle className="h-3 w-3" />
                    <span>Repetition: "Developed" used 4 times (Penalty Applied)</span>
                  </div>
                </div>
              </div>

              {/* Scanning Line Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan opacity-40" />
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 glass-card px-6 py-4 rounded-2xl border-blue-500/20 border shadow-xl animate-float">
               <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                     <Target className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">JD Correlation</span>
                    <span className="text-lg font-bold text-foreground">94% Match</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
