import { create } from 'zustand'

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface TestCaseResult {
  passed: boolean
  actualOutput: string
  error?: string
  input?: string
  expectedOutput?: string
}

export interface QuestionResult {
  questionNumber: number
  title: string
  difficulty: string
  passed: number
  total: number
  score: number         // 0-100 based on pass rate
  timeTakenSecs: number
  isFlagged: boolean    // true if suspiciously fast
  codeQuality: 'excellent' | 'good' | 'average' | 'needs-improvement'
}

export interface CodingState {
  isCodingMode: boolean
  sessionId: string | null
  questionId: string | null
  title: string
  difficulty: string
  statement: string
  starterCode: string
  code: string
  language: string
  testCases: TestCase[]
  visibleTestCases: TestCase[] // First two usually
  consoleOutput: string
  isExecuting: boolean
  testResults: TestCaseResult[]
  hintLevelUsed: number
  
  // Multi-question flow
  questionNumber: number       // Current question (1 or 2)
  totalQuestions: number       // Total questions in session (2)
  questionStartTime: number    // timestamp when question loaded
  showResultPopup: boolean     // show the congratulations popup
  currentResult: QuestionResult | null
  questionHistory: QuestionResult[] // results from completed questions
  isSessionComplete: boolean   // true when all questions are done
  
  // Actions
  setCodingMode: (isCoding: boolean) => void
  setQuestion: (data: Partial<CodingState>) => void
  setCode: (code: string) => void
  setLanguage: (lang: string) => void
  setConsoleOutput: (output: string) => void
  setIsExecuting: (executing: boolean) => void
  setTestResults: (results: TestCaseResult[]) => void
  incrementHintLevel: () => void
  setShowResultPopup: (show: boolean) => void
  setCurrentResult: (result: QuestionResult | null) => void
  advanceToNextQuestion: () => void
  completeSession: () => void
  reset: () => void
}

export const useCodingStore = create<CodingState>((set) => ({
  isCodingMode: false,
  sessionId: null,
  questionId: null,
  title: "",
  difficulty: "",
  statement: "",
  starterCode: "",
  code: "",
  language: "javascript",
  testCases: [],
  visibleTestCases: [],
  consoleOutput: "",
  isExecuting: false,
  testResults: [],
  hintLevelUsed: 0,
  
  // Multi-question flow
  questionNumber: 1,
  totalQuestions: 2,
  questionStartTime: Date.now(),
  showResultPopup: false,
  currentResult: null,
  questionHistory: [],
  isSessionComplete: false,
  
  setCodingMode: (isCoding) => set({ isCodingMode: isCoding }),
  setQuestion: (data) => set((state) => ({ 
    ...state, 
    ...data, 
    code: data.starterCode || state.code,
    questionStartTime: Date.now(),  // Reset timer when new question loads
    testResults: [],                // Clear old results
    consoleOutput: "",              // Clear old console
    hintLevelUsed: 0,              // Reset hints
  })),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setConsoleOutput: (output) => set({ consoleOutput: output }),
  setIsExecuting: (executing) => set({ isExecuting: executing }),
  setTestResults: (results) => set({ testResults: results }),
  incrementHintLevel: () => set((state) => ({ hintLevelUsed: state.hintLevelUsed + 1 })),
  setShowResultPopup: (show) => set({ showResultPopup: show }),
  setCurrentResult: (result) => set({ currentResult: result }),
  advanceToNextQuestion: () => set((state) => ({
    questionNumber: state.questionNumber + 1,
    questionId: null,
    title: "",
    difficulty: "",
    statement: "",
    starterCode: "",
    code: "",
    testCases: [],
    visibleTestCases: [],
    consoleOutput: "",
    testResults: [],
    hintLevelUsed: 0,
    showResultPopup: false,
    currentResult: null,
    questionStartTime: Date.now(),
    questionHistory: state.currentResult 
      ? [...state.questionHistory, state.currentResult]
      : state.questionHistory,
  })),
  completeSession: () => set((state) => ({
    isSessionComplete: true,
    showResultPopup: false,
    questionHistory: state.currentResult 
      ? [...state.questionHistory, state.currentResult]
      : state.questionHistory,
  })),
  reset: () => set({
    isCodingMode: false,
    questionId: null,
    title: "",
    difficulty: "",
    statement: "",
    starterCode: "",
    code: "",
    testCases: [],
    visibleTestCases: [],
    consoleOutput: "",
    isExecuting: false,
    testResults: [],
    hintLevelUsed: 0,
    questionNumber: 1,
    totalQuestions: 2,
    questionStartTime: Date.now(),
    showResultPopup: false,
    currentResult: null,
    questionHistory: [],
    isSessionComplete: false,
  })
}))
