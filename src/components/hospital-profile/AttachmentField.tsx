import { useRef } from 'react';
import { Type, Image as ImageIcon, Video, Link2, FileText, Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Attachment, AttachmentKind, AttachmentRef } from '../../services/hospitalProfileService';
import { cx } from '../caresuite/careSuiteAtoms';
import InfoTip from '../caresuite/InfoTip';

type Choice = 'text' | AttachmentKind;
const CHOICES: { id: Choice; label: string; icon: typeof Type; hint: string }[] = [
  { id: 'text', label: 'Text only', icon: Type, hint: 'Formatted text, no attachment' },
  { id: 'image', label: 'Image', icon: ImageIcon, hint: 'Text plus an image' },
  { id: 'stream', label: 'Video stream', icon: Video, hint: 'Text plus a video stream link' },
  { id: 'link', label: 'External link', icon: Link2, hint: 'Text plus a web link' },
  { id: 'pdf', label: 'PDF', icon: FileText, hint: 'Text plus a PDF document' },
];

// localStorage in this demo holds a few MB in total; a backend removes this limit
const MAX_BYTES: Partial<Record<AttachmentKind, number>> = { image: 1.5 * 1024 * 1024, pdf: 2 * 1024 * 1024 };
const URL_RULES: Partial<Record<AttachmentKind, RegExp>> = { link: /^https?:\/\/\S+\.\S+/i, stream: /^(https?|rtsp|rtmp):\/\/\S+/i };

export const attachmentProblem = (a: Attachment | null): string | null => {
  if (!a) return null;
  const check = (r: AttachmentRef | undefined, where: string) => {
    if (!r?.url) return a.kind === 'image' || a.kind === 'pdf' ? `Upload the ${where}${a.kind === 'pdf' ? 'PDF' : 'image'}.` : `Enter the ${where}link.`;
    const rule = URL_RULES[a.kind];
    if (rule && !rule.test(r.url)) return a.kind === 'stream' ? `The ${where}stream link must start with https://, rtsp:// or rtmp://.` : `The ${where}link must start with https://.`;
    return null;
  };
  return check(a.en, '') ?? (a.ar ? check(a.ar, 'Arabic ') : null);
};

