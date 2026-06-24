import { useCallback, useEffect, useState } from 'react';
import { staffService, STAFF_EVENT, type StaffMember } from '../services/staffService';

/**
 * Subscribe to the Staff store so any consumer stays in sync after a
 * create/update/delete — including across browser tabs (via the native
 * `storage` event).
 */
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(() => staffService.list());

  const refresh = useCallback(() => {
    setStaff(staffService.list());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(STAFF_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(STAFF_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { staff, refresh };
}
