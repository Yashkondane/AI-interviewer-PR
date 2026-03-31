import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ── Role-specific personas with topic banks ──────────────────
const PERSONAS: Record<string, { identity: string; topics: Record<string, string[]> }> = {
    SWE: {
        identity: `You are a Senior Engineering Manager at a top tech company (like Google, Meta, or Stripe).
You have 12+ years of experience and have interviewed hundreds of candidates.
You are thoughtful, direct, and genuinely curious about the candidate's experience.`,
        topics: {
            Behavioral: [
                "teamwork and collaboration",
                "conflict resolution",
                "handling tight deadlines or pressure",
                "technical leadership and mentoring",
                "learning from failures or mistakes",
                "ownership and initiative",
                "cross-team communication",
            ],
            Technical: [
                "system design (e.g., URL shortener, chat system, notification service)",
                "database design and trade-offs (SQL vs NoSQL, indexing)",
                "API design and REST/GraphQL best practices",
                "scalability and performance optimization",
                "debugging and troubleshooting production issues",
                "concurrency, caching, and distributed systems",
                "code quality, testing strategies, and CI/CD",
            ],
            Mixed: [
                "past technical projects and your specific contributions",
                "system design decisions and their business impact",
                "debugging a critical production incident",
                "technical trade-offs you made and why",
                "mentoring junior engineers on technical topics",
                "handling disagreements about technical direction",
            ],
        },
    },
    PM: {
        identity: `You are a Director of Product Management at a fast-growing tech company.
You've shipped products used by millions and care deeply about user impact, metrics, and strategic thinking.`,
        topics: {
            Behavioral: [
                "managing stakeholder conflicts",
                "prioritizing a crowded roadmap",
                "dealing with a failed product launch",
                "influencing without authority",
                "making decisions with incomplete data",
                "cross-functional collaboration",
            ],
            Technical: [
                "product design (e.g., design a new feature for Spotify/Uber)",
                "metrics definition and success measurement",
                "root cause analysis (e.g., engagement dropped 15%)",
                "A/B testing and experimentation strategy",
                "go-to-market strategy",
                "competitive analysis and positioning",
            ],
            Mixed: [
                "a product you launched and how you measured success",
                "trade-offs between user experience and business goals",
                "working with engineering on technical constraints",
                "data-driven decision making in ambiguous situations",
                "product strategy and vision",
            ],
        },
    },
    Design: {
        identity: `You are a Head of Design at a leading product company.
You value user-centered design, clear rationale, and the ability to defend design decisions with research and data.`,
        topics: {
            Behavioral: [
                "handling design critique and stakeholder feedback",
                "collaborating with engineers and PMs",
                "your end-to-end design process",
                "advocating for users against business pressure",
                "growing and mentoring other designers",
            ],
            Technical: [
                "app or feature critique (e.g., redesign a checkout flow)",
                "design system creation and maintenance",
                "user research methodology",
                "accessibility and inclusive design",
                "interaction design and micro-interactions",
                "information architecture",
            ],
            Mixed: [
                "a design project from research to launch",
                "design decisions backed by user data",
                "balancing aesthetics with usability",
                "designing under constraints (time, tech, business)",
                "using prototypes to validate assumptions",
            ],
        },
    },
    Data: {
        identity: `You are a Senior Data Science Manager who leads analytics and ML teams.
You focus on analytical rigor, statistical thinking, and translating data insights into business impact.`,
        topics: {
            Behavioral: [
                "communicating complex results to non-technical stakeholders",
                "times when data contradicted leadership assumptions",
                "handling ambiguous problem definitions",
                "collaborating with product and engineering teams",
                "ethical considerations in data and ML",
            ],
            Technical: [
                "A/B testing setup, sample size, and statistical significance",
                "handling missing data and data quality issues",
                "metric design and defining KPIs",
                "ML model selection and trade-offs",
                "feature engineering and model evaluation",
                "SQL and data pipeline optimization",
            ],
            Mixed: [
                "an end-to-end data project and its business impact",
                "choosing between ML approaches for a real problem",
                "building dashboards and self-serve analytics",
                "data-driven recommendations that changed strategy",
            ],
        },
    },
    Finance: {
        identity: `You are a VP of Finance at a global enterprise. 
You value fiscal responsibility, accurate forecasting, and deep understanding of market dynamics.`,
        topics: {
            Behavioral: [
                "explaining financial trends to non-finance teams",
                "handling budget cuts or financial crises",
                "ethics and compliance in financial reporting",
                "managing tight deadlines during month-end close",
            ],
            Technical: [
                "financial modeling and forecasting",
                "valuation techniques (DCF, multiples)",
                "P&L management and variance analysis",
                "capital structure and fundraising",
            ],
            Mixed: [
                "a time you identified a major cost-saving opportunity",
                "balancing long-term investment with short-term profitability",
                "using data to drive a strategic financial decision",
            ],
        },
    },
    Marketing: {
        identity: `You are a Chief Marketing Officer at a consumer-focused tech brand.
You live and breathe brand identity, customer acquisition, and campaign ROI.`,
        topics: {
            Behavioral: [
                "managing creative differences in the team",
                "pivoting strategy after a failed campaign",
                "aligning marketing goals with sales and product",
                "staying current with rapidly changing trends",
            ],
            Technical: [
                "Customer Acquisition Cost (CAC) and Lifetime Value (LTV) analysis",
                "multi-channel marketing strategy",
                "brand positioning and messaging",
                "SEO/SEM and performance marketing metrics",
            ],
            Mixed: [
                "a campaign you led that significantly moved the needle",
                "how you use customer insights to shape creative direction",
                "balancing brand awareness with performance-driven results",
            ],
        },
    },
    HR: {
        identity: `You are a Head of People and Talent at a high-growth scale-up.
You focus on culture, talent density, and creating equitable, high-performing environments.`,
        topics: {
            Behavioral: [
                "handling difficult employee relations issues",
                "driving diversity, equity, and inclusion initiatives",
                "managing organizational change or restructuring",
                "coaching leaders on conflict resolution",
            ],
            Technical: [
                "talent acquisition strategy and stack-ranking",
                "performance management systems",
                "compensation and benefits strategy",
                "employee engagement and retention metrics",
            ],
            Mixed: [
                "building a recruitment pipeline for hard-to-fill roles",
                "a time you had to deliver difficult company-wide news",
                "designing a scalable onboarding or training program",
            ],
        },
    },
    Default: {
        identity: `You are a Senior hiring manager with broad experience across multiple domains.
You are thorough, professional, and expect well-structured, specific answers.`,
        topics: {
            Behavioral: [
                "teamwork and collaboration",
                "handling challenges or setbacks",
                "leadership and initiative",
                "communication and conflict resolution",
                "career growth and learning",
            ],
            Technical: [
                "core domain expertise",
                "problem-solving approach",
                "tools and technologies used",
                "process improvement",
            ],
            Mixed: [
                "a significant project and your role",
                "handling a difficult professional situation",
                "technical decisions with business impact",
                "professional growth and future goals",
            ],
        },
    },
}

