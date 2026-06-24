import React, { useEffect, useState } from 'react';
import PillTabs from '../PillTabs';
import NurseStationPage from './NurseStationPage';
import NurseStationManagePage from './NurseStationManagePage';
import NurseStationWardView from './NurseStationWardView';

export type NurseStationTab = 'overview' | 'manage';

interface NurseStationSectionProps {
  /** Which sub-tab to open (Overview is the default for the section). */
  initialTab?: NurseStationTab;
  /** When opening Manage from a sidebar/table station entry, focus that station. */
  focusStationId?: string | null;
  /** Navigate to another sidebar route (e.g. a station's own entry). */
  onNavigate?: (item: string) => void;
}

export default function NurseStationSection({
  initialTab = 'overview',
  focusStationId,
  onNavigate,
}: NurseStationSectionProps) {
  const [activeTab, setActiveTab] = useState<NurseStationTab>(initialTab);

  // Sync tab when sidebar navigation changes the target station or initial tab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, focusStationId]);

  // Focused station page: always show tabs so the user can switch between Ward View and Manage
  if (focusStationId) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
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
            <NurseStationWardView
              focusStationId={focusStationId}
              onManageClick={() => setActiveTab('manage')}
            />
          ) : (
            <NurseStationManagePage focusStationId={focusStationId} onNavigate={onNavigate} />
          )}
        </div>
      </div>
    );
  }

  // General Nurse Station tabs page
  return (
    <div className="flex flex-col h-full bg-white">
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
