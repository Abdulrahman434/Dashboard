/**
 * sectionVisibilityService.ts
 *
 * Manages global patient terminal section visibility settings (Care Overview,
 * My Care Plan, Financial, Lab Results, Imaging, Baby Camera, Discharge Plan,
 * Observations, Education) and per-patient overrides.
 */

export type SectionKey =
  | 'careOverview'
  | 'carePlan'
  | 'financial'
  | 'labs'
  | 'imaging'
  | 'baby'
  | 'discharge'
  | 'observations'
  | 'education';

export interface SectionMeta {
  key: SectionKey;
  label: string;
  description: string;
}

export const SECTIONS_META: SectionMeta[] = [
  { key: 'careOverview', label: 'Care Overview', description: 'Patient care team, admission overview, and vitals' },
  { key: 'observations', label: 'Observations', description: 'Nursing notes, pain logs, and clinical logs' },
  { key: 'carePlan', label: 'My Care Plan', description: 'Scheduled clinical tasks and activities' },
  { key: 'labs', label: 'Lab Results', description: 'Laboratory test findings and diagnostic reports' },
  { key: 'imaging', label: 'Imaging', description: 'X-Ray, MRI, CT scan results and radiology reports' },
  { key: 'education', label: 'Education', description: 'Patient education materials and videos' },
  { key: 'baby', label: 'Baby Camera', description: 'Nursery live camera feed for newborn monitoring' },
  { key: 'discharge', label: 'Discharge Plan', description: 'Post-discharge instructions and follow-up tasks' },
  { key: 'financial', label: 'Financial', description: 'Hospital bill breakdown and insurance coverage' },
];

export type SectionVisibilityMap = Record<SectionKey, boolean>;

const GLOBAL_VISIBILITY_KEY = 'careinn_global_section_visibility';
const PATIENT_OVERRIDES_KEY = 'careinn_patient_section_overrides';

export const DEFAULT_GLOBAL_VISIBILITY: SectionVisibilityMap = {
  careOverview: true,
  carePlan: true,
  financial: true,
  labs: true,
  imaging: true,
  baby: true,
  discharge: true,
  observations: true,
  education: true,
};

export const sectionVisibilityService = {
  getGlobalVisibility(): SectionVisibilityMap {
    try {
      const raw = localStorage.getItem(GLOBAL_VISIBILITY_KEY);
      if (!raw) return { ...DEFAULT_GLOBAL_VISIBILITY };
      return { ...DEFAULT_GLOBAL_VISIBILITY, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_GLOBAL_VISIBILITY };
    }
  },

  saveGlobalVisibility(settings: SectionVisibilityMap) {
    try {
      localStorage.setItem(GLOBAL_VISIBILITY_KEY, JSON.stringify(settings));
      // Reset all per-patient custom overrides so every patient returns to global selection
      localStorage.removeItem(PATIENT_OVERRIDES_KEY);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('careinn-global-visibility-updated'));
    } catch (e) {
      console.error('Failed to save global section visibility:', e);
    }
  },

  getAllPatientOverrides(): Record<string, SectionVisibilityMap> {
    try {
      const raw = localStorage.getItem(PATIENT_OVERRIDES_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  getPatientVisibility(roomNo: string): SectionVisibilityMap {
    const overrides = this.getAllPatientOverrides();
    if (overrides[roomNo]) {
      return { ...this.getGlobalVisibility(), ...overrides[roomNo] };
    }
    return this.getGlobalVisibility();
  },

  hasPatientOverride(roomNo: string): boolean {
    const overrides = this.getAllPatientOverrides();
    return !!overrides[roomNo];
  },

  savePatientVisibility(roomNo: string, settings: SectionVisibilityMap) {
    try {
      const overrides = this.getAllPatientOverrides();
      overrides[roomNo] = settings;
      localStorage.setItem(PATIENT_OVERRIDES_KEY, JSON.stringify(overrides));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('careinn-patient-visibility-updated', { detail: { roomNo } }));
    } catch (e) {
      console.error('Failed to save patient section visibility override:', e);
    }
  },

  clearPatientOverride(roomNo: string) {
    try {
      const overrides = this.getAllPatientOverrides();
      delete overrides[roomNo];
      localStorage.setItem(PATIENT_OVERRIDES_KEY, JSON.stringify(overrides));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('careinn-patient-visibility-updated', { detail: { roomNo } }));
    } catch (e) {
      console.error('Failed to clear patient section visibility override:', e);
    }
  },
};
