import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { conversation, role, seniority } = await req.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
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

    const transcript = (conversation as { question: string; answer: string }[])
      .map((e, i) => `Q${i + 1}: ${e.question}\nA${i + 1}: ${e.answer || "(no answer given)"}`)
      .join("\n\n")

    const prompt = `You are an expert interview coach. Analyze this ${role} interview at ${seniority} level.

Full transcript:
${transcript}

Evaluate the answers and produce a complete scorecard with overall_score (0–100), 
dimension scores (clarity, structure, relevance, pacing, confidence each 0–100),
a summary, top_strengths list, areas_to_improve list, and per-answer feedback.`

    const result = await model.generateContent(prompt)
    const scorecard = JSON.parse(result.response.text())

    return NextResponse.json(scorecard)
  } catch (err) {
    console.error("Scorecard API error:", err)
    return NextResponse.json({ error: "Failed to generate scorecard" }, { status: 500 })
  }
}
