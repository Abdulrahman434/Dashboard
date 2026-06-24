import { useCallback, useEffect, useState } from 'react';
import { educationService, EDUCATION_EVENT, type EducationMaterial } from '../services/educationService';

/**
 * Subscribe to the Education Materials store so any consumer stays in sync after a
 * create/update/delete — including across browser tabs (via the native
 * `storage` event).
 */
export function useEducation() {
  const [materials, setMaterials] = useState<EducationMaterial[]>(() => educationService.list());

  const refresh = useCallback(() => {
    setMaterials(educationService.list());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(EDUCATION_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EDUCATION_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { materials, refresh };
}
