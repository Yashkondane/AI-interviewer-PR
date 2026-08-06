import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"
import { PROBLEM_BANK, STARTER_TEMPLATES } from "@/lib/dsa-problems"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

// ── Difficulty → CP level mapping ────────────────────────────
const DIFFICULTY_MAP: Record<string, string[]> = {
    "Beginner":     ["Easy"],
    "Intermediate": ["Easy", "Medium"],
    "Advanced":     ["Medium", "Hard"],
    "Expert":       ["Hard"],
}

// ── Already-given question titles per session ───────────────
const sessionQuestionCache = new Map<string, string[]>()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { role, company, cp_level, language, sessionId } = body

        if (!role || !cp_level || !language) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const difficulties = DIFFICULTY_MAP[cp_level] || ["Medium"]
        const lang = language || "python"

        // Track which questions we've already given in this session
        const previousTitles = sessionQuestionCache.get(sessionId) || []

        // Filter problem bank by difficulty and un-used status
        const eligibleFromBank = PROBLEM_BANK.filter(
            p => difficulties.includes(p.difficulty) && !previousTitles.includes(p.title)
        )

        let selectedProblem: any = null

        // 1. Pick instantly from curated Bank if available (FAST PATH)
        if (eligibleFromBank.length > 0) {
            const raw = eligibleFromBank[Math.floor(Math.random() * eligibleFromBank.length)]
            selectedProblem = {
                ...raw,
                starter_code: typeof raw.starter_code === "object" 
                    ? (raw.starter_code[lang] || raw.starter_code["python"]) 
                    : raw.starter_code
            }
        } 
        // 2. Fallback to Gemini if bank is exhausted for that difficulty (SLOW PATH)
        else {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
            const prompt = `Generate ONE unique DSA algorithm coding problem for a ${role} role.
Difficulty: ${difficulties[0]}
Target Language: ${lang}
Return strictly JSON with keys: title, difficulty, topic, statement (HTML), starter_code, test_cases (array of 5 {input, expectedOutput}).`
            
            try {
                const result = await model.generateContent(prompt)
                const responseText = result.response.text().trim()
                const jsonStr = responseText.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
                selectedProblem = JSON.parse(jsonStr)
            } catch (err) {
                const fallback = PROBLEM_BANK[0]
                selectedProblem = {
                    ...fallback,
                    starter_code: fallback.starter_code[lang] || fallback.starter_code["python"]
                }
            }
        }

        // Track title
        if (sessionId) {
            const existing = sessionQuestionCache.get(sessionId) || []
            existing.push(selectedProblem.title)
            sessionQuestionCache.set(sessionId, existing)
        }

        // Save to Supabase (non-blocking)
        let savedQuestion = null
        if (sessionId) {
            try {
                const { data } = await supabase
                    .from("generated_questions")
                    .insert({
                        session_id: sessionId,
                        title: selectedProblem.title,
                        statement: selectedProblem.statement,
                        difficulty: selectedProblem.difficulty,
                        topic: selectedProblem.topic,
                        starter_code: selectedProblem.starter_code,
                        test_cases: selectedProblem.test_cases,
                    })
                    .select()
                    .single()
                savedQuestion = data
            } catch (e) {
                console.error("DB save error:", e)
            }
        }

        return NextResponse.json({
            question: selectedProblem,
            dbId: savedQuestion?.id
        })

    } catch (err: any) {
        console.error("Generate Question Error:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
