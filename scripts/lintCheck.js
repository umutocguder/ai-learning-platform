/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 [Rule 20 Linting]: Starting static analysis for ai-learning-platform...');

let errorCount = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(rootDir, filePath);

  // Check 1: Forbidden Company Legal Suffix
  if (relPath !== 'scripts/lintCheck.js') {
    const forbiddenPatterns = ['Software' + ' Ltd', 'Limited' + ' Şirketi'];
    if (forbiddenPatterns.some((pattern) => content.includes(pattern))) {
      console.error(`❌ [Lint Error in ${relPath}]: Forbidden brand suffix found. Use '11Hopem' only.`);
      errorCount++;
    }
  }

  // Check 2: Mandatory Header in JS/CSS
  if ((filePath.endsWith('.js') || filePath.endsWith('.css')) && !filePath.includes('node_modules')) {
    if (!content.includes('Created by 11Hopem')) {
      console.error(`❌ [Lint Error in ${relPath}]: Missing 'Created by 11Hopem' copyright header.`);
      errorCount++;
    }
  }

  // Check 3: Zero Turkish in Code / Comments (Rule 3)
  if (filePath.endsWith('.js') && !filePath.includes('node_modules')) {
    const turkishChars = /[ğüşöçıİĞÜŞÖÇ]/;
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Allow Turkish in user name placeholder or explicit localization if any, but zero in code/comments
      if (line.includes('//') || line.includes('/*') || line.includes('*')) {
        if (turkishChars.test(line)) {
          console.error(`❌ [Lint Error in ${relPath}:${idx + 1}]: Turkish characters found in comment: "${line.trim()}"`);
          errorCount++;
        }
      }
    });
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', '.vercel', 'data', 'dist'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css') || entry.name.endsWith('.html') || entry.name.endsWith('.json')) {
      checkFile(fullPath);
    }
  }
}

walkDir(rootDir);

if (errorCount === 0) {
  console.log('✅ [Rule 20 All Passed]: Zero lint errors detected.');
  process.exit(0);
} else {
  console.error(`❌ [Rule 20 Failed]: ${errorCount} lint error(s) detected.`);
  process.exit(1);
}
