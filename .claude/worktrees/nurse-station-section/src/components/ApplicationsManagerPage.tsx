import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, X, Link as LinkIcon, FileText, Smartphone, Settings2, Image as ImageIcon, ChevronDown, LayoutGrid } from 'lucide-react';
import InlineInput from './InlineInput';
import InlineImageUpload from './InlineImageUpload';
import { toast } from 'sonner@2.0.3';
import TableSortIcon from './TableSortIcon';
import PillTabs from './PillTabs';

type SortField = 'englishName' | 'arabicName' | 'type';
type SortDirection = 'asc' | 'desc';

interface Application {
  id: string;
  englishName: string;
  arabicName: string;
  type: 'URL' | 'APK' | 'PDF';
  icon: string;
  url?: string;
  apkFile?: string;
  pdfFile?: string;
  assignedTo: string[];
}

interface CategoryConfig {
  englishName: string;
  arabicName: string;
  icon: string;
}

type AppCategory = 'Games' | 'Social' | 'Reading' | 'Meeting' | 'Media' | 'Internet' | 'Tools' | 'About Us';

const APP_CATEGORIES: AppCategory[] = ['Games', 'Social', 'Reading', 'Meeting', 'Media', 'Internet', 'Tools', 'About Us'];

export default function ApplicationsManagerPage() {
  const [activeTab, setActiveTab] = useState<AppCategory>('Games');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<Record<AppCategory, Application[]>>(() => {
    const saved = localStorage.getItem('applications-data');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      'Games': [],
      'Social': [],
      'Reading': [],
      'Meeting': [],
      'Media': [],
      'Internet': [],
      'Tools': [],
      'About Us': []
    };
  });
  
  const [categoryConfigs, setCategoryConfigs] = useState<Record<AppCategory, CategoryConfig>>(() => {
    const saved = localStorage.getItem('category-configs');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      'Games': { englishName: 'Games', arabicName: 'الألعاب', icon: '' },
      'Social': { englishName: 'Social', arabicName: 'التواصل الاجتماعي', icon: '' },
      'Reading': { englishName: 'Reading', arabicName: 'القراءة', icon: '' },
      'Meeting': { englishName: 'Meeting', arabicName: 'الاجتماعات', icon: '' },
      'Media': { englishName: 'Media', arabicName: 'الوسائط', icon: '' },
      'Internet': { englishName: 'Internet', arabicName: 'الإنترنت', icon: '' },
      'Tools': { englishName: 'Tools', arabicName: 'الأدوات', icon: '' },
      'About Us': { englishName: 'About Us', arabicName: 'عنا', icon: '' }
    };
  });

  // Input history for autocomplete
  const [inputHistory, setInputHistory] = useState<{
    englishNames: string[];
    arabicNames: string[];
    urls: string[];
  }>(() => {
    const saved = localStorage.getItem('app-input-history');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      englishNames: [],
      arabicNames: [],
      urls: []
    };
  });

  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAssignedToDropdown, setShowAssignedToDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form state
  const [appType, setAppType] = useState<'URL' | 'APK' | 'PDF'>('URL');
  const [formData, setFormData] = useState({
    englishName: '',
    arabicName: '',
    icon: '',
    url: '',
    apkFile: '',
    pdfFile: '',
    assignedTo: []
  });

  // Configure form state
  const [configForm, setConfigForm] = useState({
    englishName: '',
    arabicName: '',
    icon: '',
    visible: true
  });

  // Save to localStorage with size optimization
  useEffect(() => {
    try {
      // Create a copy without large files for localStorage
      const appsForStorage = Object.keys(applications).reduce((acc, category) => {
        acc[category as AppCategory] = applications[category as AppCategory].map(app => ({
          ...app,
          // Keep small icons, but mark large files as session-only
          apkFile: app.apkFile ? '[APK data - session only]' : '',
          pdfFile: app.pdfFile ? '[PDF data - session only]' : ''
        }));
        return acc;
      }, {} as Record<AppCategory, Application[]>);

      localStorage.setItem('applications-data', JSON.stringify(appsForStorage));
      console.log('✅ Applications saved to localStorage (large files stored in memory)');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      // If still fails, try minimal data
      try {
        const minimalData = Object.keys(applications).reduce((acc, category) => {
          acc[category as AppCategory] = applications[category as AppCategory].map(app => ({
            id: app.id,
            englishName: app.englishName,
            arabicName: app.arabicName,
            type: app.type,
            icon: app.icon.length > 50000 ? '' : app.icon,
            url: app.url,
            assignedTo: app.assignedTo,
            apkFile: '',
            pdfFile: ''
          }));
          return acc;
        }, {} as Record<AppCategory, Application[]>);
        localStorage.setItem('applications-data', JSON.stringify(minimalData));
        console.warn('⚠️ Saved minimal data due to storage quota limits');
      } catch (finalError) {
        console.error('❌ Cannot save to localStorage:', finalError);
        alert('Storage quota exceeded. APK/PDF files will only be available during this session.');
      }
    }
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('category-configs', JSON.stringify(categoryConfigs));
  }, [categoryConfigs]);

  useEffect(() => {
    localStorage.setItem('app-input-history', JSON.stringify(inputHistory));
  }, [inputHistory]);

  const handleFileUpload = (file: File, type: 'icon' | 'apk' | 'pdf' | 'categoryIcon') => {
    console.log(`📁 Starting file upload for ${type}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Check file size (100MB for APK, 10MB for PDF, 2MB for images)
    const maxSize = type === 'apk' ? 100 * 1024 * 1024 : 
                    type === 'pdf' ? 10 * 1024 * 1024 : 
                    2 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      alert(`File is too large! Maximum size is ${maxMB}MB`);
      console.error(`❌ File too large: ${file.size} bytes (max: ${maxSize} bytes)`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Uploading ${type}...`);

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      console.log(`⏳ Starting to read file: ${file.name}`);
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(`Uploading ${type}... ${percentComplete}%`);
        console.log(`📊 Upload progress: ${percentComplete}%`);
      }
    };

    reader.onloadend = () => {
      console.log(`✅ File read complete for ${type}`);
      setIsUploading(false);
      setUploadProgress('');
      
      const result = reader.result as string;
      console.log(`📦 Base64 data length: ${result?.length || 0} characters`);
      
      if (type === 'icon') {
        setFormData(prev => ({ ...prev, icon: result }));
        console.log('✅ Icon uploaded successfully');
      } else if (type === 'apk') {
        setFormData(prev => ({ ...prev, apkFile: result }));
        console.log('✅ APK uploaded successfully');
      } else if (type === 'pdf') {
        setFormData(prev => ({ ...prev, pdfFile: result }));
        console.log('✅ PDF uploaded successfully');
      } else if (type === 'categoryIcon') {
        setConfigForm(prev => ({ ...prev, icon: result }));
        console.log('✅ Category icon uploaded successfully');
      }
    };

    reader.onerror = (error) => {
      console.error(`❌ File upload error for ${type}:`, error);
      setIsUploading(false);
      setUploadProgress('');
      alert(`Failed to upload ${type}. Please try again or try a smaller file.`);
    };

    reader.onabort = () => {
      console.warn(`⚠️ File upload aborted for ${type}`);
      setIsUploading(false);
      setUploadProgress('');
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(`❌ Error starting file read:`, error);
      setIsUploading(false);
      setUploadProgress('');
      alert(`Failed to read file. Please try again.`);
    }
  };

  const handleAddApp = () => {
    const newApp: Application = {
      id: Date.now().toString(),
      englishName: formData.englishName,
      arabicName: formData.arabicName,
      type: appType,
      icon: formData.icon,
      assignedTo: formData.assignedTo,
      ...(appType === 'URL' && { url: formData.url }),
      ...(appType === 'APK' && { apkFile: formData.apkFile }),
      ...(appType === 'PDF' && { pdfFile: formData.pdfFile })
    };

    console.log('📱 Adding new application:', {
      name: newApp.englishName,
      type: newApp.type,
      hasAPK: !!newApp.apkFile,
      hasPDF: !!newApp.pdfFile,
      apkSize: newApp.apkFile ? `${(newApp.apkFile.length / 1024).toFixed(2)} KB` : 'N/A'
    });

    setApplications(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newApp]
    }));

    // Update input history
    setInputHistory(prev => ({
      ...prev,
      englishNames: [...prev.englishNames, formData.englishName],
      arabicNames: [...prev.arabicNames, formData.arabicName],
      urls: appType === 'URL' ? [...prev.urls, formData.url || ''] : prev.urls
    }));

    // Show info message for APK/PDF files
    if (appType === 'APK' || appType === 'PDF') {
      console.log('ℹ️ Note: APK/PDF files are stored in browser memory for this session');
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEditApp = () => {
    if (!editingApp) return;

    const updatedApp: Application = {
      ...editingApp,
      englishName: formData.englishName,
      arabicName: formData.arabicName,
      icon: formData.icon,
      type: appType,
      assignedTo: formData.assignedTo,
      ...(appType === 'URL' && { url: formData.url }),
      ...(appType === 'APK' && { apkFile: formData.apkFile }),
      ...(appType === 'PDF' && { pdfFile: formData.pdfFile })
    };

    setApplications(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(app => 
        app.id === editingApp.id ? updatedApp : app
      )
    }));

    resetForm();
    setShowEditModal(false);
    setEditingApp(null);
  };

  const handleToggleAssignment = (appId: string, assignment: 'Kids' | 'Adults' | 'VIP') => {
    setApplications(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(app => {
        if (app.id === appId) {
          const currentAssignments = app.assignedTo || [];
          const hasAssignment = currentAssignments.includes(assignment);
          
          return {
            ...app,
            assignedTo: hasAssignment
              ? currentAssignments.filter(a => a !== assignment)
              : [...currentAssignments, assignment]
          };
        }
        return app;
      })
    }));
  };

  const handleToggleAllAssignments = (appId: string) => {
    setApplications(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(app => {
        if (app.id === appId) {
          const currentAssignments = app.assignedTo || [];
          const hasAll = currentAssignments.length === 3;
          
          return {
            ...app,
            assignedTo: hasAll ? [] : ['Kids', 'Adults', 'VIP']
          };
        }
        return app;
      })
    }));
  };

  const handleConfigureCategory = () => {
    setCategoryConfigs(prev => ({
      ...prev,
      [activeTab]: {
        englishName: configForm.englishName,
        arabicName: configForm.arabicName,
        icon: configForm.icon,
        visible: configForm.visible
      }
    }));
    setShowConfigureModal(false);
    resetConfigForm();
  };

  const handleDeleteApp = (app: Application) => {
    setAppToDelete(app);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!appToDelete) return;

    setApplications(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(app => app.id !== appToDelete.id)
    }));

    setShowDeleteConfirm(false);
    setAppToDelete(null);
  };

  const handleBulkDelete = () => {
    setApplications(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(app => !selectedApps.includes(app.id))
    }));
    setSelectedApps([]);
  };

  const resetForm = () => {
    setFormData({
      englishName: '',
      arabicName: '',
      icon: '',
      url: '',
      apkFile: '',
      pdfFile: '',
      assignedTo: []
    });
    setAppType('URL');
    setShowAssignedToDropdown(false);
  };

  const resetConfigForm = () => {
    setConfigForm({
      englishName: '',
      arabicName: '',
      icon: '',
      visible: true
    });
  };

  const openConfigureModal = () => {
    const config = categoryConfigs[activeTab];
    setConfigForm({
      englishName: config.englishName,
      arabicName: config.arabicName,
      icon: config.icon,
      visible: config.visible !== undefined ? config.visible : true
    });
    setShowConfigureModal(true);
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setAppType(app.type);
    
    // Migrate old "Children" to "Kids" for backward compatibility
    const migratedAssignedTo = (app.assignedTo || []).map(item => 
      item === 'Children' ? 'Kids' : item
    );
    
    setFormData({
      englishName: app.englishName,
      arabicName: app.arabicName,
      icon: app.icon,
      url: app.url || '',
      apkFile: app.apkFile || '',
      pdfFile: app.pdfFile || '',
      assignedTo: migratedAssignedTo
    });
    setShowEditModal(true);
  };

  const filteredApps = applications[activeTab].filter(app =>
    app.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.arabicName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApps(filteredApps.map(app => app.id));
    } else {
      setSelectedApps([]);
    }
  };

  const handleSelectApp = (appId: string, checked: boolean) => {
    if (checked) {
      setSelectedApps(prev => [...prev, appId]);
    } else {
      setSelectedApps(prev => prev.filter(id => id !== appId));
    }
  };

  const renderFileUploadPreview = (
    fileName: string,
    fileData: string,
    onRemove: () => void,
    label: string = "File"
  ) => {
    if (!fileData) return null;

    const isImage = fileData.startsWith('data:image');

    return (
      <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => isImage && setPreviewImage(fileData)}
          >
            {isImage ? (
              <img 
                src={fileData} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText size={32} className="text-gray-400" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">
              {label}
            </p>
            <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">
              {isImage ? 'Image uploaded' : 'File uploaded'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  };

  const renderAppModal = (isEdit: boolean) => {
    const isVisible = isEdit ? showEditModal : showAddModal;
    if (!isVisible) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.englishName || !formData.arabicName || !formData.icon) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Validate type-specific fields
      if (appType === 'URL' && !formData.url) {
        alert('Please enter a URL');
        return;
      }
      
      if (appType === 'APK' && !formData.apkFile) {
        alert('Please upload an APK file');
        return;
      }
      
      if (appType === 'PDF' && !formData.pdfFile) {
        alert('Please upload a PDF file');
        return;
      }
      
      if (isEdit) {
        handleEditApp();
      } else {
        handleAddApp();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              {isEdit ? 'Edit Application' : 'Add New Application'}
            </h3>
            <button
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingApp(null);
                } else {
                  setShowAddModal(false);
                }
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Application Type Selection */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Application Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAppType('URL')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    appType === 'URL'
                      ? 'border-[#4EBEE3] bg-[#4EBEE3]/10 text-[#4EBEE3]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <LinkIcon size={18} strokeWidth={2} />
                  <span className="text-[13px] font-medium font-['Poppins',sans-serif]">URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppType('APK')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    appType === 'APK'
                      ? 'border-[#4EBEE3] bg-[#4EBEE3]/10 text-[#4EBEE3]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Smartphone size={18} strokeWidth={2} />
                  <span className="text-[13px] font-medium font-['Poppins',sans-serif]">APK</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppType('PDF')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    appType === 'PDF'
                      ? 'border-[#4EBEE3] bg-[#4EBEE3]/10 text-[#4EBEE3]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <FileText size={18} strokeWidth={2} />
                  <span className="text-[13px] font-medium font-['Poppins',sans-serif]">PDF</span>
                </button>
              </div>
            </div>

            {/* English Name */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                English Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.englishName}
                onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                placeholder="Enter application name in English"
                required
                list="englishNames"
              />
              <datalist id="englishNames">
                {inputHistory.englishNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Arabic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.arabicName}
                onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                placeholder="أدخل اسم التطبيق بالعربية"
                required
                dir="rtl"
                list="arabicNames"
              />
              <datalist id="arabicNames">
                {inputHistory.arabicNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>

            {/* Upload Icon */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Upload Icon <span className="text-red-500">*</span>
              </label>
              {formData.icon ? (
                renderFileUploadPreview(
                  'Icon',
                  formData.icon,
                  () => setFormData({ ...formData, icon: '' }),
                  'App Icon'
                )
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'icon');
                      }
                    }}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                      <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        Click to upload icon
                      </p>
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Conditional Fields based on Type */}
            {appType === 'URL' && (
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                  placeholder="https://example.com"
                  required
                  list="urls"
                />
                <datalist id="urls">
                  {inputHistory.urls.map((url, index) => (
                    <option key={index} value={url} />
                  ))}
                </datalist>
              </div>
            )}

            {appType === 'APK' && (
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Upload APK File <span className="text-red-500">*</span>
                </label>
                {formData.apkFile ? (
                  renderFileUploadPreview(
                    'APK',
                    formData.apkFile,
                    () => setFormData({ ...formData, apkFile: '' }),
                    'APK File'
                  )
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept=".apk"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, 'apk');
                        }
                      }}
                      className="hidden"
                      id="apk-upload"
                      required={!isEdit}
                    />
                    <label htmlFor="apk-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                        <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload APK
                        </p>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                          APK files only, up to 100MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {appType === 'PDF' && (
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Upload PDF File <span className="text-red-500">*</span>
                </label>
                {formData.pdfFile ? (
                  renderFileUploadPreview(
                    'PDF',
                    formData.pdfFile,
                    () => setFormData({ ...formData, pdfFile: '' }),
                    'PDF File'
                  )
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, 'pdf');
                        }
                      }}
                      className="hidden"
                      id="pdf-upload"
                      required={!isEdit}
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                        <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload PDF
                        </p>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                          PDF files only, up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Assigned To */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Select Group
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssignedToDropdown(!showAssignedToDropdown)}
                  className="w-full px-4 py-3 border-2 border-[#4EBEE3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 font-['Poppins',sans-serif] text-[13px] flex items-center justify-between bg-white"
                >
                  <span className={`text-[14px] font-['Poppins',sans-serif] ${formData.assignedTo.length === 0 ? 'text-gray-400' : 'text-[#16274D]'}`}>
                    {formData.assignedTo.length === 0 ? 'Select groups' : formData.assignedTo.join(', ')}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-200 ${showAssignedToDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>
                {showAssignedToDropdown && (
                  <div className="absolute z-10 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl mt-1 py-3">
                    <div className="space-y-3 px-4">
                      {/* Select All */}
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.length === 3}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, assignedTo: ['Kids', 'Adults', 'VIP'] });
                            } else {
                              setFormData({ ...formData, assignedTo: [] });
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                        <span className="text-[15px] text-[#16274D] font-['Poppins',sans-serif] font-semibold">Select All</span>
                      </label>
                      
                      {/* Individual Options */}
                      {['Kids', 'Adults', 'VIP'].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, assignedTo: [...formData.assignedTo, option] });
                              } else {
                                setFormData({ ...formData, assignedTo: formData.assignedTo.filter(item => item !== option) });
                              }
                            }}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                          <span className="text-[15px] text-[#16274D] font-['Poppins',sans-serif]">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isEdit) {
                    setShowEditModal(false);
                    setEditingApp(null);
                  } else {
                    setShowAddModal(false);
                  }
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
              >
                {isEdit ? 'Update' : 'Add'} Application
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-5 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <LayoutGrid size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Applications Manager
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage applications across all categories
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Content - Merged Container */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {/* Tabs */}
        <PillTabs
          tabs={APP_CATEGORIES.map(category => ({
            id: category,
            label: categoryConfigs[category].englishName
          }))}
          activeTab={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId as AppCategory);
            setSearchQuery('');
            setSelectedApps([]);
          }}
        />

        {/* Content Area */}
        {filteredApps.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone size={28} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
              No applications in {categoryConfigs[activeTab].englishName}
            </h3>
            <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-6">
              Get started by adding your first application to this category
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={openConfigureModal}
                className="px-6 py-2.5 border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium inline-flex items-center gap-2"
              >
                <Settings2 size={16} strokeWidth={2} />
                Configure
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium inline-flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2} />
                Add Application
              </button>
            </div>
          </div>
        ) : (
          /* Table with Data */
          <>
            {/* Search Bar and Actions */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                  />
                </div>
                <div className="flex gap-3">
                  {selectedApps.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-2"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                      Delete ({selectedApps.length})
                    </button>
                  )}
                  <button
                    onClick={openConfigureModal}
                    className="px-4 py-2.5 border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-2"
                  >
                    <Settings2 size={16} strokeWidth={2} />
                    Configure
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2} />
                    Add Application
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Icon
                    </th>
                    <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      English Name
                    </th>
                    <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Arabic Name
                    </th>
                    <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Type
                    </th>
                    <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Kids
                    </th>
                    <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Adults
                    </th>
                    <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      VIP
                    </th>
                    <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      All
                    </th>
                    <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApps.map((app) => {
                    const hasKids = (app.assignedTo || []).includes('Kids') || (app.assignedTo || []).includes('Children');
                    const hasAdults = (app.assignedTo || []).includes('Adults');
                    const hasVIP = (app.assignedTo || []).includes('VIP');
                    const hasAll = hasKids && hasAdults && hasVIP;

                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedApps.includes(app.id)}
                            onChange={(e) => handleSelectApp(app.id, e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <InlineImageUpload
                            imageUrl={app.icon}
                            onImageChange={(imageUrl) => {
                              const updatedApps = { ...applications };
                              updatedApps[activeTab] = updatedApps[activeTab].map(a =>
                                a.id === app.id ? { ...a, icon: imageUrl } : a
                              );
                              setApplications(updatedApps);
                              toast.success('Icon Updated', {
                                description: 'Application icon updated successfully',
                                duration: 2000,
                              });
                            }}
                            altText={app.englishName}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <InlineInput
                            value={app.englishName}
                            onChange={(value) => {
                              const updatedApps = { ...applications };
                              updatedApps[activeTab] = updatedApps[activeTab].map(a =>
                                a.id === app.id ? { ...a, englishName: value } : a
                              );
                              setApplications(updatedApps);
                            }}
                            className="font-medium"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <InlineInput
                            value={app.arabicName}
                            onChange={(value) => {
                              const updatedApps = { ...applications };
                              updatedApps[activeTab] = updatedApps[activeTab].map(a =>
                                a.id === app.id ? { ...a, arabicName: value } : a
                              );
                              setApplications(updatedApps);
                            }}
                            className="font-medium"
                            dir="rtl"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] ${
                            app.type === 'URL' ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]' :
                            app.type === 'APK' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {app.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={hasKids}
                            onChange={() => handleToggleAssignment(app.id, 'Kids')}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={hasAdults}
                            onChange={() => handleToggleAssignment(app.id, 'Adults')}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={hasVIP}
                            onChange={() => handleToggleAssignment(app.id, 'VIP')}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={hasAll}
                            onChange={() => handleToggleAllAssignments(app.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="group relative inline-flex">
                              <button
                                onClick={() => openEditModal(app)}
                                className="p-2 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} strokeWidth={2} />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                                Edit
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                                  <div className="border-4 border-transparent border-t-[#16274D]"></div>
                                </div>
                              </div>
                            </div>
                            <div className="group relative inline-flex">
                              <button
                                onClick={() => handleDeleteApp(app)}
                                className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                                Delete
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                                  <div className="border-4 border-transparent border-t-[#16274D]"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {renderAppModal(false)}
      {renderAppModal(true)}

      {/* Configure Category Modal */}
      {showConfigureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Configure Category: {activeTab}
              </h3>
              <button
                onClick={() => {
                  setShowConfigureModal(false);
                  resetConfigForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleConfigureCategory(); }} className="p-6 space-y-5">
              {/* English Category Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  English Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configForm.englishName}
                  onChange={(e) => setConfigForm({ ...configForm, englishName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                  placeholder="Enter category name in English"
                  required
                />
              </div>

              {/* Arabic Category Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Arabic Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configForm.arabicName}
                  onChange={(e) => setConfigForm({ ...configForm, arabicName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                  placeholder="أدخل اسم الفئة بالعربية"
                  required
                  dir="rtl"
                />
              </div>

              {/* Category Icon */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Category Icon
                </label>
                {configForm.icon ? (
                  renderFileUploadPreview(
                    'Icon',
                    configForm.icon,
                    () => setConfigForm({ ...configForm, icon: '' }),
                    'Category Icon'
                  )
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, 'categoryIcon');
                        }
                      }}
                      className="hidden"
                      id="category-icon-upload"
                    />
                    <label htmlFor="category-icon-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                        <ImageIcon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload category icon
                        </p>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                          PNG, JPG up to 2MB (optional)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    Show Category on Terminal
                  </label>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                    Toggle to hide or show this category folder on patient terminals
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigForm({ ...configForm, visible: !configForm.visible })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:ring-offset-2 ${
                    configForm.visible ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={configForm.visible}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      configForm.visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigureModal(false);
                    resetConfigForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} strokeWidth={2} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && appToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] text-center mb-2">
              Delete Application
            </h3>
            <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] text-center mb-6">
              Are you sure you want to delete "{appToDelete.englishName}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAppToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}