# Part 3: Core AI Conversational State Machine

**Presenter:** [Student Name 3]  
**Role:** AI Orchestrator & State Management Lead  
**Core Technologies:** React Hooks, Context API, LLM Generation, Text-to-Speech (TTS)

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
