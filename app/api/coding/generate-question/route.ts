import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { role, company, cp_level, language, sessionId } = body

        if (!role || !cp_level || !language) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const langExamples: Record<string, { ext: string, starterExample: string, solutionExample: string }> = {
            "python": {
                ext: "py",
                starterExample: `import sys\ninput_data = sys.stdin.read().split()\n# Parse input and implement your solution\n# Print the result to stdout`,
                solutionExample: `import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:n+1]))\nprint(sum(nums))`
            },
            "javascript": {
                ext: "js",
                starterExample: `const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\n// Parse input and implement your solution\n// Use console.log() to print the result`,
                solutionExample: `const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst nums = input[1].split(' ').map(Number);\nconsole.log(nums.reduce((a,b) => a+b, 0));`
            },
            "java": {
                ext: "java",
                starterExample: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Parse input and implement your solution\n        // Use System.out.println() to print the result\n    }\n}`,
                solutionExample: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        for (int i = 0; i < n; i++) sum += sc.nextInt();\n        System.out.println(sum);\n    }\n}`
            },
            "cpp": {
                ext: "cpp",
                starterExample: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Read input from stdin\n    // Implement your solution\n    // Print the result to stdout\n    return 0;\n}`,
                solutionExample: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> v(n);\n    for (auto& x : v) cin >> x;\n    cout << accumulate(v.begin(), v.end(), 0) << endl;\n    return 0;\n}`
            }
        }

        const langInfo = langExamples[language] || langExamples["python"]

        const prompt = `
You are an expert technical interviewer at ${company || 'a top tech company'}.
Generate a data structures and algorithms (DSA) coding problem for a ${cp_level} level candidate applying for a ${role} role.
The problem should be similar in style to LeetCode / Codeforces questions.

IMPORTANT: The code must be written in **competitive programming style** — it should read from STDIN and write to STDOUT.
It must be a COMPLETE, RUNNABLE program (with a main function if needed). NOT a class-based LeetCode solution.

Here is an example of the starter code style for ${language}:
${langInfo.starterExample}

Here is an example of a reference solution style for ${language}:
${langInfo.solutionExample}

You MUST return the output as a strictly formatted JSON object matching this schema exactly:
{
    "title": "Problem Title",
    "difficulty": "Easy/Medium/Hard",
    "topic": "Array/String/Graph/etc",
    "statement": "HTML formatted problem statement with <p>, <strong>, <pre> for examples. Include Input Format, Output Format, and Constraints sections.",
    "starter_code": "A complete runnable program skeleton in ${language} that reads from stdin and prints to stdout. Include the boilerplate (imports, main function, input parsing) but leave the core algorithm as a comment for the candidate to fill in.",
    "reference_solution": "A complete, working, optimal solution in ${language} that reads from stdin and prints to stdout",
    "test_cases": [
        { "input": "The exact stdin string (e.g. '3\\n1 2 3')", "expectedOutput": "The exact stdout string (e.g. '6')" }
    ]
}

CRITICAL RULES:
- Generate EXACTLY 10 test cases in the "test_cases" array. Include edge cases and standard inputs.
- The "input" field is the EXACT string that will be piped to stdin. Use newlines (\\n) to separate lines.
- The "expectedOutput" field is the EXACT string the program should print to stdout (trimmed).
- The starter_code MUST be a complete runnable program. For C++ include main(), for Java include public class Main with main(), etc.
- The starter_code should have comments showing where to implement the solution, but NO actual algorithm logic.
- VERY IMPORTANT: Each test case is run as a SEPARATE program execution with its own stdin. The code must read the input ONCE, solve it, print the answer, and EXIT. Do NOT use "while(cin >> ...)", "while(t--)", or any loop that reads multiple test cases. There is exactly ONE test case per execution.
- ALL test case input and expectedOutput values MUST be plain literal strings. Do NOT use code expressions, string concatenation, or function calls (e.g. " ".join(...), range(...), Array.from(...)). Write out the full literal value.
- Keep all test case inputs SHORT — maximum 200 characters each. For "large" test cases, use n=50 to n=100, not n=1000.
- Output ONLY the raw JSON. Do not include markdown formatting like \`\`\`json.
`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()
        
        // Robustly extract just the JSON object from the response
        const match = responseText.match(/\{[\s\S]*\}/)
        let jsonStr = match ? match[0] : responseText.trim()
        
        // Sanitize: remove any string concatenation expressions that Gemini sometimes puts in
        // e.g. "1000\n" + " ".join(...) + "\n1" → just keep the first literal part
        jsonStr = jsonStr.replace(/"[^"]*"\s*\+\s*[^,}\]]+/g, (match) => {
            // Try to extract just the first quoted string
            const firstQuote = match.match(/^"([^"]*)"/)
            return firstQuote ? firstQuote[0] : '""'
        })
        
        let parsedData
        try {
            parsedData = JSON.parse(jsonStr)
        } catch (parseError) {
            console.error("Failed to parse Gemini output:", jsonStr.substring(0, 500))
            return NextResponse.json({ error: "Failed to generate a valid question format from AI" }, { status: 500 })
        }

        // Validate that we got test cases
        if (!parsedData.test_cases || parsedData.test_cases.length === 0) {
            return NextResponse.json({ error: "AI did not generate test cases" }, { status: 500 })
        }

        // Save to Supabase (if sessionId is provided)
        let savedQuestion = null
        if (sessionId) {
            const { data, error } = await supabase
                .from("generated_questions")
                .insert({
                    session_id: sessionId,
                    title: parsedData.title,
                    statement: parsedData.statement,
                    difficulty: parsedData.difficulty,
                    topic: parsedData.topic,
                    starter_code: parsedData.starter_code,
                    test_cases: parsedData.test_cases,
                    reference_solution: parsedData.reference_solution
                })
                .select()
                .single()
            
            if (error) {
                console.error("Failed to save generated question to DB:", error)
                // Continue anyway so the frontend can still use it
            } else {
                savedQuestion = data
            }
        }

        return NextResponse.json({
            question: parsedData,
            dbId: savedQuestion?.id
        })

    } catch (err: any) {
        console.error("Generate Question Error:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
