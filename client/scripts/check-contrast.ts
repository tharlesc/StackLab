import {
  parseColor,
  blendOver,
  relativeLuminance,
  getContrastRatio,
  evaluateThemeContrast,
  runContrastAudit,
  type RGB,
  type ContrastCheckItem,
} from '@/utils/contrast';

export {
  parseColor,
  blendOver,
  relativeLuminance,
  getContrastRatio,
  evaluateThemeContrast,
  runContrastAudit,
  type RGB,
  type ContrastCheckItem,
};

export function executeContrastCheckCli(): void {
  const { results, failures } = runContrastAudit();
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    console.log(`[${status}] [${r.theme}] ${r.name}: ${r.actualRatio}:1 (min ${r.minRatio}:1)`);
  }
  if (failures.length > 0) {
    throw new Error(`Contrast check failed on ${failures.length} pair(s).`);
  }
  console.log(`\nAll ${results.length} contrast pairs passed WCAG minimums.`);
}
