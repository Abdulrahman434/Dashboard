import { useState } from 'react';
import { Eye, Check, X, Palette, FileText } from 'lucide-react';
import PillTabs from './PillTabs';
import imgTemplate1 from 'figma:asset/f769ef7183e837fc09a89b05e1f616ca5c218e23.png';
import imgTemplate2 from 'figma:asset/0d17d5493f56eee9f0ea25a8f66106a8e836f6e9.png';

interface Template {
  id: string;
  name: string;
  category: 'Kids' | 'Adults' | 'VIP' | 'Nurse Station';
  thumbnail: string;
  description: string;
}

interface ThemeOption {
  id: string;
  name: string;
  thumbnail?: string;
}

const templates: Template[] = [
  {
    id: 'kids-layout-1',
    name: 'Kids Interactive Layout',
    category: 'Kids',
    thumbnail: imgTemplate1,
    description: 'Colorful layout with large icons and easy navigation for children'
  },
  {
    id: 'kids-layout-2',
    name: 'Kids Sidebar Layout',
    category: 'Kids',
    thumbnail: imgTemplate2,
    description: 'Side navigation layout optimized for kids with touch-friendly buttons'
  },
  {
    id: 'adults-layout-1',
    name: 'Adults Modern Layout',
    category: 'Adults',
    thumbnail: imgTemplate1,
    description: 'Clean and professional layout for adult patients'
  },
  {
    id: 'adults-layout-2',
    name: 'Adults Classic Layout',
    category: 'Adults',
    thumbnail: imgTemplate2,
    description: 'Traditional layout with clear sections and easy readability'
  },
  {
    id: 'vip-layout-1',
    name: 'VIP Premium Layout',
    category: 'VIP',
    thumbnail: imgTemplate1,
    description: 'Elegant and sophisticated layout for VIP patients'
  },
  {
    id: 'vip-layout-2',
    name: 'VIP Luxury Layout',
    category: 'VIP',
    thumbnail: imgTemplate2,
    description: 'High-end design with premium features and styling'
  },
  {
    id: 'nurse-layout-1',
    name: 'Nurse Station Dashboard',
    category: 'Nurse Station',
    thumbnail: imgTemplate1,
    description: 'Information-dense layout for healthcare professionals'
  },
  {
    id: 'nurse-layout-2',
    name: 'Nurse Station Compact',
    category: 'Nurse Station',
    thumbnail: imgTemplate2,
    description: 'Compact layout with quick access to patient information'
  },
];

