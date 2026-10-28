<!-- Created by 11Hopem -->
# ai-learning-platform — Worklog & AI Context Handoff

### [2026-10-20 09:40] Project Launch: 11AI Academy — Interactive AI Learning Platform
- **Task & Objective**: Build a premier, lightweight, high-performance web-based AI learning hub and prompt engineering laboratory per user instructions ("ai öğrenme platformu yapsana bir tane proje olarak buraya aç web projesi olacak düm düz").
- **Technical Decisions & Architecture**:
  1. **Lightweight Pure Web Architecture**: High-speed vanilla ES modules with zero heavy dependencies or hydration delays; fast loading and instant interactivity.
  2. **6 Core Mastery Tracks**:
     - LLM Architecture & Foundations (Tokens, Context Windows, Transformers, Self-Attention, Temperature).
     - Prompt Engineering Masterclass (Zero-shot, Few-shot, Chain-of-Thought, ReAct, Strict JSON Schemas).
     - Agentic AI & Next-Gen Software Dev (Context Engineering, AGENTS.md constitution, TDD with AI).
     - Autonomous Agents & Tool Calling (MCP standard, Subagents, Multi-agent loops).
     - Generative Media (Cinematic video prompting for Sora/Kling, photorealistic Midjourney v6).
     - Enterprise RAG, Security & AI Safety (Vector embeddings, Indirect Prompt Injection, Hallucination defense).
  3. **Interactive Prompt Evaluator**: Instant 4-metric scoring (Clarity, Context, Constraints, Formatting) with auto-enhanced prompt generator and constructive critique.
  4. **Knowledge Check & Certificate**: 10-question evaluation awarding a verifiable 11Hopem AI Academy Certificate upon 70%+ score.
  5. **Rule 18 Telemetry & Rule 17 Backup**: Non-blocking Cloud Firestore telemetry to `hopem-software-cloud` and SHA-256 state ledger.
- **Affected Files**:
  - `package.json`, `vercel.json`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `WORKLOG.md`, `README.md`
  - `assets/images/logo.svg`, `public/logo.svg`, `public/favicon.svg`, `public/favicon.ico`
  - `src/lib/academyEngine.js`, `src/telemetry/firebaseLogger.js`
  - `public/index.html`, `public/style.css`, `public/app.js`, `public/robots.txt`, `public/sitemap.xml`
  - `scripts/build.js`, `scripts/backupService.js`, `scripts/lintCheck.js`
  - `tests/blueprint.test.js`, `tests/academy.test.js`
- **Current Status & Verification**:
  - Tests: `npm test` passed 100%.
  - Lint: `npm run lint` passed with 0 errors.
  - Vercel Deployment & GitHub private repo connected.
- **Next Steps**:
  - Expand additional deep-dive modules (e.g., fine-tuning with LoRA/QLoRA).
  - Add community prompt submission playground.
