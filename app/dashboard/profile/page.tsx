"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
    User, Mail, Phone, Link as LinkIcon, Github, 
    GraduationCap, Briefcase, Code, FileText, 
    Upload, Loader2, CheckCircle2, Edit2, Save, X, Plus, Trash2, Award
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your resume and professional background for AI interviews.</p>
                </div>
                {profile?.resume_data && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                <Button onClick={handleSaveProfile} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Profile
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Upload & Sync */}
                <div className="space-y-6">
                    <div className="rounded-3xl p-6 space-y-4" 
                        style={{ background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.1)" }}>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Resume Source</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Upload your latest resume. Sarah will analyze your specific projects, experience, and skills automatically!
                        </p>
                        
                        <div className="relative">
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
                                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 cursor-pointer"
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
                        <div className="rounded-3xl p-6 space-y-4 flex flex-col items-center justify-center text-center" 
                            style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                            <div className="flex items-center gap-2 text-green-500 mb-2">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-semibold text-green-400">AI Background Sync Active</span>
                            <p className="text-xs text-muted-foreground">
                                Your profile data is ready to be referenced in personalized resume-focused interviews.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Display/Edit Extracted Data */}
                <div className="md:col-span-2 space-y-6">
                    {resume ? (
                        <div className={`rounded-3xl p-6 md:p-8 space-y-8 transition-colors ${isEditing ? "bg-slate-900 border border-primary/40 ring-1 ring-primary/20" : ""}`} 
                            style={!isEditing ? { background: "rgba(12,22,44,0.7)", border: "1px solid rgba(59,130,246,0.1)" } : {}}>
                            
                            {/* Personal Info */}
                            {!isEditing ? (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">{resume.name || "Unknown Name"}</h3>
                                    {resume.summary && <p className="text-sm text-slate-300 italic">{resume.summary}</p>}
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        {resume.contact?.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {resume.contact.email}</span>}
                                        {resume.contact?.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {resume.contact.phone}</span>}
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        {resume.contact?.linkedin && <a href={resume.contact.linkedin} target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><LinkIcon className="h-4 w-4" /></a>}
                                        {resume.contact?.github && <a href={resume.contact.github} target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-sm font-semibold text-primary mb-2 border-b border-primary/20 pb-2">Basic Info</h4>
                                    <input placeholder="Full Name" className={inputStyle} value={resume.name || ""} onChange={e => updateField(["name"], e.target.value)} />
                                    <textarea placeholder="Professional Summary" className={`${inputStyle} h-20 resize-none`} value={resume.summary || ""} onChange={e => updateField(["summary"], e.target.value)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><input placeholder="Email" className={inputStyle} value={resume.contact?.email || ""} onChange={e => updateField(["contact", "email"], e.target.value)} /></div>
                                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><input placeholder="Phone" className={inputStyle} value={resume.contact?.phone || ""} onChange={e => updateField(["contact", "phone"], e.target.value)} /></div>
                                        <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-slate-400" /><input placeholder="LinkedIn URL" className={inputStyle} value={resume.contact?.linkedin || ""} onChange={e => updateField(["contact", "linkedin"], e.target.value)} /></div>
                                        <div className="flex items-center gap-2"><Github className="w-4 h-4 text-slate-400" /><input placeholder="GitHub URL" className={inputStyle} value={resume.contact?.github || ""} onChange={e => updateField(["contact", "github"], e.target.value)} /></div>
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <Code className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold tracking-wider">TOP SKILLS</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills?.length > 0 ? resume.skills.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
                                                {skill}
                                            </span>
                                        )) : <span className="text-xs text-muted-foreground">No skills listed.</span>}
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="flex flex-wrap gap-2">
                                            {resume.skills?.map((skill: string, i: number) => (
                                                <div key={i} className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md pl-2 pr-1 py-1">
                                                    <input className="bg-transparent text-xs text-slate-200 outline-none w-20 sm:w-24" value={skill} onChange={e => updateStringArrayItem("skills", i, e.target.value)} />
                                                    <button onClick={() => removeArrayItem("skills", i)} className="text-rose-400 hover:text-rose-300 p-0.5"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("skills", "New Skill")} className="h-8 text-xs bg-slate-900 border-slate-700">
                                            <Plus className="w-3 h-3 mr-1" /> Add Skill
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Experience */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Briefcase className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold tracking-wider">EXPERIENCE</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="grid gap-4">
                                        {resume.experience?.length > 0 ? resume.experience.map((exp: any, i: number) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/4 border border-white/5 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-semibold">{exp.role}</h5>
                                                        <p className="text-xs text-primary">{exp.company}</p>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded-md">{exp.duration}</span>
                                                </div>
                                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2">
                                                    {exp.highlights?.map((h: string, j: number) => <li key={j}>{h}</li>)}
                                                </ul>
                                            </div>
                                        )) : <span className="text-xs text-muted-foreground">No experience listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        {resume.experience?.map((exp: any, i: number) => (
                                            <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-3 relative">
                                                <button onClick={() => removeArrayItem("experience", i)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 bg-rose-500/10 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Job Role" className={`${inputStyle} text-sm font-semibold w-[85%]`} value={exp.role || ""} onChange={e => updateArrayItem("experience", i, "role", e.target.value)} />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input placeholder="Company Name" className={inputStyle} value={exp.company || ""} onChange={e => updateArrayItem("experience", i, "company", e.target.value)} />
                                                    <input placeholder="Duration (e.g. Jan 2022 - Present)" className={inputStyle} value={exp.duration || ""} onChange={e => updateArrayItem("experience", i, "duration", e.target.value)} />
                                                </div>
                                                <textarea placeholder="Highlights (one per line)" className={`${inputStyle} h-20 resize-none`} value={exp.highlights?.join("\n") || ""} onChange={e => updateArrayItem("experience", i, "highlights", e.target.value.split("\n"))} />
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("experience", { company: "", role: "", duration: "", highlights: [] })} className="w-full text-xs">
                                            <Plus className="w-4 h-4 mr-2" /> Add Experience Entry
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Projects */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Code className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold tracking-wider">FEATURED PROJECTS</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="grid gap-4">
                                        {resume.projects?.length > 0 ? resume.projects.map((proj: any, i: number) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/4 border border-white/5 space-y-2">
                                                <h5 className="font-semibold">{proj.name}</h5>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {proj.tech_stack?.map((t: string, j: number) => <span key={j} className="text-[10px] text-muted-foreground">{t}</span>)}
                                                </div>
                                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2">
                                                    {proj.highlights?.map((h: string, k: number) => <li key={k}>{h}</li>)}
                                                </ul>
                                            </div>
                                        )) : <span className="text-xs text-muted-foreground">No projects listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        {resume.projects?.map((proj: any, i: number) => (
                                            <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-3 relative">
                                                <button onClick={() => removeArrayItem("projects", i)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 bg-rose-500/10 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Project Name" className={`${inputStyle} font-semibold w-[85%]`} value={proj.name || ""} onChange={e => updateArrayItem("projects", i, "name", e.target.value)} />
                                                <input placeholder="Tech Stack (comma separated)" className={inputStyle} value={proj.tech_stack?.join(", ") || ""} onChange={e => updateArrayItem("projects", i, "tech_stack", e.target.value.split(",").map((s:string) => s.trim()))} />
                                                <textarea placeholder="Highlights (one per line)" className={`${inputStyle} h-20 resize-none`} value={proj.highlights?.join("\n") || ""} onChange={e => updateArrayItem("projects", i, "highlights", e.target.value.split("\n"))} />
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "", tech_stack: [], highlights: [] })} className="w-full text-xs">
                                            <Plus className="w-4 h-4 mr-2" /> Add Project
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <GraduationCap className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold tracking-wider">EDUCATION</h4>
                                </div>
                                {!isEditing ? (
                                    <div className="space-y-4">
                                        {resume.education?.length > 0 ? resume.education.map((ed: any, i: number) => (
                                            <div key={i} className="flex justify-between items-start border-l-2 border-white/10 pl-4 ml-1">
                                                <div>
                                                    <h5 className="text-sm font-semibold">{ed.institution}</h5>
                                                    <p className="text-xs text-muted-foreground">{ed.degree}</p>
                                                </div>
                                                <div className="text-right whitespace-nowrap ml-4">
                                                    <p className="text-xs font-bold text-primary">{ed.score}</p>
                                                    <p className="text-[10px] text-muted-foreground">{ed.year}</p>
                                                </div>
                                            </div>
                                        )) : <span className="text-xs text-muted-foreground">No education listed.</span>}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        {resume.education?.map((ed: any, i: number) => (
                                            <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-3 relative">
                                                <button onClick={() => removeArrayItem("education", i)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 bg-rose-500/10 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                <input placeholder="Institution Name" className={`${inputStyle} font-semibold w-[85%]`} value={ed.institution || ""} onChange={e => updateArrayItem("education", i, "institution", e.target.value)} />
                                                <input placeholder="Degree/Course" className={inputStyle} value={ed.degree || ""} onChange={e => updateArrayItem("education", i, "degree", e.target.value)} />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input placeholder="Score (CGPA/%)" className={inputStyle} value={ed.score || ""} onChange={e => updateArrayItem("education", i, "score", e.target.value)} />
                                                    <input placeholder="Year/Duration" className={inputStyle} value={ed.year || ""} onChange={e => updateArrayItem("education", i, "year", e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { institution: "", degree: "", score: "", year: "" })} className="w-full text-xs">
                                            <Plus className="w-4 h-4 mr-2" /> Add Education
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Achievements */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Award className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold tracking-wider">ACHIEVEMENTS</h4>
                                </div>
                                {!isEditing ? (
                                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5">
                                        {resume.achievements?.length > 0 ? resume.achievements.map((ach: string, i: number) => (
                                            <li key={i}>{ach}</li>
                                        )) : <span className="text-xs text-muted-foreground list-none block">No extra achievements listed.</span>}
                                    </ul>
                                ) : (
                                    <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        {resume.achievements?.map((ach: string, i: number) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input className={inputStyle} value={ach} onChange={e => updateStringArrayItem("achievements", i, e.target.value)} placeholder="Achievement description" />
                                                <button onClick={() => removeArrayItem("achievements", i)} className="text-rose-400 hover:text-rose-300 p-2"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem("achievements", "")} className="w-full text-xs">
                                            <Plus className="w-4 h-4 mr-2" /> Add Achievement
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/2">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <User className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-semibold">No profile data found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mt-2">
                                Once you upload your resume, Sarah will use its details to personalize your interview experience.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
