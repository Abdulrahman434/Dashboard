interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function PillTabs({ tabs, activeTab, onChange, className = '' }: PillTabsProps) {
  return (
    <div className={`border-b-2 border-gray-200 px-2 pt-2 flex gap-1 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={`px-6 py-3 font-['Poppins',sans-serif] text-[14px] font-medium rounded-t-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.id
              ? 'bg-[#4EBEE3] text-white'
              : tab.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#16274D] hover:bg-gray-50'
          }`}
        >
          {tab.label}
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
