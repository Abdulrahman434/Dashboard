import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Info, FileText, Image as ImageIcon, Video, Link2, Type, Pencil, Trash2, Power, PowerOff, Monitor, FilePen, Layers } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ATTACHMENT_LABEL, isDocEmpty, profileService, type ProfileCategory, type ProfileContent } from '../../services/hospitalProfileService';
import { Note } from '../caresuite/careSuiteAtoms';
import { SortableRows, SortableTr, OrderBadge } from '../caresuite/sortable';
import { thLeft, thCenter, tdCls, trCls, nameCls } from '../caresuite/tableTokens';
import { Switch } from '../caresuite/itemTableAtoms';
import QuickActionsPill from '../caresuite/QuickActionsPill';
import TableSortIcon from '../TableSortIcon';
import { useAddSignal } from '../caresuite/ItemsManagerTab';
import { useProfile } from './useProfile';
import { attempt } from './attempt';
import CategoryFormModal from './CategoryFormModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { VisibilityModal, BulkVisibilityModal, mockTerminals } from './TerminalVisibilityModals';

const checkboxCls = 'w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';
type SortKey = 'order' | 'nameEn' | 'nameAr' | 'content' | 'visibility' | 'updated' | 'active';

/** What a category shows patients, as a label + icon. */
export function contentKind(c: ProfileContent | null): { label: string; icon: JSX.Element; empty: boolean } {
  if (c?.attachment) {
    const Icon = { image: ImageIcon, stream: Video, link: Link2, pdf: FileText }[c.attachment.kind];
    return { label: ATTACHMENT_LABEL[c.attachment.kind], icon: <Icon size={15} />, empty: false };
  }
  const empty = !c || (isDocEmpty(c.bodyEn) && isDocEmpty(c.bodyAr));
  return { label: empty ? 'No content yet' : 'Text only', icon: <Type size={15} />, empty };
}

