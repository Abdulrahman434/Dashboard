import { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, RotateCcw, Info, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  sectionVisibilityService,
  SECTIONS_META,
  SectionKey,
  SectionVisibilityMap,
} from '../../services/sectionVisibilityService';

interface GlobalVisibilityConfigureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function GlobalVisibilityConfigureModal({
  isOpen,
  onClose,
  onSaved,
}: GlobalVisibilityConfigureModalProps) {
  const [settings, setSettings] = useState<SectionVisibilityMap>(
    sectionVisibilityService.getGlobalVisibility()
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(sectionVisibilityService.getGlobalVisibility());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: SectionKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (visible: boolean) => {
    const updated = { ...settings };
    SECTIONS_META.forEach((s) => {
      updated[s.key] = visible;
    });
    setSettings(updated);
  };

  const handleSave = () => {
    sectionVisibilityService.saveGlobalVisibility(settings);
    toast.success('Global Patient Section Visibility Updated', {
      description: 'Applied to all patients. All per-patient custom overrides have been reset to global.',
      duration: 3500,
    });
    if (onSaved) onSaved();
    onClose();
  };

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-[220] flex items-center justify-center p-4 backdrop-blur-sm font-['Poppins',sans-serif]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF8FC] flex items-center justify-center text-[#4EBEE3] shadow-sm border border-[#4EBEE3]/20">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#16274D]">
                Configure Global Patient Terminal Visibility
              </h2>
              <p className="text-[12px] text-[#637381]">
                Set default section visibility across all patient terminals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/80 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#F0F9FF] border-b border-[#BAE6FD] px-6 py-3 flex items-start gap-2.5 text-[12.5px] text-[#0369A1]">
          <Info size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
          <p>
            <strong>Global Policy Notice:</strong> Saving settings here applies globally to all patients. If a nurse previously customized visibility for a specific patient, saving global settings will <strong>reset that patient back to this global selection</strong>.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between text-[12.5px]">
          <span className="font-semibold text-[#16274D]">
            Active Sections: <span className="text-[#4EBEE3] font-bold">{activeCount} / {SECTIONS_META.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="px-2.5 py-1 text-[#0284C7] hover:bg-sky-50 rounded-lg font-medium transition-colors"
            >
              Enable All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Section Toggles List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1 bg-gray-50/30">
          {SECTIONS_META.map((sec) => {
            const isVisible = settings[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => handleToggle(sec.key)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isVisible
                    ? 'bg-white border-[#4EBEE3]/40 shadow-sm hover:border-[#4EBEE3]'
                    : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isVisible ? 'bg-[#EBF8FC] text-[#4EBEE3]' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#16274D]">{sec.label}</h4>
                    <p className="text-[12px] text-[#637381]">{sec.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    isVisible ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      isVisible ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white text-[13px] font-bold shadow-md transition-all"
          >
            <Sliders size={16} />
            Apply Global Settings to All Patients
          </button>
        </div>
      </div>
    </div>
  );
}
