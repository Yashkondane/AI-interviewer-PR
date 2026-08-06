# Part 2: Sensory Input & Hardware Diagnostics

**Presenter:** [Student Name 2]  
**Role:** Client-Side AI & Hardware Integration Lead  
**Core Technologies:** WebRTC (`getUserMedia`), Web Speech API, MediaPipe (TensorFlow Lite WASM)

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
