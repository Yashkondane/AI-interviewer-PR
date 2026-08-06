"use client"

import { useState, useCallback } from "react"
import { useCodingStore, QuestionResult } from "@/hooks/use-coding-store"
import { STARTER_TEMPLATES } from "@/lib/dsa-problems"
import Editor from "@monaco-editor/react"
import { Play, Send, Maximize2, Minimize2, Loader2, CheckCircle2, XCircle, Trophy, AlertTriangle, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Minimum time thresholds (seconds) before flagging as suspicious ──
const SUSPICIOUS_TIME: Record<string, number> = {
    "Easy": 120,      // < 2 min
    "Medium": 180,    // < 3 min
    "Hard": 300,      // < 5 min
}

function getCodeQuality(passRate: number, hintLevel: number): QuestionResult['codeQuality'] {
    if (passRate >= 90 && hintLevel === 0) return 'excellent'
    if (passRate >= 70) return 'good'
    if (passRate >= 40) return 'average'
    return 'needs-improvement'
}

// ── Animated Result Popup ──
function ResultPopup() {
    const { currentResult, questionNumber, totalQuestions, showResultPopup } = useCodingStore()
    const store = useCodingStore

    if (!showResultPopup || !currentResult) return null

    const isLastQuestion = questionNumber >= totalQuestions
    const passRate = Math.round((currentResult.passed / currentResult.total) * 100)
    const timeMins = Math.floor(currentResult.timeTakenSecs / 60)
    const timeSecs = currentResult.timeTakenSecs % 60

    const qualityColors: Record<string, string> = {
        'excellent': 'text-green-400',
        'good': 'text-blue-400',
        'average': 'text-yellow-400',
        'needs-improvement': 'text-red-400',
    }

    const qualityLabels: Record<string, string> = {
        'excellent': '🌟 Excellent',
        'good': '👍 Good',
        'average': '📝 Average',
        'needs-improvement': '🔧 Needs Improvement',
    }

    const handleNext = () => {
        if (isLastQuestion) {
            store.getState().completeSession()
        } else {
            store.getState().advanceToNextQuestion()
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-popIn">
                {/* Header */}
                <div className="text-center mb-6">
                    {passRate >= 70 ? (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4 animate-bounce">
                            <Trophy className="w-10 h-10 text-green-400" />
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-4">
                            <Star className="w-10 h-10 text-yellow-400" />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-white">
                        {passRate >= 90 ? "🎉 Outstanding!" : passRate >= 70 ? "✅ Well Done!" : passRate >= 40 ? "Good Attempt!" : "Keep Practicing!"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Question {questionNumber} of {totalQuestions} — {currentResult.title}
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">{currentResult.passed}/{currentResult.total}</div>
                        <div className="text-xs text-slate-400 mt-1">Test Cases Passed</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">{currentResult.score}%</div>
                        <div className="text-xs text-slate-400 mt-1">Score</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">{timeMins}:{timeSecs.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-slate-400 mt-1">Time Taken</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className={`text-lg font-bold ${qualityColors[currentResult.codeQuality]}`}>
                            {qualityLabels[currentResult.codeQuality]}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Code Quality</div>
                    </div>
                </div>

                {/* AI Flag Warning */}
                {currentResult.isFlagged && (
                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-amber-300 text-sm font-medium">Suspiciously Fast Submission</p>
                            <p className="text-amber-400/70 text-xs mt-1">
                                You solved a {currentResult.difficulty} problem in under {Math.ceil((SUSPICIOUS_TIME[currentResult.difficulty] || 180) / 60)} minutes. 
                                This has been flagged for review. Your score is not affected.
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Evaluation */}
                {currentResult.evaluation && (
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-white/5">
                        <div className="grid grid-cols-2 gap-4 mb-3 border-b border-white/10 pb-3">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Time Complexity</div>
                                <div className="text-base font-mono font-medium text-blue-400 mt-0.5">{currentResult.evaluation.timeComplexity}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Space Complexity</div>
                                <div className="text-base font-mono font-medium text-emerald-400 mt-0.5">{currentResult.evaluation.spaceComplexity}</div>
                            </div>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed">
                            {currentResult.evaluation.feedback}
                        </div>
                    </div>
                )}

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 text-base font-semibold rounded-xl"
                >
                    {isLastQuestion ? (
                        <>Finish Coding Round <CheckCircle2 className="w-5 h-5 ml-2" /></>
                    ) : (
                        <>Next Question <ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                </Button>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                    60% { transform: scale(1.02) translateY(-5px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-popIn { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    )
}

// ── Session Complete Screen ──
function SessionCompleteScreen() {
    const { questionHistory } = useCodingStore()
    const totalScore = questionHistory.length > 0
        ? Math.round(questionHistory.reduce((sum, q) => sum + q.score, 0) / questionHistory.length)
        : 0

    return (
        <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
                    <Trophy className="w-12 h-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Coding Round Complete!</h2>
                <p className="text-slate-400 mb-8">Here's your performance summary</p>
                
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 mb-6">
                    <div className="text-5xl font-bold text-white mb-2">{totalScore}%</div>
                    <div className="text-sm text-slate-400">Overall Score</div>
                </div>

                <div className="space-y-3">
                    {questionHistory.map((q, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                            <div className="text-left">
                                <div className="text-sm font-medium text-white">Q{q.questionNumber}: {q.title}</div>
                                <div className="text-xs text-slate-400">{q.difficulty} • {Math.floor(q.timeTakenSecs / 60)}m {q.timeTakenSecs % 60}s</div>
                            </div>
                            <div className="flex items-center gap-2">
                                {q.isFlagged && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                                <span className={`text-lg font-bold ${q.score >= 70 ? 'text-green-400' : q.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {q.score}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Main Coding Workspace ──
export function CodingWorkspace() {
    const { 
        title, statement, code, language, consoleOutput, isExecuting,
        setCode, setLanguage, testResults, testCases, questionNumber, totalQuestions,
        showResultPopup, isSessionComplete, difficulty
    } = useCodingStore()

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [activeTab, setActiveTab] = useState<"statement" | "console">("statement")

    const handleRun = async (type: "run" | "sample") => {
        const store = useCodingStore.getState()
        store.setIsExecuting(true)
        store.setConsoleOutput("⏳ Executing code...")
        store.setTestResults([])
        try {
            // "run" sends the first visible test case as stdin (so stdin-based code works)
            // "sample" runs against ALL visible sample test cases
            let casesToSend: any[] = []
            if (type === "sample") {
                casesToSend = store.testCases
            } else {
                // "run" = run once with the first sample as stdin
                const firstCase = store.visibleTestCases?.[0] || store.testCases?.[0]
                if (firstCase) {
                    casesToSend = [firstCase]
                }
            }

            const res = await fetch("/api/coding/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "run", 
                    code, 
                    language, 
                    testCases: casesToSend
                })
            })
            const data = await res.json()
            if (data.error) {
                store.setConsoleOutput("❌ " + data.error)
            } else {
                store.setConsoleOutput(data.output || "Execution completed.")
            }
            if (data.results) store.setTestResults(data.results)
            setActiveTab("console")
        } catch (err: any) {
            store.setConsoleOutput("❌ Error: " + err.message)
            setActiveTab("console")
        } finally {
            store.setIsExecuting(false)
        }
    }

    const handleSubmit = async () => {
        const store = useCodingStore.getState()
        store.setIsExecuting(true)
        try {
            const res = await fetch("/api/coding/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "submit", 
                    code, 
                    language, 
                    testCases: store.testCases,
                    sessionId: store.sessionId,
                    questionId: store.questionId
                })
            })
            const data = await res.json()
            store.setConsoleOutput(data.output || "Submission evaluated.")
            if (data.results) store.setTestResults(data.results)
            setActiveTab("console")

            // Calculate result
            const passed = data.passed || 0
            const total = data.total || store.testCases.length
            const timeTakenSecs = Math.round((Date.now() - store.questionStartTime) / 1000)
            const passRate = total > 0 ? (passed / total) * 100 : 0
            const questionDifficulty = store.difficulty || "Medium"
            const threshold = SUSPICIOUS_TIME[questionDifficulty] || 180
            const isFlagged = timeTakenSecs < threshold && passRate >= 70

            // Evaluate complexity
            store.setConsoleOutput(data.output + "\n\nEvaluating time and space complexity... Please wait.")
            let evaluationData = undefined
            try {
                const evalRes = await fetch("/api/coding/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        language,
                        problemStatement: store.statement,
                        passedCases: passed,
                        totalCases: total,
                        testResults: data.results
                    })
                })
                const evalJson = await evalRes.json()
                if (evalJson.evaluation) {
                    evaluationData = evalJson.evaluation
                }
            } catch (err) {
                console.error("Evaluation failed", err)
            }

            const result: QuestionResult = {
                questionNumber: store.questionNumber,
                title: store.title || `Question ${store.questionNumber}`,
                difficulty: questionDifficulty,
                passed,
                total,
                score: Math.round(passRate),
                timeTakenSecs,
                isFlagged,
                codeQuality: getCodeQuality(passRate, store.hintLevelUsed),
                evaluation: evaluationData
            }

            store.setCurrentResult(result)
            store.setShowResultPopup(true)
        } catch (err: any) {
            store.setConsoleOutput("Submission Error: " + err.message)
            setActiveTab("console")
        } finally {
            useCodingStore.getState().setIsExecuting(false)
        }
    }

    // Show session complete screen
    if (isSessionComplete) {
        return <SessionCompleteScreen />
    }

    // Show loading skeleton while question is being fetched
    const isQuestionLoading = !title && !statement

    return (
        <>
            {/* Result Popup Overlay */}
            <ResultPopup />

            <div className={`flex w-full h-full bg-slate-950 border-l border-white/10 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                {/* Left Panel: Problem Statement & Output */}
                <div className="w-[40%] flex flex-col border-r border-white/10 bg-slate-900/50">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 px-2 pt-2 gap-1 bg-slate-900/80">
                        <button 
                            onClick={() => setActiveTab("statement")}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'statement' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Problem Description
                        </button>
                        <button 
                            onClick={() => setActiveTab("console")}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'console' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Console Output
                        </button>
                        {/* Question indicator */}
                        <div className="ml-auto flex items-center px-3 text-xs font-medium text-slate-400">
                            Q{questionNumber}/{totalQuestions}
                        </div>
                    </div>
                    
                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === "statement" ? (
                            <div className="flex flex-col gap-4 text-slate-300">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white">{isQuestionLoading ? "" : title}</h2>
                                    {difficulty && (
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                            difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {difficulty}
                                        </span>
                                    )}
                                </div>
                                {isQuestionLoading ? (
                                    <div className="flex flex-col gap-4 animate-pulse">
                                        <div className="h-5 bg-slate-700/50 rounded w-3/4" />
                                        <div className="h-4 bg-slate-700/50 rounded w-full" />
                                        <div className="h-4 bg-slate-700/50 rounded w-5/6" />
                                        <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                                        <div className="h-12 bg-slate-700/30 rounded-lg w-full mt-2" />
                                        <div className="h-4 bg-slate-700/50 rounded w-4/5" />
                                        <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                                        <p className="text-sm text-slate-500 mt-4 text-center">Generating your coding problem with AI...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: statement }} />
                                )}
                                
                                {/* Divider */}
                                <div className="h-px w-full bg-white/10 my-4"></div>

                                {/* Sample Test Cases Section (Always visible below problem) */}
                                {testCases && testCases.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="font-semibold text-white">Sample Test Cases</h3>
                                        {testCases.slice(0, 2).map((tc, i) => (
                                            <div key={i} className="p-4 rounded-lg border bg-slate-800/50 border-white/10 flex flex-col gap-2">
                                                <div className="font-semibold text-slate-200">Sample Case {i + 1}</div>
                                                <div className="text-sm font-mono text-slate-400 mt-1 bg-black/40 p-2 rounded break-all">
                                                    <span className="font-semibold text-slate-300 block mb-1">Input:</span> 
                                                    {String(tc.input).split(/\r?\n|\\n/).map((line, idx) => (
                                                        <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                    ))}
                                                </div>
                                                <div className="text-sm font-mono text-slate-400 bg-black/40 p-2 rounded break-all">
                                                    <span className="font-semibold text-slate-300 block mb-1">Expected Output:</span> 
                                                    {String(tc.expectedOutput).split(/\r?\n|\\n/).map((line, idx) => (
                                                        <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {testCases.length > 2 && (
                                            <div className="text-sm text-slate-400 italic mt-2">
                                                + {testCases.length - 2} hidden test cases used for final evaluation.
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm min-h-[200px] text-slate-300 whitespace-pre-wrap break-all">
                                    {isExecuting ? (
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Executing code...
                                        </div>
                                    ) : consoleOutput || "Run or submit your code to see output."}
                                </div>
                                
                                {testResults.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-white">Execution Results</h3>
                                            <span className="text-sm font-medium text-slate-300">
                                                {testResults.filter(tr => tr.passed).length} / {testResults.length} Passed
                                            </span>
                                        </div>
                                        {testResults.map((tr, i) => {
                                            const isHidden = i >= 2;
                                            return (
                                                <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2 ${tr.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {tr.passed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                                        <span className={`font-semibold ${tr.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                            {isHidden ? `Hidden Test Case ${i + 1}` : `Sample Case ${i + 1}`}
                                                        </span>
                                                    </div>
                                                    {!isHidden && tr.input && (
                                                        <div className="text-sm font-mono text-slate-400 mt-2 bg-black/40 p-2 rounded break-all">
                                                            <span className="font-semibold text-slate-300 block mb-1">Input:</span> 
                                                            {String(tr.input).split(/\r?\n|\\n/).map((line, idx) => (
                                                                <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!isHidden && tr.expectedOutput && (
                                                        <div className="text-sm font-mono text-slate-400 bg-black/40 p-2 rounded break-all">
                                                            <span className="font-semibold text-slate-300 block mb-1">Expected Output:</span> 
                                                            {String(tr.expectedOutput).split(/\r?\n|\\n/).map((line, idx) => (
                                                                <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!isHidden && !tr.passed && tr.actualOutput !== undefined && (
                                                        <div className="text-sm font-mono text-slate-400 bg-red-950/40 p-2 rounded border border-red-500/20 break-all">
                                                            <span className="font-semibold text-red-300 block mb-1">Your Output:</span> 
                                                            {tr.actualOutput === "" ? <span className="italic text-slate-500">(empty output)</span> : String(tr.actualOutput).split(/\r?\n|\\n/).map((line, idx) => (
                                                                <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!isHidden && !tr.passed && tr.error && (
                                                        <div className="text-sm font-mono text-red-400 bg-red-950/40 p-2 rounded border border-red-500/20 break-all">
                                                            <span className="font-semibold block mb-1">Error:</span> 
                                                            {String(tr.error).split(/\r?\n|\\n/).map((line, idx) => (
                                                                <div key={idx} className="min-h-[1.25rem]">{line}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor */}
                <div className="w-[60%] flex flex-col relative">
                    {/* Editor Toolbar */}
                    <div className="h-12 border-b border-white/10 bg-slate-900/80 flex items-center justify-between px-4">
                        <select 
                            value={language}
                            onChange={(e) => {
                                const newLang = e.target.value
                                setLanguage(newLang)
                                
                                if (STARTER_TEMPLATES[newLang]) {
                                    setCode(STARTER_TEMPLATES[newLang])
                                }
                            }}
                            className="bg-slate-800 text-sm text-slate-200 px-3 py-1.5 rounded-md border border-white/10 outline-none cursor-pointer"
                        >
                            <option value="javascript">JavaScript (Node)</option>
                            <option value="python">Python 3</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10 mr-1">
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRun("run")} 
                                disabled={isExecuting || !code}
                                className="bg-slate-800 border-white/10 hover:bg-slate-700 h-8 text-xs"
                            >
                                <Play className="w-3 h-3 mr-1" /> Run Code
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRun("sample")} 
                                disabled={isExecuting || !code}
                                className="bg-slate-800 border-white/10 hover:bg-slate-700 h-8 text-xs hidden sm:flex"
                            >
                                <Play className="w-3 h-3 mr-1" /> Run Samples
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleSubmit} 
                                disabled={isExecuting || !code}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs ml-1"
                            >
                                <Send className="w-3 h-3 mr-1" /> Submit
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => useCodingStore.getState().skipQuestion()} 
                                disabled={isExecuting}
                                className="text-slate-400 hover:text-white h-8 text-xs ml-1"
                            >
                                Skip
                            </Button>
                        </div>
                    </div>
                    
                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: "on",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                            }}
                            loading={
                                <div className="flex h-full items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Loading editor...
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