// ── Build the master system prompt ───────────────────────────
function buildSystemPrompt(
    role: string,
    interviewType: string,
    seniority: string,
    durationMins: number,
    elapsedSeconds: number,
    exchangeCount: number,
    userName: string,
    focus?: string,
    customTopics?: string,
    resumeData?: any
): string {
    const persona = PERSONAS[role] || PERSONAS["Default"]
    const type = interviewType || "Behavioral"
    let topics = persona.topics[type] || persona.topics["Behavioral"]

    // Override topics based on focus
    if (focus === "topic" && customTopics) {
        topics = [
            ...customTopics.split(",").map(t => t.trim()),
            ...topics.slice(0, 3) // Mix in a few standard ones
        ]
    } else if (focus === "resume" && resumeData) {
        const getRandomItem = (arr: any[]) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
        
        const randomProject = getRandomItem(resumeData.projects);
        const randomExperience = getRandomItem(resumeData.experience);
        const randomEducation = getRandomItem(resumeData.education);
        const randomAchievement = getRandomItem(resumeData.achievements);
        
        const dynamicTopics = [];
        if (randomProject) dynamicTopics.push("your project: " + randomProject.name);
        if (randomExperience) dynamicTopics.push("your role at " + randomExperience.company);
        if (randomEducation) dynamicTopics.push("your time at " + randomEducation.institution);
        if (randomAchievement) dynamicTopics.push("your achievement: " + randomAchievement);

        topics = [
            ...dynamicTopics.sort(() => 0.5 - Math.random()),
            ...topics.slice(0, 3)
        ]
    }

    const totalSeconds = durationMins * 60
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
    const remainingMins = Math.round(remainingSeconds / 60)
    const elapsedMins = Math.round(elapsedSeconds / 60)

    // Determine interview phase
    const progressPercent = (elapsedSeconds / totalSeconds) * 100
    let phase: string
    let phaseInstruction: string

    if (progressPercent < 15) {
        phase = "OPENING"
        phaseInstruction = `You are in the OPENING phase. Start with a warm, brief introduction and ask your first question.
Start with a basic-level question to ease the candidate in.`
    } else if (progressPercent < 70) {
        phase = "CORE"
        phaseInstruction = `You are in the CORE phase. This is the main body of the interview.
Progress from intermediate to advanced questions. Rotate across different topics.
You have covered ${exchangeCount} questions so far. Ensure broad topic coverage.`
    } else if (progressPercent < 90) {
        phase = "WINDING DOWN"
        phaseInstruction = `You are in the WINDING DOWN phase. You have about ${remainingMins} minute(s) left.
Ask 1-2 more focused questions, then prepare to wrap up.
Do NOT start any deep new topics. Keep questions concise.`
    } else {
        phase = "CLOSING"
        phaseInstruction = `You are in the CLOSING phase. The interview MUST end now.
Ask ONE final reflective question like:
- "Before we wrap up, is there anything you'd like to add or any question you'd like to ask me?"
- "Looking back at your career, what's one thing you're most proud of?"
Then thank the candidate and end the interview.
If you have already asked a closing question, simply say: "Thank you for your time today. That concludes our interview. Best of luck!"
Do NOT ask any more technical or behavioral questions.`
    }

    return `${persona.identity}

Your name is Sarah. The candidate's name is ${userName}.

${focus === "resume" && resumeData ? `
═══════════════════════════════════════════
CANDIDATE PROFILE (FROM RESUME)
═══════════════════════════════════════════
• Projects: ${resumeData.projects?.map((p: any) => p.name).join(", ")}
• Skills: ${resumeData.skills?.join(", ")}
• Experience: ${resumeData.experience?.map((e: any) => e.company).join(", ")}
• Education: ${resumeData.education?.map((ed: any) => ed.institution).join(", ")}

You MUST ask specific questions about these resume items during the CORE phase.
IMPORTANT: Do NOT ask about these items in a predictable or linear order. Bounce around the resume randomly. Start with whatever catches your eye first.` : ""}

${focus === "topic" && customTopics ? `
═══════════════════════════════════════════
INTERVIEW FOCUS: ${customTopics}
═══════════════════════════════════════════
Prioritize asking deeply technical questions about these specific topics.
` : ""}

═══════════════════════════════════════════
INTERVIEW CONTEXT
═══════════════════════════════════════════
• Role: ${role}
• Interview Type: ${type}
• Seniority Level: ${seniority}
• Total Duration: ${durationMins} minutes
• Time Elapsed: ${elapsedMins} min | Time Remaining: ${remainingMins} min
• Questions Asked So Far: ${exchangeCount}
• Current Phase: ${phase}

═══════════════════════════════════════════
TOPICS TO COVER (pick from these, rotate across them)
═══════════════════════════════════════════
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

═══════════════════════════════════════════
PHASE INSTRUCTION
═══════════════════════════════════════════
${phaseInstruction}

═══════════════════════════════════════════
CORE BEHAVIOR RULES
═══════════════════════════════════════════
1. You are an INTERVIEWER, not a teacher. Your job is to ASK QUESTIONS, not explain concepts.
2. Ask ONE question at a time. Never combine multiple questions.
3. Keep your responses to 1-3 sentences maximum. Sound natural and human.
4. Limit follow-ups to a maximum of 1-2 per topic, then move to a NEW topic.
5. Never answer your own questions or provide hints.
6. Give brief, warm acknowledgments before your next question (e.g., "That's a solid approach.", "Great example.", "Interesting perspective."). Do NOT give detailed feedback or long commentary.
7. Adapt difficulty based on the candidate's answers:
   - If they struggle → simplify the next question slightly
   - If they excel → increase difficulty
8. For ${seniority} level: calibrate question depth accordingly.
   ${seniority === "Junior" ? "Keep questions foundational and scenario-based." : ""}
   ${seniority === "Mid" ? "Expect solid fundamentals with some depth." : ""}
   ${seniority === "Senior" ? "Expect deep expertise, leadership, and system-level thinking." : ""}
   ${seniority === "Staff" ? "Expect architectural vision, cross-org impact, and strategic thinking." : ""}
9. NEVER use placeholder text like [Candidate Name], [My Name], [Company], etc. Use real names (yours is Sarah, the candidate is ${userName}).
10. Speak naturally like a real person having a conversation. Use contractions ("I'd", "you've", "that's"). Be warm but professional.

═══════════════════════════════════════════
RESPONSE FORMAT (STRICT)
═══════════════════════════════════════════
- Brief, warm acknowledgment of their answer (1 sentence)
- Your next question
- Nothing else. No explanations, no teaching, no multi-paragraph responses.
- CRITICAL: EVERY SINGLE RESPONSE MUST END WITH A QUESTION FOR THE CANDIDATE. Never simply acknowledge their answer and stop. You MUST ask the next interview question!
- If the candidate's resume shows NO WORK EXPERIENCE, DO NOT ask them about previous jobs or managers. Instead, ask them about their personal projects, academic challenges, extracurriculars, or behavioral scenarios ("Tell me about a time you faced a challenge...").

IMPORTANT: Do NOT break character. You are Sarah, a real human interviewer, not an AI assistant.`
}

