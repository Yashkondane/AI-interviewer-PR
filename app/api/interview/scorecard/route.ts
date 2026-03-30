import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { conversation, role, seniority, resume_text } = await req.json()

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
                resume_alignment: { type: SchemaType.NUMBER },
                fluency: { type: SchemaType.NUMBER },
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
    const resumeContext = resume_text ? `CANDIDATE RESUME:\n"""\n${resume_text}\n"""` : "No resume provided for cross-referencing."

    const prompt = `You are a CRITICAL, PROFESSIONAL Interview Coach. Analyze this ${role} interview at ${seniority} level.

${resumeContext}

TRANSCRIPT:
${transcript}

EVALUATION CRITERIA:
1. **Resume Alignment (0-100)**: 
   - Cross-reference the answers with the resume. 
   - Penalty: If the candidate lists a skill (e.g., Python, AWS) but struggles to talk about it or gives an incorrect answer, deduct 20 points from this dimension.
   - Reward: Honest, deep explanations of resume items.

2. **Fluency & Filler Analysis (0-100)**:
   - **Leniency Rule**: Common fillers ("uh", "um", "like", "you know") are allowed. Do NOT penalize for 1-2 uses per answer.
   - **Penalty Rule**: Deduct points if fillers are **excessive** (appearing in >15% of the total word count) or if they obstruct the meaning.
   - **Fumbles**: Penalize "false starts" (e.g., "I I I think... wait, no... I focused on...") or losing track of the sentence.

3. **Standard Dimensions (0-100 each)**: Clarity, Structure, Relevance, Pacing, Confidence.

INSTRUCTIONS:
1. Evaluate EVERY question-answer pair. Return exactly ${totalQuestions} items in "answers".
2. Write feedback as if you're coaching a high-stakes candidate — specific, direct, and actionable.
3. If the candidate fumbled a specific answer, mention the exact fumble in "what_to_improve" for that answer.
4. "summary" should be a high-level expert analysis (2-3 sentences).

Produce the complete JSON response.`

    const result = await model.generateContent(prompt)
    const scorecard = JSON.parse(result.response.text())

    return NextResponse.json(scorecard)
  } catch (err) {
    console.error("Scorecard API error:", err)
    return NextResponse.json({ error: "Failed to generate scorecard" }, { status: 500 })
  }
}
