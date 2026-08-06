# Part 1: AI Onboarding & Resume Parsing Engine

**Presenter:** [Student Name 1]  
**Role:** Data Ingestion & Prompt Engineering Architect  
**Core Technologies:** Next.js API Routes, Google Gemini API, Supabase

---

## 1. Introduction
Good morning/afternoon, Examiner. My name is [Student Name 1], and I was responsible for the **AI Onboarding & Resume Parsing Engine** of this project. 

The goal of this module is to replicate the experience of a real-world recruiter reviewing a candidate's resume before an interview. I built the pipeline that ingests raw user data, extracts meaningful insights using generative AI, and configures the core parameters for the interview session.

## 2. Core Architecture
The onboarding flow consists of three major steps:
1. **File Upload & Text Extraction:** The user uploads a PDF of their resume. We extract the raw unstructured text on the client and send it to our backend.
2. **AI Parsing (`app/api/resume-score`):** The backend leverages the Gemini API to analyze the raw text. Through careful prompt engineering, the LLM is forced to return a strictly typed JSON object containing the candidate's skills, experience level, and potential strengths/weaknesses.
3. **Session Configuration (`app/interview/setup`):** The extracted data is stored in Supabase and used to tailor the interview's difficulty and topic focus.

## 3. Technical Deep Dive & Challenges
**Challenge: Extracting Structured Data from Unstructured Text**
Resumes come in thousands of different formats. Traditional regex or keyword-matching fails to accurately parse complex experience sections. 

**Solution:**
I implemented a specialized prompt layer using the Gemini API. Instead of asking for a summary, the prompt explicitly instructs the LLM to output a raw JSON structure. We then validate this JSON on the backend. This allows us to dynamically extract an array of top skills and a calculated "experience level" (Entry, Mid, Senior) regardless of how the resume was originally formatted.

**Challenge: Dynamic Prompt Generation**
The AI interviewer needs to know who it is interviewing to ask relevant questions.

**Solution:**
I built a setup module that concatenates the parsed resume data with the user's selected job role to generate a dynamic System Prompt. If a user applies for a "Frontend React" role, the system prompt is injected with their specific React projects found in the resume, allowing the AI to ask highly personalized questions.

## 4. Conclusion
By building this module, we ensure that the AI Interviewer doesn't just ask generic questions off a script, but actually tailors the entire interview to the candidate's unique background—just like a human interviewer would.
