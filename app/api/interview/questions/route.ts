import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ROLE_CONTEXT: Record<string, string> = {
    SWE: "a software engineering role (coding, system design, problem solving)",
    PM: "a product management role (product sense, metrics, strategy, execution)",
    Design: "a UX/product design role (design process, case studies, user research)",
    Data: "a data analyst / data science role (analytics, SQL, A/B testing, insights)",
    Finance: "a finance or investment banking role (financial modeling, markets, valuation)",
    Marketing: "a marketing and growth role (campaigns, metrics, brand, channels)",
    HR: "an HR or recruiting role (talent acquisition, culture, processes)",
    Other: "a general professional role",
}

export async function POST(req: NextRequest) {
    try {
        const { role, company, seniority, interview_type } = await req.json()

        const roleCtx = ROLE_CONTEXT[role] || ROLE_CONTEXT["Other"]
        const companyCtx = company ? ` at ${company}` : ""
        const typeCtx =
            interview_type === "Behavioral" ? "behavioral (STAR-method) questions only" :
                interview_type === "Technical" ? "technical and role-specific questions only" :
                    "a mix of behavioral and technical questions"

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = `You are an expert interviewer. Generate interview opening questions for ${roleCtx}${companyCtx}.
Seniority level: ${seniority}. Focus on ${typeCtx}.
Return ONLY a valid JSON object with this format: { "questions": ["question1", "question2", ...] }
Generate 6-8 opening questions. Make them specific, realistic, and appropriately challenging for a ${seniority} candidate.
Do not include any markdown formatting or code blocks — just raw JSON.`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        // Strip markdown code fences if Gemini adds them
        const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
        const parsed = JSON.parse(clean)

        return NextResponse.json({ questions: parsed.questions || [] })
    } catch (err) {
        console.error("Questions API error:", err)
        return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
    }
}
