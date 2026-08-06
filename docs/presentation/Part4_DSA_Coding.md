# Part 4: Interactive DSA Coding Workspace

**Presenter:** [Student Name 4]  
**Role:** Interactive Workspace & Execution Engineer  
**Core Technologies:** Monaco Editor, Zustand State Management, OneCompiler API

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
