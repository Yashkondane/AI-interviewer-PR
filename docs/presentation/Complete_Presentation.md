# AI Interviewer - Complete Group Presentation Breakdown

---

# Part 1: AI Onboarding & Resume Parsing Engine

**Presenter:** [Student Name 1]  
**Role:** Data Ingestion & Prompt Engineering Architect  
**Core Technologies:** Next.js API Routes, Google Gemini API, Supabase  
**Folders to Focus On:** 
- `app/api/resume-score/` (Backend PDF parsing API)
- `app/interview/setup/` (Onboarding UI)

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

<br><br><br>

---

# Part 2: Sensory Input & Hardware Diagnostics

**Presenter:** [Student Name 2]  
**Role:** Client-Side AI & Hardware Integration Lead  
**Core Technologies:** WebRTC (`getUserMedia`), Web Speech API, MediaPipe (TensorFlow Lite WASM)  
**Folders to Focus On:** 
- `hooks/use-camera.ts` (WASM Vision processing logic)
- `hooks/use-speech.ts` (Audio recording and recognition logic)
- `app/interview/preflight/` (Hardware testing UI)

---

## 1. Introduction
Good morning/afternoon, Examiner. My name is [Student Name 2], and my responsibility was the **Sensory Input & Hardware Diagnostics** module. 

A traditional interview involves body language, eye contact, and verbal communication. My task was to build the eyes and ears of our AI interviewer, capturing and processing the candidate's real-time video and audio streams directly in the browser.

## 2. Core Architecture
My module is divided into two primary sensory engines:
1. **Vision Engine (`hooks/use-camera.ts`):** We use Google's MediaPipe framework compiled to WebAssembly. It processes the webcam feed locally to detect facial landmarks and body pose estimation at 60 FPS.
2. **Audio Engine (`hooks/use-speech.ts`):** We leverage the browser's native Web Speech API (`webkitSpeechRecognition`) to continuously transcribe the user's spoken words into text, handling silence timeouts and automatic restarts.

## 3. Technical Deep Dive & Challenges
**Challenge: High-Latency Video Processing**
Sending a live video feed to a backend server for analysis is extremely expensive, raises privacy concerns, and introduces massive network latency.

**Solution:**
I implemented the computer vision entirely on the client-side edge using WebAssembly. I extract the nose tip coordinates to calculate a deviation vector for **Eye Contact**, and measure the distance between the shoulders and hips to calculate **Posture**. Because this runs in the browser, the latency is effectively zero, and no video frames are ever recorded or sent to a server.

**Challenge: Operating System Microphone Locks**
During development, we discovered a major bug: Windows OS often places an exclusive lock on the microphone when we run our visual volume meter (`getUserMedia`), completely breaking the Speech Recognition engine.

**Solution:**
I engineered a Dual-Mode Audio architecture. In the "Preflight" screen, we use the real hardware stream to prove the mic works. But once the interview starts, I release the hardware lock and switch to a faux-animation bound to the AI's internal state. This entirely bypassed the OS limitation, ensuring uninterrupted speech transcription.

## 4. Conclusion
This module transforms a standard text-based chatbot into an immersive, multimodal experience. By processing complex visual and audio data locally, we maintain high performance, strict user privacy, and a seamless conversational flow.

<br><br><br>

---

# Part 3: Core AI Conversational State Machine

**Presenter:** [Student Name 3]  
**Role:** AI Orchestrator & State Management Lead  
**Core Technologies:** React Hooks, Context API, LLM Generation, Text-to-Speech (TTS)  
**Folders to Focus On:** 
- `hooks/use-interview.ts` (Core state machine loop)
- `app/api/interview/` (LLM Context and Generation logic)
- `app/api/tts/` (Text-to-speech rendering)

---

## 1. Introduction
Good morning/afternoon, Examiner. My name is [Student Name 3], and I engineered the **Core AI Conversational State Machine**. 

While the other modules handle data ingestion and sensory inputs, my module acts as the "brain" of the application. I built the central loop that orchestrates when the AI listens, when it processes data, and when it speaks, ensuring a fluid back-and-forth conversation.

## 2. Core Architecture
The conversational engine (`hooks/use-interview.ts`) operates on a finite state machine:
1. **Listening State:** Waits for the Speech Engine to resolve a final transcript.
2. **Processing State:** Appends the transcript to the context history and sends it to our backend LLM endpoint (`app/api/interview/converse`).
3. **Speaking State:** Receives the generated text and streams it through a Text-to-Speech (TTS) API while animating the UI.

## 3. Technical Deep Dive & Challenges
**Challenge: Managing Conversational Context**
Standard API calls are stateless, meaning the AI forgets what was said 10 seconds ago. 

**Solution:**
I implemented a robust Context History array that is maintained in a `useRef` across the React component lifecycle. Every time the user or AI speaks, the transcript is appended to this array. When we ping the backend, the entire conversation history is attached, allowing the AI to ask natural follow-up questions (e.g., "Tell me more about what you just mentioned").

**Challenge: Complex Mode Transitions**
The interview isn't just talking; it transitions into a Data Structures and Algorithms (DSA) coding mode seamlessly.

**Solution:**
I built an interception layer into the state machine. By analyzing the time elapsed and the AI's generated text, the state machine can detect when the AI says keywords like "let's write some code". It then intercepts the loop, switches the global Zustand store to `isCodingMode`, stops the conversational questioning, and enters a silent background-listening loop so the user can code in peace.

