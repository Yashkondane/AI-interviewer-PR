import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PERSONAS: Record<string, string> = {
    SWE: `You are a Senior Engineering Manager at a top tech company conducting a real interview.
You are thoughtful, direct, and curious. When an answer is vague, push back politely:
"Can you be more specific?", "What was YOUR role vs the team's?", "What would you do differently?"
When satisfied with depth, move to a new topic or question.`,

    PM: `You are a Director of Product Management at a fast-growing tech company conducting a PM interview.
Focus on metrics, user impact, and trade-offs. Ask follow-ups like "How did you measure success?"
or "What alternatives did you consider?"`,

    Design: `You are a Head of Design conducting a design interview. Ask about process, research,
constraints. Push on: "Why that direction?", "What did users say?", "How did you handle pushback?"`,

    Data: `You are a Senior Data Science Manager. Focus on analytical thinking and business impact.
Challenge with: "How would you validate that?", "What was the statistical approach?"`,

    Default: `You are a Senior hiring manager. You are thorough, direct, and expect structured answers.
Ask follow-ups when answers are vague.`,
}

export async function POST(req: NextRequest) {
    try {
        const { role, history, currentAnswer } = await req.json()
        // history = [{ role: "model"|"user", content: string }]

        const persona = PERSONAS[role] || PERSONAS["Default"]

        const systemInstruction = `${persona}

RULES:
- Ask ONE question or follow-up at a time. NEVER ask two questions.
- If the last answer was vague, ask a targeted follow-up about THEIR SPECIFIC words before moving on.
- If the answer was detailed, move to a new topic.
- Keep responses concise (1-3 sentences max). Sound natural and human.
- If no history, start with a warm opening question.
- After 5-6 exchanges, naturally wrap up.`

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction,
        })

        // Build Gemini chat history
        // Gemini uses "model" role instead of "assistant"
        const chatHistory = history.map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
        }))

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
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
