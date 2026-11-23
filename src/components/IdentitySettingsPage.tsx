import { useState, useRef, useEffect } from 'react';
import { Fingerprint, Upload, X, Palette, Type, Building2, Check, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CustomRadio from './CustomRadio';
import { IdentitySettings, defaultIdentitySettings as defaultSettings, readIdentitySettings, pickLogo, isWebUrl } from '../services/identitySettings';

const googleFontsEnglish = [
  'Poppins', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Nunito',
  'Raleway', 'Source Sans 3', 'DM Sans', 'Work Sans', 'Outfit', 'Manrope',
  'Plus Jakarta Sans', 'Figtree', 'Sora', 'Lexend', 'Space Grotesk',
];

const googleFontsArabic = [
  'Baloo Bhaijaan 2', 'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic',
  'Noto Sans Arabic', 'Readex Pro', 'El Messiri', 'Noto Kufi Arabic',
  'Rubik', 'Changa', 'Harmattan', 'Lateef', 'Amiri', 'Scheherazade New',
];

// Load Google Fonts dynamically
function loadGoogleFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function ImageUploadArea({ label, image, imageName, onUpload, onRemove, aspectHint, required, optional, hint, darkThumb }: {
  label: string;
  image: string | null;
  imageName: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  aspectHint: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  /** show the thumbnail on a dark surface (logo for dark backgrounds) */
  darkThumb?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] flex items-center gap-1.5">
        {label}
        {required && <span className="text-[#EF4444] text-[11px]">*</span>}
        {optional && <span className="text-[11px] font-normal text-[#16274D]/40">Optional</span>}
      </label>
      {hint && <p className="text-[11px] text-[#16274D]/50 -mt-1">{hint}</p>}
      {image ? (
        <div className="relative group rounded-xl border-2 border-[#4EBEE3]/20 bg-[#4EBEE3]/5 p-4 flex items-center gap-4">
          <div className={`w-[100px] h-[68px] rounded-lg overflow-hidden border flex items-center justify-center flex-shrink-0 ${darkThumb ? 'bg-[#16274D] border-[#16274D]' : 'bg-white border-gray-200'}`}>
            <img src={image} alt={label} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">{imageName}</p>
            <p className="text-[11px] text-[#16274D]/50 font-['Poppins',sans-serif] mt-0.5">{aspectHint}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Replace
            </button>
            {!required && (
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg bg-white border border-gray-200 text-[#EF4444] hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed ${isDragging ? 'border-[#4EBEE3] bg-[#4EBEE3]/10' : 'border-gray-300 bg-gray-50 hover:border-[#4EBEE3]/50 hover:bg-[#4EBEE3]/5'} transition-all p-6 flex flex-col items-center gap-2.5`}
        >
          <div className="w-10 h-10 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
            <Upload className="w-4 h-4 text-[#4EBEE3]" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Drop image here or <span className="text-[#4EBEE3]">browse</span>
            </p>
            <p className="text-[10px] text-[#16274D]/40 font-['Poppins',sans-serif] mt-0.5">{aspectHint} • PNG, JPG, SVG up to 5MB</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
        </div>
      )}
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => { setInputValue(value); }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[#16274D]/70 font-['Poppins',sans-serif]">{label}</label>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-[#4EBEE3]/50 transition-colors">
        <input
          type="color"
          value={value}
          onChange={e => { onChange(e.target.value); setInputValue(e.target.value); }}
          className="w-8 h-8 rounded-md cursor-pointer border-0 p-0"
        />
        <input
          type="text"
          value={inputValue.toUpperCase()}
          onChange={e => {
            const v = e.target.value;
            setInputValue(v);
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
          }}
          className="flex-1 text-[13px] font-mono text-[#16274D] font-medium bg-transparent outline-none border-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function FontSelector({ label, value, onChange, options, language }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  language: 'english' | 'arabic';
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[#16274D]/70 font-['Poppins',sans-serif]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-['Poppins',sans-serif] text-[#16274D] outline-none hover:border-[#4EBEE3]/50 focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 transition-all cursor-pointer appearance-none pr-8"
          style={{ fontFamily: value }}
        >
          <optgroup label="Google Fonts">
            {options.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </optgroup>
        </select>
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#16274D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  );
}

export default function IdentitySettingsPage() {
  const [settings, setSettings] = useState<IdentitySettings>(() => readIdentitySettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load Google Fonts on mount and when fonts change
  useEffect(() => {
    loadGoogleFont(settings.englishFont);
    loadGoogleFont(settings.arabicFont);
  }, [settings.englishFont, settings.arabicFont]);

  // Load all Google Fonts for dropdown previews
  useEffect(() => {
    googleFontsEnglish.forEach(loadGoogleFont);
    googleFontsArabic.forEach(loadGoogleFont);
  }, []);

  const update = (partial: Partial<IdentitySettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    setHasChanges(true);
    setValidationErrors([]);
  };

  const handleImageUpload = (field: 'logo' | 'logoDark' | 'hospitalImage', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      update({
        [field]: e.target?.result as string,
        [field === 'logo' ? 'logoName' : field === 'logoDark' ? 'logoDarkName' : 'hospitalImageName']: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const termsPdfRef = useRef<HTMLInputElement>(null);
  const termsUrlError = settings.termsType === 'link' && !!settings.termsUrl.trim() && !isWebUrl(settings.termsUrl);
  const handleTermsPdf = (file: File) => {
    if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) {
      toast.error('Choose a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => update({ termsPdf: e.target?.result as string, termsPdfName: file.name });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const errors: string[] = [];
    if (!settings.hospitalName.trim()) errors.push('Hospital Name is required');
    if (!settings.logo) errors.push('Hospital Logo is required');
    if (settings.termsType === 'link' && settings.termsUrl.trim() && !isWebUrl(settings.termsUrl)) errors.push('Terms & Conditions page URL must start with http:// or https://');
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the errors', { description: errors.join(', '), duration: 4000 });
      return;
    }
    localStorage.setItem('careinn-identity-settings', JSON.stringify(settings));
    setHasChanges(false);
    setValidationErrors([]);
    toast.success('Identity Settings Saved', {
      description: 'Hospital identity has been updated successfully.',
      duration: 3000,
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    setValidationErrors([]);
    toast('Settings reset to defaults', { duration: 2000 });
  };

  const nameError = validationErrors.includes('Hospital Name is required') && !settings.hospitalName.trim();
  const logoError = validationErrors.includes('Hospital Logo is required') && !settings.logo;

  return (
    <div className="p-8 font-['Poppins',sans-serif] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4EBEE3]/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-[#4EBEE3]" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Identity Settings</h1>
            <p className="text-[13px] text-[#16274D]/50 mt-0.5">Manage your hospital's patient-facing identity and branding</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-[#16274D] hover:bg-gray-50 transition-colors font-['Poppins',sans-serif]"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all font-['Poppins',sans-serif] ${
              hasChanges
                ? 'bg-[#4EBEE3] text-white hover:bg-[#3DA5CA] shadow-lg shadow-[#4EBEE3]/25'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Section 1: Hospital Identity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-[18px] h-[18px] text-[#4EBEE3]" />
              <h2 className="text-[16px] font-semibold text-[#16274D]">Hospital Identity</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] flex items-center gap-1.5">
                  Hospital Name
                  <span className="text-[#EF4444] text-[11px]">*</span>
                </label>
                <input
                  type="text"
                  value={settings.hospitalName}
                  onChange={e => update({ hospitalName: e.target.value })}
                  placeholder="e.g. Saint Louis Hospital"
                  className={`bg-white border rounded-xl px-4 py-3 text-[14px] font-['Poppins',sans-serif] text-[#16274D] outline-none transition-all ${
                    nameError
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-gray-200 hover:border-[#4EBEE3]/50 focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20'
                  }`}
                />
                {nameError && (
                  <p className="text-[11px] text-[#EF4444] flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> Hospital name is required
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-right">اسم المستشفى (Arabic)</label>
                <input
                  type="text"
                  value={settings.hospitalNameAr}
                  onChange={e => update({ hospitalNameAr: e.target.value })}
                  placeholder="مثال: مستشفى دلة"
                  dir="rtl"
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-['Poppins',sans-serif] text-[#16274D] text-right outline-none transition-all hover:border-[#4EBEE3]/50 focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20"
                />
                <p className="text-[11px] text-[#6B7280]">Printed beside the English name on meal tickets.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Short Name / Abbreviation</label>
                <input
                  type="text"
                  value={settings.hospitalShortName}
                  onChange={e => update({ hospitalShortName: e.target.value })}
                  placeholder="e.g. SLH"
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-['Poppins',sans-serif] text-[#16274D] outline-none hover:border-[#4EBEE3]/50 focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 transition-all"
                />
                <p className="text-[11px] text-[#16274D]/40 mt-0.5">Displayed in compact UI elements</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <ImageUploadArea
                  label="Hospital Logo"
                  image={settings.logo}
                  imageName={settings.logoName}
                  onUpload={f => handleImageUpload('logo', f)}
                  onRemove={() => update({ logo: null, logoName: '' })}
                  aspectHint="Recommended: 400×200px, transparent PNG"
                  required
                />
                {logoError && (
                  <p className="text-[11px] text-[#EF4444] flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" /> Hospital logo is required
                  </p>
                )}
              </div>
              <ImageUploadArea
                label="Background Image"
                image={settings.hospitalImage}
                imageName={settings.hospitalImageName}
                onUpload={f => handleImageUpload('hospitalImage', f)}
                onRemove={() => update({ hospitalImage: null, hospitalImageName: '' })}
                aspectHint="Recommended: 1920×600px, used behind welcome card"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImageUploadArea
                label="Logo for dark background"
                image={settings.logoDark}
                imageName={settings.logoDarkName}
                onUpload={f => handleImageUpload('logoDark', f)}
                onRemove={() => update({ logoDark: null, logoDarkName: '' })}
                darkThumb
                aspectHint="Light or white version, transparent PNG"
                optional
                hint="Used in dark mode. If empty, the default logo is used."
              />
              <div className="flex flex-col gap-2 min-w-0">
                <span className="text-[13px] font-medium text-[#16274D]">Logo preview</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['light', 'dark'] as const).map(theme => {
                    const src = pickLogo(settings, theme);
                    const fallback = theme === 'dark' && !settings.logoDark && !!settings.logo;
                    return (
                      <div key={theme} className="min-w-0">
                        <div
                          className={`h-[88px] rounded-xl border flex items-center justify-center p-3 overflow-hidden ${theme === 'dark' ? 'bg-[#16274D] border-[#16274D]' : 'bg-white border-gray-200'}`}
                        >
                          {src ? (
                            <img src={src} alt={`${theme} mode logo preview`} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className={`text-[11px] ${theme === 'dark' ? 'text-white/50' : 'text-[#16274D]/40'}`}>No logo</span>
                          )}
                        </div>
                        <p className="text-[12px] font-medium text-[#16274D] mt-1.5">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                        {fallback && <p className="text-[11px] text-[#16274D]/60">Using the default logo</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-[13px] font-medium text-[#16274D]">Terms &amp; Conditions</div>
              <p className="text-[12px] text-[#16274D]/60 mt-0.5">Choose one: an external page or a PDF. The bedside reader shows it in the same preview.</p>
              <div className="flex flex-col gap-2.5 mt-3" role="radiogroup" aria-label="Terms & Conditions source">
                <CustomRadio name="terms-type" label="External link" checked={settings.termsType === 'link'} onChange={() => update({ termsType: 'link' })} />
                <CustomRadio name="terms-type" label="PDF document" checked={settings.termsType === 'pdf'} onChange={() => update({ termsType: 'pdf' })} />
              </div>
              {settings.termsType === 'link' ? (
                <div className="mt-4">
                  <label htmlFor="terms-url" className="block text-[13px] font-medium text-[#16274D] mb-1.5">Page URL</label>
                  <input
                    id="terms-url"
                    type="url"
                    dir="ltr"
                    value={settings.termsUrl}
                    onChange={e => update({ termsUrl: e.target.value })}
                    placeholder="https://hospital.example/legal/terms.html"
                    className={`w-full h-[46px] px-4 border rounded-xl text-[14px] text-[#16274D] placeholder:text-[#16274D]/35 outline-none transition-colors ${termsUrlError ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-gray-200 focus:border-[#4EBEE3]'}`}
                  />
                  {termsUrlError ? (
                    <p className="text-[11px] text-[#EF4444] flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> Use a web address starting with http:// or https://</p>
                  ) : (
                    <p className="text-[12px] text-[#16274D]/60 mt-1.5">Bedside preferences setup — patients open this page and must scroll to the end before accepting.</p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <input ref={termsPdfRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleTermsPdf(f); }} />
                  <span className="block text-[13px] font-medium text-[#16274D] mb-1.5">PDF document</span>
                  {settings.termsPdf ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#4EBEE3]/30 bg-[#4EBEE3]/5 p-3">
                      <span className="w-11 h-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#16274D] shrink-0"><FileText className="w-5 h-5" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[#16274D] truncate">{settings.termsPdfName || 'Terms & Conditions.pdf'}</div>
                        <div className="text-[11px] text-[#16274D]/60">Patients must scroll to the end before accepting.</div>
                      </div>
                      <button type="button" onClick={() => termsPdfRef.current?.click()} className="h-8 px-3 rounded-lg text-[12px] font-medium text-[#16274D] border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">Replace</button>
                      <button type="button" onClick={() => update({ termsPdf: null, termsPdfName: '' })} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#EF4444] border border-gray-200 bg-white hover:bg-red-50 cursor-pointer" title="Remove PDF" aria-label="Remove PDF"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => termsPdfRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-1.5 h-[96px] rounded-xl border-2 border-dashed border-gray-200 hover:border-[#4EBEE3] text-[12px] text-[#16274D]/60 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4 text-[#4EBEE3]" />
                      <span><span className="text-[#4EBEE3] font-medium">Upload a PDF</span> · up to 5MB</span>
                    </button>
                  )}
                  <p className="text-[12px] text-[#16274D]/60 mt-1.5">Bedside preferences setup — patients open this document and must scroll to the end before accepting.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Brand Colors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="w-[18px] h-[18px] text-[#4EBEE3]" />
              <h2 className="text-[16px] font-semibold text-[#16274D]">Brand Colors</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <ColorPicker label="Primary Color" value={settings.primaryColor} onChange={v => update({ primaryColor: v })} />
              <ColorPicker label="Secondary Color" value={settings.secondaryColor} onChange={v => update({ secondaryColor: v })} />
            </div>

            {/* Color Preview */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl">
              <p className="text-[11px] font-medium text-[#16274D]/50 mb-3 uppercase tracking-wider">Preview</p>
              <div className="flex gap-2 h-10 rounded-lg overflow-hidden mb-3">
                <div className="flex-1 relative group" style={{ backgroundColor: settings.primaryColor }}>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Primary</span>
                </div>
                <div className="flex-1 relative group" style={{ backgroundColor: settings.secondaryColor }}>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Secondary</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Section 3: Typography */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Type className="w-[18px] h-[18px] text-[#4EBEE3]" />
              <h2 className="text-[16px] font-semibold text-[#16274D]">Typography</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* English Font */}
              <div>
                <FontSelector
                  label="English Font"
                  value={settings.englishFont}
                  onChange={v => update({ englishFont: v })}
                  options={googleFontsEnglish}
                  language="english"
                />
                <div className="bg-gray-50 rounded-xl p-4 mt-3">
                  <p className="text-[10px] font-medium text-[#16274D]/40 mb-2 uppercase tracking-wider">Preview</p>
                  <p className="text-[18px] text-[#16274D] mb-0.5" style={{ fontFamily: settings.englishFont }}>
                    Welcome to {settings.hospitalName || 'Our Hospital'}
                  </p>
                  <p className="text-[13px] text-[#16274D]/60" style={{ fontFamily: settings.englishFont }}>
                    Providing quality healthcare with compassion and excellence.
                  </p>
                </div>
              </div>
              {/* Arabic Font */}
              <div>
                <FontSelector
                  label="Arabic Font"
                  value={settings.arabicFont}
                  onChange={v => update({ arabicFont: v })}
                  options={googleFontsArabic}
                  language="arabic"
                />
                <div className="bg-gray-50 rounded-xl p-4 mt-3">
                  <p className="text-[10px] font-medium text-[#16274D]/40 mb-2 uppercase tracking-wider">Preview</p>
                  <p className="text-[18px] text-[#16274D] mb-0.5" style={{ fontFamily: settings.arabicFont }}>
                    مرحبًا بك في {settings.hospitalName || 'مستشفىنا'}
                  </p>
                  <p className="text-[13px] text-[#16274D]/60" style={{ fontFamily: settings.arabicFont }}>
                    نقدم الرعاية الصحية بحنان وتميز.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}