import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Search, Edit2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import InlineSelect from './InlineSelect';
import InlineFileInput from './InlineFileInput';
import PillTabs from './PillTabs';

interface PatientService {
  id: string;
  englishName: string;
  arabicName: string;
  type: 'Stream' | 'Service' | 'Room Control';
  image: string;
  selectedChannels?: string[];
  selectedApps?: string[];
}

interface ShortcutService {
  id: string;
  englishName: string;
  arabicName: string;
  type: 'URL' | 'APK' | 'PDF' | 'Stream';
  icon: string;
  typeInput?: string;
  assignedTo: string[];
  assetId?: string; // Reference to Content Library asset
}

interface Channel {
  id: string;
  imageUrl: string;
  nameEn: string;
  nameAr: string;
  channelType: string;
  channelUrl: string;
  createdAt: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'patient-services' | 'shortcuts'>('patient-services');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Patient Services State
  const [patientServices, setPatientServices] = useState<PatientService[]>(() => {
    const saved = localStorage.getItem('patient-services');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Shortcuts State
  const [shortcuts, setShortcuts] = useState<ShortcutService[]>(() => {
    const saved = localStorage.getItem('shortcuts-services');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Channels data from ChannelManagerPage
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('channels-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Applications data from Content Library (all items for Shortcuts)
  const [applications, setApplications] = useState<any[]>(() => {
    const saved = localStorage.getItem('content-library-assets');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        return parsedData;
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  // Modal States
  const [showAddPatientServiceModal, setShowAddPatientServiceModal] = useState(false);
  const [showAddShortcutModal, setShowAddShortcutModal] = useState(false);
  const [showEditPatientServiceModal, setShowEditPatientServiceModal] = useState(false);
  const [showEditShortcutModal, setShowEditShortcutModal] = useState(false);
  const [editingPatientService, setEditingPatientService] = useState<PatientService | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutService | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'patient' | 'shortcut'; id: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);

  // Form States - Patient Service
  const [patientServiceForm, setPatientServiceForm] = useState({
    englishName: '',
    arabicName: '',
    type: 'Service' as 'Stream' | 'Service' | 'Room Control',
    image: '',
    selectedChannels: [] as string[],
    selectedApps: [] as string[]
  });
  
  // Form States - Shortcut
  const [shortcutType, setShortcutType] = useState<'URL' | 'APK' | 'PDF' | 'Stream'>('URL');
  const [shortcutForm, setShortcutForm] = useState({
    englishName: '',
    arabicName: '',
    icon: '',
    typeInput: '',
    assignedTo: [] as string[],
    selectedAsset: '' as string
  });
  
  // Channel Form State
  const [channelForm, setChannelForm] = useState({
    nameEn: '',
    nameAr: '',
    channelType: 'Entertainment',
    channelUrl: '',
    imageUrl: '',
    isActive: true
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('patient-services', JSON.stringify(patientServices));
  }, [patientServices]);

  useEffect(() => {
    localStorage.setItem('shortcuts-services', JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Sync applications from Content Library when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('content-library-assets');
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          setApplications(parsedData);
        } catch (e) {
          console.error('Error syncing applications:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Inline edit handler for Patient Services
  const handleInlineEditPatientService = (id: string, field: keyof PatientService, newValue: any) => {
    setPatientServices(patientServices.map(service => 
      service.id === id ? { ...service, [field]: newValue } : service
    ));
  };

  // Inline edit handler for Shortcuts
  const handleInlineEditShortcut = (id: string, field: keyof ShortcutService, newValue: any) => {
    setShortcuts(shortcuts.map(shortcut => 
      shortcut.id === id ? { ...shortcut, [field]: newValue } : shortcut
    ));
  };

  // Handle Patient Service Add
  const handleAddPatientService = () => {
    if (!patientServiceForm.englishName.trim() || !patientServiceForm.arabicName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newService: PatientService = {
      id: Date.now().toString(),
      englishName: patientServiceForm.englishName,
      arabicName: patientServiceForm.arabicName,
      type: patientServiceForm.type,
      image: patientServiceForm.image,
      selectedChannels: patientServiceForm.type === 'Stream' ? patientServiceForm.selectedChannels : undefined,
      selectedApps: patientServiceForm.type === 'Service' ? patientServiceForm.selectedApps : undefined
    };

    setPatientServices([...patientServices, newService]);
    setShowAddPatientServiceModal(false);
    resetPatientServiceForm();
    toast.success('Patient Service Added', {
      description: `${newService.englishName} has been added successfully`,
    });
  };

  // Handle Patient Service Edit
  const handleEditPatientService = () => {
    if (!editingPatientService || !patientServiceForm.englishName.trim() || !patientServiceForm.arabicName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setPatientServices(
      patientServices.map((service) =>
        service.id === editingPatientService.id
          ? {
              ...service,
              englishName: patientServiceForm.englishName,
              arabicName: patientServiceForm.arabicName,
              type: patientServiceForm.type,
              image: patientServiceForm.image,
              selectedChannels: patientServiceForm.type === 'Stream' ? patientServiceForm.selectedChannels : undefined,
              selectedApps: patientServiceForm.type === 'Service' ? patientServiceForm.selectedApps : undefined
            }
          : service
      )
    );

    setShowEditPatientServiceModal(false);
    setEditingPatientService(null);
    resetPatientServiceForm();
    toast.success('Patient Service Updated');
  };

  // Handle Shortcut Add
  const handleAddShortcut = () => {
    if (!shortcutForm.englishName.trim() || !shortcutForm.arabicName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newShortcut: ShortcutService = {
      id: Date.now().toString(),
      englishName: shortcutForm.englishName,
      arabicName: shortcutForm.arabicName,
      type: shortcutType,
      icon: shortcutForm.icon,
      typeInput: shortcutForm.typeInput,
      assignedTo: shortcutForm.assignedTo,
      assetId: shortcutForm.selectedAsset && shortcutForm.selectedAsset !== '' ? shortcutForm.selectedAsset : undefined
    };

    console.log('Creating new shortcut:', newShortcut);
    console.log('selectedAsset value:', shortcutForm.selectedAsset);
    setShortcuts([...shortcuts, newShortcut]);
    setShowAddShortcutModal(false);
    resetShortcutForm();
    toast.success('Shortcut Service Added', {
      description: `${newShortcut.englishName} has been added successfully`,
    });
  };

  // Handle Shortcut Edit
  const handleEditShortcut = () => {
    if (!editingShortcut || !shortcutForm.englishName.trim() || !shortcutForm.arabicName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setShortcuts(
      shortcuts.map((shortcut) =>
        shortcut.id === editingShortcut.id
          ? {
              ...shortcut,
              englishName: shortcutForm.englishName,
              arabicName: shortcutForm.arabicName,
              type: shortcutType,
              icon: shortcutForm.icon,
              typeInput: shortcutForm.typeInput,
              assignedTo: shortcutForm.assignedTo,
              assetId: shortcutForm.selectedAsset && shortcutForm.selectedAsset !== '' ? shortcutForm.selectedAsset : undefined
            }
          : shortcut
      )
    );

    setShowEditShortcutModal(false);
    setEditingShortcut(null);
    resetShortcutForm();
    toast.success('Shortcut Service Updated');
  };

  // Handle Channel Add from Patient Service Modal
  const handleAddChannel = () => {
    if (!channelForm.nameEn.trim() || !channelForm.nameAr.trim() || !channelForm.channelUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newChannel: Channel = {
      id: Date.now().toString(),
      imageUrl: channelForm.imageUrl,
      nameEn: channelForm.nameEn,
      nameAr: channelForm.nameAr,
      channelType: channelForm.channelType,
      channelUrl: channelForm.channelUrl,
      createdAt: new Date().toISOString(),
      isActive: channelForm.isActive
    };

    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    localStorage.setItem('channels-data', JSON.stringify(updatedChannels));
    
    // Auto-select the newly added channel
    setPatientServiceForm({
      ...patientServiceForm,
      selectedChannels: [...patientServiceForm.selectedChannels, newChannel.id]
    });

    setShowAddChannelModal(false);
    resetChannelForm();
    toast.success('Channel Added', {
      description: `${newChannel.nameEn} has been added successfully`,
    });
  };

  // Handle Delete
  const handleDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'patient') {
      setPatientServices(patientServices.filter((service) => service.id !== itemToDelete.id));
      toast.success('Patient Service Deleted');
    } else {
      setShortcuts(shortcuts.filter((shortcut) => shortcut.id !== itemToDelete.id));
      toast.success('Shortcut Service Deleted');
    }

    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Reset Forms
  const resetPatientServiceForm = () => {
    setPatientServiceForm({
      englishName: '',
      arabicName: '',
      type: 'Service',
      image: '',
      selectedChannels: [],
      selectedApps: []
    });
    setPreviewImage(null);
  };

  const resetShortcutForm = () => {
    setShortcutForm({
      englishName: '',
      arabicName: '',
      icon: '',
      typeInput: '',
      assignedTo: [],
      selectedAsset: ''
    });
    setShortcutType('URL');
    setPreviewImage(null);
  };

  const resetChannelForm = () => {
    setChannelForm({
      nameEn: '',
      nameAr: '',
      channelType: 'Entertainment',
      channelUrl: '',
      imageUrl: '',
      isActive: true
    });
  };

  // Open Edit Modals
  const openEditPatientService = (service: PatientService) => {
    setEditingPatientService(service);
    setPatientServiceForm({
      englishName: service.englishName,
      arabicName: service.arabicName,
      type: service.type,
      image: service.image,
      selectedChannels: service.selectedChannels || [],
      selectedApps: service.selectedApps || []
    });
    setPreviewImage(service.image);
    setShowEditPatientServiceModal(true);
  };

  const openEditShortcut = (shortcut: ShortcutService) => {
    setEditingShortcut(shortcut);
    setShortcutType(shortcut.type);
    setShortcutForm({
      englishName: shortcut.englishName,
      arabicName: shortcut.arabicName,
      icon: shortcut.icon,
      typeInput: shortcut.typeInput || '',
      assignedTo: shortcut.assignedTo,
      selectedAsset: shortcut.assetId || ''
    });
    setPreviewImage(shortcut.icon);
    setShowEditShortcutModal(true);
  };

  // Handle Channel Selection
  const toggleChannelSelection = (channelId: string) => {
    setPatientServiceForm({
      ...patientServiceForm,
      selectedChannels: patientServiceForm.selectedChannels.includes(channelId)
        ? patientServiceForm.selectedChannels.filter(id => id !== channelId)
        : [...patientServiceForm.selectedChannels, channelId]
    });
  };

  // Handle App Selection
  const toggleAppSelection = (appId: string) => {
    setPatientServiceForm({
      ...patientServiceForm,
      selectedApps: patientServiceForm.selectedApps.includes(appId)
        ? patientServiceForm.selectedApps.filter(id => id !== appId)
        : [...patientServiceForm.selectedApps, appId]
    });
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'icon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        if (activeTab === 'patient-services') {
          setPatientServiceForm({ ...patientServiceForm, image: imageUrl });
        } else {
          setShortcutForm({ ...shortcutForm, icon: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter data
  const filteredPatientServices = patientServices.filter(
    (service) =>
      service.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.arabicName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.arabicName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 pt-8 pb-0">
          <motion.div 
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Services
              </h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Manage patient services and shortcuts
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PillTabs
              tabs={[
                { id: 'patient-services', label: 'Patient Services' },
                { id: 'shortcuts', label: 'Shortcuts' }
              ]}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as 'patient-services' | 'shortcuts')}
            />
          </motion.div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-[#f8f9fb] p-8">
        {activeTab === 'patient-services' ? (
          <>
            {/* Patient Services Tab */}
            {filteredPatientServices.length === 0 && searchQuery === '' ? (
              // Empty State
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <div className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                        <Briefcase size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                        No Patient Services Yet
                      </h3>
                      <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                        Get started by adding your first patient service to get started.
                      </p>
                      <button
                        onClick={() => setShowAddPatientServiceModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                      >
                        <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                          <Plus size={14} strokeWidth={2.5} />
                        </div>
                        Add Patient Service
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Table View
              <>
                {/* Search and Add Button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient services..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddPatientServiceModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#4EBEE3] hover:bg-[#3da5ca] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    <Plus size={18} strokeWidth={2} />
                    Add Service
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Image
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          English Name
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Arabic Name
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatientServices.map((service) => (
                        <tr key={service.id} className="border-b border-gray-200 hover:bg-[#f8f9fb] transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {service.image ? (
                                <img src={service.image} alt={service.englishName} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={20} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <InlineInput
                              value={service.englishName}
                              onChange={(value) => handleInlineEditPatientService(service.id, 'englishName', value)}
                              placeholder="English Name"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <InlineInput
                              value={service.arabicName}
                              onChange={(value) => handleInlineEditPatientService(service.id, 'arabicName', value)}
                              placeholder="Arabic Name"
                              dir="rtl"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <InlineSelect
                              value={service.type}
                              onChange={(value) => handleInlineEditPatientService(service.id, 'type', value)}
                              options={['Stream', 'Service', 'Room Control']}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="group relative inline-flex">
                                <button
                                  onClick={() => openEditPatientService(service)}
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
                                  onClick={() => {
                                    setItemToDelete({ type: 'patient', id: service.id });
                                    setShowDeleteConfirm(true);
                                  }}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Shortcuts Tab */}
            {filteredShortcuts.length === 0 && searchQuery === '' ? (
              // Empty State
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <div className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                        <Briefcase size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                        No Shortcut Services Yet
                      </h3>
                      <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                        Get started by adding your first shortcut service to get started.
                      </p>
                      <button
                        onClick={() => setShowAddShortcutModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                      >
                        <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                          <Plus size={14} strokeWidth={2.5} />
                        </div>
                        Add Service
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Table View
              <>
                {/* Search and Add Button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search shortcut services..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddShortcutModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#4EBEE3] hover:bg-[#3da5ca] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    <Plus size={18} strokeWidth={2} />
                    Add Service
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Icon
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          English Name
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Arabic Name
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-[150px]">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Type Input
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Linked Asset (Debug)
                        </th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShortcuts.map((shortcut) => (
                        <tr key={shortcut.id} className="border-b border-gray-200 hover:bg-[#f8f9fb] transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {shortcut.icon ? (
                                <img src={shortcut.icon} alt={shortcut.englishName} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={20} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <InlineInput
                              value={shortcut.englishName}
                              onChange={(value) => handleInlineEditShortcut(shortcut.id, 'englishName', value)}
                              placeholder="English Name"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <InlineInput
                              value={shortcut.arabicName}
                              onChange={(value) => handleInlineEditShortcut(shortcut.id, 'arabicName', value)}
                              placeholder="Arabic Name"
                              dir="rtl"
                            />
                          </td>
                          <td className="px-6 py-4 w-[150px]">
                            <InlineSelect
                              value={shortcut.type}
                              onChange={(value) => handleInlineEditShortcut(shortcut.id, 'type', value)}
                              options={['URL', 'APK', 'PDF', 'Stream']}
                              width="w-[130px]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            {shortcut.type === 'PDF' ? (
                              <InlineFileInput
                                value={shortcut.typeInput || ''}
                                onChange={(value) => handleInlineEditShortcut(shortcut.id, 'typeInput', value)}
                                placeholder="Upload PDF"
                              />
                            ) : shortcut.type === 'Stream' ? (
                              <InlineInput
                                value={shortcut.typeInput || ''}
                                onChange={(value) => handleInlineEditShortcut(shortcut.id, 'typeInput', value)}
                                placeholder="udp://@224.1.1.1:5000"
                              />
                            ) : (
                              <InlineInput
                                value={shortcut.typeInput || ''}
                                onChange={(value) => handleInlineEditShortcut(shortcut.id, 'typeInput', value)}
                                placeholder={shortcut.type === 'APK' ? 'APK URL' : 'URL'}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[12px] text-gray-600 font-mono">
                              {shortcut.assetId || '(none)'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="group relative inline-flex">
                                <button
                                  onClick={() => openEditShortcut(shortcut)}
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
                                  onClick={() => {
                                    setItemToDelete({ type: 'shortcut', id: shortcut.id });
                                    setShowDeleteConfirm(true);
                                  }}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Patient Service Modal */}
      {(showAddPatientServiceModal || showEditPatientServiceModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                {showEditPatientServiceModal ? 'Edit Patient Service' : 'Add Patient Service'}
              </h2>
              <button
                onClick={() => {
                  showEditPatientServiceModal ? setShowEditPatientServiceModal(false) : setShowAddPatientServiceModal(false);
                  resetPatientServiceForm();
                  setEditingPatientService(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* English Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  English Name *
                </label>
                <input
                  type="text"
                  value={patientServiceForm.englishName}
                  onChange={(e) => setPatientServiceForm({ ...patientServiceForm, englishName: e.target.value })}
                  placeholder="Enter service name in English"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Arabic Name *
                </label>
                <input
                  type="text"
                  value={patientServiceForm.arabicName}
                  onChange={(e) => setPatientServiceForm({ ...patientServiceForm, arabicName: e.target.value })}
                  placeholder="أدخل اسم الخدمة بالعربية"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Type *
                </label>
                <select
                  value={patientServiceForm.type}
                  onChange={(e) => setPatientServiceForm({ ...patientServiceForm, type: e.target.value as 'Stream' | 'Service' | 'Room Control' })}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none cursor-pointer bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="Service">Service</option>
                  <option value="Stream">Stream</option>
                  <option value="Room Control">Room Control</option>
                </select>
              </div>

              {/* Channels Selection (only for Stream type) */}
              {patientServiceForm.type === 'Stream' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Select Channels
                    </label>
                    <button
                      onClick={() => setShowAddChannelModal(true)}
                      className="text-[13px] text-[#4EBEE3] hover:text-[#3da5ca] font-medium font-['Poppins',sans-serif] flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add New Channel
                    </button>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                    {channels.length === 0 ? (
                      <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif] text-center py-4">
                        No channels available. Add a new channel to get started.
                      </p>
                    ) : (
                      channels.map((channel) => (
                        <label
                          key={channel.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={patientServiceForm.selectedChannels.includes(channel.id)}
                            onChange={() => toggleChannelSelection(channel.id)}
                            className="w-4 h-4 text-[#4EBEE3] border-gray-300 rounded focus:ring-[#4EBEE3]"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {channel.imageUrl ? (
                                <img src={channel.imageUrl} alt={channel.nameEn} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                                {channel.nameEn}
                              </div>
                              <div className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                                {channel.nameAr} • {channel.channelType}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Applications Selection (only for Service type) */}
              {patientServiceForm.type === 'Service' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Select Applications
                    </label>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                    {applications.filter(app => app.assignedCategories?.includes('Patient Services')).length === 0 ? (
                      <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif] text-center py-4">
                        No content available. Assign content to "Patient Services" section in Content Library.
                      </p>
                    ) : (
                      applications.filter(app => app.assignedCategories?.includes('Patient Services')).map((app) => (
                        <label
                          key={app.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={patientServiceForm.selectedApps.includes(app.id)}
                            onChange={() => toggleAppSelection(app.id)}
                            className="w-4 h-4 text-[#4EBEE3] border-gray-300 rounded focus:ring-[#4EBEE3]"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {app.icon ? (
                                <img src={app.icon} alt={app.nameEn || app.englishName} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                                {app.nameEn || app.englishName}
                              </div>
                              <div className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                                {app.nameAr || app.arabicName} • {app.type}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Service Image
                </label>
                <div className="flex items-center gap-4">
                  {previewImage && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-[#4EBEE3] rounded-lg cursor-pointer transition-colors">
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  showEditPatientServiceModal ? setShowEditPatientServiceModal(false) : setShowAddPatientServiceModal(false);
                  resetPatientServiceForm();
                  setEditingPatientService(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={showEditPatientServiceModal ? handleEditPatientService : handleAddPatientService}
                className="px-6 py-2.5 bg-[#4EBEE3] hover:bg-[#3da5ca] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                {showEditPatientServiceModal ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Channel Modal (opened from Patient Service Modal) */}
      {showAddChannelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Add New Channel
              </h2>
              <button
                onClick={() => {
                  setShowAddChannelModal(false);
                  resetChannelForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* English Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  English Name *
                </label>
                <input
                  type="text"
                  value={channelForm.nameEn}
                  onChange={(e) => setChannelForm({ ...channelForm, nameEn: e.target.value })}
                  placeholder="Enter channel name in English"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Arabic Name *
                </label>
                <input
                  type="text"
                  value={channelForm.nameAr}
                  onChange={(e) => setChannelForm({ ...channelForm, nameAr: e.target.value })}
                  placeholder="أدخل اسم القناة بالعربية"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Channel Type */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Channel Type *
                </label>
                <select
                  value={channelForm.channelType}
                  onChange={(e) => setChannelForm({ ...channelForm, channelType: e.target.value })}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none cursor-pointer bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Kids">Kids</option>
                  <option value="Religious">Religious</option>
                  <option value="Music">Music</option>
                  <option value="News">News</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              {/* Channel URL */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Channel URL *
                </label>
                <input
                  type="url"
                  value={channelForm.channelUrl}
                  onChange={(e) => setChannelForm({ ...channelForm, channelUrl: e.target.value })}
                  placeholder="https://example.com/channel"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Channel Image */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Channel Image
                </label>
                <input
                  type="url"
                  value={channelForm.imageUrl}
                  onChange={(e) => setChannelForm({ ...channelForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddChannelModal(false);
                  resetChannelForm();
                }}
                className="px-6 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChannel}
                className="px-6 py-2.5 bg-[#4EBEE3] hover:bg-[#3da5ca] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Shortcut Modal - Continues in next part due to length */}
      {(showAddShortcutModal || showEditShortcutModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                {showEditShortcutModal ? 'Edit Shortcut Service' : 'Add Shortcut Service'}
              </h2>
              <button
                onClick={() => {
                  showEditShortcutModal ? setShowEditShortcutModal(false) : setShowAddShortcutModal(false);
                  resetShortcutForm();
                  setEditingShortcut(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-3">
                  Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShortcutType('URL')}
                    className={`p-4 border-2 rounded-lg transition-all font-['Poppins',sans-serif] text-[14px] font-medium ${
                      shortcutType === 'URL'
                        ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 text-[#4EBEE3]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    onClick={() => setShortcutType('APK')}
                    className={`p-4 border-2 rounded-lg transition-all font-['Poppins',sans-serif] text-[14px] font-medium ${
                      shortcutType === 'APK'
                        ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 text-[#4EBEE3]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    APK
                  </button>
                  <button
                    onClick={() => setShortcutType('PDF')}
                    className={`p-4 border-2 rounded-lg transition-all font-['Poppins',sans-serif] text-[14px] font-medium ${
                      shortcutType === 'PDF'
                        ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 text-[#4EBEE3]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* English Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  English Name *
                </label>
                <input
                  type="text"
                  value={shortcutForm.englishName}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, englishName: e.target.value })}
                  placeholder="Enter service name in English"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Arabic Name *
                </label>
                <input
                  type="text"
                  value={shortcutForm.arabicName}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, arabicName: e.target.value })}
                  placeholder="أدخل اسم الخدمة بالعربية"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* Type-specific fields */}
              {shortcutType === 'URL' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={shortcutForm.typeInput}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, typeInput: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>
              )}

              {shortcutType === 'APK' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    APK URL *
                  </label>
                  <input
                    type="text"
                    value={shortcutForm.typeInput}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, typeInput: e.target.value })}
                    placeholder="APK URL"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>
              )}

              {shortcutType === 'PDF' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    PDF File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setShortcutForm({ ...shortcutForm, typeInput: file.name });
                        }
                      }}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors cursor-pointer flex items-center gap-2 hover:border-[#4EBEE3]"
                    >
                      <Upload size={16} className="text-[#4EBEE3]" />
                      {shortcutForm.typeInput || 'Upload PDF'}
                    </label>
                  </div>
                </div>
              )}

              {shortcutType === 'Stream' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Stream URL *
                  </label>
                  <input
                    type="text"
                    value={shortcutForm.typeInput}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, typeInput: e.target.value })}
                    placeholder="udp://@224.1.1.1:5000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>
              )}

              {/* Content Library Asset Selection */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Link to Content Library Asset (Optional)
                </label>
                <select
                  value={shortcutForm.selectedAsset}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, selectedAsset: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                >
                  <option value="">-- None --</option>
                  {applications
                    .filter(app => {
                      // Filter by matching type
                      if (shortcutType === 'URL' && app.type === 'URL') return true;
                      if (shortcutType === 'APK' && app.type === 'APK') return true;
                      if (shortcutType === 'PDF' && app.type === 'PDF') return true;
                      if (shortcutType === 'Stream' && app.type === 'Stream') return true;
                      return false;
                    })
                    .map(app => (
                      <option key={app.id} value={app.id}>
                        {app.englishName}
                      </option>
                    ))}
                </select>
                <p className="text-[12px] text-gray-500 mt-1 font-['Poppins',sans-serif]">
                  Link this shortcut to an asset from the Content Library for tracking
                </p>
              </div>

              {/* Icon Upload */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Service Icon
                </label>
                <div className="flex items-center gap-4">
                  {previewImage && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-[#4EBEE3] rounded-lg cursor-pointer transition-colors">
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Upload Icon
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'icon')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  showEditShortcutModal ? setShowEditShortcutModal(false) : setShowAddShortcutModal(false);
                  resetShortcutForm();
                  setEditingShortcut(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={showEditShortcutModal ? handleEditShortcut : handleAddShortcut}
                className="px-6 py-2.5 bg-[#4EBEE3] hover:bg-[#3da5ca] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                {showEditShortcutModal ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Delete Service?
              </h3>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif] mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
