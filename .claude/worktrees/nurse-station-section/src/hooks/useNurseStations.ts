import { useCallback, useEffect, useState } from 'react';
import {
  nurseStationService,
  NURSE_STATIONS_EVENT,
  type Station,
} from '../services/nurseStationService';

/**
 * Subscribe to the Nurse Station store so any consumer (sidebar, Manage tab,
 * User Roles) stays in sync after a create/update/delete — including across
 * browser tabs (via the native `storage` event).
 */
export function useNurseStations() {
  const [stations, setStations] = useState<Station[]>(() => nurseStationService.list());

  const refresh = useCallback(() => {
    setStations(nurseStationService.list());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(NURSE_STATIONS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(NURSE_STATIONS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { stations, refresh };
}
