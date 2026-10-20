/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  CURRICULUM_TRACKS,
  READY_PROMPT_CHEATSHEETS,
  QUIZ_QUESTIONS,
  evaluatePrompt,
  gradeQuiz,
  calculateLevel
} from '../src/lib/academyEngine.js';
import { scrubSensitiveData } from '../src/telemetry/firebaseLogger.js';

describe('AI Learning Platform — Academy & Engine Verification', () => {
  test('should verify 6 core curriculum tracks are defined with modules', () => {
    assert.strictEqual(CURRICULUM_TRACKS.length >= 6, true);
    for (const track of CURRICULUM_TRACKS) {
      assert.strictEqual(typeof track.id, 'string');
      assert.strictEqual(typeof track.title, 'string');
      assert.strictEqual(track.modules.length >= 2, true);
      for (const mod of track.modules) {
        assert.strictEqual(typeof mod.title, 'string');
        assert.strictEqual(Array.isArray(mod.keyTakeaways), true);
        assert.strictEqual(typeof mod.codeSnippet, 'string');
      }
    }
  });

  test('should evaluate empty or blank prompts gracefully', () => {
    const emptyRes = evaluatePrompt('');
    assert.strictEqual(emptyRes.score, 0);
    assert.strictEqual(emptyRes.tier, 'Empty');
  });

  test('should evaluate basic prompt vs advanced prompt with higher score', () => {
    const weakPrompt = 'tell me how to code';
    const strongPrompt = `Act as a Senior Principal Cloud Architect.
Context: We are designing an enterprise event-driven architecture using Kafka and Postgres.
Constraints:
- Must avoid single points of failure.
- Ensure strict zero breaking changes and sub-50ms latency.
- Do not use deprecated libraries.
Format your output as a Markdown table with column headers: Service, RTO, RPO, and Scaling Policy.`;

    const weakRes = evaluatePrompt(weakPrompt);
    const strongRes = evaluatePrompt(strongPrompt);

    assert.strictEqual(strongRes.score > weakRes.score, true);
    assert.strictEqual(strongRes.score >= 80, true);
    assert.strictEqual(strongRes.tier, 'Master Prompt');
    assert.strictEqual(typeof strongRes.enhancedVersion, 'string');
  });

  test('should grade quiz accurately and award verified certificate on passing', () => {
    const perfectAnswers = {};
    QUIZ_QUESTIONS.forEach((q) => {
      perfectAnswers[q.id] = q.correctAnswerIndex;
    });

    const passOutcome = gradeQuiz(perfectAnswers, 'Umut Öçgüder');
    assert.strictEqual(passOutcome.score, 10);
    assert.strictEqual(passOutcome.percentage, 100);
    assert.strictEqual(passOutcome.passed, true);
    assert.notStrictEqual(passOutcome.certificate, null);
    assert.strictEqual(passOutcome.certificate.recipientName, 'Umut Öçgüder');
    assert.strictEqual(passOutcome.certificate.issuer, '11Hopem AI Academy');

    // Failing attempt
    const failAnswers = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3 };
    const failOutcome = gradeQuiz(failAnswers, 'Test User');
    assert.strictEqual(failOutcome.passed, false);
    assert.strictEqual(failOutcome.certificate, null);
  });

  test('should calculate user XP levels correctly', () => {
    assert.strictEqual(calculateLevel(50).title, 'AI Novice');
    assert.strictEqual(calculateLevel(350).title, 'AI Explorer');
    assert.strictEqual(calculateLevel(800).title, 'Prompt Engineer Pro');
    assert.strictEqual(calculateLevel(1500).title, 'Autonomous Agent Architect');
    assert.strictEqual(calculateLevel(2500).title, 'AI Grandmaster');
  });

  test('should sanitize sensitive PII in telemetry logger', () => {
    const raw = {
      password: 'superSecretPassword123',
      apiKey: 'sk-proj-1234567890abcdef',
      userEmail: 'student@example.com',
      nationalId: '12345678901'
    };

    const sanitized = scrubSensitiveData(raw);
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.apiKey, '[REDACTED]');
    assert.strictEqual(sanitized.userEmail, '[REDACTED_EMAIL]');
    assert.strictEqual(sanitized.nationalId, '[REDACTED_ID]');
  });
});
