# Product Requirements Document (PRD): Speech Recognition & Pronunciation Assessment

- **Feature Title**: Speech Recognition & Pronunciation Assessment (EPIC-08)
- **Feature Slug**: `speech-pronunciation-assessment`
- **Target Stories**: US-VOICE-01 (Voice Recognition & Pronunciation Scoring) & US-VOICE-02 (Native Audio Playback & Pronunciation Guide)
- **Target Release**: Sprint 6 (WordStreak Core Interactive Audio)
- **Status**: Ready for Review

---

## 1. Executive Summary & Problem Statement

Traditional digital flashcards restrict learners to passive visual recognition and silent memorization. When English learners attempt to speak words in real-world conversations or exams (such as IELTS or TOEFL), they frequently encounter hesitation, incorrect phonetic stress, and inaccurate phoneme articulation.

The **Speech Recognition & Pronunciation Assessment** feature transforms WordStreak into an interactive oral practice studio. Learners can listen to pristine dual-accent native pronunciations (US and UK), slow down audio to 0.75x speed with pitch preservation, inspect interactive IPA syllable breakdowns, speak vocabulary aloud into their microphone with real-time soundwave visualization, and receive instant similarity scoring and gamified XP rewards (+10 XP) that fuel their daily study streak.

---

## 2. Target Personas & Core User Value

- **The Speaking Test Candidate (Dung)**: Wants precise verification that difficult vocabulary words (e.g. _anemone_, _rural_, _epitome_) are recognized accurately by standard speech models.
- **The Beginner Learner (Thao)**: Needs encouraging, low-stakes practice where close pronunciations (80–99%) are praised, and fast native phrases can be played at 0.75x slow speed with interactive syllable stress indicators.
- **The Habitual Learner (Minh)**: Motivated by gamified feedback loops (+10 XP per accurate pronunciation) that actively preserve and advance their daily Electric Violet Streak flame.

---

## 3. Product Scope & Functional Highlights

### 3.1 US-VOICE-01: Voice Recognition & Pronunciation Assessment

1. **Interactive Microphone Controller**: Clean Obsidian black pill CTA with fluid state transitions (Idle $\rightarrow$ Listening with dynamic soundwave $\rightarrow$ Evaluating $\rightarrow$ Results Card).
2. **Real-Time Soundwave Visualization**: Web Audio `AnalyserNode` frequency meter rendering animated audio bars directly synchronized with voice volume.
3. **Instant Speech-to-Text Transcription**: Client-side Web Speech Recognition (`webkitSpeechRecognition` / `SpeechRecognition`) streaming live partial transcripts.
4. **Phonetic & Levenshtein Similarity Scoring**: Automated comparison algorithm classifying attempts into:
   - **Exact Match (100%)**: Emerald Green glow, celebratory audio chime, $+10\text{ XP}$.
   - **Close Match (80% – 99%)**: Royal Violet glow, encouraging chime, $+10\text{ XP}$, highlighted spelling differences.
   - **Needs Retry (<80%)**: Warm Amber glow, gentle retry prompt, $0\text{ XP}$, syllable hints.
5. **Auditory & Haptic Feedback**: Lightweight web audio chimes for success and retry events (with mute control).
6. **Streak & Gamification Integration**: Passing attempts award $+10\text{ XP}$ (capped at $500\text{ XP/day}$) and count toward daily study streak maintenance.

### 3.2 US-VOICE-02: Native Reference Audio & Pronunciation Guide

1. **Dual-Accent Player (US & UK)**: Instant toggle between General American (`en-US`) and British RP (`en-GB`) audio tracks.
2. **Slow Playback Speed Toggle (0.75x)**: High-fidelity slow speed playback with audio pitch preservation (`preservesPitch = true`).
3. **Resilient Web Speech Synthesis Fallback**: Transparent zero-lag fallback to `window.speechSynthesis` with matching locale voices if CDN audio is unavailable.
4. **Interactive Syllable IPA Segmentation**: Syllable chips split by phonetic dots and stress marks (`ˈ`, `ˌ`), enabling learners to click isolated syllables for audio repetition.

---

## 4. User Experience & Design Guidelines

- **Canvas & Surface**: Pure white canvas (`#ffffff`), 1px hairline borders (`#e5e5e5`), obsidian primary pill buttons (`#000000`, `rounded-full`).
- **Accent & Brand Energy**: Electric Violet / Purple Flame (`#8B5CF6`, `#9333ea`, `#c084fc`) indicating active speech listening and gamified bonuses.
- **Typography Tokens**: `Nunito` for display headers, `Inter` for functional controls and body copy, `JetBrains Mono` for IPA strings, transcripts, and syllable chips.
- **Zero-AI-Slop Principle**: No cheesy cartoon microphones or cluttered waveform overlays. Crisp, minimalist volume meter bars and clean phonetic pill tags.

---

## 5. Scope Boundaries (MoSCoW Summary)

- **Must-Have (P0)**: Web Speech API voice capture, live soundwave meter, similarity scoring (100%, 80-99%, <80%), dual accent US/UK audio player, 0.75x slow speed with pitch preservation, interactive IPA syllables, $+10\text{ XP}$ reward with $500\text{ XP/day}$ cap, permission handling & fallbacks.
- **Should-Have (P1)**: Keyboard shortcuts (`Space`, `R`, `S`), audio chimes mute toggle, multi-word sentence accuracy highlighting.
- **Could-Have (P2)**: Pitch contour intonation curve comparison, offline WASM phonemizer.
- **Won't-Have (Out of Scope)**: Server-side audio recording storage, paid cloud speech APIs (Whisper/Azure), non-English languages.
