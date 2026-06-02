import { useState } from 'react';
import { User, Settings, X, Upload, FileText, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  visible: boolean;
}

const initialCategories: Category[] = [
  { id: '1', nameEn: 'Vision', nameAr: 'الرؤية', visible: true },
  { id: '2', nameEn: 'Mission', nameAr: 'الرسالة', visible: true },
  { id: '3', nameEn: 'Value', nameAr: 'القيم', visible: true },
  { id: '4', nameEn: 'Rights & Responsibilities', nameAr: 'حقوق وواجبات المريض', visible: true },
  { id: '5', nameEn: 'Evacuation map', nameAr: 'خريطة الإخلاء', visible: true },
  { id: '6', nameEn: 'Hotlines', nameAr: 'خطوط عاجلة', visible: true }
];

interface TabContent {
  categoryId: string;
  fileEnUrl: string;
  fileEnName: string;
  fileEnType: 'image' | 'pdf' | null;
  fileArUrl: string;
  fileArName: string;
  fileArType: 'image' | 'pdf' | null;
}

const initialContent: TabContent[] = [];

export default function ProfilePage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState('1');
  const [tabContents, setTabContents] = useState<TabContent[]>(initialContent);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: 'image' | 'pdf'; name: string } | null>(null);
  const [configFormData, setConfigFormData] = useState({
    nameEn: '',
    nameAr: '',
    visible: true
  });

  const visibleCategories = categories.filter(cat => cat.visible);
  const activeCategory = categories.find(cat => cat.id === activeTab);
  const activeContent = tabContents.find(tc => tc.categoryId === activeTab);

  const handleConfigure = () => {
    if (!activeCategory) return;
    
    setConfigFormData({
      nameEn: activeCategory.nameEn,
      nameAr: activeCategory.nameAr,
      visible: activeCategory.visible
    });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfiguration = () => {
    if (!configFormData.nameEn.trim() || !configFormData.nameAr.trim()) {
      toast.error('Error', {
        description: 'Please fill in all fields',
        duration: 2000,
      });
      return;
    }

    if (!activeCategory) return;

    setCategories(categories.map(cat =>
      cat.id === activeCategory.id
        ? {
            ...cat,
            nameEn: configFormData.nameEn.trim(),
            nameAr: configFormData.nameAr.trim(),
            visible: configFormData.visible
          }
        : cat
    ));

    setIsConfigModalOpen(false);

    toast.success('Category Configured', {
      description: 'Category settings have been updated successfully',
      duration: 2000,
    });
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
    setConfigFormData({ nameEn: '', nameAr: '', visible: true });
  };

  const handleFileUpload = (language: 'en' | 'ar', file: File) => {
    const url = URL.createObjectURL(file);
    const isPdf = file.type === 'application/pdf';
    const fileType = isPdf ? 'pdf' : 'image';
    
    const existingContent = tabContents.find(tc => tc.categoryId === activeTab);
    
    if (existingContent) {
      setTabContents(tabContents.map(tc =>
        tc.categoryId === activeTab
          ? {
              ...tc,
              ...(language === 'en' 
                ? { fileEnUrl: url, fileEnName: file.name, fileEnType: fileType }
                : { fileArUrl: url, fileArName: file.name, fileArType: fileType }
              )
            }
          : tc
      ));
    } else {
      setTabContents([
        ...tabContents,
        {
          categoryId: activeTab,
          fileEnUrl: language === 'en' ? url : '',
          fileEnName: language === 'en' ? file.name : '',
          fileEnType: language === 'en' ? fileType : null,
          fileArUrl: language === 'ar' ? url : '',
          fileArName: language === 'ar' ? file.name : '',
          fileArType: language === 'ar' ? fileType : null
        }
      ]);
    }

    toast.success('File Uploaded', {
      description: `${language === 'en' ? 'English' : 'Arabic'} ${fileType} has been uploaded successfully`,
      duration: 2000,
    });
  };

  const handleRemoveFile = (language: 'en' | 'ar') => {
    setTabContents(tabContents.map(tc =>
      tc.categoryId === activeTab
        ? {
            ...tc,
            ...(language === 'en' 
              ? { fileEnUrl: '', fileEnName: '', fileEnType: null }
              : { fileArUrl: '', fileArName: '', fileArType: null }
            )
          }
        : tc
    ));

    toast.success('File Removed', {
      description: `${language === 'en' ? 'English' : 'Arabic'} file has been removed`,
      duration: 2000,
    });
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <User size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Profile</h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage hospital profile content for each category
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="border-b-2 border-gray-200 px-2 pt-2 flex gap-1 overflow-x-auto">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-6 py-3 font-['Poppins',sans-serif] text-[14px] font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === category.id
                  ? 'bg-[#4EBEE3] text-white'
                  : 'text-[#16274D] hover:bg-gray-50'
              }`}
            >
              {category.nameEn}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Configure Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleConfigure}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3] hover:text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Settings size={18} strokeWidth={2} />
              Configure
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-1/2">
                    English Content
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-1/2">
                    Arabic Content
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* English Upload */}
                  <td className="py-6 px-6 align-top border-r border-gray-200">
                    {!activeContent?.fileEnUrl ? (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('en', file);
                          }}
                          accept="image/*,.pdf"
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-3">
                              <Upload size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1">
                              Click to upload
                            </p>
                            <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                              PNG, JPG or PDF
                            </p>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => setPreviewFile({ url: activeContent.fileEnUrl, type: activeContent.fileEnType!, name: activeContent.fileEnName })}
                          className="w-full p-4 bg-[#F8FAFC] rounded-lg border-2 border-gray-200 hover:border-[#4EBEE3] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              activeContent.fileEnType === 'pdf' 
                                ? 'bg-[#EF4444]/10' 
                                : 'bg-[#4EBEE3]/10'
                            }`}>
                              {activeContent.fileEnType === 'pdf' ? (
                                <FileText size={24} className="text-[#EF4444]" strokeWidth={2} />
                              ) : (
                                <ImageIcon size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">
                                {activeContent.fileEnName}
                              </p>
                              <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                                {activeContent.fileEnType === 'pdf' ? 'PDF Document' : 'Image'}
                              </p>
                            </div>
                            <Eye size={20} className="text-[#4EBEE3] flex-shrink-0" strokeWidth={2} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile('en');
                              }}
                              className="p-2 hover:bg-[#EF4444]/10 rounded-lg transition-colors flex-shrink-0"
                              title="Remove file"
                            >
                              <Trash2 size={18} className="text-[#EF4444]" strokeWidth={2} />
                            </button>
                          </div>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Arabic Upload */}
                  <td className="py-6 px-6 align-top">
                    {!activeContent?.fileArUrl ? (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('ar', file);
                          }}
                          accept="image/*,.pdf"
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-3">
                              <Upload size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1" dir="rtl">
                              انقر للتحميل
                            </p>
                            <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]" dir="rtl">
                              PNG, JPG أو PDF
                            </p>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => setPreviewFile({ url: activeContent.fileArUrl, type: activeContent.fileArType!, name: activeContent.fileArName })}
                          className="w-full p-4 bg-[#F8FAFC] rounded-lg border-2 border-gray-200 hover:border-[#4EBEE3] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              activeContent.fileArType === 'pdf' 
                                ? 'bg-[#EF4444]/10' 
                                : 'bg-[#4EBEE3]/10'
                            }`}>
                              {activeContent.fileArType === 'pdf' ? (
                                <FileText size={24} className="text-[#EF4444]" strokeWidth={2} />
                              ) : (
                                <ImageIcon size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate" dir="rtl">
                                {activeContent.fileArName}
                              </p>
                              <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]" dir="rtl">
                                {activeContent.fileArType === 'pdf' ? 'مستند PDF' : 'صورة'}
                              </p>
                            </div>
                            <Eye size={20} className="text-[#4EBEE3] flex-shrink-0" strokeWidth={2} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile('ar');
                              }}
                              className="p-2 hover:bg-[#EF4444]/10 rounded-lg transition-colors flex-shrink-0"
                              title="Remove file"
                            >
                              <Trash2 size={18} className="text-[#EF4444]" strokeWidth={2} />
                            </button>
                          </div>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Configure Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Configure Category: {activeCategory?.nameEn}
                </h2>
              </div>
              <button
                onClick={closeConfigModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#6B7280]" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-6">
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  English Category Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={configFormData.nameEn}
                  onChange={(e) => setConfigFormData({ ...configFormData, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Arabic Category Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={configFormData.nameAr}
                  onChange={(e) => setConfigFormData({ ...configFormData, nameAr: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  dir="rtl"
                />
              </div>

              <div className="bg-[#F8FAFC] rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Show Category on Terminal
                    </p>
                    <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Toggle to hide or show this category folder on patient terminals
                    </p>
                  </div>
                  <button
                    onClick={() => setConfigFormData({ ...configFormData, visible: !configFormData.visible })}
                    className={`relative w-14 h-7 rounded-full transition-all duration-200 ${
                      configFormData.visible ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        configFormData.visible ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t-2 border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeConfigModal}
                className="px-6 py-3 border-2 border-gray-200 text-[#16274D] hover:bg-gray-50 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                className="px-6 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  previewFile.type === 'pdf' ? 'bg-[#EF4444]/10' : 'bg-[#4EBEE3]/10'
                }`}>
                  {previewFile.type === 'pdf' ? (
                    <FileText size={20} className="text-[#EF4444]" strokeWidth={2} />
                  ) : (
                    <ImageIcon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    {previewFile.name}
                  </p>
                  <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
                    {previewFile.type === 'pdf' ? 'PDF Document' : 'Image Preview'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#6B7280]" strokeWidth={2} />
              </button>
            </div>

            {/* Preview Content */}
            <div className="overflow-auto max-h-[calc(90vh-80px)] bg-gray-100 flex items-center justify-center p-8">
              {previewFile.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh] bg-white rounded-lg shadow-lg"
                  title={previewFile.name}
                />
              ) : (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}