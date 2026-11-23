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
  /** Background image (shown behind the welcome card). Stored under its original key. */
  hospitalImage: string | null;
  hospitalImageName: string;
  /** Terms & Conditions shown in bedside preferences: an external page or a PDF. */
  termsType: 'link' | 'pdf';
  termsUrl: string;
  termsPdf: string | null;
  termsPdfName: string;
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
  termsType: 'link',
  termsUrl: '',
  termsPdf: null,
  termsPdfName: '',
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

/** Accepts http(s) web addresses only. */
export const isWebUrl = (v: string) => /^https?:\/\/[^\s/.]+\.[^\s]+$/i.test(v.trim());

/**
 * The Terms & Conditions document for bedside preferences, or null when not
 * set. The bedside reader shows either kind in the same preview and requires
 * scrolling to the end before the patient can accept.
 */
export function termsFor(s: IdentitySettings = readIdentitySettings()): { kind: 'link'; url: string } | { kind: 'pdf'; url: string; name: string } | null {
  if (s.termsType === 'pdf') return s.termsPdf ? { kind: 'pdf', url: s.termsPdf, name: s.termsPdfName } : null;
  return s.termsUrl && isWebUrl(s.termsUrl) ? { kind: 'link', url: s.termsUrl.trim() } : null;
}
