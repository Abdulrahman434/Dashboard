import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Monitor, FilePen, Plus, FileText, ExternalLink, Play, Layers } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { isDocEmpty, profileService, type Attachment, type ProfileCategory, type ProfileContent } from '../../services/hospitalProfileService';
import { Badge, Btn, cx } from '../caresuite/careSuiteAtoms';
import { restrictToVerticalAxis } from '../caresuite/restrictToVerticalAxis';
import { useBrandPrimary } from '../caresuite/categoryTone';
import { useAddSignal } from '../caresuite/ItemsManagerTab';
import { useProfile } from './useProfile';
import RichTextView from './richText/RichTextView';
import CategoryFormModal from './CategoryFormModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ContentEditor from './ContentEditor';
import { VisibilityModal, mockTerminals } from './TerminalVisibilityModals';
import { contentKind, visibilityLabel } from './CategoriesTab';

function SortableCategory({ c, on, locked, kindLabel, empty, onSelect }: { c: ProfileCategory; on: boolean; locked: boolean; kindLabel: string; empty: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id, disabled: locked });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: 'relative' }}
      className={cx('flex items-center gap-1 rounded-lg border transition-colors', on ? 'bg-[#eaf7fc] border-[#4EBEE3]' : 'border-transparent hover:bg-[#f7f8fb]', isDragging && 'bg-white shadow-lg')}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={locked}
        className="p-1.5 text-[#9099ab] rounded-md cursor-grab active:cursor-grabbing hover:text-[#16274D] disabled:opacity-30 disabled:cursor-not-allowed"
        title={locked ? 'Finish editing first' : 'Drag to reorder'}
        aria-label={`Reorder ${c.nameEn}`}
      >
        <GripVertical size={15} />
      </button>
      <button type="button" onClick={onSelect} disabled={locked && !on} className="flex-1 min-w-0 text-left py-2 pr-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
        <span className={cx('block text-[13.5px] leading-snug', on ? 'font-semibold text-[#16274D]' : 'text-[#19233a]')}>{c.nameEn}</span>
        <span className={cx('block text-[12px]', empty ? 'text-[#b9770b]' : 'text-[#9099ab]')}>
          {kindLabel}
          {!c.active && ' · hidden'}
        </span>
      </button>
    </div>
  );
}

