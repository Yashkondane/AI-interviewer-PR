# Part 5: Analytics, Scoring, & Database Architecture

**Presenter:** [Student Name 5]  
**Role:** Database Architect & Data Visualization Lead  
**Core Technologies:** Supabase (PostgreSQL), Recharts, LLM Evaluation Prompting

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
