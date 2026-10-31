#!/usr/bin/env node
/**
 * StackLab RDO Comprehensive E2E Test Runner
 * Implements 4-tier opaque-box test runner with clear pass/fail exit code semantics.
 * Exit code: 0 if all tests pass and coverage thresholds are met; 1 on any failure.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIERS = [
  {
    id: 1,
    name: 'Tier 1: Feature Coverage (>=5 test cases per feature for 27 features)',
    dir: 'tier1_features',
    minRequired: 135,
    files: [
      'f01_f05_core.test.mjs',
      'f06_f10_site.test.mjs',
      'f11_f13_docs.test.mjs',
      'f14_f16_photo.test.mjs',
      'f17_f19_lifecycle.test.mjs',
      'f20_f27_master.test.mjs',
    ],
  },
  {
    id: 2,
    name: 'Tier 2: Boundary & Corner Cases (>=5 boundary cases per feature)',
    dir: 'tier2_boundaries',
    minRequired: 135,
    files: [
      'f01_f05_boundaries.test.mjs',
      'f06_f10_boundaries.test.mjs',
      'f11_f13_boundaries.test.mjs',
      'f14_f16_boundaries.test.mjs',
      'f17_f19_boundaries.test.mjs',
      'f20_f27_boundaries.test.mjs',
    ],
  },
  {
    id: 3,
    name: 'Tier 3: Cross-Feature Combinations (Pairwise critical interactions)',
    dir: 'tier3_combinations',
    minRequired: 27,
    files: ['combinations.test.mjs'],
  },
  {
    id: 4,
    name: 'Tier 4: Real-World Scenarios (Full lifecycle application workflows)',
    dir: 'tier4_realworld',
    minRequired: 5,
    files: [
      'scenario1_rain_stoppage.test.mjs',
      'scenario2_photo_watermark.test.mjs',
      'scenario3_offline_lifecycle.test.mjs',
      'scenario4_heavy_site.test.mjs',
      'scenario5_rectification.test.mjs',
    ],
  },
];

console.log('='.repeat(80));
console.log('🚀 STACKLAB RDO E2E TEST SUITE RUNNER');
console.log(`   Node.js: ${process.version} | Platform: ${process.platform}`);
console.log(`   Working Directory: ${path.resolve(__dirname, '../..')}`);
console.log('='.repeat(80));

const startTime = Date.now();
let totalPassed = 0;
let totalFailed = 0;
const tierResults = [];

for (const tier of TIERS) {
  console.log(`\n▶ [START] ${tier.name}`);
  let tierPassed = 0;
  let tierFailed = 0;
  const fileOutputs = [];

  for (const filename of tier.files) {
    const fullPath = path.join(__dirname, tier.dir, filename);
    const relPath = path.relative(process.cwd(), fullPath);

    try {
      const output = execSync(`node --test "${fullPath}"`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Parse pass/fail counts from node:test output
      const passMatch = output.match(/ℹ pass (\d+)/);
      const failMatch = output.match(/ℹ fail (\d+)/);
      const passCount = passMatch ? parseInt(passMatch[1], 10) : 0;
      const failCount = failMatch ? parseInt(failMatch[1], 10) : 0;

      tierPassed += passCount;
      tierFailed += failCount;

      console.log(`  ✔ [PASS] ${relPath} (${passCount} tests)`);
      fileOutputs.push({ file: filename, pass: passCount, fail: failCount, ok: true });
    } catch (err) {
      const stdout = err.stdout ? err.stdout.toString() : '';
      const stderr = err.stderr ? err.stderr.toString() : '';
      const fullError = stdout + '\n' + stderr;

      const passMatch = fullError.match(/ℹ pass (\d+)/);
      const failMatch = fullError.match(/ℹ fail (\d+)/);
      const passCount = passMatch ? parseInt(passMatch[1], 10) : 0;
      const failCount = failMatch ? parseInt(failMatch[1], 10) : 1;

      tierPassed += passCount;
      tierFailed += failCount;

      console.error(`  ✖ [FAIL] ${relPath}`);
      console.error(fullError);
      fileOutputs.push({ file: filename, pass: passCount, fail: failCount, ok: false, error: fullError });
    }
  }

  totalPassed += tierPassed;
  totalFailed += tierFailed;

  const thresholdMet = tierPassed >= tier.minRequired && tierFailed === 0;
  tierResults.push({
    ...tier,
    passed: tierPassed,
    failed: tierFailed,
    thresholdMet,
  });

  const statusSymbol = thresholdMet ? '✔' : '✖';
  console.log(
    `◀ [DONE] ${statusSymbol} Tier ${tier.id}: ${tierPassed} passed, ${tierFailed} failed (Required: >=${tier.minRequired})`
  );
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n' + '='.repeat(80));
console.log('📊 E2E TEST EXECUTION SUMMARY REPORT');
console.log('='.repeat(80));
console.log(
  `| Tier | Description                                    | Min Req | Passed | Failed | Status |`
);
console.log(
  `|------|------------------------------------------------|---------|--------|--------|--------|`
);

for (const t of tierResults) {
  const desc = t.name.slice(0, 46).padEnd(46, ' ');
  const min = String(t.minRequired).padStart(7, ' ');
  const p = String(t.passed).padStart(6, ' ');
  const f = String(t.failed).padStart(6, ' ');
  const status = t.thresholdMet ? ' PASS ' : ' FAIL ';
  console.log(`| T${t.id}  | ${desc} | ${min} | ${p} | ${f} | ${status} |`);
}

console.log('-'.repeat(80));
console.log(`TOTAL TESTS EXECUTED: ${totalPassed + totalFailed}`);
console.log(`TOTAL PASSED:         ${totalPassed}`);
console.log(`TOTAL FAILED:         ${totalFailed}`);
console.log(`EXECUTION TIME:       ${totalDuration}s`);
console.log('='.repeat(80));

const allTiersMet = tierResults.every((t) => t.thresholdMet);

if (allTiersMet && totalFailed === 0) {
  console.log('🎉 VERDICT: ALL TIERS PASSED 100% CLEANLY — TEST SUITE VERIFIED GREEN');
  process.exit(0);
} else {
  console.error('❌ VERDICT: FAILURES DETECTED OR THRESHOLDS NOT MET');
  process.exit(1);
}
