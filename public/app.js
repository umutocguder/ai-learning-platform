/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import {
  CURRICULUM_TRACKS,
  READY_PROMPT_CHEATSHEETS,
  QUIZ_QUESTIONS,
  evaluatePrompt,
  gradeQuiz,
  loadProgress,
  saveProgress,
  calculateLevel
} from './src/lib/academyEngine.js';

import { logEvent } from './src/telemetry/firebaseLogger.js';

// Application State
let appState = loadProgress();

// Toast helper
function showToast(message) {
  const hub = document.getElementById('toastHub');
  if (!hub) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  hub.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Update HUD Header Progress
function updateHud() {
  const hudXp = document.getElementById('hudXp');
  const hudLevel = document.getElementById('hudLevel');
  if (hudXp) hudXp.textContent = `${appState.xp} XP`;
  if (hudLevel) {
    const meta = calculateLevel(appState.xp);
    hudLevel.textContent = meta.title;
    appState.level = meta.level;
    appState.title = meta.title;
  }
}

// Render Curriculum Tracks
function renderTracks() {
  const container = document.getElementById('tracksGrid');
  if (!container) return;

  container.innerHTML = CURRICULUM_TRACKS.map((track) => {
    const modulesHtml = track.modules
      .map((mod) => {
        const isDone = appState.completedModules.includes(mod.id);
        return `
          <li class="module-item ${isDone ? 'completed' : ''}" data-mod-id="${mod.id}" data-track-id="${track.id}">
            <div class="mod-title">
              <span>${isDone ? '✅' : '📖'}</span>
              <strong>${mod.title}</strong>
            </div>
            <span class="mod-time">${mod.readTimeMinutes} min</span>
          </li>
        `;
      })
      .join('');

    return `
      <div class="track-card">
        <div>
          <div class="track-top">
            <span class="track-pill">${track.badge}</span>
            <span class="track-xp">+${track.xpReward} XP</span>
          </div>
          <h3>${track.title}</h3>
          <p class="track-desc">${track.shortDescription}</p>
          <ul class="module-list">
            ${modulesHtml}
          </ul>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Difficulty: <strong>${track.difficulty}</strong></span>
          <span>${track.modules.length} Lessons</span>
        </div>
      </div>
    `;
  }).join('');

  // Attach click events for modules
  container.querySelectorAll('.module-item').forEach((item) => {
    item.addEventListener('click', () => {
      const trackId = item.getAttribute('data-track-id');
      const modId = item.getAttribute('data-mod-id');
      openLessonModal(trackId, modId);
    });
  });
}

// Open Lesson Modal
function openLessonModal(trackId, modId) {
  const track = CURRICULUM_TRACKS.find((t) => t.id === trackId);
  if (!track) return;
  const mod = track.modules.find((m) => m.id === modId);
  if (!mod) return;

  const modal = document.getElementById('lessonModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const isCompleted = appState.completedModules.includes(mod.id);

  body.innerHTML = `
    <span class="track-pill" style="margin-bottom: 0.75rem; display: inline-block;">${track.title}</span>
    <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.75rem;">${mod.title}</h2>
    <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem;">${mod.summary}</p>

    <h4 style="font-size: 1rem; color: #06b6d4; margin-bottom: 0.75rem; text-transform: uppercase;">Key Takeaways:</h4>
    <ul style="padding-left: 1.25rem; margin-bottom: 1.5rem; color: #e2e8f0; font-size: 0.92rem; line-height: 1.7;">
      ${mod.keyTakeaways.map((point) => `<li>${point}</li>`).join('')}
    </ul>

    <h4 style="font-size: 1rem; color: #c084fc; margin-bottom: 0.5rem; text-transform: uppercase;">Technical Reference / Code:</h4>
    <pre><code>${mod.codeSnippet}</code></pre>

    <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 0.85rem; color: #94a3b8;">Earn <strong>+100 XP</strong> upon completion</span>
      <button id="btnCompleteModule" class="btn-primary" ${isCompleted ? 'disabled style="opacity: 0.6;"' : ''}>
        ${isCompleted ? 'Completed ✅' : 'Mark as Completed (+100 XP)'}
      </button>
    </div>
  `;

  modal.classList.add('active');

  const btnComplete = document.getElementById('btnCompleteModule');
  if (btnComplete && !isCompleted) {
    btnComplete.addEventListener('click', () => {
      appState.completedModules.push(mod.id);
      appState.xp += 100;
      saveProgress(appState);
      updateHud();
      renderTracks();
      showToast(`🎉 Module Completed! +100 XP awarded.`);
      logEvent('telemetry_logs', 'module_completed', { moduleId: mod.id, trackId });
      btnComplete.textContent = 'Completed ✅';
      btnComplete.disabled = true;
      btnComplete.style.opacity = '0.6';
    });
  }

  logEvent('visitor_logs', 'module_opened', { moduleId: mod.id, trackId });
}

// Close Modal
function setupModalClose() {
  const modal = document.getElementById('lessonModal');
  const btnClose = document.getElementById('btnCloseModal');
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

// Render Cheatsheets
function renderCheatsheets() {
  const container = document.getElementById('cheatsheetGrid');
  if (!container) return;

  container.innerHTML = READY_PROMPT_CHEATSHEETS.map((item) => {
    return `
      <div class="cheat-card">
        <div>
          <span class="category-pill">${item.category}</span>
          <h4>${item.title}</h4>
          <pre id="pre_${item.id}">${item.prompt}</pre>
        </div>
        <button class="btn-secondary btn-copy-prompt" data-target="pre_${item.id}" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 0.65rem;">
          📋 Copy Prompt Formula
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-copy-prompt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (el) {
        navigator.clipboard.writeText(el.textContent.trim()).then(() => {
          showToast('📋 Prompt copied to clipboard!');
          logEvent('telemetry_logs', 'prompt_copied', { promptId: targetId });
        });
      }
    });
  });
}

// Setup Interactive Prompt Lab
function setupPromptLab() {
  const btnEvaluate = document.getElementById('btnEvaluate');
  const btnSample = document.getElementById('btnSamplePrompt');
  const input = document.getElementById('promptInput');
  const scoreNum = document.getElementById('scoreNum');
  const scoreTier = document.getElementById('scoreTier');
  const scoreSummary = document.getElementById('scoreSummary');
  const scoreCircle = document.getElementById('scoreCircle');
  const fillClarity = document.getElementById('fillClarity');
  const fillContext = document.getElementById('fillContext');
  const fillConstraints = document.getElementById('fillConstraints');
  const fillFormatting = document.getElementById('fillFormatting');
  const metricClarity = document.getElementById('metricClarity');
  const metricContext = document.getElementById('metricContext');
  const metricConstraints = document.getElementById('metricConstraints');
  const metricFormatting = document.getElementById('metricFormatting');
  const critiqueBox = document.getElementById('critiqueBox');
  const enhancedContent = document.getElementById('enhancedContent');
  const btnCopyEnhanced = document.getElementById('btnCopyEnhanced');

  if (btnSample && input) {
    btnSample.addEventListener('click', () => {
      input.value = `Act as a Senior AI Solutions Architect.
Context: We are architecting an autonomous multi-agent coding agent using the Model Context Protocol (MCP).
Explicit Constraints:
- Detail the exact security boundaries between LLM inference and filesystem tools.
- Never allow unapproved write operations on company production databases.
- Limit response to a structured markdown blueprint with actionable code blocks.
Output Format: Markdown with executive overview, sequence diagram description, and checklist.`;
      showToast('Loaded sample architectural prompt!');
    });
  }

  if (btnEvaluate && input) {
    btnEvaluate.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) {
        showToast('Please type a prompt first!');
        return;
      }

      const res = evaluatePrompt(val);

      // Animate Score
      if (scoreNum) scoreNum.textContent = res.score;
      if (scoreTier) scoreTier.textContent = res.tier;
      if (scoreSummary) scoreSummary.textContent = `Overall Rating: ${res.score}/100`;

      // Update Bar Fills
      if (fillClarity) fillClarity.style.width = `${(res.breakdown.clarity / 25) * 100}%`;
      if (fillContext) fillContext.style.width = `${(res.breakdown.context / 25) * 100}%`;
      if (fillConstraints) fillConstraints.style.width = `${(res.breakdown.constraints / 25) * 100}%`;
      if (fillFormatting) fillFormatting.style.width = `${(res.breakdown.formatting / 25) * 100}%`;

      if (metricClarity) metricClarity.textContent = `${res.breakdown.clarity}/25`;
      if (metricContext) metricContext.textContent = `${res.breakdown.context}/25`;
      if (metricConstraints) metricConstraints.textContent = `${res.breakdown.constraints}/25`;
      if (metricFormatting) metricFormatting.textContent = `${res.breakdown.formatting}/25`;

      // Critique
      if (critiqueBox) {
        critiqueBox.innerHTML = res.critique.map((c) => `<div style="margin-bottom: 0.35rem;">💡 ${c}</div>`).join('');
      }

      // Enhanced Blueprint
      if (enhancedContent) {
        enhancedContent.textContent = res.enhancedVersion;
      }

      // Award XP for evaluation
      appState.xp += 25;
      appState.evaluatedPromptsCount = (appState.evaluatedPromptsCount || 0) + 1;
      saveProgress(appState);
      updateHud();

      showToast(`Prompt Evaluated! Score: ${res.score}/100 (+25 XP)`);
      logEvent('telemetry_logs', 'prompt_evaluated', { score: res.score, tier: res.tier });
    });
  }

  if (btnCopyEnhanced && enhancedContent) {
    btnCopyEnhanced.addEventListener('click', () => {
      navigator.clipboard.writeText(enhancedContent.textContent).then(() => {
        showToast('📋 Auto-Enhanced prompt copied!');
      });
    });
  }
}

// Render Knowledge Check Exam
function renderQuiz() {
  const container = document.getElementById('quizQuestionsContainer');
  if (!container) return;

  container.innerHTML = QUIZ_QUESTIONS.map((q, idx) => {
    const opts = q.options
      .map(
        (opt, optIdx) => `
        <label class="quiz-opt-label">
          <input type="radio" name="q_${q.id}" value="${optIdx}">
          <span>${opt}</span>
        </label>
      `
      )
      .join('');

    return `
      <div class="quiz-card">
        <div class="quiz-q-num">Question ${idx + 1} of ${QUIZ_QUESTIONS.length}</div>
        <div class="quiz-q-text">${q.question}</div>
        <div class="quiz-options">
          ${opts}
        </div>
      </div>
    `;
  }).join('');

  const btnSubmit = document.getElementById('btnSubmitQuiz');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      const nameInput = document.getElementById('learnerName');
      const learnerName = nameInput ? nameInput.value.trim() : 'AI Student';

      const userAnswers = {};
      QUIZ_QUESTIONS.forEach((q) => {
        const checked = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (checked) {
          userAnswers[q.id] = parseInt(checked.value, 10);
        }
      });

      const answeredCount = Object.keys(userAnswers).length;
      if (answeredCount < QUIZ_QUESTIONS.length) {
        showToast(`Please answer all questions (${answeredCount}/${QUIZ_QUESTIONS.length} completed).`);
        return;
      }

      const outcome = gradeQuiz(userAnswers, learnerName);

      if (outcome.passed) {
        appState.quizPassed = true;
        appState.quizBestScore = Math.max(appState.quizBestScore || 0, outcome.percentage);
        appState.xp += 500;
        appState.certificate = outcome.certificate;
        saveProgress(appState);
        updateHud();

        showToast(`🎓 Exam Passed! Score: ${outcome.percentage}%. Certificate generated!`);
        renderCertificate(outcome.certificate);
        logEvent('telemetry_logs', 'exam_passed', { score: outcome.percentage, learnerName });
      } else {
        showToast(`Score: ${outcome.percentage}%. Minimum 70% required to pass. Please review and try again.`);
        logEvent('telemetry_logs', 'exam_failed', { score: outcome.percentage });
      }
    });
  }
}

// Render Certificate
function renderCertificate(cert) {
  const certContainer = document.getElementById('certContainer');
  const quizForm = document.getElementById('quizForm');
  if (!certContainer) return;

  certContainer.style.display = 'block';
  if (quizForm) quizForm.style.display = 'none';

  certContainer.innerHTML = `
    <div class="certificate-view">
      <div class="cert-header">
        <img src="/logo.svg" alt="11Hopem" style="width: 54px; height: 54px; margin-bottom: 0.75rem;">
        <h3>Certificate of Achievement</h3>
        <p style="color: #94a3b8; font-size: 0.95rem;">11Hopem AI Academy • Professional Credential</p>
      </div>

      <p style="margin-top: 1.5rem; color: #cbd5e1; font-size: 1rem;">This certifies that</p>
      <div class="cert-recipient">${cert.recipientName}</div>
      <p style="color: #cbd5e1; max-width: 540px; margin: 0 auto; font-size: 1.05rem;">
        has successfully completed the comprehensive curriculum and demonstrated mastery in <strong>${cert.courseTitle}</strong> with a passing score of <strong>${cert.scorePercentage}%</strong>.
      </p>

      <div class="cert-meta">
        <div>Certificate ID: <strong>${cert.id}</strong></div>
        <div>Date of Issue: <strong>${new Date(cert.issuedAt).toLocaleDateString()}</strong></div>
        <div style="margin-top: 0.5rem;">Verified by: <a href="https://11hopem.com" target="_blank" style="color: #06b6d4; font-weight: 700;">11Hopem</a></div>
      </div>

      <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
        <button id="btnPrintCert" class="btn-primary">🖨️ Print / Save as PDF</button>
        <button id="btnRetakeQuiz" class="btn-secondary">Retake Exam</button>
      </div>
    </div>
  `;

  document.getElementById('btnPrintCert')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btnRetakeQuiz')?.addEventListener('click', () => {
    certContainer.style.display = 'none';
    if (quizForm) quizForm.style.display = 'block';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateHud();
  renderTracks();
  setupModalClose();
  renderCheatsheets();
  setupPromptLab();
  renderQuiz();

  // If user already passed, show certificate directly
  if (appState.quizPassed && appState.certificate) {
    renderCertificate(appState.certificate);
  }

  logEvent('visitor_logs', 'app_loaded', { path: window.location.pathname });
});