## 4. Conclusion
The orchestration logic I developed ensures that all the disparate APIs (Speech, Vision, LLM, TTS) work together in perfect harmony. It creates an experience that feels less like software and more like a fluid conversation with a real human.

<br><br><br>

---

# Part 4: Interactive DSA Coding Workspace

**Presenter:** [Student Name 4]  
**Role:** Interactive Workspace & Execution Engineer  
**Core Technologies:** Monaco Editor, Zustand State Management, OneCompiler API  
**Folders to Focus On:** 
- `components/interview/coding-workspace.tsx` (Split-pane Code Editor UI)
- `hooks/use-coding-store.ts` (Zustand state for test cases)
- `app/api/coding/` (Secure Code Execution proxy backend)

---

## 1. Introduction
Good morning/afternoon, Examiner. My name is [Student Name 4], and I developed the **Interactive DSA Coding Workspace**. 

Technical interviews require writing and evaluating code in real-time. My responsibility was to build a full-fledged IDE within the browser that presents algorithmic problems, allows the user to write solutions, and actually compiles and tests their code against hidden edge cases.

## 2. Core Architecture
The coding module is composed of three main pillars:
1. **The Workspace UI (`coding-workspace.tsx`):** A responsive, split-pane layout integrating Microsoft's Monaco Editor (the engine behind VS Code) for syntax highlighting and autocomplete.
2. **State Management (`hooks/use-coding-store.ts`):** A centralized Zustand store that tracks the problem statement, the user's live code, and the execution status of multiple test cases.
3. **Execution Backend (`app/api/coding/execute`):** A secure backend route that proxies the user's code to a third-party compilation engine (OneCompiler) to safely execute untrusted code.

## 3. Technical Deep Dive & Challenges
**Challenge: Safely Executing Untrusted Code**
Running arbitrary code submitted by a user on our own Node.js servers is a massive security risk (Remote Code Execution vulnerabilities).

**Solution:**
I designed a proxy architecture. Instead of running the code locally, our backend bundles the user's code with predefined test cases and sends it securely to a sandboxed execution API (OneCompiler). The results are then parsed and returned to the frontend.

**Challenge: Rate Limiting & Concurrent Execution**
When a user clicks "Run All Test Cases", executing 5 test cases simultaneously triggered `429 Too Many Requests` errors from the compiler API, causing the UI to freeze.

**Solution:**
I refactored the execution engine from a concurrent `Promise.all` approach to a sequential execution queue. I implemented a forced 200ms delay between requests to the compilation API. This slightly increased the total execution time but resulted in 100% stability and resolved all network failures.

## 4. Conclusion
By building this module, we elevated the platform from a simple behavioral chatbot to a comprehensive technical assessment tool, proving that the system can accurately evaluate a candidate's hard software engineering skills.

<br><br><br>

---

# Part 5: Analytics, Scoring, & Database Architecture

**Presenter:** [Student Name 5]  
**Role:** Database Architect & Data Visualization Lead  
**Core Technologies:** Supabase (PostgreSQL), Recharts, LLM Evaluation Prompting  
**Folders to Focus On:** 
- `app/interview/results/` (Data Visualization Dashboard UI)
- `app/api/scorecard/` (LLM-based Grading Engine)
- `supabase/` (or Database config logic for schemas)

---

## 1. Introduction
Good morning/afternoon, Examiner. My name is [Student Name 5], and I led the **Analytics, Scoring, & Database Architecture** for this project. 

An interview is only useful if we can accurately assess the results. My module is responsible for storing the immense amount of data generated during the interview, evaluating the candidate's performance, and presenting it in an actionable, highly visual dashboard.

## 2. Core Architecture
The analytics module consists of:
1. **Relational Database (Supabase):** A PostgreSQL schema that securely links Users to their Sessions, and links Sessions to individual Q&A turns, Code Executions, and Biometric Metrics.
2. **Evaluation Engine (`app/api/scorecard`):** A backend process that gathers the entire transcript and feeds it to an LLM with a highly specific grading rubric to generate a final score.
3. **Results Dashboard (`app/interview/results`):** A data visualization UI using Recharts to plot the candidate's eye contact, posture, and technical scores over time.

## 3. Technical Deep Dive & Challenges
**Challenge: Evaluating Subjective Answers**
How do you programmatically grade a behavioral answer like "Tell me about a time you failed"? 

**Solution:**
I designed a post-interview evaluation pipeline. When the session ends, the backend compiles the entire Q&A history and injects it into a rigorous grading prompt. The LLM acts as a Senior Technical Recruiter, scoring the candidate out of 100 based on communication, technical accuracy, and problem-solving, returning a strictly formatted JSON scorecard.

**Challenge: Managing Real-Time Metric Aggregation**
The Vision API generates posture and eye-contact scores 60 times a second. Storing all this in the database would be incredibly expensive and slow.

**Solution:**
I worked with the Sensory module to implement a client-side aggregation buffer. Instead of saving every frame, the frontend calculates a rolling average every 500ms, and only commits a summarized metric snapshot to the database at the end of the session. This drastically optimized database writes while still preserving the integrity of the data for our charts.

## 4. Conclusion
My architecture ensures that all the incredible data captured during the interview is actually useful. By persisting it securely and visualizing it cleanly, we provide candidates with the actionable feedback they need to improve, fulfilling the core mission of our platform.