export const visibilityLabel = (c: ProfileCategory) => (c.visibleTerminals.length ? `${c.visibleTerminals.length} terminal${c.visibleTerminals.length === 1 ? '' : 's'}` : 'All terminals');
const updatedLabel = (t?: number) => (t ? new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function CategoriesTab({ addSignal, headerSlot, onOpenContent }: { addSignal: number; headerSlot: HTMLElement | null; onOpenContent: (id: string) => void }) {
  const { categories, content } = useProfile();
  const [editing, setEditing] = useState<ProfileCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProfileCategory[] | null>(null);
  const [visibility, setVisibility] = useState<ProfileCategory | null>(null);
  const [bulkVisibility, setBulkVisibility] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);

  useAddSignal(addSignal, () => setEditing(null));

  const picked = categories.filter((c) => selected.includes(c.id));
  const allSelected = categories.length > 0 && picked.length === categories.length;
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const value = (c: ProfileCategory, key: SortKey): string | number => {
    switch (key) {
      case 'order': return c.order;
      case 'nameEn': return c.nameEn.toLowerCase();
      case 'nameAr': return c.nameAr;
      case 'content': return contentKind(content[c.id]).label;
      case 'visibility': return c.visibleTerminals.length || Number.MAX_SAFE_INTEGER; // "All" last when ascending
      case 'updated': return content[c.id]?.updatedAt ?? 0;
      case 'active': return c.active ? 0 : 1;
    }
  };
  const rows = !sort
    ? categories
    : [...categories].sort((a, b) => {
        const va = value(a, sort.key);
        const vb = value(b, sort.key);
        const d = typeof va === 'number' ? va - (vb as number) : va.localeCompare(vb as string, 'ar');
        return sort.dir === 'asc' ? d : -d;
      });

  const sortTh = (label: string, key: SortKey, cls = thLeft, style?: CSSProperties) => (
    <th className={cls} style={style}>
      <button
        onClick={() => setSort((cur) => (!cur || cur.key !== key ? { key, dir: 'asc' } : cur.dir === 'asc' ? { key, dir: 'desc' } : null))}
        className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[#4EBEE3] transition-colors"
        title={`Sort by ${label}`}
      >
        {label}
        <TableSortIcon field={key} currentField={sort?.key ?? ''} direction={sort?.dir ?? 'asc'} />
      </button>
    </th>
  );

  const setActivePicked = (active: boolean) => {
    attempt(() => profileService.updateCategories(picked.map((c) => c.id), { active }), `${picked.length} ${picked.length === 1 ? 'category' : 'categories'} ${active ? 'shown to' : 'hidden from'} patients`);
  };

  const quickActions = (
    <QuickActionsPill
      count={picked.length}
      noun={['Category', 'Categories']}
      onDeselect={() => setSelected([])}
      actions={[
        ...(picked.length === 1
          ? [
              { label: 'Edit content', icon: <FilePen size={16} />, tone: 'accent' as const, onClick: () => onOpenContent(picked[0].id) },
              { label: 'Rename', icon: <Pencil size={16} />, tone: 'accent' as const, onClick: () => setEditing(picked[0]) },
            ]
          : []),
        { label: 'Activate', icon: <Power size={16} />, tone: 'ok', onClick: () => setActivePicked(true) },
        { label: 'Deactivate', icon: <PowerOff size={16} />, tone: 'mute', onClick: () => setActivePicked(false) },
        { label: 'Set visibility', icon: <Monitor size={16} />, tone: 'accent', onClick: () => setBulkVisibility(true) },
        { label: 'Delete', icon: <Trash2 size={16} />, tone: 'danger', onClick: () => setDeleting(picked), separated: true },
      ]}
    />
  );

  const saveOrder = (ids: string[]) => {
    attempt(() => profileService.setCategoryOrder(ids), 'Category order saved');
  };

  return (
    <>
      {picked.length > 0 && headerSlot && createPortal(quickActions, headerSlot)}
      <Note tone="info" icon={<Info size={16} />} className="mb-4">
        <div className="font-semibold text-[#16274D] text-[14px]">The About Us menu, in patient order</div>
        Drag categories to change their order on the patient screen. Click a category to edit its content.
      </Note>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <Layers size={26} />
            </div>
            <div className="font-semibold text-[#16274D]">No categories yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Add a category, such as Vision or Services, to start the About Us menu.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <SortableRows ids={categories.map((c) => c.id)} onReorder={saveOrder}>
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className={thCenter} style={{ width: 40 }} title={sort ? 'Clear the sort to reorder' : undefined} />
                    <th className={thCenter} style={{ width: 44 }}>
                      <input type="checkbox" className={checkboxCls} checked={allSelected} onChange={() => setSelected(allSelected ? [] : categories.map((c) => c.id))} aria-label="Select all categories" />
                    </th>
                    {sortTh('Order', 'order', thCenter, { width: 80 })}
                    {sortTh('Name (EN)', 'nameEn')}
                    {sortTh('Name (AR)', 'nameAr')}
                    {sortTh('Content', 'content')}
                    {sortTh('Visible on', 'visibility')}
                    {sortTh('Updated', 'updated')}
                    {sortTh('Active', 'active', thCenter)}
                    <th className={thCenter} style={{ width: 150 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {rows.map((c) => {
                    const kind = contentKind(content[c.id]);
                    return (
                      <SortableTr key={c.id} id={c.id} disabled={!!sort} className={trCls} onClick={() => onOpenContent(c.id)}>
                        {(handle) => (
                          <>
                            <td className={`${tdCls} text-center`}>{handle}</td>
                            <td className="p-0 text-center">
                              <label className="flex items-center justify-center py-3.5 px-4 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className={checkboxCls} checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} aria-label={`Select ${c.nameEn}`} />
                              </label>
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <OrderBadge n={categories.indexOf(c) + 1} />
                            </td>
                            <td className={tdCls}>
                              <span className={nameCls}>{c.nameEn}</span>
                            </td>
                            <td className={`${tdCls} text-[13.5px] text-[#19233a] text-left`} dir="rtl">{c.nameAr}</td>
                            <td className={tdCls}>
                              <span className={`inline-flex items-center gap-1.5 text-[13px] ${kind.empty ? 'text-[#b9770b]' : 'text-[#19233a]'}`}>
                                {kind.icon}
                                {kind.label}
                              </span>
                            </td>
                            <td className={`${tdCls} text-[13px] text-[#19233a] whitespace-nowrap`}>{visibilityLabel(c)}</td>
                            <td className={`${tdCls} text-[13px] text-[#5d6678] whitespace-nowrap`}>{updatedLabel(content[c.id]?.updatedAt)}</td>
                            <td className={`${tdCls} text-center`}>
                              <span className="inline-flex">
                                <Switch on={c.active} label={`${c.nameEn} active`} onChange={() => attempt(() => profileService.updateCategory(c.id, { active: !c.active }))} />
                              </span>
                            </td>
                            <td className={tdCls}>
                              <div className="flex items-center justify-center gap-1">
                                {[
                                  { t: 'Edit content', i: <FilePen size={15} className="text-[#4EBEE3]" />, f: () => onOpenContent(c.id), h: 'hover:bg-[#4EBEE3]/10' },
                                  { t: 'Rename', i: <Pencil size={15} className="text-[#4EBEE3]" />, f: () => setEditing(c), h: 'hover:bg-[#4EBEE3]/10' },
                                  { t: 'Visibility', i: <Monitor size={15} className="text-[#5d6678]" />, f: () => setVisibility(c), h: 'hover:bg-gray-100' },
                                  { t: 'Delete', i: <Trash2 size={15} className="text-red-500" />, f: () => setDeleting([c]), h: 'hover:bg-red-50' },
                                ].map((a) => (
                                  <button
                                    key={a.t}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      a.f();
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${a.h}`}
                                    title={a.t}
                                    aria-label={`${a.t}: ${c.nameEn}`}
                                  >
                                    {a.i}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </>
                        )}
                      </SortableTr>
                    );
                  })}
                </tbody>
              </table>
            </SortableRows>
          </div>
        )}
      </div>

      {editing !== undefined && <CategoryFormModal category={editing} onClose={() => setEditing(undefined)} />}
      {deleting && (
        <DeleteCategoryDialog
          categories={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(ids) => {
            setSelected((s) => s.filter((id) => !ids.includes(id)));
            setDeleting(null);
          }}
        />
      )}
      {visibility && (
        <VisibilityModal
          category={visibility}
          terminals={mockTerminals}
          onClose={() => setVisibility(null)}
          onSave={(t) => {
            if (attempt(() => profileService.updateCategory(visibility.id, { visibleTerminals: t }))) setVisibility(null);
          }}
        />
      )}
      {bulkVisibility && (
        <BulkVisibilityModal
          categoryCount={picked.length}
          terminals={mockTerminals}
          onClose={() => setBulkVisibility(false)}
          onSave={(t) => {
            if (attempt(() => profileService.updateCategories(picked.map((c) => c.id), { visibleTerminals: t }))) setBulkVisibility(false);
          }}
        />
      )}
    </>
  );
}
