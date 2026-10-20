/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

const FIREBASE_PROJECT_ID = 'hopem-software-cloud';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

/**
 * PII Sanitizer: Redacts passwords, auth tokens, credit cards, emails and national IDs
 */
export function scrubSensitiveData(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized = Array.isArray(payload) ? [] : {};
  const sensitiveKeys = ['password', 'secret', 'token', 'authorization', 'apiKey', 'creditCard'];

  for (const [key, val] of Object.entries(payload)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'string') {
      let cleanVal = val.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');
      cleanVal = cleanVal.replace(/\b\d{11}\b/g, '[REDACTED_ID]');
      cleanVal = cleanVal.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CC]');
      sanitized[key] = cleanVal;
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = scrubSensitiveData(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Converts Javascript primitives into Cloud Firestore REST JSON format
 */
export function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      fields[key] = Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: item.toString() };
            return { stringValue: JSON.stringify(item) };
          })
        }
      };
    } else if (typeof val === 'object') {
      fields[key] = { stringValue: JSON.stringify(val) };
    }
  }
  return fields;
}

/**
 * Non-blocking telemetry dispatcher
 */
export async function logEvent(collectionName, eventName, metadata = {}) {
  try {
    const timestamp = new Date().toISOString();
    const payload = scrubSensitiveData({
      appId: 'ai-learning-platform',
      event: eventName,
      timestamp,
      environment: typeof window !== 'undefined' && window.location ? window.location.hostname : 'node',
      ...metadata
    });

    // In-browser local storage queue for resilience
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localKey = '11ai_academy_telemetry_queue';
        const queue = JSON.parse(window.localStorage.getItem(localKey) || '[]');
        queue.push({ collection: collectionName, payload, timestamp });
        if (queue.length > 50) queue.shift();
        window.localStorage.setItem(localKey, JSON.stringify(queue));
      } catch (_e) {
        // Silent local buffer fallback
      }
    }

    // Non-blocking fire-and-forget fetch to Firestore REST
    if (typeof fetch !== 'undefined') {
      const url = `${FIRESTORE_BASE_URL}/${collectionName}`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(payload) })
      }).catch(() => {
        // Suppress network failures to guarantee zero crash
      });
    }

    return { success: true, timestamp };
  } catch (_err) {
    // Zero-Crash Guarantee
    return { success: false, error: 'Telemetry non-blocking catch' };
  }
}