function FileSlot({ kind, value, onChange, label }: { kind: 'image' | 'pdf'; value?: AttachmentRef; onChange: (r: AttachmentRef | undefined) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const pick = (file: File) => {
    const okType = kind === 'pdf' ? file.type === 'application/pdf' || /\.pdf$/i.test(file.name) : file.type.startsWith('image/');
    if (!okType) return toast.error(kind === 'pdf' ? 'Choose a PDF file.' : 'Choose an image file.');
    const max = MAX_BYTES[kind]!;
    if (file.size > max) return toast.error(`The file is ${(file.size / 1048576).toFixed(1)} MB. This demo keeps files up to ${(max / 1048576).toFixed(1)} MB.`);
    const r = new FileReader();
    r.onloadend = () => onChange({ url: r.result as string, name: file.name });
    r.readAsDataURL(file);
  };
  return (
    <div>
      <input ref={ref} type="file" className="hidden" accept={kind === 'pdf' ? 'application/pdf,.pdf' : 'image/*'} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) pick(f); }} />
      {value?.url ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-[#cfe9f3] bg-[#f3fafd] p-2.5">
          {kind === 'image' ? (
            <img src={value.url} alt="" className="w-14 h-14 rounded-lg object-cover bg-white border border-[#e7e9f0]" />
          ) : (
            <span className="w-14 h-14 rounded-lg bg-white border border-[#e7e9f0] flex items-center justify-center text-[#16274D]"><FileText size={24} /></span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium text-[#16274D] truncate">{value.name || (kind === 'pdf' ? 'Current PDF' : 'Current image')}</div>
            <div className="text-[12px] text-[#5d6678]">{label}</div>
          </div>
          <button type="button" onClick={() => ref.current?.click()} className="h-8 px-3 rounded-lg text-[12.5px] font-medium text-[#1d7da3] hover:bg-[#e3f4fa] cursor-pointer">Replace</button>
          <button type="button" onClick={() => onChange(undefined)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5d6678] hover:bg-[#e3f4fa] cursor-pointer" title="Remove" aria-label="Remove file"><X size={16} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="w-full flex items-center justify-center gap-2 h-[72px] rounded-[10px] border-2 border-dashed border-[#d6dae6] text-[13.5px] text-[#5d6678] hover:border-[#4EBEE3] hover:text-[#1d7da3] transition-colors cursor-pointer">
          <Upload size={17} /> Upload {kind === 'pdf' ? 'a PDF' : 'an image'} <span className="text-[#9099ab]">· {label}</span>
        </button>
      )}
    </div>
  );
}

function UrlSlot({ kind, value, onChange, label, id }: { kind: 'stream' | 'link'; value?: AttachmentRef; onChange: (r: AttachmentRef | undefined) => void; label: string; id: string }) {
  const v = value?.url ?? '';
  const bad = !!v && !URL_RULES[kind]!.test(v);
  return (
    <div>
      <label htmlFor={id} className="block text-[12.5px] text-[#5d6678] mb-1">{label}</label>
      <input
        id={id}
        value={v}
        onChange={(e) => onChange(e.target.value.trim() ? { url: e.target.value.trim() } : undefined)}
        placeholder={kind === 'stream' ? 'https://… or rtsp://…' : 'https://…'}
        dir="ltr"
        className={cx('w-full h-[40px] px-3 border rounded-[10px] outline-none transition-colors text-[13.5px]', bad ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#d6dae6] focus:border-[#4EBEE3]')}
      />
      {bad && <div className="text-[12px] text-[#c0392b] mt-1">{kind === 'stream' ? 'Use a link starting with https://, rtsp:// or rtmp://.' : 'Use a link starting with https://.'}</div>}
    </div>
  );
}

/** Content type (Text only or an attachment kind) plus the attachment itself, with an optional Arabic version. */
export default function AttachmentField({ value, onChange }: { value: Attachment | null; onChange: (a: Attachment | null) => void }) {
  const choice: Choice = value?.kind ?? 'text';
  const setChoice = (c: Choice) => {
    if (c === choice) return;
    // switching type starts that type fresh (files and links of another type don't carry over)
    onChange(c === 'text' ? null : { kind: c, en: { url: '' } });
  };
  const kind = value?.kind;
  const hasAr = !!value?.ar;

  return (
    <div className="space-y-3">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[#5d6678] mb-1.5">
          Content type <InfoTip text="Every category has English and Arabic text. Add one attachment if needed; Text only has none. Changing the type clears the previous attachment." />
        </span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] gap-2" role="radiogroup" aria-label="Content type">
          {CHOICES.map(({ id, label, icon: Icon, hint }) => {
            const on = choice === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                title={hint}
                onClick={() => setChoice(id)}
                className={cx(
                  'relative flex flex-col items-center justify-center gap-1 h-[64px] rounded-[10px] border text-[12.5px] font-medium transition-colors cursor-pointer',
                  on ? 'border-[#4EBEE3] bg-[#eaf7fc] text-[#16274D]' : 'border-[#d6dae6] text-[#5d6678] hover:border-[#9099ab]',
                )}
              >
                <Icon size={18} />
                {label}
                {on && <Check size={13} className="absolute top-1.5 right-1.5 text-[#4EBEE3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {kind && (
        <div className="space-y-2.5">
          {kind === 'image' || kind === 'pdf' ? (
            <FileSlot kind={kind} value={value!.en?.url ? value!.en : undefined} onChange={(r) => onChange({ ...value!, en: r ?? { url: '' } })} label={hasAr ? 'English' : 'Used for English and Arabic'} />
          ) : (
            <UrlSlot id="att-en" kind={kind} value={value!.en} onChange={(r) => onChange({ ...value!, en: r ?? { url: '' } })} label={hasAr ? 'English link' : 'Link (used for English and Arabic)'} />
          )}
          <label className="flex items-center gap-2 text-[13px] text-[#16274D] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAr}
              onChange={(e) => {
                const { ar: _drop, ...rest } = value!;
                onChange(e.target.checked ? { ...rest, ar: { url: '' } } : rest);
              }}
              className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] cursor-pointer"
            />
            Use a different {kind === 'pdf' ? 'PDF' : kind === 'image' ? 'image' : 'link'} for Arabic
          </label>
          {hasAr &&
            (kind === 'image' || kind === 'pdf' ? (
              <FileSlot kind={kind} value={value!.ar?.url ? value!.ar : undefined} onChange={(r) => onChange({ ...value!, ar: r ?? { url: '' } })} label="Arabic" />
            ) : (
              <UrlSlot id="att-ar" kind={kind} value={value!.ar} onChange={(r) => onChange({ ...value!, ar: r ?? { url: '' } })} label="Arabic link" />
            ))}
        </div>
      )}
    </div>
  );
}
