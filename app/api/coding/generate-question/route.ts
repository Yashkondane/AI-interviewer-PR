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
                solutionExample: `import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:n+1]))\ntarget = int(data[-1])\nseen = set()\nfound = False\nfor x in nums:\n    if target - x in seen:\n        found = True\n        break\n    seen.add(x)\nprint("True" if found else "False")`
            },
            "javascript": {
                ext: "js",
                starterExample: `const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\n// Parse input and implement your solution\n// Use console.log() to print the result`,
                solutionExample: `const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst nums = input[1].split(' ').map(Number);\nconst target = parseInt(input[2]);\nconst seen = new Set();\nlet found = false;\nfor (const x of nums) {\n    if (seen.has(target - x)) { found = true; break; }\n    seen.add(x);\n}\nconsole.log(found ? "True" : "False");`
            },
            "java": {
                ext: "java",
                starterExample: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Parse input and implement your solution\n        // Use System.out.println() to print the result\n    }\n}`,
                solutionExample: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        Set<Integer> seen = new HashSet<>();\n        boolean found = false;\n        for (int x : nums) {\n            if (seen.contains(target - x)) { found = true; break; }\n            seen.add(x);\n        }\n        System.out.println(found ? "True" : "False");\n    }\n}`
            },
            "cpp": {
                ext: "cpp",
                starterExample: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Read input from stdin\n    // Implement your solution\n    // Print the result to stdout\n    return 0;\n}`,
                solutionExample: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> v(n);\n    for (auto& x : v) cin >> x;\n    int target; cin >> target;\n    unordered_set<int> seen;\n    bool found = false;\n    for (int x : v) {\n        if (seen.count(target - x)) { found = true; break; }\n        seen.insert(x);\n    }\n    cout << (found ? "True" : "False") << endl;\n    return 0;\n}`
            }
        }

        const langInfo = langExamples[language] || langExamples["python"]

        // Return a hardcoded problem instantly for testing
        const hardcodedProblem = {
            "title": "Two Sum (Existence)",
            "difficulty": "Easy",
            "topic": "Array",
            "statement": "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, determine if there exist two numbers in the array that add up to <code>target</code>.</p><p><strong>Input Format:</strong><br>The first line contains an integer <code>n</code>.<br>The second line contains <code>n</code> space-separated integers.<br>The third line contains the <code>target</code>.</p><p><strong>Output Format:</strong><br>Print \"True\" if such a pair exists, otherwise print \"False\".</p>",
            "starter_code": langInfo.starterExample,
            "reference_solution": langInfo.solutionExample,
            "test_cases": [
                { "input": "4\n2 7 11 15\n9", "expectedOutput": "True" },
                { "input": "3\n3 2 4\n6", "expectedOutput": "True" },
                { "input": "2\n3 3\n7", "expectedOutput": "False" }
            ]
        }

        const parsedData = hardcodedProblem

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
