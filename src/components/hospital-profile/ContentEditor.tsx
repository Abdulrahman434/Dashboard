import { Suspense, lazy, useMemo, useState } from 'react';
import { AlertTriangle, Monitor, Tablet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { emptyDoc, isDocEmpty, profileService, type Attachment, type ProfileCategory, type ProfileContent, type RichDoc } from '../../services/hospitalProfileService';
import { Btn, cx } from '../caresuite/careSuiteAtoms';
import { useBrandPrimary } from '../caresuite/categoryTone';
import AttachmentField, { attachmentProblem } from './AttachmentField';
import PatientPreview, { DEVICES, type Device } from './PatientPreview';

const RichTextEditor = lazy(() => import('./richText/RichTextEditor'));

const Seg = <T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: React.ReactNode }[]; onChange: (v: T) => void; label: string }) => (
  <div className="inline-flex rounded-lg border border-[#d6dae6] bg-white p-0.5" role="radiogroup" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        role="radio"
        aria-checked={value === o.id}
        onClick={() => onChange(o.id)}
        className={cx('h-7 px-2.5 rounded-md text-[12.5px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors', value === o.id ? 'bg-[#16274D] text-white' : 'text-[#5d6678] hover:bg-[#f3f4f6]')}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/**
 * Edit a category's content: type (Text only or an attachment), English and
 * Arabic text with the restricted editor, and a live patient preview.
 */
export default function ContentEditor({
  category,
  categories,
  initial,
  onClose,
}: {
  category: ProfileCategory;
  categories: ProfileCategory[];
  initial: ProfileContent | null;
  onClose: () => void;
}) {
  const brand = useBrandPrimary();
  const [bodyEn, setBodyEn] = useState<RichDoc>(initial?.bodyEn ?? emptyDoc());
  const [bodyAr, setBodyAr] = useState<RichDoc>(initial?.bodyAr ?? emptyDoc());
  const [attachment, setAttachment] = useState<Attachment | null>(initial?.attachment ?? null);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [device, setDevice] = useState<Device>('tablet');

  const start = useMemo(() => JSON.stringify([initial?.bodyEn ?? emptyDoc(), initial?.bodyAr ?? emptyDoc(), initial?.attachment ?? null]), [initial]);
  const dirty = JSON.stringify([bodyEn, bodyAr, attachment]) !== start;
  const enEmpty = isDocEmpty(bodyEn);
  const arEmpty = isDocEmpty(bodyAr);

  const cancel = () => {
    if (dirty && !confirm('Discard your unsaved changes?')) return;
    onClose();
  };
  const save = () => {
    const problem = attachmentProblem(attachment);
    if (problem) return toast.error(problem);
    if (!attachment && enEmpty && arEmpty) return toast.error('Add text in English or Arabic, or choose an attachment.');
    try {
      profileService.saveContent(category.id, { bodyEn, bodyAr, attachment });
    } catch {
      return toast.error('Not saved: the files are too large for this demo’s browser storage. Use a smaller image or PDF.');
    }
    toast.success('Content saved');
    onClose();
  };

  const langTab = (l: 'en' | 'ar', label: string, empty: boolean) => (
    <button
      type="button"
      role="tab"
      aria-selected={lang === l}
      onClick={() => setLang(l)}
      className={cx('h-9 px-4 rounded-t-lg text-[13.5px] font-medium inline-flex items-center gap-2 border-b-2 -mb-px cursor-pointer', lang === l ? 'border-[#4EBEE3] text-[#16274D]' : 'border-transparent text-[#5d6678] hover:text-[#16274D]')}
    >
      {label}
      {empty && <span className="w-1.5 h-1.5 rounded-full bg-[#e0a43a]" title="No text yet" />}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* sticky action bar */}
      <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-[#f6f8fb]/95 backdrop-blur flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-[#16274D] truncate">Edit content · {category.nameEn}</div>
          <div className="text-[12.5px] text-[#6B7280]">{dirty ? 'Unsaved changes' : 'No changes yet'}</div>
        </div>
        <div className="flex gap-2">
          <Btn variant="neutral" onClick={cancel}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={!dirty}>Save content</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,40%)] gap-5 items-start">
        {/* editing column */}
        <div className="space-y-5 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <AttachmentField value={attachment} onChange={setAttachment} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between border-b border-[#e7e9f0] mb-3" role="tablist" aria-label="Language">
              <div className="flex gap-1">
                {langTab('en', 'English', enEmpty)}
                {langTab('ar', 'العربية', arEmpty)}
              </div>
            </div>
            {(lang === 'en' ? enEmpty : arEmpty) && !(enEmpty && arEmpty) && (
              <div className="flex items-center gap-2 text-[12.5px] text-[#b9770b] bg-[#fbf1de] rounded-lg px-3 py-2 mb-3">
                <AlertTriangle size={14} className="shrink-0" />
                No {lang === 'en' ? 'English' : 'Arabic'} text yet. Patients reading in {lang === 'en' ? 'English' : 'Arabic'} will see only the title{attachment ? ' and attachment' : ''}.
              </div>
            )}
            <Suspense fallback={<div className="h-[240px] rounded-[10px] border border-[#d6dae6] bg-[#f8fafc] animate-pulse" />}>
              <div hidden={lang !== 'en'}>
                <RichTextEditor id="en" value={bodyEn} onChange={setBodyEn} dir="ltr" brand={brand} placeholder="Write the English text patients will read…" />
              </div>
              <div hidden={lang !== 'ar'}>
                <RichTextEditor id="ar" value={bodyAr} onChange={setBodyAr} dir="rtl" brand={brand} placeholder="اكتب النص العربي الذي سيقرؤه المريض…" />
              </div>
            </Suspense>
            <p className="text-[11.5px] text-[#9099ab] mt-2">
              Pasted text keeps only the formatting above. Sizes and colours are presets, so content looks right on every screen and brand.
            </p>
          </div>
        </div>

        {/* live preview */}
        <div className="xl:sticky xl:top-16 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9099ab]">Patient preview</span>
            <div className="flex gap-2">
              <Seg label="Preview language" value={lang} onChange={setLang} options={[{ id: 'en', label: 'EN' }, { id: 'ar', label: 'AR' }]} />
              <Seg
                label="Screen"
                value={device}
                onChange={setDevice}
                options={[
                  { id: 'tablet', label: <><Tablet size={13} /> Tablet</> },
                  { id: 'tv', label: <><Monitor size={13} /> TV</> },
                ]}
              />
            </div>
          </div>
          <PatientPreview
            categories={categories}
            activeId={category.id}
            title={lang === 'ar' ? category.nameAr : category.nameEn}
            body={lang === 'ar' ? bodyAr : bodyEn}
            attachment={attachment && !attachmentProblem(attachment) ? attachment : attachment?.en?.url ? attachment : null}
            lang={lang}
            device={device}
            brand={brand}
          />
          <div className="text-[11.5px] text-[#9099ab]">{DEVICES[device].label}, scaled to fit.</div>
        </div>
      </div>
    </div>
  );
}
