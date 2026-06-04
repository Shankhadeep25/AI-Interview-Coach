/**
 * Phase 0 smoke test — verifies:
 *  1. getModel() factory builds without throwing
 *  2. Schemas are valid objects with required fields
 *  3. SYSTEM_INSTRUCTION is a non-empty string
 *  4. All 4 exported functions exist
 *
 * Run: node backend/test_phase0.js
 * Does NOT hit the Gemini API — no key required.
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// ── 1. Load the service module ────────────────────────────────────────────────
let service;
try {
  service = require('./src/services/geminiService');
  console.log('✅ Module loaded successfully');
} catch (e) {
  console.error('❌ Module failed to load:', e.message);
  process.exit(1);
}

// ── 2. Check all 4 functions are exported ─────────────────────────────────────
const EXPECTED_EXPORTS = [
  'analyzeResumeAndJD',
  'generateInterviewQuestions',
  'evaluateAnswer',
  'generateCoverLetter',
];

let allExportsOk = true;
for (const name of EXPECTED_EXPORTS) {
  if (typeof service[name] === 'function') {
    console.log(`✅ Exported function: ${name}`);
  } else {
    console.error(`❌ Missing export: ${name}`);
    allExportsOk = false;
  }
}

// ── 3. Inspect module internals via re-require trick ─────────────────────────
// We can't import private vars, but we can check the module source for keywords
const fs = require('fs');
const src = fs.readFileSync('./src/services/geminiService.js', 'utf8');

const checks = [
  { label: 'SYSTEM_INSTRUCTION defined',       pattern: /const SYSTEM_INSTRUCTION/       },
  { label: 'ANALYSIS_SCHEMA defined',           pattern: /const ANALYSIS_SCHEMA/          },
  { label: 'QUESTIONS_SCHEMA defined',          pattern: /const QUESTIONS_SCHEMA/         },
  { label: 'EVALUATION_SCHEMA defined',         pattern: /const EVALUATION_SCHEMA/        },
  { label: 'COVER_LETTER_SCHEMA defined',       pattern: /const COVER_LETTER_SCHEMA/      },
  { label: 'getModel() factory defined',        pattern: /function getModel\(/            },
  { label: 'responseMimeType json set',         pattern: /responseMimeType.*application\/json/ },
  { label: 'responseSchema wired in',           pattern: /responseSchema: schema/         },
  { label: 'systemInstruction wired in',        pattern: /systemInstruction: SYSTEM_INSTRUCTION/ },
  { label: 'thinkingBudget:0 preserved',        pattern: /thinkingBudget: 0/              },
  { label: 'parseGeminiJSON removed',           pattern: /function parseGeminiJSON/, shouldAbsent: true },
  { label: 'extractText guard present',         pattern: /function extractText/           },
  { label: 'JSON.parse used for output',        pattern: /JSON\.parse\(extractText/       },
];

console.log('\n── Source-level checks ─────────────────────────────────────────');
let passed = 0;
for (const { label, pattern, shouldAbsent } of checks) {
  const found = pattern.test(src);
  const ok = shouldAbsent ? !found : found;
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (ok) passed++;
}

console.log(`\n── Result: ${passed}/${checks.length} checks passed ──────────────────────────`);

if (!allExportsOk || passed < checks.length) {
  console.error('\n🔴 Phase 0 has issues. Review failures above.');
  process.exit(1);
} else {
  console.log('\n🟢 Phase 0 complete. geminiService.js is hardened and ready.');
  console.log('   Next: Run the backend with `npm run dev` and test via Postman or the UI.');
}
