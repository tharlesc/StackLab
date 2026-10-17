import { runContrastAudit, getContrastRatio } from '@/utils/contrast';
import { lightTheme, darkTheme } from '@/constants/theme';

describe('Design System WCAG Contrast Audit (F4.1)', () => {
  it('passes all text (>= 4.5:1) and UI component (>= 3.0:1) contrast pairs in both light and dark themes', () => {
    const { results, failures } = runContrastAudit();
    expect(results.length).toBeGreaterThanOrEqual(40);
    expect(failures).toEqual([]);
  });

  it('verifies key measured pairs cited in F4.1', () => {
    // Navy label on #F97316 >= 4.5:1 (measured ~5.69:1)
    expect(getContrastRatio(lightTheme.colors.onSecondary, lightTheme.colors.secondary)).toBeGreaterThanOrEqual(4.5);

    // tintText (#C2410C) on white and on #F3F4F6 >= 4.5:1
    expect(getContrastRatio(lightTheme.colors.tintText, lightTheme.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(lightTheme.colors.tintText, lightTheme.colors.surfaceVariant)).toBeGreaterThanOrEqual(4.5);

    // Dark theme primary button and avatar are clearly visible (>= 3.0:1 against surface)
    expect(getContrastRatio(darkTheme.colors.buttonPrimaryBg, darkTheme.colors.surface)).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio(darkTheme.colors.avatarBg, darkTheme.colors.surface)).toBeGreaterThanOrEqual(3.0);
  });
});
