import { useCallback, useEffect, useState } from 'react';
import { profileService, PROFILE_EVENT, type ProfileCategory, type ProfileContent } from '../../services/hospitalProfileService';

/** Live categories + content map; re-reads after any write (and across tabs). */
export function useProfile() {
  const load = () => {
    const categories = profileService.listCategories();
    const content: Record<string, ProfileContent | null> = {};
    categories.forEach((c) => (content[c.id] = profileService.getContent(c.id)));
    return { categories, content };
  };
  const [state, setState] = useState(load);
  const refresh = useCallback(() => setState(load()), []);
  useEffect(() => {
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PROFILE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
  return state as { categories: ProfileCategory[]; content: Record<string, ProfileContent | null> };
}