const themeOptions: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    thumbnail: undefined // No image for default
  },
  {
    id: 'default-light',
    name: 'Default Light',
    thumbnail: imgTemplate1
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    thumbnail: imgTemplate2
  },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('Kids');
  const [appliedTemplates, setAppliedTemplates] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [themeModalTemplate, setThemeModalTemplate] = useState<Template | null>(null);
  const [templateThemes, setTemplateThemes] = useState<{ [key: string]: string }>({});

  const tabs = [
    { id: 'Kids', label: 'Kids' },
    { id: 'Adults', label: 'Adults' },
    { id: 'VIP', label: 'VIP' },
    { id: 'Nurse Station', label: 'Nurse Station' }
  ];

  const filteredTemplates = templates.filter(t => t.category === activeTab);

  const handleApplyTemplate = (templateId: string) => {
    setAppliedTemplates(prev => new Set(prev).add(templateId));
    // Set default theme when first applying a template
    if (!templateThemes[templateId]) {
      setTemplateThemes(prev => ({ ...prev, [templateId]: 'default' }));
    }
  };

  const handleRemoveTemplate = (templateId: string) => {
    setAppliedTemplates(prev => {
      const newSet = new Set(prev);
      newSet.delete(templateId);
      return newSet;
    });
  };

  const handleApplyTheme = (templateId: string, themeId: string) => {
    setTemplateThemes(prev => ({ ...prev, [templateId]: themeId }));
    setThemeModalTemplate(null);
  };

  const isApplied = (templateId: string) => appliedTemplates.has(templateId);
  
  const getCurrentTheme = (templateId: string) => templateThemes[templateId] || 'default';

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafbfc]">
      {/* Page Header - Unified Design */}
      <div className="bg-white px-8 py-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Templates
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage template layouts and themes for different patient categories
            </p>
          </div>
        </div>

        {/* Tabs */}
        <PillTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Templates Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Template Preview Image */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden group">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-4 py-2 bg-white rounded-lg flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Eye size={18} strokeWidth={2} className="text-[#16274D]" />
                    <span className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#16274D]">
                      Preview
                    </span>
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-5">
                <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#16274D] mb-2">
                  {template.name}
                </h3>
                <p className="font-['Poppins',sans-serif] text-[13px] text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Action Buttons */}
                {isApplied(template.id) ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveTemplate(template.id)}
                      className="flex-1 h-[40px] px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 font-['Poppins',sans-serif] font-medium text-[14px]"
                    >
                      <X size={18} strokeWidth={2} />
                      Remove
                    </button>
                    <button
                      onClick={() => setThemeModalTemplate(template)}
                      className="flex-1 h-[40px] px-4 bg-[#4ebee3] hover:bg-[#3da5ca] text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 font-['Poppins',sans-serif] font-medium text-[14px]"
                    >
                      <Palette size={18} strokeWidth={2} />
                      Theme/Shades
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApplyTemplate(template.id)}
                    className="w-full h-[40px] px-4 bg-[#4ebee3] hover:bg-[#3da5ca] text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 font-['Poppins',sans-serif] font-medium text-[14px]"
                  >
                    <Check size={18} strokeWidth={2} />
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#16274D]">
                  {previewTemplate.name}
                </h2>
                <p className="font-['Poppins',sans-serif] text-[13px] text-gray-600 mt-1">
                  {previewTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} strokeWidth={2} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={previewTemplate.thumbnail}
                  alt={previewTemplate.name}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="h-[40px] px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] transition-colors"
              >
                Close
              </button>
              {!isApplied(previewTemplate.id) && (
                <button
                  onClick={() => {
                    handleApplyTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  className="h-[40px] px-6 bg-[#4ebee3] hover:bg-[#3da5ca] text-white rounded-lg flex items-center gap-2 font-['Poppins',sans-serif] font-medium text-[14px] transition-colors"
                >
                  <Check size={18} strokeWidth={2} />
                  Apply Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme/Shades Modal */}
      {themeModalTemplate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setThemeModalTemplate(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#16274D]">
                  Theme & Shades
                </h2>
                <p className="font-['Poppins',sans-serif] text-[13px] text-gray-600 mt-1">
                  Select a theme variation for {themeModalTemplate.name}
                </p>
              </div>
              <button
                onClick={() => setThemeModalTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} strokeWidth={2} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themeOptions.map((theme) => {
                  const isCurrentTheme = getCurrentTheme(themeModalTemplate.id) === theme.id;
                  
                  return (
                    <div
                      key={theme.id}
                      className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                        isCurrentTheme 
                          ? 'border-[#4ebee3] ring-2 ring-[#4ebee3]/20' 
                          : 'border-gray-200 hover:border-[#4ebee3]'
                      }`}
                    >
                      {/* Theme Preview */}
                      <div className="aspect-video bg-gray-100 overflow-hidden flex items-center justify-center relative">
                        {theme.thumbnail ? (
                          <img
                            src={theme.thumbnail}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Palette size={48} className="text-gray-300" strokeWidth={1.5} />
                            <span className="font-['Poppins',sans-serif] text-[14px] text-gray-400">
                              No Preview
                            </span>
                          </div>
                        )}
                        {isCurrentTheme && (
                          <div className="absolute top-2 right-2 bg-[#4ebee3] text-white rounded-full p-1.5">
                            <Check size={16} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {/* Theme Info */}
                      <div className="p-4">
                        <h3 className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#16274D] mb-3 text-center">
                          {theme.name}
                        </h3>
                        {isCurrentTheme ? (
                          <button
                            className="w-full h-[36px] px-4 bg-green-50 text-green-600 rounded-lg flex items-center justify-center gap-2 font-['Poppins',sans-serif] font-medium text-[13px] cursor-default"
                            disabled
                          >
                            <Check size={16} strokeWidth={2} />
                            Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyTheme(themeModalTemplate.id, theme.id)}
                            className="w-full h-[36px] px-4 bg-[#4ebee3] hover:bg-[#3da5ca] text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 font-['Poppins',sans-serif] font-medium text-[13px]"
                          >
                            <Check size={16} strokeWidth={2} />
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setThemeModalTemplate(null)}
                className="h-[40px] px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}