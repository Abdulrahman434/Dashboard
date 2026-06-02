import { useState } from 'react';
import { Monitor } from 'lucide-react';
import ChannelTypePage from './ChannelTypePage';
import ChannelManagerPage from './ChannelManagerPage';
import PillTabs from './PillTabs';

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'channels'>('types');

  const tabs = [
    { id: 'types', label: 'Channel Types' },
    { id: 'channels', label: 'Channels Manager' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Monitor size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Channels
              </h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Manage channel types and TV channels
              </p>
            </div>
          </div>

          {/* Tabs */}
          <PillTabs 
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as 'types' | 'channels')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'types' ? <ChannelTypePage /> : <ChannelManagerPage />}
      </div>
    </div>
  );
}