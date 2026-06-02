import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Stethoscope, Upload, Check, ChevronDown, Globe, Tv, Package, Eye, FileText, Link, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import TablePagination from './TablePagination';
import TableSortIcon from './TableSortIcon';
import { SingleSelectDropdown } from './UnifiedDropdown';
import InlineEditCell from './InlineEditCell';
import InlineImageUpload from './InlineImageUpload';
import SetVisibilityModal, { Terminal } from './SetVisibilityModal';

type SortField = 'nameEn' | 'nameAr' | 'type' | 'visibility';
type SortDirection = 'asc' | 'desc';

interface Service {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'Asset' | 'Stream';
  icon: string;
  iconFileName?: string;
  visibility: {
    kids: boolean;
    adults: boolean;
    vip: boolean;
  };
  visibleTerminals?: string[]; // Array of terminal IDs
  contentItems?: string[];
  channelIds?: string[];
}

interface ContentLibraryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'PDF' | 'URL' | 'APK';
  icon: string;
  iconFileName?: string;
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
  visibility: {
    kids: boolean;
    adults: boolean;
    vip: boolean;
  };
}

export default function PatientServicesPageWithCategories() {
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('patient-services');
    return saved ? JSON.parse(saved) : [];
  });

  const [contentLibraryItems, setContentLibraryItems] = useState<ContentLibraryItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [engagementHubItems, setEngagementHubItems] = useState<any>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Asset' | 'Stream'>('all');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    type: 'Asset' as 'Asset' | 'Stream',
    icon: '',
    iconFileName: '',
    visibility: {
      kids: false,
      adults: false,
      vip: false,
    },
  });
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [selectionSearchQuery, setSelectionSearchQuery] = useState('');
  const [tempSelectedItems, setTempSelectedItems] = useState<string[]>([]);

  // State for new service visibility (in Add Modal)
  const [newServiceVisibleTerminals, setNewServiceVisibleTerminals] = useState<string[]>([]);
  const [showAddModalVisibility, setShowAddModalVisibility] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortField, setSortField] = useState<SortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Visibility modal state
  const [visibilityModalServiceId, setVisibilityModalServiceId] = useState<string | null>(null);

  // Generate mock terminals - matching CareInn15 structure
  const generateMockTerminals = (): Terminal[] => {
    const rooms = ['101', '102', '103', '201', '202', '203', '301', '302', '303', '401'];
    const buildings = ['Building A', 'Building B', 'Building C'];
    const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
    const pocs = ['POC 1', 'POC 2', 'POC 3'];
    const groups = ['Kids', 'Adults', 'VIP'];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: `terminal-${i}`,
      deviceId: `CareInn15-${String(i + 1).padStart(3, '0')}`,
      mrn: `MRN-${String(i + 1).padStart(5, '0')}`,
      roomNo: rooms[i % rooms.length],
      bedNo: String((i % 4) + 1),
      building: buildings[i % buildings.length],
      floor: floors[i % floors.length],
      poc: pocs[i % pocs.length],
      group: groups[i % groups.length],
      isConnected: i < 28, // 28 connected, 2 disconnected
    }));
  };

  const mockTerminals = generateMockTerminals();

  useEffect(() => {
    const loadContentLibrary = () => {
      const saved = localStorage.getItem('content-library-assets');
      if (saved) {
        setContentLibraryItems(JSON.parse(saved));
      }
    };

    const loadChannels = () => {
      const saved = localStorage.getItem('careinn_channels');
      if (saved) {
        setChannels(JSON.parse(saved));
      }
    };

    const loadEngagementHubItems = () => {
      const saved = localStorage.getItem('engagement-hub-items');
      if (saved) {
        setEngagementHubItems(JSON.parse(saved));
      }
    };

    loadContentLibrary();
    loadChannels();
    loadEngagementHubItems();

    const handleStorageChange = () => {
      loadContentLibrary();
      loadChannels();
      loadEngagementHubItems();
    };
    
    const handleEngagementHubUpdate = () => {
      loadEngagementHubItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('engagement-hub-updated', handleEngagementHubUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('engagement-hub-updated', handleEngagementHubUpdate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('patient-services', JSON.stringify(services));
  }, [services]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedServices = [...services].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'visibility') {
      aValue = Object.values(a.visibility).filter(Boolean).length;
      bValue = Object.values(b.visibility).filter(Boolean).length;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredServices = sortedServices.filter(service => {
    const matchesSearch = service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.nameAr.includes(searchQuery);
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(new Set(paginatedServices.map(s => s.id)));
    } else {
      setSelectedServices(new Set());
    }
  };

  const handleSelectService = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedServices);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedServices(newSelected);
  };

  const handleBulkDelete = () => {
    setServices(services.filter(s => !selectedServices.has(s.id)));
    setSelectedServices(new Set());
    setShowDeleteConfirm(false);
    toast.success('Selected services deleted successfully');
  };

  const openAddModal = () => {
    setFormData({
      nameEn: '',
      nameAr: '',
      type: 'Asset',
      icon: '',
      iconFileName: '',
      visibility: {
        kids: false,
        adults: false,
        vip: false,
      },
    });
    setNewServiceVisibleTerminals([]); // Reset visibility terminals
    setShowAddModal(true);
  };

  const handleVisibilityToggle = (group: 'kids' | 'adults' | 'vip') => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [group]: !prev.visibility[group],
      },
    }));
  };

  const handleSelectAllVisibility = () => {
    const allSelected = formData.visibility.kids && formData.visibility.adults && formData.visibility.vip;
    setFormData(prev => ({
      ...prev,
      visibility: {
        kids: !allSelected,
        adults: !allSelected,
        vip: !allSelected,
      },
    }));
  };

  const handleSaveService = () => {
    if (!formData.nameEn || !formData.nameAr) {
      toast.error('Please enter both English and Arabic names');
      return;
    }
    if (!formData.icon) {
      toast.error('Please upload a service icon');
      return;
    }
    if (newServiceVisibleTerminals.length === 0) {
      toast.error('Please set visibility for at least one terminal');
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      type: formData.type,
      icon: formData.icon,
      iconFileName: formData.iconFileName,
      visibility: formData.visibility,
      visibleTerminals: newServiceVisibleTerminals, // Use the new visibility terminals
      contentItems: formData.type === 'Asset' ? [] : undefined,
      channelIds: formData.type === 'Stream' ? [] : undefined,
    };

    setServices([...services, newService]);
    setShowAddModal(false);
    setNewServiceVisibleTerminals([]); // Reset after saving
    toast.success('Service added successfully', {
      description: `${formData.nameEn} has been added. Click on the Type badge to select ${formData.type === 'Asset' ? 'content' : 'channels'}.`,
    });
  };

  const handleDelete = (id: string) => {
    const service = services.find(s => s.id === id);
    setServices(services.filter(s => s.id !== id));
    toast.success('Service deleted', {
      description: `${service?.nameEn} has been removed`,
    });
  };

  const handleTypeClick = (service: Service) => {
    setCurrentService(service);
    if (service.type === 'Asset') {
      setTempSelectedItems(service.contentItems || []);
    } else {
      setTempSelectedItems(service.channelIds || []);
    }
    setShowSelectionModal(true);
    setSelectionSearchQuery('');
  };

  const handleToggleItem = (id: string) => {
    setTempSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaveSelection = () => {
    if (!currentService) return;

    setServices(services.map(s => {
      if (s.id === currentService.id) {
        if (s.type === 'Asset') {
          return { ...s, contentItems: tempSelectedItems };
        } else {
          return { ...s, channelIds: tempSelectedItems };
        }
      }
      return s;
    }));

    setShowSelectionModal(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('patient-services-updated'));
    
    toast.success('Selection saved', {
      description: `${tempSelectedItems.length} ${currentService.type === 'Asset' ? 'asset(s)' : 'channel(s)'} selected`,
    });
  };

  const getVisibilityDisplay = (visibility: Service['visibility']) => {
    const groups = [];
    if (visibility.kids) groups.push('Kids');
    if (visibility.adults) groups.push('Adults');
    if (visibility.vip) groups.push('VIP');
    return groups.length > 0 ? groups.join(', ') : 'None';
  };

  const handleUpdateService = (id: string, field: keyof Service, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Save visibility settings for a service
  const handleSaveServiceVisibility = (selectedTerminals: string[]) => {
    if (!visibilityModalServiceId) return;
    
    setServices(services.map(s =>
      s.id === visibilityModalServiceId ? { ...s, visibleTerminals: selectedTerminals } : s
    ));
    
    setVisibilityModalServiceId(null);
  };

  const filteredContentItems = contentLibraryItems.filter(item =>
    item.nameEn.toLowerCase().includes(selectionSearchQuery.toLowerCase()) ||
    item.nameAr.includes(selectionSearchQuery)
  );

  const filteredChannels = channels.filter(channel =>
    channel.nameEn.toLowerCase().includes(selectionSearchQuery.toLowerCase()) ||
    channel.nameAr.includes(selectionSearchQuery)
  );

  // Helper function to get type icon
  const getTypeIcon = (type: 'PDF' | 'URL' | 'APK') => {
    switch (type) {
      case 'PDF':
        return <FileText size={14} className="text-red-500" />;
      case 'URL':
        return <Link size={14} className="text-blue-500" />;
      case 'APK':
        return <Smartphone size={14} className="text-green-600" />;
    }
  };

  // Helper function to get channel type colors
  const getChannelTypeColors = (channelType: string) => {
    const type = channelType.toLowerCase();
    
    if (type.includes('stream')) {
      return { bg: 'bg-[#E0F7FA]', text: 'text-[#00ACC1]' }; // Cyan
    } else if (type.includes('kids') || type.includes('kid')) {
      return { bg: 'bg-[#FCE4EC]', text: 'text-[#EC4899]' }; // Pink
    } else if (type.includes('entertainment')) {
      return { bg: 'bg-[#F3E5F5]', text: 'text-[#A855F7]' }; // Purple
    } else if (type.includes('music')) {
      return { bg: 'bg-[#FFF3E0]', text: 'text-[#F97316]' }; // Orange
    } else if (type.includes('religious') || type.includes('religion')) {
      return { bg: 'bg-[#E8F5E9]', text: 'text-[#10B981]' }; // Green
    } else {
      // Default purple for other types
      return { bg: 'bg-[#F3E5F5]', text: 'text-[#A855F7]' };
    }
  };

  // Check if asset is already in Engagement Hub
  const isAssetInEngagementHub = (assetId: string): boolean => {
    return Object.values(engagementHubItems).some((items: any) =>
      Array.isArray(items) && items.some((item: any) => item.assetId === assetId)
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Patient Services
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage patient services, streams, and content offerings
            </p>
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Services Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start adding patient services to your system to get started.
                </p>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Plus size={16} strokeWidth={2} />
                  Add Service
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
                  />
                </div>
                <div className="w-48">
                  <SingleSelectDropdown
                    value={typeFilter}
                    onChange={(value) => setTypeFilter(value as 'all' | 'Asset' | 'Stream')}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'Asset', label: 'Asset' },
                      { value: 'Stream', label: 'Stream' },
                    ]}
                    placeholder="Filter by type"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedServices.size > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-['Poppins',sans-serif]"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedServices.size})
                  </button>
                )}
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3da8cc] transition-colors flex items-center gap-2 text-sm font-['Poppins',sans-serif]"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={paginatedServices.length > 0 && paginatedServices.every(s => selectedServices.has(s.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-400 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] cursor-pointer"
                        style={{ accentColor: '#4EBEE3' }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] w-16">
                      Icon
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('nameEn')}
                    >
                      <div className="flex items-center gap-2">
                        Name (EN)
                        <TableSortIcon field="nameEn" currentField={sortField} direction={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('nameAr')}
                    >
                      <div className="flex items-center gap-2">
                        Name (AR)
                        <TableSortIcon field="nameAr" currentField={sortField} direction={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('visibility')}
                    >
                      <div className="flex items-center gap-2">
                        Visibility
                        <TableSortIcon field="visibility" currentField={sortField} direction={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        Type
                        <TableSortIcon field="type" currentField={sortField} direction={sortDirection} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 font-['Poppins',sans-serif] w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedServices.has(service.id)}
                          onChange={(e) => handleSelectService(service.id, e.target.checked)}
                          className="w-4 h-4 rounded border-2 border-gray-400 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] cursor-pointer"
                          style={{ accentColor: '#4EBEE3' }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineImageUpload
                          imageUrl={service.icon}
                          onImageChange={(imageUrl) => {
                            handleUpdateService(service.id, 'icon', imageUrl);
                            toast.success('Icon updated successfully');
                          }}
                          altText={service.nameEn}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineEditCell
                          value={service.nameEn}
                          onSave={(value) => handleUpdateService(service.id, 'nameEn', value)}
                          className="text-sm text-[#0f1729] font-['Poppins',sans-serif]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineEditCell
                          value={service.nameAr}
                          onSave={(value) => handleUpdateService(service.id, 'nameAr', value)}
                          className="text-sm text-[#0f1729] font-['Baloo Bhaijaan 2',sans-serif]"
                          dir="rtl"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setVisibilityModalServiceId(service.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all font-['Poppins',sans-serif] text-[13px] font-medium"
                        >
                          Set ({service.visibleTerminals?.length || 0})
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTypeClick(service)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border-2 text-[13px] font-medium font-['Poppins',sans-serif] transition-all hover:shadow-md w-[130px] ${
                            service.type === 'Stream' 
                              ? 'text-purple-700 border-purple-700 hover:bg-purple-700/5' 
                              : 'text-blue-700 border-blue-700 hover:bg-blue-700/5'
                          }`}
                        >
                          {service.type === 'Stream' ? <Tv className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          {service.type}
                          <span className="text-[11px] opacity-70">
                            ({service.type === 'Stream' ? service.channelIds?.length || 0 : service.contentItems?.length || 0})
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredServices.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-['Poppins',sans-serif] text-[#0f1729]">
                Add New Service
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Name (EN) 
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Enter service name in English"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Name (AR) 
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="أدخل اسم الخدمة بالعربية"
                    dir="rtl"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-['Baloo Bhaijaan 2',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Service Type 
                  </label>
                  <SingleSelectDropdown
                    value={formData.type}
                    onChange={(value) => setFormData({ ...formData, type: value as 'Asset' | 'Stream' })}
                    options={[
                      { value: 'Asset', label: 'Asset' },
                      { value: 'Stream', label: 'Stream' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Visibility 
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddModalVisibility(true)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 transition-all font-['Poppins',sans-serif] text-[14px] font-medium bg-[rgba(78,190,227,0)]"
                  >
                    <Eye size={18} strokeWidth={2} className="mr-2" />
                    Set Visibility ({newServiceVisibleTerminals.length})
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Icon 
                  </label>
                  <InlineImageUpload
                    value={formData.icon}
                    onChange={(value) => setFormData({ ...formData, icon: value })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="px-6 py-2 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3da8cc] transition-colors text-sm font-['Poppins',sans-serif]"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Modal */}
      {showSelectionModal && currentService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-['Poppins',sans-serif] text-[#0f1729]">
                {currentService.type === 'Stream' ? 'Select Channels' : 'Select Assets'}
              </h2>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${currentService.type === 'Stream' ? 'channels' : 'assets'}...`}
                  value={selectionSearchQuery}
                  onChange={(e) => setSelectionSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
                />
              </div>
              {currentService.type === 'Asset' && (
                <button
                  onClick={() => {
                    toast.info('Navigate to Content Library page to add new assets');
                  }}
                  className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3da8cc] transition-colors flex items-center gap-2 text-sm font-['Poppins',sans-serif]"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              )}
              {currentService.type === 'Stream' && (
                <button
                  onClick={() => {
                    toast.info('Navigate to Channels page to add new channels');
                  }}
                  className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3da8cc] transition-colors flex items-center gap-2 text-sm font-['Poppins',sans-serif]"
                >
                  <Plus className="w-4 h-4" />
                  Add Channel
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {currentService.type === 'Stream' ? (
                <div className="px-6 py-4 space-y-2">
                  {filteredChannels.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm font-['Poppins',sans-serif]">
                      No channels found
                    </div>
                  ) : (
                    filteredChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleToggleItem(channel.id)}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={tempSelectedItems.includes(channel.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleItem(channel.id);
                          }}
                          className="w-4 h-4 rounded border-2 border-gray-400 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] cursor-pointer flex-shrink-0"
                          style={{ accentColor: '#4EBEE3' }}
                        />

                        {/* Channel Image */}
                        <img src={channel.imageUrl} alt={channel.nameEn} className="w-12 h-12 rounded object-cover flex-shrink-0" />

                        {/* Name and Arabic Name */}
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-[15px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                            {channel.nameEn}
                          </span>
                          <span className="text-gray-400 text-[14px]">•</span>
                          <span className="text-[14px] text-gray-500 font-['Baloo Bhaijaan 2',sans-serif]" dir="rtl">
                            {channel.nameAr}
                          </span>
                        </div>

                        {/* Channel Type Badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getChannelTypeColors(channel.channelType).bg}`}>
                          <span className={`text-[13px] font-['Poppins',sans-serif] ${getChannelTypeColors(channel.channelType).text}`}>
                            {channel.channelType}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="px-6 py-4 space-y-2">
                  {filteredContentItems.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm font-['Poppins',sans-serif]">
                      No assets found
                    </div>
                  ) : (
                    filteredContentItems.map((item) => {
                      const isInEngagementHub = isAssetInEngagementHub(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            isInEngagementHub 
                              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                              : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                          }`}
                          onClick={() => !isInEngagementHub && handleToggleItem(item.id)}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={tempSelectedItems.includes(item.id)}
                            disabled={isInEngagementHub}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (!isInEngagementHub) {
                                handleToggleItem(item.id);
                              }
                            }}
                            className="w-4 h-4 rounded border-2 border-gray-400 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ accentColor: '#4EBEE3' }}
                          />

                          {/* Icon */}
                          <img src={item.icon} alt={item.nameEn} className="w-12 h-12 rounded object-cover flex-shrink-0" />

                          {/* Name and Type */}
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-[15px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                              {item.nameEn}
                            </span>
                            <span className="text-gray-400 text-[14px]">•</span>
                            <span className="text-[14px] text-gray-500 font-['Baloo Bhaijaan 2',sans-serif]" dir="rtl">
                              {item.nameAr}
                            </span>
                          </div>

                          {/* Type Icon and Label */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-50">
                            {getTypeIcon(item.type)}
                            <span className="text-[13px] font-['Poppins',sans-serif] text-gray-700">
                              {item.type}
                            </span>
                          </div>

                          {/* "Already in Engagement Hub" Badge */}
                          {isInEngagementHub && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100">
                              <span className="text-[11px] font-['Poppins',sans-serif] text-orange-700 font-medium">
                                In Engagement Hub
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                {tempSelectedItems.length} item(s) selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSelectionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-['Poppins',sans-serif]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSelection}
                  className="px-6 py-2 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3da8cc] transition-colors text-sm font-['Poppins',sans-serif]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-['Poppins',sans-serif] text-[#0f1729] mb-2">
              Delete Selected Services?
            </h3>
            <p className="text-sm text-gray-600 mb-6 font-['Poppins',sans-serif]">
              Are you sure you want to delete {selectedServices.size} selected service(s)? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-['Poppins',sans-serif]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Modal */}
      {visibilityModalServiceId && (() => {
        const service = services.find(s => s.id === visibilityModalServiceId);
        if (!service) return null;
        
        return (
          <SetVisibilityModal
            isOpen={true}
            onClose={() => setVisibilityModalServiceId(null)}
            title={`Set Visibility for ${service.nameEn}`}
            terminals={mockTerminals}
            currentSelection={service.visibleTerminals || []}
            onSave={handleSaveServiceVisibility}
            successMessage="Service visibility updated"
          />
        );
      })()}

      {/* Add Modal Visibility */}
      {showAddModalVisibility && (
        <SetVisibilityModal
          isOpen={true}
          onClose={() => setShowAddModalVisibility(false)}
          title="Set Service Visibility"
          terminals={mockTerminals}
          currentSelection={newServiceVisibleTerminals}
          onSave={(selectedTerminals) => {
            setNewServiceVisibleTerminals(selectedTerminals);
            setShowAddModalVisibility(false);
          }}
          successMessage="Visibility settings updated"
        />
      )}
    </div>
  );
}