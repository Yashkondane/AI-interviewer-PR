-- Disable RLS on the newly added DSA tables so that the Next.js API routes (which use the ANON key by default) can freely insert generated questions and code submissions without getting a 42501 error.

ALTER TABLE public.generated_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions DISABLE ROW LEVEL SECURITY;
