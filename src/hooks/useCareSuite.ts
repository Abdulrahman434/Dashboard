import { useCallback, useEffect, useState } from 'react';
import {
  careSuiteService,
  CARESUITE_EVENT,
  type Team,
  type TeamCategory,
  type LibraryItem,
  type WorkflowStep,
  type CSRequest,
  type DeviceRow,
} from '../services/careSuiteService';

/**
 * Subscribe to the CareSuite store so any consumer (sidebar, User Roles,
 * Library/Workflow/Teams pages, dashboards) stays in sync after a
 * create/update/delete — including across browser tabs (native `storage`
 * event), same pattern as useNurseStations.
 */
export function useCareSuite() {
  const [categories, setCategories] = useState<TeamCategory[]>(() => careSuiteService.listCategories());
  const [library, setLibrary] = useState<LibraryItem[]>(() => careSuiteService.listLibrary());
  const [workflow, setWorkflow] = useState<WorkflowStep[]>(() => careSuiteService.listWorkflow());
  const [teams, setTeams] = useState<Team[]>(() => careSuiteService.listTeams());
  const [requests, setRequests] = useState<CSRequest[]>(() => careSuiteService.listRequests());
  const [devices, setDevices] = useState<DeviceRow[]>(() => careSuiteService.listDevices());

  const refresh = useCallback(() => {
    setCategories(careSuiteService.listCategories());
    setLibrary(careSuiteService.listLibrary());
    setWorkflow(careSuiteService.listWorkflow());
    setTeams(careSuiteService.listTeams());
    setRequests(careSuiteService.listRequests());
    setDevices(careSuiteService.listDevices());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CARESUITE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CARESUITE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { categories, library, workflow, teams, requests, devices, refresh };
}

/** Lightweight variant for consumers that only need the Teams list (sidebar, User Roles). */
export function useCareSuiteTeams() {
  const [teams, setTeams] = useState<Team[]>(() => careSuiteService.listTeams());

  const refresh = useCallback(() => {
    setTeams(careSuiteService.listTeams());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CARESUITE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CARESUITE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { teams, refresh };
}

/** Ticks every `intervalMs` — drives live "time in status" counters. */
export function useTick(intervalMs = 30000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
