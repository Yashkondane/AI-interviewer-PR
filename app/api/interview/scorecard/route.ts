import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { conversation, role, seniority } = await req.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            overall_score: { type: SchemaType.NUMBER },
            dimensions: {
              type: SchemaType.OBJECT,
              properties: {
                clarity: { type: SchemaType.NUMBER },
                structure: { type: SchemaType.NUMBER },
                relevance: { type: SchemaType.NUMBER },
                pacing: { type: SchemaType.NUMBER },
                confidence: { type: SchemaType.NUMBER },
              },
            },
            summary: { type: SchemaType.STRING },
            top_strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            areas_to_improve: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            answers: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  question: { type: SchemaType.STRING },
                  score: { type: SchemaType.NUMBER },
                  feedback: { type: SchemaType.STRING },
                  what_was_good: { type: SchemaType.STRING },
                  what_to_improve: { type: SchemaType.STRING },
                },
              },
            },
          },
        },
      },
    })

    const transcript = (conversation as { turn_index?: number; question: string; answer: string }[])
      .map((e, i) => `Q${e.turn_index || i + 1}: ${e.question}\nA${e.turn_index || i + 1}: ${e.answer || "(no answer given)"}`)
      .join("\n\n")

    const totalQuestions = conversation.length

    const prompt = `You are a warm, insightful interview coach. Analyze this ${role} interview at ${seniority} level.

Full transcript (${totalQuestions} questions):
${transcript}

INSTRUCTIONS:
1. Evaluate EVERY question-answer pair. You MUST return exactly ${totalQuestions} items in the "answers" array, one for each Q&A above, in the same order.
2. For Q1 (usually an introduction or "tell me about yourself"): this IS a real answer. Score the candidate's ability to present themselves clearly, mention relevant experience, and set the tone. Do NOT give it 0.
3. Use a realistic scoring range. Most decent answers should score 40-80. Reserve 90+ for exceptional responses and below 30 for truly empty/irrelevant answers.
4. Write feedback as if you're coaching a friend — be specific, encouraging, and actionable. For example: "You gave a great overview of your project, but adding a specific metric (like 'reduced load time by 40%') would make it even stronger."
5. The "summary" should be 2-3 sentences of overall impression, written warmly but honestly.
6. "top_strengths" should list 3-5 specific things the candidate did well.
7. "areas_to_improve" should list 3-5 concrete, actionable improvements.

Produce the complete scorecard with overall_score (0–100), dimension scores (clarity, structure, relevance, pacing, confidence each 0–100), summary, top_strengths, areas_to_improve, and per-answer feedback.`

    const result = await model.generateContent(prompt)
    const scorecard = JSON.parse(result.response.text())

    return NextResponse.json(scorecard)
  } catch (err) {
    console.error("Scorecard API error:", err)
    return NextResponse.json({ error: "Failed to generate scorecard" }, { status: 500 })
  }
}
