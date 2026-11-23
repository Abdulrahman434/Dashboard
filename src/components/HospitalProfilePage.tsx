import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import PillTabs from './PillTabs';
import { Btn } from './caresuite/careSuiteAtoms';
import CategoriesTab from './hospital-profile/CategoriesTab';
import ContentTab from './hospital-profile/ContentTab';

type Tab = 'categories' | 'content';

/**
 * Hospital Profile — what patients see in "About Us": categories (order,
 * visibility) and each category's English / Arabic content.
 */
export default function HospitalProfilePage() {
  const [tab, setTab] = useState<Tab>('categories');
  // category opened from the Categories tab ("Edit content") lands selected in Content
  const [focusId, setFocusId] = useState<string | null>(null);
  const [addSignal, setAddSignal] = useState(0);
  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);
  // unsaved content edits: guard tab switches, Add Category and page reloads
  const [dirty, setDirty] = useState(false);
  const onDirtyChange = useCallback((d: boolean) => setDirty(d), []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const okToLeave = () => !dirty || confirm('Discard your unsaved content changes?');

  const openContent = (id: string) => {
    setFocusId(id);
    setTab('content');
  };

  return (
    <div className="h-full flex flex-col font-['Poppins',sans-serif]">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <Building2 size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-[19px] leading-tight font-semibold text-[#16274D]">Hospital Profile</h1>
                <p className="text-[13px] text-[#6B7280] truncate">What patients see in About Us: categories, their order and their content.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div ref={setHeaderSlot} className="contents" />
              <Btn variant="primary" onClick={() => okToLeave() && setAddSignal((n) => n + 1)} className="shrink-0">
                <Plus size={16} />
                Add Category
              </Btn>
            </div>
          </div>
          <PillTabs
            tabs={[
              { id: 'categories', label: 'Categories' },
              { id: 'content', label: 'Content' },
            ]}
            activeTab={tab}
            onChange={(id) => id !== tab && okToLeave() && setTab(id as Tab)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {tab === 'categories' ? (
          <CategoriesTab key="categories" addSignal={addSignal} headerSlot={headerSlot} onOpenContent={openContent} />
        ) : (
          <ContentTab key="content" addSignal={addSignal} focusId={focusId} onFocusUsed={() => setFocusId(null)} onDirtyChange={onDirtyChange} />
        )}
      </div>
    </div>
  );
}
