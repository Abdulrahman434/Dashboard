/**
 * educationService
 * --------------------------------------------------------------------------
 * Thin, swappable CRUD service for Education Materials.
 *
 * INTERIM PERSISTENCE: localStorage (key `careinn_education_materials`).
 * This mirrors the existing dashboard persistence convention used by the
 * Staff service (see staffService.ts).
 *
 * ⚠️ A real backend endpoint is REQUIRED for production. Every method below is
 * marked with `// TODO(backend)` at the persistence call site so the swap to a
 * real API is mechanical: keep the same method signatures, replace the
 * localStorage read/write with a fetch to the Education Materials endpoint.
 */

const EDUCATION_KEY = 'careinn_education_materials';

/** Custom event so any consumer re-reads after a write. */
export const EDUCATION_EVENT = 'careinn:education-changed';

export type ContentType = 'PDF' | 'Video' | 'URL';
export type EducationScope = 'General' | 'Specific';

export interface EducationMaterial {
  id: string;
  nameEn: string;
  nameAr: string;
  contentType: ContentType;
  contentEn: string;   // URL string (PDF link, video link, or plain URL)
  contentAr: string;   // optional URL string
  scope: EducationScope;  // General = auto all rooms, Specific = nurse assigns
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readMaterials(): EducationMaterial[] {
  if (typeof window === 'undefined') return [];
  // TODO(backend): replace with GET /education-materials
  return safeParse<EducationMaterial[]>(localStorage.getItem(EDUCATION_KEY), []);
}

function writeMaterials(materials: EducationMaterial[]): void {
  if (typeof window === 'undefined') return;
  // TODO(backend): replace with the appropriate POST/PUT/DELETE /education-materials call
  localStorage.setItem(EDUCATION_KEY, JSON.stringify(materials));
  window.dispatchEvent(new CustomEvent(EDUCATION_EVENT));
}

/** Monotonic-ish id without Math.random (kept deterministic-friendly). */
let idCounter = 0;
function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

export const educationService = {
  list(): EducationMaterial[] {
    return readMaterials();
  },

  get(id: string): EducationMaterial | undefined {
    return readMaterials().find((m) => m.id === id);
  },

  create(input: {
    nameEn: string;
    nameAr: string;
    contentType: ContentType;
    contentEn: string;
    contentAr: string;
    scope: EducationScope;
  }): EducationMaterial {
    const materials = readMaterials();
    const material: EducationMaterial = {
      id: makeId('edu'),
      nameEn: input.nameEn.trim(),
      nameAr: input.nameAr.trim(),
      contentType: input.contentType,
      contentEn: input.contentEn.trim(),
      contentAr: input.contentAr.trim(),
      scope: input.scope,
    };
    writeMaterials([...materials, material]);
    return material;
  },

  update(
    id: string,
    patch: Partial<Pick<EducationMaterial, 'nameEn' | 'nameAr' | 'contentType' | 'contentEn' | 'contentAr' | 'scope'>>,
  ): EducationMaterial | undefined {
    const materials = readMaterials();
    let updated: EducationMaterial | undefined;
    const next = materials.map((m) => {
      if (m.id !== id) return m;
      updated = {
        ...m,
        ...patch,
        nameEn: (patch.nameEn ?? m.nameEn).trim(),
        nameAr: (patch.nameAr ?? m.nameAr).trim(),
        contentEn: (patch.contentEn ?? m.contentEn).trim(),
        contentAr: (patch.contentAr ?? m.contentAr).trim(),
      };
      return updated;
    });
    writeMaterials(next);
    return updated;
  },

  remove(id: string): void {
    writeMaterials(readMaterials().filter((m) => m.id !== id));
  },

  /** Check English name uniqueness (case-insensitive), optionally excluding one id. */
  isNameTaken(nameEn: string, excludeId?: string): boolean {
    const n = nameEn.trim().toLowerCase();
    return readMaterials().some((m) => m.id !== excludeId && m.nameEn.trim().toLowerCase() === n);
  },
};
