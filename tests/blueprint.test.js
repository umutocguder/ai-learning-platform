/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('AI Learning Platform — Blueprint & Brand Standards (Rule 4, 9, 13)', () => {
  test('should verify mandatory blueprint files exist', () => {
    const requiredFiles = [
      'AGENTS.md',
      'CLAUDE.md',
      'WORKLOG.md',
      'README.md',
      '.gitignore',
      '.github/workflows/ci-cd.yml',
      'package.json'
    ];

    for (const relFile of requiredFiles) {
      const fullPath = path.join(rootDir, relFile);
      assert.strictEqual(fs.existsSync(fullPath), true, `Missing required blueprint file: ${relFile}`);
    }
  });

  test('should verify package author is 11Hopem', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    assert.strictEqual(pkg.author, '11Hopem <umutocgdr@gmail.com>');
  });

  test('should verify 1:1 brand logo and favicon equality (Rule 13)', () => {
    const assetLogo = fs.readFileSync(path.join(rootDir, 'assets/images/logo.svg'), 'utf-8');
    const publicLogo = fs.readFileSync(path.join(rootDir, 'public/logo.svg'), 'utf-8');
    const publicFavicon = fs.readFileSync(path.join(rootDir, 'public/favicon.svg'), 'utf-8');
    const publicIco = fs.readFileSync(path.join(rootDir, 'public/favicon.ico'), 'utf-8');

    assert.strictEqual(assetLogo, publicLogo, 'assets/images/logo.svg must match public/logo.svg');
    assert.strictEqual(assetLogo, publicFavicon, 'assets/images/logo.svg must match public/favicon.svg');
    assert.strictEqual(assetLogo, publicIco, 'assets/images/logo.svg must match public/favicon.ico');
  });
});