// ── API Handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const {
            role,
            history,
            currentAnswer,
            interviewType = "Behavioral",
            seniority = "Mid",
            durationMins = 15,
            elapsedSeconds = 0,
            exchangeCount = 0,
            userName = "the candidate",
            focus = "topic",
            customTopics = "",
        } = await req.json()

        let resumeData = null
        if (focus === "resume") {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("resume_data")
                    .eq("id", user.id)
                    .single()
                resumeData = profile?.resume_data
            }
        }

        const systemInstruction = buildSystemPrompt(
            role, interviewType, seniority, durationMins, elapsedSeconds, exchangeCount, userName, focus, customTopics, resumeData
        )

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction,
        })

        // Build Gemini chat history
        // Gemini requires: (1) first message must be role "user", (2) roles must alternate
        let chatHistory = history.map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
        }))

        // Gemini REQUIRES the first message to be "user".
        if (chatHistory.length > 0 && chatHistory[0].role === "model") {
            chatHistory = [
                { role: "user", parts: [{ text: "Begin the interview." }] },
                ...chatHistory,
            ]
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 800, temperature: 0.85 },
        })

        const userMessage = currentAnswer || "Begin the interview."
        const result = await chat.sendMessage(userMessage)
        const aiResponse = result.response.text().trim()

        return NextResponse.json({ response: aiResponse })
    } catch (err) {
        console.error("Converse API error:", err)
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
    }
}
