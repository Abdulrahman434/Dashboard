import React, { useEffect, useState } from 'react';
import PillTabs from '../PillTabs';
import NurseStationPage from './NurseStationPage';
import NurseStationManagePage from './NurseStationManagePage';

export type NurseStationTab = 'overview' | 'manage';

interface NurseStationSectionProps {
  /** Which sub-tab to open (Overview is the default for the section). */
  initialTab?: NurseStationTab;
  /** When opening Manage from a sidebar/table station entry, focus that station. */
  focusStationId?: string | null;
  /** Navigate to another sidebar route (e.g. a station's own entry). */
  onNavigate?: (item: string) => void;
}

/**
 * Top-level Nurse Station section. Two sub-tabs / nested views:
 *   - Overview = the existing ward-grid view (unchanged behavior).
 *   - Manage   = Nurse Station Ward CRUD.
 * Default opens Overview.
 */
export default function NurseStationSection({
  initialTab = 'overview',
  focusStationId,
  onNavigate,
}: NurseStationSectionProps) {
  const [activeTab, setActiveTab] = useState<NurseStationTab>(initialTab);

  // Respond to sidebar navigation that targets a specific sub-tab/station.
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, focusStationId]);

  // A focused station is its OWN navigation tab (reached from the sidebar entry
  // or a Manage-table row). No Overview/Manage pills, no back button.
  if (focusStationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <NurseStationManagePage focusStationId={focusStationId} onNavigate={onNavigate} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200">
        <PillTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'manage', label: 'Manage' },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as NurseStationTab)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' ? (
          <NurseStationPage />
        ) : (
          <NurseStationManagePage onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}
