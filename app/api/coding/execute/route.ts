import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

const EXECUTE_API_URL = "https://onecompiler.com/api/code/exec"

// Map our frontend language names to OneCompiler language names
const LANGUAGE_MAP: Record<string, string> = {
    "javascript": "nodejs",
    "python": "python",
    "java": "java",
    "cpp": "cpp"
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, code, language, testCases: clientTestCases = [], questionId, sessionId } = body

        if (!code || !language) {
            return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
        }

        const langConfig = LANGUAGE_MAP[language]
        if (!langConfig) {
            return NextResponse.json({ error: "Unsupported language" }, { status: 400 })
        }

        const testCases = clientTestCases

        // If no test cases are available (e.g. freestyle coding), just execute it once without stdin
        if (testCases.length === 0) {
            const result = await executeCode(code, langConfig, "")
            const output = result.stdout || result.stderr || result.exception || "Execution completed with no output";
            return NextResponse.json({
                output: output,
                results: []
            })
        }

        // Execute against test cases
        const results = []
        let passedCount = 0

        // OneCompiler API has strict rate limits, so we must execute sequentially
        const executeWithLimit = async (cases: any[]) => {
            const resultsList = []
            for (const tc of cases) {
                try {
                    const res = await executeCode(code, langConfig, tc.input)
                    if (res.exception) {
                        resultsList.push({ passed: false, actualOutput: "", error: res.exception, input: tc.input, expectedOutput: tc.expectedOutput })
                        continue
                    }
                    const output = res.stdout ? res.stdout.trim() : ""
                    const stderr = res.stderr ? res.stderr.trim() : ""
                    
                    const passed = output === String(tc.expectedOutput).trim()
                    if (passed) passedCount++
                    
                    resultsList.push({
                        passed,
                        actualOutput: output || stderr,
                        error: stderr ? "Runtime/Compilation Error" : undefined,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput
                    })
                } catch (e: any) {
                    resultsList.push({ passed: false, actualOutput: "", error: e.message, input: tc.input, expectedOutput: tc.expectedOutput })
                }
                // Small delay to prevent rate limiting
                await new Promise(r => setTimeout(r, 200))
            }
            return resultsList
        }

        const evaluatedResults = await executeWithLimit(testCases)

        // If action is submit, save submission to DB
        if (action === "submit" && questionId && sessionId) {
            await supabase.from("coding_submissions").insert({
                session_id: sessionId,
                question_id: questionId,
                code,
                language,
                status: passedCount === testCases.length ? "success" : "failed",
                passed_cases: passedCount,
                total_cases: testCases.length,
                score: Math.round((passedCount / testCases.length) * 100)
            })
        }

        return NextResponse.json({
            output: `Completed ${testCases.length} test cases. ${passedCount} passed.`,
            results: evaluatedResults,
            passed: passedCount,
            total: testCases.length
        })

    } catch (err: any) {
        console.error("Execution error:", err)
        return NextResponse.json({ error: err.message || "Execution failed" }, { status: 500 })
    }
}

async function executeCode(code: string, langConfig: string, stdin: string) {
    const EXT_MAP: Record<string, string> = {
        "nodejs": "js",
        "python": "py",
        "java": "java",
        "cpp": "cpp"
    }
    const FILE_NAME_MAP: Record<string, string> = {
        "java": "Main"  // Java requires class name to match file name
    }
    const ext = EXT_MAP[langConfig] || langConfig
    const baseName = FILE_NAME_MAP[langConfig] || "main"
    const res = await axios.post(EXECUTE_API_URL, {
        properties: {
            language: langConfig,
            files: [{ name: `${baseName}.${ext}`, content: code }],
            stdin: stdin
        }
    }, { timeout: 10000 })
    return res.data
}