function AttachmentSummary({ a, lang }: { a: Attachment; lang: 'en' | 'ar' }) {
  const ref = (lang === 'ar' && a.ar) || a.en;
  if (!ref?.url) return null;
  if (a.kind === 'image') return <img src={ref.url} alt="" className="mt-3 max-h-[180px] rounded-lg border border-[#e7e9f0] object-contain bg-[#f8fafc]" />;
  const Icon = a.kind === 'pdf' ? FileText : a.kind === 'stream' ? Play : ExternalLink;
  return (
    <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[#e7e9f0] bg-[#f8fafc] px-3 py-2 text-[13px]">
      <Icon size={16} className="text-[#16274D] shrink-0" />
      <span className="min-w-0">
        <span className="block font-medium text-[#16274D]">{a.kind === 'pdf' ? 'PDF document' : a.kind === 'stream' ? 'Video stream' : 'External link'}</span>
        <span className="block text-[#1d7da3] truncate" dir="ltr">{a.kind === 'pdf' ? ref.name || 'document.pdf' : ref.url}</span>
      </span>
      {lang === 'ar' && !a.ar && <span className="ml-auto text-[11.5px] text-[#9099ab] whitespace-nowrap">Same as English</span>}
    </div>
  );
}

/** Content tab: categories on the left, the selected category's content (or its editor) on the right. */
export default function ContentTab({ addSignal, focusId, onFocusUsed }: { addSignal: number; focusId: string | null; onFocusUsed: () => void }) {
  const { categories, content } = useProfile();
  const brand = useBrandPrimary();
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? categories[0]?.id ?? null);
  const [editingContent, setEditingContent] = useState(!!focusId);
  const [renaming, setRenaming] = useState<ProfileCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProfileCategory | null>(null);
  const [visibility, setVisibility] = useState<ProfileCategory | null>(null);

  useEffect(() => {
    if (focusId) onFocusUsed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAddSignal(addSignal, () => setRenaming(null));

  // a deleted or missing selection falls back to the first category
  const category = categories.find((c) => c.id === selectedId) ?? categories[0] ?? null;
  const current: ProfileContent | null = category ? content[category.id] : null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = categories.map((c) => c.id);
    profileService.setCategoryOrder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
    toast.success('Category order saved');
  };

  const afterDelete = (ids: string[]) => {
    setDeleting(null);
    if (category && ids.includes(category.id)) {
      // select the neighbour that takes its place
      const idx = categories.findIndex((c) => c.id === category.id);
      const rest = categories.filter((c) => !ids.includes(c.id));
      setSelectedId(rest[Math.min(idx, rest.length - 1)]?.id ?? null);
      setEditingContent(false);
    }
  };

  return (
    <div className="flex gap-4 items-start">
      {/* category list */}
      <div className="w-[230px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden self-start">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-semibold text-[14px] text-[#16274D]">Categories</span>
          <span className="text-[12px] text-[#9099ab]">Patient order</span>
        </div>
        <div className="p-2 space-y-0.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map((c) => {
                const k = contentKind(content[c.id]);
                return (
                  <SortableCategory
                    key={c.id}
                    c={c}
                    on={c.id === category?.id}
                    locked={editingContent}
                    kindLabel={k.label}
                    empty={k.empty}
                    onSelect={() => setSelectedId(c.id)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={() => setRenaming(null)}
            disabled={editingContent}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#1d7da3] hover:bg-[#eaf7fc] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} /> Add category
          </button>
        </div>
      </div>

      {/* selected category */}
      <div className="flex-1 min-w-0">
        {!category ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center py-16 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3"><Layers size={26} /></div>
            <div className="font-semibold text-[#16274D]">No categories yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Add a category to start the About Us menu.</div>
          </div>
        ) : editingContent ? (
          <ContentEditor key={category.id} category={category} categories={categories} initial={current} onClose={() => setEditingContent(false)} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[20px] font-semibold text-[#16274D]">{category.nameEn}</h2>
                  <span className="text-[16px] text-[#5d6678]" dir="rtl">{category.nameAr}</span>
                  <Badge tone={category.active ? 'ok' : 'mute'}>{category.active ? 'Active' : 'Hidden from patients'}</Badge>
                </div>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  {contentKind(current).label} · Visible on {visibilityLabel(category).toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Btn variant="neutral" onClick={() => setRenaming(category)}><Pencil size={15} /> Rename</Btn>
                <Btn variant="neutral" onClick={() => setVisibility(category)}><Monitor size={15} /> Visibility</Btn>
                <button
                  onClick={() => setDeleting(category)}
                  className="inline-flex items-center gap-2 h-[38px] px-[15px] rounded-[10px] text-[13.5px] font-medium border border-[#f3c7c1] text-[#c0392b] hover:bg-[#fcebe9] transition-colors cursor-pointer"
                >
                  <Trash2 size={15} /> Delete
                </button>
                <Btn variant="primary" onClick={() => setEditingContent(true)}><FilePen size={15} /> Edit content</Btn>
              </div>
            </div>

            {!current || (isDocEmpty(current.bodyEn) && isDocEmpty(current.bodyAr) && !current.attachment) ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-14 px-5">
                <div className="font-semibold text-[#16274D]">No content yet</div>
                <div className="text-[13px] text-[#5d6678] mt-1 mb-4">Patients see only the title until you add text or an attachment.</div>
                <Btn variant="primary" onClick={() => setEditingContent(true)}><Plus size={15} /> Add content</Btn>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(['en', 'ar'] as const).map((l) => {
                  const body = l === 'en' ? current.bodyEn : current.bodyAr;
                  return (
                    <div key={l} className="bg-white rounded-xl border border-gray-200 p-5 min-w-0">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9099ab] mb-3">{l === 'en' ? 'English' : 'Arabic'}</div>
                      {isDocEmpty(body) ? (
                        <div className="text-[13px] text-[#b9770b]">No {l === 'en' ? 'English' : 'Arabic'} text.</div>
                      ) : (
                        <RichTextView doc={body} dir={l === 'ar' ? 'rtl' : 'ltr'} brand={brand} style={{ fontSize: 15 }} />
                      )}
                      {current.attachment && <AttachmentSummary a={current.attachment} lang={l} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {renaming !== undefined && (
        <CategoryFormModal
          category={renaming}
          onClose={() => setRenaming(undefined)}
          onCreated={(id) => {
            setSelectedId(id);
            setEditingContent(true);
          }}
        />
      )}
      {deleting && <DeleteCategoryDialog categories={[deleting]} onClose={() => setDeleting(null)} onDeleted={afterDelete} />}
      {visibility && (
        <VisibilityModal
          category={visibility}
          terminals={mockTerminals}
          onClose={() => setVisibility(null)}
          onSave={(t) => {
            profileService.updateCategory(visibility.id, { visibleTerminals: t });
            setVisibility(null);
          }}
        />
      )}
    </div>
  );
}
