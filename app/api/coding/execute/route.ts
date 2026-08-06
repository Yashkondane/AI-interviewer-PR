import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

// ── OneCompiler API (free execution engine without whitelist) ─────
const ONECOMPILER_API_URL = "https://onecompiler.com/api/code/exec"

// Map our frontend language names to OneCompiler language + filename
const LANGUAGE_CONFIG: Record<string, { language: string; filename: string }> = {
    "javascript": { language: "nodejs", filename: "main.js" },
    "python":     { language: "python", filename: "main.py" },
    "java":       { language: "java",   filename: "Main.java" },
    "cpp":        { language: "cpp",    filename: "main.cpp" },
}

// ── Normalize output for comparison ──────────────────────────
function normalizeOutput(output: string): string {
    return output
        .replace(/\r\n/g, "\n")   // Normalize Windows line endings
        .replace(/\r/g, "\n")     // Normalize old Mac line endings
        .trim()                    // Strip leading/trailing whitespace
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, code, language, testCases: clientTestCases = [], questionId, sessionId } = body

        if (!code || !language) {
            return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
        }

        const langConfig = LANGUAGE_CONFIG[language]
        if (!langConfig) {
            return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
        }

        const testCases = clientTestCases

        // ── Free-run mode (no test cases) ────────────────────
        // Use the first test case input if available, otherwise run with empty stdin
        if (testCases.length === 0) {
            const result = await executeCode(code, langConfig, "")
            
            if (result.exception) {
                return NextResponse.json({
                    output: `Error:\n${result.exception}`,
                    results: []
                })
            }

            const output = result.stdout || result.stderr || "Execution completed with no output."
            return NextResponse.json({
                output: output.trim(),
                results: []
            })
        }

        // ── Execute against test cases ───────────────────────
        let passedCount = 0
        const evaluatedResults = []

        for (const tc of testCases) {
            try {
                const result = await executeCode(code, langConfig, tc.input)

                // Check for compilation/runtime errors
                if (result.exception) {
                    evaluatedResults.push({
                        passed: false,
                        actualOutput: "",
                        error: `Error:\n${result.exception.trim()}`,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput
                    })
                    continue
                }

                const stdout = result.stdout || ""
                const stderr = result.stderr || ""

                // Runtime error (stderr present, or exception)
                if (stderr) {
                    evaluatedResults.push({
                        passed: false,
                        actualOutput: stdout.trim(),
                        error: `Runtime/Compilation Error:\n${stderr.trim()}`,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput
                    })
                    continue
                }

                // Normalize and compare outputs
                const normalizedActual = normalizeOutput(stdout)
                const normalizedExpected = normalizeOutput(String(tc.expectedOutput))
                const passed = normalizedActual === normalizedExpected

                if (passed) passedCount++

                evaluatedResults.push({
                    passed,
                    actualOutput: normalizedActual || "(empty output)",
                    error: undefined,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput
                })
            } catch (e: any) {
                evaluatedResults.push({
                    passed: false,
                    actualOutput: "",
                    error: `Execution failed: ${e.message}`,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput
                })
            }
            
            // Add a 300ms delay between API calls to prevent OneCompiler rate limiting
            await new Promise(r => setTimeout(r, 300))
        }

        // ── Save submission to DB on "submit" action ─────────
        if (action === "submit" && questionId && sessionId) {
            try {
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
            } catch (dbErr) {
                console.error("Failed to save submission:", dbErr)
            }
        }

        return NextResponse.json({
            output: `Completed ${testCases.length} test case${testCases.length > 1 ? "s" : ""}. ${passedCount}/${testCases.length} passed.`,
            results: evaluatedResults,
            passed: passedCount,
            total: testCases.length
        })

    } catch (err: any) {
        console.error("Execution error:", err)
        return NextResponse.json({ error: err.message || "Execution failed" }, { status: 500 })
    }
}

// ── Execute code via OneCompiler API ─────────────────────────
async function executeCode(
    code: string, 
    config: { language: string; filename: string }, 
    stdin: string
) {
    const res = await fetch(ONECOMPILER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            properties: {
                language: config.language,
                files: [{ name: config.filename, content: code }],
                stdin: stdin
            }
        }),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`OneCompiler API error (${res.status}): ${text}`)
    }

    return res.json()
}
