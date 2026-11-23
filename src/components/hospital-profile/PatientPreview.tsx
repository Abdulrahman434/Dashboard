import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Home, Info, Globe, Moon, Maximize, FileText, Play, ExternalLink, ChevronDown } from 'lucide-react';
import type { Attachment, ProfileCategory, RichDoc } from '../../services/hospitalProfileService';
import RichTextView from './richText/RichTextView';
import { cx } from '../caresuite/careSuiteAtoms';

export type Device = 'tablet' | 'tv';
export const DEVICES: Record<Device, { w: number; h: number; label: string; base: number }> = {
  tablet: { w: 1280, h: 800, label: 'Tablet · 1280×800', base: 18 },
  tv: { w: 1920, h: 1080, label: 'TV · 1920×1080', base: 24 },
};

function AttachmentBlock({ a, lang }: { a: Attachment; lang: 'en' | 'ar' }) {
  const ref = (lang === 'ar' && a.ar) || a.en;
  if (!ref?.url) return null;
  const box = 'mt-[1.2em] rounded-[16px] border border-[#e6e9f0] overflow-hidden';
  if (a.kind === 'image')
    return (
      <div className={cx(box, 'bg-[#f6f7f9] flex items-center justify-center')} style={{ maxHeight: '22em' }}>
        <img src={ref.url} alt="" className="max-w-full object-contain" style={{ maxHeight: '22em' }} />
      </div>
    );
  if (a.kind === 'stream')
    return (
      <div className={cx(box, 'bg-[#0f1830] aspect-video flex flex-col items-center justify-center gap-[0.5em] text-white/80')} style={{ maxHeight: '22em' }}>
        <span className="w-[3.2em] h-[3.2em] rounded-full bg-white/15 flex items-center justify-center">
          <Play style={{ width: '1.4em', height: '1.4em' }} />
        </span>
        <span className="text-[0.75em] px-[1em] truncate max-w-full">{ref.url}</span>
      </div>
    );
  const Icon = a.kind === 'pdf' ? FileText : ExternalLink;
  return (
    <div className={cx(box, 'flex items-center gap-[0.8em] p-[0.9em] bg-[#f8fafc]')}>
      <span className="w-[2.6em] h-[2.6em] rounded-[10px] bg-white border border-[#e6e9f0] flex items-center justify-center text-[#16274D] shrink-0">
        <Icon style={{ width: '1.3em', height: '1.3em' }} />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[#16274D]">{a.kind === 'pdf' ? ref.name || 'PDF document' : lang === 'ar' ? 'فتح الرابط' : 'Open link'}</span>
        <span className="block text-[0.75em] text-[#6B7280] truncate">{a.kind === 'pdf' ? (lang === 'ar' ? 'اضغط للعرض' : 'Tap to view') : ref.url}</span>
      </span>
    </div>
  );
}

/**
 * The patient "About Us" screen at real size (tablet or TV), scaled to fit the
 * available width. Arabic flips the whole layout right-to-left.
 */
export default function PatientPreview({
  categories,
  activeId,
  title,
  body,
  attachment,
  lang,
  device,
  brand,
}: {
  categories: ProfileCategory[];
  activeId: string;
  title: string;
  body: RichDoc;
  attachment: Attachment | null;
  lang: 'en' | 'ar';
  device: Device;
  brand: string;
}) {
  const d = DEVICES[device];
  const outer = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / d.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [d.w]);

  // tell the admin when patients will need to scroll
  useEffect(() => {
    const el = panel.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 2);
  });

  const rtl = lang === 'ar';
  const visible = categories.filter((c) => c.active || c.id === activeId);

  return (
    <div ref={outer} className="w-full">
      <div className="relative overflow-hidden rounded-[10px] shadow-[0_8px_24px_rgba(22,39,77,.18)]" style={{ height: d.h * scale }}>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          className="absolute top-0 left-0 origin-top-left font-['Poppins',sans-serif]"
          style={{ width: d.w, height: d.h, transform: `scale(${scale})`, background: 'linear-gradient(160deg,#1b2a4b 0%,#22355c 55%,#1a2847 100%)', fontSize: d.base }}
        >
          {/* top bar */}
          <div className="flex items-center justify-between" style={{ padding: '1.6em 2.4em 0' }}>
            <div className="flex items-center gap-[0.8em] text-white">
              <span className="w-[2.4em] h-[2.4em] rounded-[0.6em] border border-white/25 bg-white/10 flex items-center justify-center">
                <Home style={{ width: '1.1em', height: '1.1em' }} />
              </span>
              <span className="w-px h-[1.6em] bg-white/25" />
              <span className="w-[2.4em] h-[2.4em] rounded-[0.6em] border border-white/25 bg-white/10 flex items-center justify-center">
                <Info style={{ width: '1.1em', height: '1.1em' }} />
              </span>
              <span className="font-bold" style={{ fontSize: '1.6em' }}>{rtl ? 'من نحن' : 'About Us'}</span>
            </div>
            <div className="flex items-center gap-[0.5em] text-white">
              <span className="h-[2.2em] px-[0.8em] rounded-[0.6em] border border-white/25 bg-white/10 flex items-center gap-[0.4em] font-semibold" style={{ fontSize: '0.85em' }}>
                <Globe style={{ width: '1.1em', height: '1.1em' }} /> {rtl ? 'EN' : 'AR'}
              </span>
              {[Moon, Maximize].map((I, i) => (
                <span key={i} className="w-[2.2em] h-[2.2em] rounded-[0.6em] border border-white/25 bg-white/10 flex items-center justify-center" style={{ fontSize: '0.85em' }}>
                  <I style={{ width: '1.1em', height: '1.1em' }} />
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-[1.4em]" style={{ padding: '1.4em 2.4em 2.4em', height: `calc(100% - 4em)` }}>
            {/* category menu */}
            <div className="shrink-0 flex flex-col gap-[0.7em]" style={{ width: '12.5em' }}>
              <div dir="ltr" className="rounded-[1em] bg-white flex items-center justify-center font-bold text-[#16274D]" style={{ height: '6em', fontSize: '1.05em' }}>
                <span style={{ color: brand }}>Care</span>&nbsp;Inn
              </div>
              {visible.map((c) => {
                const on = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    className={cx('flex items-center gap-[0.6em] rounded-[0.8em] border px-[0.8em] text-white font-semibold', on ? 'bg-white/20 border-white/70' : 'bg-white/[0.07] border-white/10')}
                    style={{ height: '3.1em', fontSize: '0.9em' }}
                  >
                    <span className="w-[1.8em] h-[1.8em] rounded-[0.5em] bg-white/15 flex items-center justify-center shrink-0">
                      <FileText style={{ width: '1em', height: '1em' }} />
                    </span>
                    <span className="truncate">{rtl ? c.nameAr : c.nameEn}</span>
                  </div>
                );
              })}
            </div>

            {/* content panel */}
            <div className="relative flex-1 min-w-0 rounded-[1.4em] bg-white">
              <div ref={panel} className="absolute inset-0 overflow-y-auto" style={{ padding: '2em 2.2em' }}>
                <div className="font-bold text-[#16274D]" style={{ fontSize: '1.6em', marginBottom: '0.6em' }}>
                  {title}
                </div>
                <RichTextView doc={body} dir={rtl ? 'rtl' : 'ltr'} brand={brand} />
                {attachment && <AttachmentBlock a={attachment} lang={lang} />}
              </div>
              {overflows && (
                <div className="absolute inset-x-0 bottom-0 h-[3em] rounded-b-[1.4em] bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-[0.4em] pointer-events-none">
                  <ChevronDown className="text-[#9099ab]" style={{ width: '1.2em', height: '1.2em' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {overflows && <div className="text-[11.5px] text-[#5d6678] mt-1.5">Longer than the panel: patients will scroll to read it all.</div>}
    </div>
  );
}
