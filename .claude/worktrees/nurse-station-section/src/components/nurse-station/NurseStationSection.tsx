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
  // If a specific station is focused, default its view to the card grid Overview tab
  const [activeTab, setActiveTab] = useState<NurseStationTab>(
    focusStationId ? 'overview' : initialTab
  );

  // Sync tab state on sidebar navigation
  useEffect(() => {
    setActiveTab(focusStationId ? 'overview' : initialTab);
  }, [initialTab, focusStationId]);

  // A focused station page handling
  if (focusStationId) {
    if (activeTab === 'overview') {
      return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
          <div className="flex-1 overflow-auto">
            <NurseStationWardView
              focusStationId={focusStationId}
              onManageClick={() => setActiveTab('manage')}
            />
          </div>
        </div>
      );
    } else {
      // In manage mode, we show the tabs at the top to let the user switch back to Overview,
      // and display the CRUD table of rooms.
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
            <NurseStationManagePage focusStationId={focusStationId} onNavigate={onNavigate} />
          </div>
        </div>
      );
    }
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
