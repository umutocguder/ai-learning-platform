/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'data', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function scanFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', 'data', 'dist'].includes(entry.name)) continue;
      scanFiles(fullPath, fileList);
    } else {
      if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css') || entry.name.endsWith('.json') || entry.name.endsWith('.svg') || entry.name.endsWith('.md')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

try {
  const files = scanFiles(rootDir);
  const manifest = {};
  let combinedHashInput = '';

  for (const file of files) {
    const relPath = path.relative(rootDir, file);
    const hash = computeFileHash(file);
    manifest[relPath] = hash;
    combinedHashInput += `${relPath}:${hash};`;
  }

  const overallHash = crypto.createHash('sha256').update(combinedHashInput).digest('hex');
  const timestamp = new Date().toISOString();

  const backupData = {
    projectId: 'ai-learning-platform',
    author: '11Hopem <umutocgdr@gmail.com>',
    timestamp,
    overallHash,
    fileCount: files.length,
    manifest
  };

  const backupFile = path.join(backupDir, 'ai_learning_platform_latest_backup.json');
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');

  const historyFile = path.join(backupDir, 'backup_history.jsonl');
  fs.appendFileSync(historyFile, JSON.stringify({ timestamp, overallHash, fileCount: files.length }) + '\n', 'utf-8');

  console.log(`✅ [Rule 17 Backup]: Snapshot created. SHA-256: ${overallHash.slice(0, 16)}...`);
} catch (err) {
  console.error('❌ [Rule 17 Backup Error]:', err.message);
  process.exit(1);
}
