import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import PillTabs from '../PillTabs';
import { Btn } from './careSuiteAtoms';
import ItemsManagerTab from './ItemsManagerTab';
import CategoriesManagerTab from './CategoriesManagerTab';

export type CareSuiteManagerTab = 'items' | 'categories';

/** Sidebar route for each tab — the page is driven by the route so the sidebar highlight follows the tab. */
export const CARESUITE_TAB_ROUTE: Record<CareSuiteManagerTab, string> = {
  items: 'cs-library',
  categories: 'cs-categories',
};

const TABS = [
  { id: 'items', label: 'Items Manager' },
  { id: 'categories', label: 'Categories Manager' },
];

/** CareSuite Manager — Items Manager and Categories Manager tabs (Channels page layout). */
export default function CareSuiteManagerPage({
  tab,
  onNavigate,
}: {
  tab: CareSuiteManagerTab;
  onNavigate: (route: string) => void;
}) {
  // Incremented by the header's Add button; the active tab opens its own form.
  const [addSignal, setAddSignal] = useState(0);

  return (
    <div className="h-full flex flex-col font-['Poppins',sans-serif]">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <Layers size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-[19px] leading-tight font-semibold text-[#16274D]">CareSuite Manager</h1>
                <p className="text-[13px] text-[#6B7280]">
                  Manage patient services (amenities and requests) and organize their categories.
                </p>
              </div>
            </div>
            <Btn variant="primary" onClick={() => setAddSignal((n) => n + 1)} className="shrink-0">
              <Plus size={16} />
              {tab === 'items' ? 'Add Item' : 'Add Category'}
            </Btn>
          </div>
          <PillTabs
            tabs={TABS}
            activeTab={tab}
            onChange={(id) => onNavigate(CARESUITE_TAB_ROUTE[id as CareSuiteManagerTab])}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {/* key resets each tab's local state (search, open views) when switching */}
        {tab === 'items' ? (
          <ItemsManagerTab key="items" addSignal={addSignal} />
        ) : (
          <CategoriesManagerTab key="categories" addSignal={addSignal} />
        )}
      </div>
    </div>
  );
}
