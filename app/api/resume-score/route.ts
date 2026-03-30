import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * Reconstruct a text resume from the structured resume_data JSON
 * stored in the profiles table.
 */
function resumeDataToText(d: any): string {
    const lines: string[] = []

    if (d.name) lines.push(d.name)
    if (d.summary) lines.push(`\nSummary: ${d.summary}`)

    if (d.contact) {
        const c = d.contact
        const contactParts = [c.email, c.phone, c.linkedin, c.github].filter(Boolean)
        if (contactParts.length) lines.push(`Contact: ${contactParts.join(" | ")}`)
    }

    if (d.skills?.length) {
        lines.push(`\nSkills: ${d.skills.join(", ")}`)
    }

    if (d.experience?.length) {
        lines.push("\nExperience:")
        for (const exp of d.experience) {
            lines.push(`  ${exp.role} at ${exp.company} (${exp.duration})`)
            for (const h of exp.highlights || []) {
                lines.push(`    • ${h}`)
            }
        }
    }

    if (d.projects?.length) {
        lines.push("\nProjects:")
        for (const proj of d.projects) {
            lines.push(`  ${proj.name} [${(proj.tech_stack || []).join(", ")}]`)
            for (const h of proj.highlights || []) {
                lines.push(`    • ${h}`)
            }
        }
    }

    if (d.education?.length) {
        lines.push("\nEducation:")
        for (const ed of d.education) {
            lines.push(`  ${ed.degree} — ${ed.institution} (${ed.year}) ${ed.score ? `Score: ${ed.score}` : ""}`)
        }
    }

    if (d.achievements?.length) {
        lines.push("\nAchievements:")
        for (const a of d.achievements) {
            lines.push(`  • ${a}`)
        }
    }

    return lines.join("\n")
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { resume_text, resume_data, job_description } = body

        // Build the resume text to evaluate
        let text = resume_text || ""
        if (!text && resume_data) {
            text = resumeDataToText(resume_data)
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json(
                { error: "Resume text is too short or empty. Please provide a valid resume." },
                { status: 400 }
            )
        }

        const hasJD = !!job_description && job_description.trim().length > 10

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        final_score: { type: SchemaType.NUMBER },
                        jd_match_score: { type: SchemaType.NUMBER, nullable: true },
                        resume_quality_score: { type: SchemaType.NUMBER },
                        jd_analysis: {
                            type: SchemaType.OBJECT,
                            nullable: true,
                            properties: {
                                matched_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                missing_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                keyword_coverage: { type: SchemaType.NUMBER },
                                experience_match: { type: SchemaType.NUMBER },
                                semantic_similarity: { type: SchemaType.NUMBER },
                                tools_match: { type: SchemaType.NUMBER },
                                education_match: { type: SchemaType.NUMBER },
                                skill_match: { type: SchemaType.NUMBER },
                            },
                        },
                        resume_analysis: {
                            type: SchemaType.OBJECT,
                            properties: {
                                bullet_strength: { type: SchemaType.NUMBER },
                                action_verbs: { type: SchemaType.NUMBER },
                                quantification: { type: SchemaType.NUMBER },
                                clarity: { type: SchemaType.NUMBER },
                                repetition_penalty: { type: SchemaType.NUMBER },
                                grammar_score: { type: SchemaType.NUMBER },
                                structure_score: { type: SchemaType.NUMBER },
                                tech_stack_complexity: { type: SchemaType.NUMBER },
                                experience_depth: { type: SchemaType.NUMBER },
                                impact_score: { type: SchemaType.NUMBER },
                                contact_completeness: { type: SchemaType.NUMBER },
                                skill_alignment: { type: SchemaType.NUMBER },
                                repetition_issues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                structure_issues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                grammar_issues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            },
                        },
                        feedback: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    },
                },
            },
        })

        const jdBlock = hasJD
            ? `
JOB DESCRIPTION:
"""
${job_description}
"""

STEP 2 — JD MATCHING (MANDATORY since JD is provided):
Compute each sub-score (0–100):
1. skill_match = (matched required skills / total required skills) × 100
2. Missing Skills = required skills NOT found in resume
3. experience_match: if experience >= required → 100; slightly below → 60–80; far below → 0–50
4. keyword_coverage = (% of JD keywords found in resume)
5. semantic_similarity = meaning overlap between resume and JD (0–100)
6. tools_match = overlap of tools/technologies mentioned in JD vs resume (0–100)
7. education_match = how well education requirements match (0–100)

Then compute:
jd_match_score = 0.35 × skill_match + 0.20 × experience_match + 0.15 × semantic_similarity + 0.10 × keyword_coverage + 0.10 × tools_match + 0.10 × education_match
`
            : `
No Job Description provided. Set jd_match_score to null and jd_analysis to null.
`

        const finalScoreFormula = hasJD
            ? "final_score = 0.60 × jd_match_score + 0.40 × resume_quality_score"
            : "final_score = resume_quality_score (since no JD)"

        const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

        const prompt = `You are a STRICT, PROFESSIONAL Applicant Tracking System (ATS) and resume evaluator, similar to Resume Worded.
TODAY'S DATE: ${currentDate}

RESUME:
"""
${text}
"""

${jdBlock}

STEP 3 — RESUME QUALITY ANALYSIS:
Evaluate each (0–100):
1. bullet_strength: Strong verbs? Measurable results? Clear and specific? Average across all bullets.
2. action_verbs: % of bullets starting with strong action verbs (Led, Built, Designed, Optimized, etc.)
3. quantification: (bullets with numbers or metrics / total bullets) × 100
4. clarity: How readable and clear is the resume? (0–100)
5. repetition_penalty: STRICT RULE — Count how many times each action verb appears across the entire resume.
   - A verb appearing 1–2 times is FINE (no penalty).
   - A verb appearing 3+ times is a VIOLATION. For EACH verb that appears 3+ times, subtract 15 points from the base of 100.
   - List every verb that appears 3+ times in repetition_issues with format: "'verb' used N times"
   - Example: if "Developed" appears 4 times and "Managed" appears 3 times → repetition_penalty = 100 - 15 - 15 = 70
6. grammar_score: How grammatically correct is the resume? (0–100)
7. structure_score: Are standard professional sections present? (skills, experience, education, contact). NOTE: A 'Summary' section is OPTIONAL and should NOT be penalized if missing. (0–100)
8. tech_stack_complexity (0–100): Evaluate how complex and modern the tech stack is.
   - Enterprise/advanced tools (Kubernetes, Terraform, Kafka, Distributed Systems, ML) → 80–100
   - Modern production stack (React, Node.js, Docker, Cloud) → 60–80
   - Standard stack (HTML/CSS, basic Python, simple APIs) → 30–60
9. experience_depth (0–100): Evaluate based on cumulative time, company prestige, and technical depth.
   - No experience → 0–10.
   - Projects only (Academic) → 10–30 based on complexity.
   - Internships / Freelancing → 30–60. (Multiple internships or roles at major firms like EY/Vodafone should be at the HIGH end of this range).
   - 1–3 years full-time work → 60–80.
   - 3+ years full-time work → 80–100.
10. impact_score (0–100): Evaluate if bullets focus on OUTCOMES ("Achieved X by doing Y") vs. just DUTIES ("Responsible for Z"). High impact = measurable business value.
11. contact_completeness (0–100): Score based on presence of professional contact info: Email (25 pts), Phone (25 pts), LinkedIn (25 pts), GitHub/Portfolio (25 pts).
12. skill_alignment (0–100): Contextual matching. If they list 'React' and a project mentions 'Next.js', it is a match. Only penalize if skills are totally disconnected from history.

resume_quality_score = 0.25 × experience_depth + 0.20 × impact_score + 0.10 × bullet_strength + 0.10 × tech_stack_complexity + 0.10 × skill_alignment + 0.10 × quantification + 0.05 × repetition_penalty + 0.04 × contact_completeness + 0.03 × grammar_score + 0.03 × structure_score

STEP 4 — FINAL SCORE:
${finalScoreFormula}

STEP 5 — RECRUITER STRICTNESS MODE (MANDATORY):
- You are a recruiter at a top-tier firm. You value DURATION and PROGRESSION.
- DO NOT INFLATE SCORES.
- Experience Depth Rule: 2025 dates are in the PAST. Treat them as real, completed experience. 
- If a candidate has multiple internships at reputable companies, they should score much higher than someone with one project.
- Quantification: Requires hard numbers (%, $, #). No numbers in a bullet = 0 for that bullet's quantification.
- Repetitive verbs (3+ times) get -15 per verb in repetition_penalty.

STEP 6 — EDGE CASE PENALTIES:
• No bullet points → heavy penalty to bullet_strength
• Verb repetition 3+ times → MUST penalize repetition_penalty
• Missing skills section → reduce structure_score
• Resume too short (< 200 words) → penalty across all quality scores
• Only basic/beginner tech stack → penalize tech_stack_complexity

STEP 7 — FEEDBACK:
Provide 4–6 SPECIFIC, ACTIONABLE improvement suggestions. 
CRITICAL: DO NOT suggest adding a 'Professional Summary' or 'Objective'.
If tech stack is basic, suggest specific advanced tools to learn.
If experience is weak, suggest internships or open-source contributions.

All scores must be integers 0–100. Round to nearest integer.
Return the complete JSON response now.`

        const result = await model.generateContent(prompt)
        const scorecard = JSON.parse(result.response.text())

        return NextResponse.json(scorecard)
    } catch (err: any) {
        console.error("ATS Score API error:", err)
        return NextResponse.json(
            { error: err.message || "Failed to evaluate resume" },
            { status: 500 }
        )
    }
}
