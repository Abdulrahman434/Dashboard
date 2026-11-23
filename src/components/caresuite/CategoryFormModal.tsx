import { useState } from 'react';
import { X, Image as ImageIcon, Shapes, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  careSuiteService,
  categoryDisplayAr,
  type CardStyle,
  type CategoryTone,
  type LibraryItem,
  type TeamCategory,
} from '../../services/careSuiteService';
import { Btn, Toggle, Card, CardHead, Bar, cx } from './careSuiteAtoms';
import IconPicker from './IconPicker';
import { ItemIcon } from './careSuiteIcons';
import InfoTip from './InfoTip';
import { ALERT_RED, ToneIconTile, alpha, toneColor, useBrandPrimary } from './categoryTone';

const inputCls =
  'w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors text-[13.5px]';
const labelCls = 'block text-[13px] text-[#5d6678] mb-1.5';
const sectionCls = 'text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9099ab]';

/**
 * Add (`category = null`) or edit a category: internal Name, Display Names,
 * Active, and how it looks on the patient screen (icon, line under the name, colour, card
 * style, multiple items per request) with a live preview.
 */
export default function CategoryFormModal({ category, onClose }: { category: TeamCategory | null; onClose: () => void }) {
  const primary = useBrandPrimary();
  const [name, setName] = useState(category?.nameEn ?? '');
  const [displayEn, setDisplayEn] = useState(category?.displayNameEn ?? '');
  const [displayAr, setDisplayAr] = useState(category ? categoryDisplayAr(category) : '');
  const [active, setActive] = useState(category?.active ?? true);
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [iconSvg, setIconSvg] = useState(category?.iconSvg ?? '');
  const [subEn, setSubEn] = useState(category?.subheadingEn ?? '');
  const [subAr, setSubAr] = useState(category?.subheadingAr ?? '');
  const [tone, setTone] = useState<CategoryTone>(category?.tone ?? 'primary');
  const [cardStyle, setCardStyle] = useState<CardStyle>(category?.cardStyle ?? 'image');
  const [allowMultiple, setAllowMultiple] = useState(category?.allowMultiple ?? false);

  const color = toneColor(tone, primary);
  const shownName = displayEn.trim() || name.trim() || 'Category';
  const missingIcons = category ? careSuiteService.itemsMissingIcon(category.id).length : 0;
  const sampleItems: LibraryItem[] = category ? careSuiteService.listCategoryItems(category.id).slice(0, 3) : [];

  const save = () => {
    const n = name.trim();
    if (!n) {
      toast.error('Enter a category name');
      return;
    }
    if (careSuiteService.isCategoryNameTaken(n, category?.id)) {
      toast.error('A category with this name already exists');
      return;
    }
    const t = (s: string) => s.trim() || undefined;
    const fields = {
      displayNameEn: t(displayEn),
      displayNameAr: t(displayAr),
      active,
      icon: icon || undefined,
      iconSvg: iconSvg || undefined,
      subheadingEn: t(subEn),
      subheadingAr: t(subAr),
      tone,
      cardStyle,
      allowMultiple,
    };
    if (category) {
      careSuiteService.updateCategory(category.id, { nameEn: n, ...fields });
    } else {
      careSuiteService.createCategory({ nameEn: n, ...fields });
    }
    toast.success(category ? 'Category updated' : 'Category added');
    onClose();
  };

  const choice = (on: boolean) =>
    cx(
      'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border text-left transition-colors cursor-pointer',
      on ? 'border-[#4EBEE3] bg-[#eaf7fc]' : 'border-[#d6dae6] hover:border-[#9099ab]',
    );

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5" onClick={onClose}>
      <Card className="max-w-[920px] w-full max-h-[90vh] flex flex-col" onClick={(e: any) => e.stopPropagation()}>
        <CardHead
          title={category ? 'Edit category' : 'Add category'}
          right={
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[1fr_300px] gap-6 p-5">
            {/* fields */}
            <div className="space-y-4 min-w-0">
              <div className={sectionCls}>Details</div>
              <div>
                <label className={labelCls} htmlFor="cat-name">
                  <span className="inline-flex items-center gap-1.5">
                    Name <InfoTip text="Internal name, used in Team Assignment and Items Manager." />
                  </span>
                </label>
                <input id="cat-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Housekeeping requests" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="cat-display-en">Display Name (EN)</label>
                  <input id="cat-display-en" className={inputCls} value={displayEn} onChange={(e) => setDisplayEn(e.target.value)} placeholder={name || 'e.g. I Need Something'} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="cat-display-ar">Display Name (AR)</label>
                  <input id="cat-display-ar" className={inputCls} dir="rtl" value={displayAr} onChange={(e) => setDisplayAr(e.target.value)} placeholder="مثال: أحتاج إلى شيء" />
                </div>
              </div>

              <div className={cx(sectionCls, 'pt-3 border-t border-[#e7e9f0]')}>Patient screen</div>
              <div>
                <label className={labelCls} htmlFor="cat-icon">Category icon</label>
                <IconPicker id="cat-icon" value={icon} iconSvg={iconSvg} onChange={(n) => { setIcon(n); setIconSvg(''); }} onUpload={(svg) => setIconSvg(svg)} color={color} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="cat-sub-en">Line under the name (EN)</label>
                  <input id="cat-sub-en" className={inputCls} value={subEn} onChange={(e) => setSubEn(e.target.value)} placeholder="e.g. Let us know what your room needs." />
                </div>
                <div>
                  <label className={labelCls} htmlFor="cat-sub-ar">Line under the name (AR)</label>
                  <input id="cat-sub-ar" className={inputCls} dir="rtl" value={subAr} onChange={(e) => setSubAr(e.target.value)} placeholder="مثال: أخبرنا بما تحتاجه غرفتك." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className={cx(labelCls, 'inline-flex items-center gap-1.5')}>
                    Colour <InfoTip text="Brand primary follows the client's colour in Identity Settings. Use alert red for problems and urgent reports." />
                  </span>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Colour">
                    {(
                      [
                        ['primary', 'Brand', primary],
                        ['alert', 'Alert red', ALERT_RED],
                      ] as const
                    ).map(([v, label, swatch]) => (
                      <button key={v} type="button" role="radio" aria-checked={tone === v} onClick={() => setTone(v)} className={choice(tone === v)}>
                        <span className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow" style={{ background: swatch }} />
                        <span className="text-[13px] font-medium text-[#16274D] whitespace-nowrap">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={cx(labelCls, 'inline-flex items-center gap-1.5')}>
                    Item cards <InfoTip text="Photo shows each item's uploaded picture. Icon shows an icon per item, drawn in the category colour." />
                  </span>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Item cards">
                    {(
                      [
                        ['image', 'Photo', <ImageIcon size={16} key="i" />],
                        ['icon', 'Icon', <Shapes size={16} key="s" />],
                      ] as const
                    ).map(([v, label, ic]) => (
                      <button key={v} type="button" role="radio" aria-checked={cardStyle === v} onClick={() => setCardStyle(v)} className={choice(cardStyle === v)}>
                        <span className="text-[#5d6678] shrink-0">{ic}</span>
                        <span className="text-[13px] font-medium text-[#16274D]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {cardStyle === 'icon' && missingIcons > 0 && (
                <div className="flex items-center gap-2 text-[12.5px] text-[#b9770b] bg-[#fbf1de] rounded-lg px-3 py-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  {missingIcons} {missingIcons === 1 ? 'item needs' : 'items need'} an icon. Set them in Items Manager.
                </div>
              )}

              <div className="divide-y divide-[#e7e9f0] border-t border-[#e7e9f0]">
                <div className="flex items-center justify-between gap-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#19233a] text-[14px]">
                    Allow several items in one request
                    <InfoTip text="On: patients pick items, then send them together. Off: tapping an item sends the request." />
                  </span>
                  <Toggle on={allowMultiple} onClick={() => setAllowMultiple(!allowMultiple)} />
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#19233a] text-[14px]">
                    Active
                    <InfoTip text="Inactive categories and their items are hidden from patients. Teams and requests are not affected." />
                  </span>
                  <Toggle on={active} onClick={() => setActive(!active)} />
                </div>
              </div>
            </div>

            {/* live preview */}
            <div className="md:sticky md:top-0 self-start">
              <div className={cx(sectionCls, 'mb-2 inline-flex items-center gap-1.5')}>
                Preview <InfoTip align="right" text="Brand shows this client's colour. The patient app draws the icon circle and card shading from it." />
              </div>
              <div className="rounded-xl border border-[#e7e9f0] bg-[#f6f7f9] p-3 space-y-3">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-[13px] font-medium"
                  style={{ background: color }}
                >
                  <span className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center">
                    <ItemIcon name={icon} svg={iconSvg} size={14} />
                  </span>
                  {shownName}
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-[14px] font-semibold text-[#16274D] leading-tight">{shownName}</div>
                  {subEn.trim() && <div className="text-[11.5px] text-[#5d6678] mt-0.5">{subEn.trim()}</div>}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {(sampleItems.length ? sampleItems : [null, null]).slice(0, 2).map((it, i) => (
                      <div key={it?.id ?? i} className="rounded-lg border border-[#eceef2] overflow-hidden">
                        {cardStyle === 'icon' ? (
                          <div className="h-[64px] flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${alpha(color, 0.1)}, ${alpha(color, 0.04)})` }}>
                            <ToneIconTile color={color} size={40}>
                              <ItemIcon name={it?.icon} svg={it?.iconSvg} size={20} />
                            </ToneIconTile>
                          </div>
                        ) : (
                          <div className="h-[64px] bg-[#F3EEE8] flex items-center justify-center overflow-hidden">
                            {it?.image ? <img src={it.image} alt="" className="max-h-full object-contain" /> : <ImageIcon size={20} className="text-[#b7ab9c]" />}
                          </div>
                        )}
                        <div className="text-[11.5px] font-semibold text-[#16274D] text-center py-1.5 truncate px-1">{it?.nameEn ?? 'Item'}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10.5px] text-[#9099ab] mt-2">
                    {allowMultiple ? 'Patients can select several, then send.' : 'Tapping an item sends the request.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={save}>
            Save category
          </Btn>
        </Bar>
      </Card>
    </div>
  );
}
