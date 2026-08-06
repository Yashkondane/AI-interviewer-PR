"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { 
    User, Mail, Phone, Link as LinkIcon, Github, 
    GraduationCap, Briefcase, Code, FileText, 
    Upload, Loader2, CheckCircle2, Edit2, Save, X, Plus, Trash2, Award,
    ArrowLeft, Home, LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ProfilePage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single()
                setProfile(data)
                setEditedProfile(data?.resume_data || {})
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/profile/resume", {
                method: "POST",
                body: formData,
            })

            const result = await res.json()
            if (result.success) {
                toast.success("Resume parsed and profile updated!")
                await fetchProfile()
            } else {
                throw new Error(result.error || "Failed to parse resume")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSaveProfile = async () => {
        if (!user) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ resume_data: editedProfile })
                .eq("id", user.id)

            if (error) throw error

            toast.success("Profile saved successfully!")
            setProfile({ ...profile, resume_data: editedProfile })
            setIsEditing(false)
        } catch (err: any) {
            toast.error(err.message || "Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    const cancelEdit = () => {
        setEditedProfile(profile?.resume_data || {})
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    const resume = isEditing ? editedProfile : profile?.resume_data

    const updateField = (fieldPath: string[], value: any) => {
        setEditedProfile((prev: any) => {
            const newProfile = { ...prev }
            let current = newProfile
            for (let i = 0; i < fieldPath.length - 1; i++) {
                if (!current[fieldPath[i]]) current[fieldPath[i]] = {}
                current = current[fieldPath[i]]
            }
            current[fieldPath[fieldPath.length - 1]] = value
            return newProfile
        })
    }

    const addArrayItem = (field: string, emptyItem: any) => {
        const arr = resume[field] || []
        updateField([field], [...arr, emptyItem])
    }

    const removeArrayItem = (field: string, index: number) => {
        const arr = [...(resume[field] || [])]
        arr.splice(index, 1)
        updateField([field], arr)
    }

    const updateArrayItem = (field: string, index: number, key: string, value: any) => {
        const arr = [...(resume[field] || [])]
        arr[index] = { ...arr[index], [key]: value }
        updateField([field], arr)
    }
    
    const updateStringArrayItem = (field: string, index: number, value: string) => {
        const arr = [...(resume[field] || [])]
        arr[index] = value
        updateField([field], arr)
    }
    
    // Custom robust input styles to use without assuming specific UI library components exist
    const inputStyle = "w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"

    return (
        <div className="min-h-screen relative overflow-hidden text-foreground" style={{ background: "#040814" }}>
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
                {/* Top left violet glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-30"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)", filter: "blur(120px)" }} />
                {/* Bottom right cyan glow */}
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 60%)", filter: "blur(150px)" }} />
                {/* Center subtle glow */}
                <div className="absolute top-[30%] left-[30%] w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", filter: "blur(100px)" }} />
            </div>

            {/* Top Navigation Header */}
            <nav className="w-full border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                                <Image src="/logo.png" alt="Prepwise" fill className="object-contain" />
                            </div>
                            <span className="font-bold text-foreground text-lg tracking-tight hidden sm:inline">
                                Prep<span className="text-violet-400">wise</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 text-xs sm:text-sm">
                                <Home className="h-4 w-4 text-violet-400" />
                                <span>Home</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="border-white/10 text-muted-foreground hover:text-foreground gap-2 text-xs sm:text-sm bg-white/5 hover:bg-white/10">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground/80 text-lg mt-1 font-medium">Manage your resume and professional background for AI interviews.</p>
                    </div>
                {profile?.resume_data && (
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={cancelEdit} disabled={saving} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold">
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Profile
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Upload & Sync */}
                <div className="space-y-6">
                    <div className="rounded-[2.5rem] p-8 space-y-6 border border-white/5 bg-[#0a0f1d]/80 backdrop-blur-3xl shadow-xl relative overflow-hidden group hover:border-violet-500/20 transition-all duration-500" 
                        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-500" />
                        
                        <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
                            <FileText className="h-7 w-7 text-violet-400" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white tracking-tight mb-2">Resume Source</h2>
                            <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium">
                                Upload your latest resume. Your interviewer will analyze your specific projects, experience, and skills automatically!
                            </p>
                        </div>
                        
                        <div className="relative z-10">
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleUpload}
                                disabled={uploading || isEditing}
                            />
                            <label htmlFor="resume-upload">
                                <Button 
                                    asChild
                                    className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                                    disabled={uploading || isEditing}
                                >
                                    <span>
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                        {profile?.resume_data ? "Update PDF Profile" : "Upload JSON Resume"}
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </div>

                    {profile?.resume_data && !isEditing && (
                        <div className="rounded-[2rem] p-6 space-y-3 flex flex-col items-center justify-center text-center border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
                            <div className="flex items-center gap-2 text-emerald-400 mb-1 relative z-10 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <span className="text-sm font-bold text-emerald-400 relative z-10">AI Background Sync Active</span>
                            <p className="text-xs text-emerald-400/70 font-medium relative z-10">
                                Your profile data is ready to be referenced in personalized resume-focused interviews.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Display/Edit Extracted Data */}
                <div className="md:col-span-2 space-y-6">
                    {resume ? (
                        <div className={`rounded-[2.5rem] p-8 sm:p-10 space-y-10 transition-all duration-500 relative overflow-hidden ${isEditing ? "bg-[#0a0f1d] border border-violet-500/30 ring-1 ring-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]" : "bg-[#0a0f1d]/80 backdrop-blur-3xl border border-white/5 shadow-2xl hover:border-white/10"}`} >
                            
                            {/* Decorative background effects for right column */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                            {/* Personal Info */}
                            {!isEditing ? (
                                <div className="space-y-5 relative z-10">
                                    <h3 className="text-4xl font-extrabold text-white tracking-tight">{resume.name || "Unknown Name"}</h3>
                                    {resume.summary && <p className="text-base text-white/70 leading-relaxed font-medium max-w-3xl">{resume.summary}</p>}
                                    
                                    <div className="flex flex-wrap gap-4 text-sm font-semibold pt-2">
                                        {resume.contact?.email && <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/90"><Mail className="h-4 w-4 text-violet-400" /> {resume.contact.email}</span>}
                                        {resume.contact?.phone && <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/90"><Phone className="h-4 w-4 text-emerald-400" /> {resume.contact.phone}</span>}
                                    </div>
                                    <div className="flex gap-4 pt-3">
                                        {resume.contact?.linkedin && <a href={resume.contact.linkedin.startsWith("http") ? resume.contact.linkedin : `https://${resume.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-medium text-sm"><LinkIcon className="h-4 w-4" /> LinkedIn</a>}
                                        {resume.contact?.github && <a href={resume.contact.github.startsWith("http") ? resume.contact.github : `https://${resume.contact.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-medium text-sm"><Github className="h-4 w-4" /> GitHub</a>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 bg-white/5 p-6 rounded-[2rem] border border-white/10 relative z-10 shadow-inner">
                                    <h4 className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-widest flex items-center gap-2"><User className="w-4 h-4" /> Basic Info</h4>
                                    <input placeholder="Full Name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-semibold" value={resume.name || ""} onChange={e => updateField(["name"], e.target.value)} />
                                    <textarea placeholder="Professional Summary" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-medium h-24 resize-none" value={resume.summary || ""} onChange={e => updateField(["summary"], e.target.value)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center relative"><Mail className="absolute left-4 w-4 h-4 text-white/30" /><input placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={resume.contact?.email || ""} onChange={e => updateField(["contact", "email"], e.target.value)} /></div>
                                        <div className="flex items-center relative"><Phone className="absolute left-4 w-4 h-4 text-white/30" /><input placeholder="Phone" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={resume.contact?.phone || ""} onChange={e => updateField(["contact", "phone"], e.target.value)} /></div>
                                        <div className="flex items-center relative"><LinkIcon className="absolute left-4 w-4 h-4 text-white/30" /><input placeholder="LinkedIn URL" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={resume.contact?.linkedin || ""} onChange={e => updateField(["contact", "linkedin"], e.target.value)} /></div>
                                        <div className="flex items-center relative"><Github className="absolute left-4 w-4 h-4 text-white/30" /><input placeholder="GitHub URL" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={resume.contact?.github || ""} onChange={e => updateField(["contact", "github"], e.target.value)} /></div>
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Code className="h-5 w-5" />
                                    <h4 className="text-sm font-bold tracking-widest uppercase">Top Skills</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills?.length > 0 ? resume.skills.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/90 shadow-sm">
                                                {skill}
                                            </span>
                                        )) : <span className="text-xs text-white/40 font-medium">No skills listed.</span>}
                                    </div>
                                ) : (
                                    <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                        <div className="flex flex-wrap gap-3">
                                            {resume.skills?.map((skill: string, i: number) => (
                                                <div key={i} className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl pl-3 pr-1 py-1.5">
                                                    <input className="bg-transparent text-sm font-semibold text-white outline-none w-24 sm:w-32" value={skill} onChange={e => updateStringArrayItem("skills", i, e.target.value)} />
                                                    <button onClick={() => removeArrayItem("skills", i)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("skills", "New Skill")} className="h-9 text-xs rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold mt-2">
                                            <Plus className="w-4 h-4 mr-2" /> Add Skill
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Experience */}
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center gap-2 text-violet-400">
                                    <Briefcase className="h-5 w-5" />
                                    <h4 className="text-sm font-bold tracking-widest uppercase">Experience</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="grid gap-4">
                                        {resume.experience?.length > 0 ? resume.experience.map((exp: any, i: number) => (
                                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:bg-white/[0.04] transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div>
                                                        <h5 className="font-bold text-lg text-white tracking-tight">{exp.role}</h5>
                                                        <p className="text-sm text-violet-300/80 font-medium">{exp.company}</p>
                                                    </div>
                                                    <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap self-start">{exp.duration}</span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-white/60 space-y-1.5 mt-3">
                                                    {exp.highlights?.map((h: string, j: number) => <li key={j} className="leading-relaxed">{h}</li>)}
                                                </ul>
                                            </div>
                                        )) : <span className="text-xs text-white/40 font-medium">No experience listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                        {resume.experience?.map((exp: any, i: number) => (
                                            <div key={i} className="bg-black/20 p-5 rounded-2xl border border-white/10 space-y-4 relative">
                                                <button onClick={() => removeArrayItem("experience", i)} className="absolute top-4 right-4 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-colors p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Job Role" className="w-[85%] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold" value={exp.role || ""} onChange={e => updateArrayItem("experience", i, "role", e.target.value)} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input placeholder="Company Name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={exp.company || ""} onChange={e => updateArrayItem("experience", i, "company", e.target.value)} />
                                                    <input placeholder="Duration (e.g. Jan 2022 - Present)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={exp.duration || ""} onChange={e => updateArrayItem("experience", i, "duration", e.target.value)} />
                                                </div>
                                                <textarea placeholder="Highlights (one per line)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium h-24 resize-none" value={exp.highlights?.join("\n") || ""} onChange={e => updateArrayItem("experience", i, "highlights", e.target.value.split("\n"))} />
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("experience", { company: "", role: "", duration: "", highlights: [] })} className="w-full text-sm rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold py-6">
                                            <Plus className="w-5 h-5 mr-2" /> Add Experience Entry
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Projects */}
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Code className="h-5 w-5" />
                                    <h4 className="text-sm font-bold tracking-widest uppercase">Featured Projects</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="grid gap-4">
                                        {resume.projects?.length > 0 ? resume.projects.map((proj: any, i: number) => (
                                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:bg-white/[0.04] transition-colors">
                                                <h5 className="font-bold text-lg text-white tracking-tight">{proj.name}</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {proj.tech_stack?.map((t: string, j: number) => <span key={j} className="text-[10px] text-emerald-300/80 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{t}</span>)}
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-white/60 space-y-1.5 mt-3">
                                                    {proj.highlights?.map((h: string, k: number) => <li key={k} className="leading-relaxed">{h}</li>)}
                                                </ul>
                                            </div>
                                        )) : <span className="text-xs text-white/40 font-medium">No projects listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                        {resume.projects?.map((proj: any, i: number) => (
                                            <div key={i} className="bg-black/20 p-5 rounded-2xl border border-white/10 space-y-4 relative">
                                                <button onClick={() => removeArrayItem("projects", i)} className="absolute top-4 right-4 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-colors p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Project Name" className="w-[85%] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold" value={proj.name || ""} onChange={e => updateArrayItem("projects", i, "name", e.target.value)} />
                                                <input placeholder="Tech Stack (comma separated)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={proj.tech_stack?.join(", ") || ""} onChange={e => updateArrayItem("projects", i, "tech_stack", e.target.value.split(",").map((s:string) => s.trim()))} />
                                                <textarea placeholder="Highlights (one per line)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium h-24 resize-none" value={proj.highlights?.join("\n") || ""} onChange={e => updateArrayItem("projects", i, "highlights", e.target.value.split("\n"))} />
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "", tech_stack: [], highlights: [] })} className="w-full text-sm rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold py-6">
                                            <Plus className="w-5 h-5 mr-2" /> Add Project
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Education */}
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center gap-2 text-rose-400">
                                    <GraduationCap className="h-5 w-5" />
                                    <h4 className="text-sm font-bold tracking-widest uppercase">Education</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="space-y-4">
                                        {resume.education?.length > 0 ? resume.education.map((ed: any, i: number) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-l-2 border-white/10 pl-4 py-1 ml-2 relative group hover:border-rose-400/50 transition-colors">
                                                <div className="absolute w-2 h-2 rounded-full bg-white/20 -left-[5px] top-2.5 group-hover:bg-rose-400 transition-colors" />
                                                <div>
                                                    <h5 className="font-bold text-lg text-white tracking-tight">{ed.institution}</h5>
                                                    <p className="text-sm text-white/60 font-medium">{ed.degree}</p>
                                                </div>
                                                <div className="sm:text-right mt-2 sm:mt-0">
                                                    <p className="text-sm font-bold text-rose-300">{ed.score}</p>
                                                    <p className="text-xs text-white/40 font-medium">{ed.year}</p>
                                                </div>
                                            </div>
                                        )) : <span className="text-xs text-white/40 font-medium">No education listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                        {resume.education?.map((ed: any, i: number) => (
                                            <div key={i} className="bg-black/20 p-5 rounded-2xl border border-white/10 space-y-4 relative">
                                                <button onClick={() => removeArrayItem("education", i)} className="absolute top-4 right-4 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-colors p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Institution Name" className="w-[85%] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold" value={ed.institution || ""} onChange={e => updateArrayItem("education", i, "institution", e.target.value)} />
                                                <input placeholder="Degree/Course" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={ed.degree || ""} onChange={e => updateArrayItem("education", i, "degree", e.target.value)} />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <input placeholder="Score (CGPA/%)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={ed.score || ""} onChange={e => updateArrayItem("education", i, "score", e.target.value)} />
                                                    <input placeholder="Year/Duration" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={ed.year || ""} onChange={e => updateArrayItem("education", i, "year", e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { institution: "", degree: "", score: "", year: "" })} className="w-full text-sm rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold py-6">
                                            <Plus className="w-5 h-5 mr-2" /> Add Education
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Achievements */}
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Award className="h-5 w-5" />
                                    <h4 className="text-sm font-bold tracking-widest uppercase">Achievements</h4>
                                </div>
                                {!isEditing ? (
                                    <ul className="list-disc list-inside text-sm text-white/60 space-y-2">
                                        {resume.achievements?.length > 0 ? resume.achievements.map((ach: string, i: number) => (
                                            <li key={i} className="leading-relaxed">{ach}</li>
                                        )) : <span className="text-xs text-white/40 font-medium list-none block">No extra achievements listed.</span>}
                                    </ul>
                                ) : (
                                    <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                        {resume.achievements?.map((ach: string, i: number) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <input className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium" value={ach} onChange={e => updateStringArrayItem("achievements", i, e.target.value)} placeholder="Achievement description" />
                                                <button onClick={() => removeArrayItem("achievements", i)} className="text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-colors p-3 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("achievements", "")} className="w-full text-sm rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold py-6">
                                            <Plus className="w-5 h-5 mr-2" /> Add Achievement
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 rounded-[2.5rem] border border-dashed border-white/10 bg-[#0a0f1d]/50 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 pointer-events-none" />
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <User className="h-10 w-10 text-white/20" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">No profile data found</h3>
                            <p className="text-white/50 text-sm max-w-sm mt-3 font-medium leading-relaxed">
                                Upload your resume PDF on the left. We'll instantly extract your experience so your interviewer can ask personalized questions!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    )
}
