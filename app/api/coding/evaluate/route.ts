import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, language, problemStatement, passedCases, totalCases, testResults } = body

        if (!code || !problemStatement) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
You are an expert technical interviewer evaluating a candidate's submitted code for a DSA problem.

Problem Statement:
${problemStatement}

Candidate's Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Test Results: Passed ${passedCases} out of ${totalCases} test cases.

Evaluate the candidate's solution based on:
1. Approach and logic
2. Time and Space Complexity
3. Code quality and readability
4. Edge cases missed (based on the failed test cases, if any)

Return a strictly formatted JSON object matching this schema exactly:
{
    "score": 0-100 (integer representing overall code quality and correctness),
    "timeComplexity": "e.g., O(N)",
    "spaceComplexity": "e.g., O(1)",
    "strengths": ["list of 1-3 strengths"],
    "weaknesses": ["list of 1-3 areas for improvement"],
    "feedback": "A short, professional paragraph summarizing their performance."
}

Output ONLY the raw JSON. Do not include markdown formatting like \`\`\`json.
`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()
        
        // Strip markdown if Gemini accidentally included it
        const jsonStr = responseText.replace(/^```json\n?/, '').replace(/```$/, '').trim()
        
        let parsedData
        try {
            parsedData = JSON.parse(jsonStr)
        } catch (parseError) {
            console.error("Failed to parse Gemini evaluation output:", jsonStr)
            return NextResponse.json({ error: "Failed to parse AI evaluation" }, { status: 500 })
        }

        return NextResponse.json({ evaluation: parsedData })

    } catch (err: any) {
        console.error("Evaluate API Error:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
