-- DSA Coding Round Schema additions

-- 1. Generated Questions Table
-- Stores the dynamically generated questions by Gemini, so we can reference them later.
CREATE TABLE IF NOT EXISTS public.generated_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL, -- references sessions(id)
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    test_cases JSONB NOT NULL, -- Array of { input: string, expectedOutput: string }
    reference_solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Coding Submissions Table
-- Stores code execution results.
CREATE TABLE IF NOT EXISTS public.coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.generated_questions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL, -- e.g., "pending", "success", "error"
    execution_time FLOAT, -- in ms
    memory FLOAT, -- in bytes/kb
    passed_cases INTEGER DEFAULT 0,
    total_cases INTEGER DEFAULT 0,
    score INTEGER, -- 0-100 based on pass rate & AI evaluation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Interview Events Table (Optional tracking for DSA)
-- Tracks actions like hint_used, code_run, etc.
CREATE TABLE IF NOT EXISTS public.interview_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ALTER existing sessions table to support DSA
-- Add a column to indicate if the candidate selected the DSA round.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'dsa_enabled'
    ) THEN
        ALTER TABLE public.sessions ADD COLUMN dsa_enabled BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.sessions ADD COLUMN cp_level TEXT;
        ALTER TABLE public.sessions ADD COLUMN preferred_language TEXT;
    END IF;
END $$;
