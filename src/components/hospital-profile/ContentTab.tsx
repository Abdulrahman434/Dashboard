import { useEffect, useState } from 'react';
import { Pencil, Trash2, Monitor, FilePen, Plus, FileText, ExternalLink, Play, Layers, PanelLeftOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { isDocEmpty, profileService, type Attachment, type ProfileCategory, type ProfileContent } from '../../services/hospitalProfileService';
import { Badge, Btn, cx } from '../caresuite/careSuiteAtoms';
import { useBrandPrimary } from '../caresuite/categoryTone';
import { useAddSignal } from '../caresuite/ItemsManagerTab';
import { useProfile } from './useProfile';
import CategorySidebar from '../CategorySidebar';
import RichTextView from './richText/RichTextView';
import CategoryFormModal from './CategoryFormModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ContentEditor from './ContentEditor';
import { VisibilityModal, mockTerminals } from './TerminalVisibilityModals';
import { contentKind, visibilityLabel } from './CategoriesTab';
import { attempt } from './attempt';

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
export default function ContentTab({ addSignal, focusId, onFocusUsed, onDirtyChange }: { addSignal: number; focusId: string | null; onFocusUsed: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const { categories, content } = useProfile();
  const brand = useBrandPrimary();
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? categories[0]?.id ?? null);
  const [editingContent, setEditingContent] = useState(!!focusId);
  const [renaming, setRenaming] = useState<ProfileCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProfileCategory | null>(null);
  const [visibility, setVisibility] = useState<ProfileCategory | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (focusId) onFocusUsed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAddSignal(addSignal, () => setRenaming(null));

  // a deleted or missing selection falls back to the first category
  const category = categories.find((c) => c.id === selectedId) ?? categories[0] ?? null;
  const current: ProfileContent | null = category ? content[category.id] : null;


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
      {panelOpen && (
        <CategorySidebar
          title="Categories"
          selectedId={category?.id ?? null}
          onSelect={setSelectedId}
          onCollapse={() => setPanelOpen(false)}
          onReorder={(ids) => attempt(() => profileService.setCategoryOrder(ids), 'Category order saved')}
          onAdd={() => setRenaming(null)}
          locked={editingContent}
          lockedReason="Save or cancel the content you're editing first"
          items={categories.map((c) => {
            const k = contentKind(content[c.id]);
            return { id: c.id, label: c.nameEn, icon: k.icon, sublabel: k.label + (c.active ? '' : ' · hidden'), sublabelTone: k.empty ? 'warn' : 'muted' };
          })}
        />
      )}

      {/* selected category */}
      <div className="flex-1 min-w-0">
        {!category ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center py-16 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3"><Layers size={26} /></div>
            <div className="font-semibold text-[#16274D]">No categories yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Add a category to start the About Us menu.</div>
          </div>
        ) : editingContent ? (
          <ContentEditor key={category.id} category={category} categories={categories} initial={current} onClose={() => setEditingContent(false)} onDirtyChange={onDirtyChange} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {!panelOpen && (
                    <button onClick={() => setPanelOpen(true)} className="p-1.5 rounded-lg border border-gray-300 text-[#4EBEE3] hover:border-gray-400 cursor-pointer" title="Show categories" aria-label="Show categories">
                      <PanelLeftOpen size={17} />
                    </button>
                  )}
                  <h2 className="text-[20px] font-semibold text-[#16274D] [overflow-wrap:anywhere]">{category.nameEn}</h2>
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
            if (attempt(() => profileService.updateCategory(visibility.id, { visibleTerminals: t }))) setVisibility(null);
          }}
        />
      )}
    </div>
  );
}
