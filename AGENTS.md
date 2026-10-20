<!-- Created by 11Hopem -->
# ai-learning-platform — Agent & Engineering Guidelines

## 1. Project Overview & Architecture
`ai-learning-platform` (11AI Academy) is a next-generation interactive AI learning hub and prompt engineering laboratory developed by 11Hopem.
- **Frontend**: Vanilla ES modules, high-velocity responsive cyber-obsidian design, zero heavy frontend framework bloat.
- **Engines**: Modular JavaScript (`src/lib/academyEngine.js`) covering LLM foundations, prompt evaluation, automated grading, certificate generation, and persistent progress.
- **Telemetry**: Rule 18 Cloud Firestore telemetry (`src/telemetry/firebaseLogger.js`) streaming to `hopem-software-cloud`Europe `eur3` non-blocking.
- **Backup**: Rule 17 automated cryptographic SHA-256 state ledger (`scripts/backupService.js`).

---

## 2. Strict Confidentiality & Isolation (Rule 1)
- This project is strictly personal (`~/mycodespaces/ai-learning-platform`).
- NEVER apply or push any company code or data from `/Users/umut/intetra/*` into this repository.

---

## 3. Strict 100% English Code Standard (Rule 3)
- All source code, variable names, functions, classes, comments, tests, commits, and logs must be written in **100% ENGLISH**.
- Turkish is reserved exclusively for communication with Umut in chat.

---

## 4. Brand Standards (Rule 9 & 13)
- Author is strictly **11Hopem** (`11Hopem <umutocgdr@gmail.com>`).
- Brand references redirect to **`https://11hopem.com`**.
- Never include "Software Ltd. Şti." in any file or label.
- Dedicated vector SVG logo at `assets/images/logo.svg` is 1:1 synchronized with `public/logo.svg`, `public/favicon.svg`, and `public/favicon.ico`.

---

## 5. Development & Testing Commands
```bash
# Run automated test suite (Rule 8)
npm test

# Run static analysis and lint checks (Rule 20)
npm run lint

# Take an autonomous cryptographic state backup (Rule 17)
npm run backup

# Build static output for deployment
npm run build

# Start local preview server
npm start
```

---

## 6. Branching & Git Conventions
- **`master`**: Production-ready code deployed to Vercel.
- **`dev`**: Active feature development and integration.
- Standard Conventional Commits: `feat: ...`, `fix: ...`, `chore: ...`.
