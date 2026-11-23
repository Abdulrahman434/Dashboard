export const IDENTITY_STORAGE_KEY = 'careinn-identity-settings';

export interface IdentitySettings {
  logo: string | null;
  logoName: string;
  /** Optional logo used on dark backgrounds (Dark Mode). */
  logoDark: string | null;
  logoDarkName: string;
  hospitalName: string;
  hospitalNameAr: string;
  hospitalShortName: string;
  hospitalImage: string | null;
  hospitalImageName: string;
  primaryColor: string;
  secondaryColor: string;
  englishFont: string;
  arabicFont: string;
}

export const defaultIdentitySettings: IdentitySettings = {
  logo: null,
  logoName: '',
  logoDark: null,
  logoDarkName: '',
  hospitalName: 'Dr. Soliman Fakeeh Hospital',
  hospitalNameAr: 'مستشفى الدكتور سليمان فقيه',
  hospitalShortName: 'DSFH',
  hospitalImage: null,
  hospitalImageName: '',
  primaryColor: '#4EBEE3',
  secondaryColor: '#16274D',
  englishFont: 'Poppins',
  arabicFont: 'Baloo Bhaijaan 2',
};

/** Safe read of saved settings; missing fields (old saved data) fall back to defaults. */
export function readIdentitySettings(): IdentitySettings {
  try {
    const saved = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!saved) return { ...defaultIdentitySettings };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return { ...defaultIdentitySettings };
    return { ...defaultIdentitySettings, ...parsed };
  } catch {
    return { ...defaultIdentitySettings };
  }
}

/** Pick the logo for a theme from given settings. Dark falls back to the default logo. */
export function pickLogo(s: Pick<IdentitySettings, 'logo' | 'logoDark'>, theme: 'light' | 'dark'): string | null {
  if (theme === 'dark') return s.logoDark || s.logo || null;
  return s.logo || null;
}

/**
 * Logo to show for a theme. Dark mode uses the dark-background logo when one
 * is uploaded, otherwise the default logo. Independent of any colour settings.
 * Patient apps should use this same rule.
 */
export function logoFor(theme: 'light' | 'dark'): string | null {
  return pickLogo(readIdentitySettings(), theme);
}
