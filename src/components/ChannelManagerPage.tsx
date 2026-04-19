import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, X, Upload, Tv, Info, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';
import InlineInput from './InlineInput';
import InlineImageUpload from './InlineImageUpload';
import InlineSelect from './InlineSelect';
import TablePagination from './TablePagination';
import { UnifiedVisibilityModal } from './UnifiedVisibilityModal';

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

interface Terminal {
  id: string;
  deviceId: string;
  mrn: string;
  roomNo: string;
  bedNo: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  isConnected: boolean;
}

const mockTerminals: Terminal[] = [
  { id: '1', deviceId: 'TRM-2401', mrn: 'MRN-78945', roomNo: '301', bedNo: 'A', building: 'Main Tower', floor: '3rd Floor', poc: 'Dr. Sarah Ahmed', group: 'Kids', isConnected: true },
  { id: '2', deviceId: 'TRM-2402', mrn: 'MRN-78946', roomNo: '302', bedNo: 'B', building: 'Main Tower', floor: '3rd Floor', poc: 'Dr. Sarah Ahmed', group: 'Kids', isConnected: true },
  { id: '3', deviceId: 'TRM-2403', mrn: 'MRN-78947', roomNo: '401', bedNo: 'A', building: 'West Wing', floor: '4th Floor', poc: 'Dr. Michael Chen', group: 'Adults', isConnected: false },
  { id: '4', deviceId: 'TRM-2404', mrn: 'MRN-78948', roomNo: '402', bedNo: 'B', building: 'West Wing', floor: '4th Floor', poc: 'Dr. Michael Chen', group: 'Adults', isConnected: true },
  { id: '5', deviceId: 'TRM-2405', mrn: 'MRN-78949', roomNo: '201', bedNo: 'C', building: 'East Wing', floor: '2nd Floor', poc: 'Dr. Emily Roberts', group: 'VIP', isConnected: true },
  { id: '6', deviceId: 'TRM-2406', mrn: 'MRN-78950', roomNo: '202', bedNo: 'D', building: 'East Wing', floor: '2nd Floor', poc: 'Dr. Emily Roberts', group: 'VIP', isConnected: true },
  { id: '7', deviceId: 'TRM-2407', mrn: 'MRN-78951', roomNo: '501', bedNo: 'A', building: 'Main Tower', floor: '5th Floor', poc: 'Dr. James Wilson', group: 'Kids', isConnected: false },
  { id: '8', deviceId: 'TRM-2408', mrn: 'MRN-78952', roomNo: '502', bedNo: 'B', building: 'Main Tower', floor: '5th Floor', poc: 'Dr. James Wilson', group: 'Kids', isConnected: true },
];

type SortField = 'nameEn' | 'nameAr' | 'channelType';
type SortDirection = 'asc' | 'desc';

const defaultChannels: Channel[] = [
  // Entertainment
  {
    id: '1',
    imageUrl: '',
    nameEn: 'MBC1',
    nameAr: 'MBC1',
    channelType: 'Entertainment',
    channelUrl: 'https://mbc1.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  {
    id: '2',
    imageUrl: '',
    nameEn: 'Rotana',
    nameAr: 'روتانا',
    channelType: 'Entertainment',
    channelUrl: 'https://rotana.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  {
    id: '3',
    imageUrl: '',
    nameEn: 'SBC',
    nameAr: 'SBC',
    channelType: 'Entertainment',
    channelUrl: 'https://sbc.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  // Kids
  {
    id: '4',
    imageUrl: '',
    nameEn: 'MBC3',
    nameAr: 'MBC3',
    channelType: 'Kids',
    channelUrl: 'https://mbc3.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  {
    id: '5',
    imageUrl: '',
    nameEn: 'SpaceToon',
    nameAr: 'سبيستون',
    channelType: 'Kids',
    channelUrl: 'https://spacetoon.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  {
    id: '6',
    imageUrl: '',
    nameEn: 'Cartoon Network Arabic',
    nameAr: 'كرتون نتورك بالعربية',
    channelType: 'Kids',
    channelUrl: 'https://cartoonnetwork.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  // Religious
  {
    id: '7',
    imageUrl: '',
    nameEn: 'Saudi Quran',
    nameAr: 'قناة القرآن الكريم',
    channelType: 'Religious',
    channelUrl: 'https://quran.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  {
    id: '8',
    imageUrl: '',
    nameEn: 'Sunnah Channel',
    nameAr: 'قناة السنة',
    channelType: 'Religious',
    channelUrl: 'https://sunnah.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  // Music
  {
    id: '9',
    imageUrl: '',
    nameEn: 'Rotana Music',
    nameAr: 'روتانا موسيقى',
    channelType: 'Music',
    channelUrl: 'https://rotanamusic.example.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: true,
      adults: true,
      vip: true,
    },
  },
  // Stream
  {
    id: '10',
    imageUrl: '',
    nameEn: 'Baby Camera',
    nameAr: 'كاميرا الطفل',
    channelType: 'Stream',
    channelUrl: 'rtsp://admin:password@192.168.1.100:554/stream1',
    createdAt: new Date().toISOString(),
    isActive: true,
    visibility: {
      kids: false,
      adults: true,
      vip: false,
    },
  },
];

export default function ChannelManagerPage() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_channels');
      if (saved) {
        try {
          const loadedChannels = JSON.parse(saved);
          // Migrate old channels to include visibility property and merge with new defaults
          const migratedChannels = loadedChannels.map((channel: any) => ({
            ...channel,
            visibility: channel.visibility || {
              kids: true,
              adults: true,
              vip: true,
            },
          }));
          
          // Merge with defaults to ensure new channels are added
          const mergedChannels = [...migratedChannels];
          defaultChannels.forEach(defaultChannel => {
            const exists = migratedChannels.find((c: Channel) => c.id === defaultChannel.id);
            if (!exists) {
              mergedChannels.push(defaultChannel);
            }
          });
          
          return mergedChannels;
        } catch (e) {
          return defaultChannels;
        }
      }
    }
    return defaultChannels;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterChannelType, setFilterChannelType] = useState<string>('All');
  const [visibilityModalChannelId, setVisibilityModalChannelId] = useState<string | null>(null);

  // Form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [channelType, setChannelType] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [visibilityTerminals, setVisibilityTerminals] = useState<string[]>([]);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  // Load channel types dynamically from ChannelTypePage
  const [channelTypes, setChannelTypes] = useState<string[]>([]);

  // Get color for channel type
  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'Entertainment': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      'Kids': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
      'Religious': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      'Music': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      'News': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      'Sports': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'Documentary': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
      'Movies': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      'Series': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
      'Educational': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
      'Stream': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    };
    
    // Return color or default gray for unknown types
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  // Load channel types from localStorage
  useEffect(() => {
    const loadChannelTypes = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('careinn_channel_types');
        if (saved) {
          try {
            const types = JSON.parse(saved);
            setChannelTypes(types.map((t: any) => t.nameEn));
          } catch (e) {
            setChannelTypes(['Entertainment', 'Kids', 'Religious', 'Music', 'News', 'Sports']);
          }
        } else {
          setChannelTypes(['Entertainment', 'Kids', 'Religious', 'Music', 'News', 'Sports']);
        }
      }
    };

    loadChannelTypes();

    // Listen for storage changes to update channel types dynamically
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'careinn_channel_types') {
        loadChannelTypes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus events to reload when switching tabs
    const handleFocus = () => {
      loadChannelTypes();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_channels', JSON.stringify(channels));
    }
  }, [channels]);

  const resetForm = () => {
    setNameEn('');
    setNameAr('');
    setChannelType('');
    setChannelUrl('');
    setImage(null);
    setImageUrl('');
    setVisibilityTerminals([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageUrl('');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl('');
  };

  const handleAddChannel = () => {
    if (!nameEn.trim()) {
      toast.error('English Name Required', {
        description: 'Please enter a channel name in English',
        duration: 2000,
      });
      return;
    }

    if (!channelType) {
      toast.error('Channel Type Required', {
        description: 'Please select a channel type',
        duration: 2000,
      });
      return;
    }

    const newChannel: Channel = {
      id: Date.now().toString(),
      imageUrl,
      nameEn,
      nameAr,
      channelType,
      channelUrl,
      createdAt: new Date().toISOString(),
      isActive: true,
      visibility: {
        kids: visibilityTerminals.includes('Kids'),
        adults: visibilityTerminals.includes('Adults'),
        vip: visibilityTerminals.includes('VIP'),
      },
    };

    setChannels([...channels, newChannel]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Channel Added', {
      description: 'Channel added successfully',
      duration: 2000,
    });
  };

  const handleEditChannel = () => {
    if (!editingChannel) return;

    if (!nameEn.trim()) {
      toast.error('English Name Required', {
        description: 'Please enter a channel name in English',
        duration: 2000,
      });
      return;
    }

    if (!channelType) {
      toast.error('Channel Type Required', {
        description: 'Please select a channel type',
        duration: 2000,
      });
      return;
    }

    setChannels(channels.map(c => 
      c.id === editingChannel.id
        ? {
            ...c,
            imageUrl,
            nameEn,
            nameAr,
            channelType,
            channelUrl,
            visibility: {
              kids: visibilityTerminals.includes('Kids'),
              adults: visibilityTerminals.includes('Adults'),
              vip: visibilityTerminals.includes('VIP'),
            },
          }
        : c
    ));

    setIsEditModalOpen(false);
    setEditingChannel(null);
    resetForm();
    toast.success('Channel Updated', {
      description: 'Channel updated successfully',
      duration: 2000,
    });
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
    setDeleteConfirmId(null);
    toast.success('Channel Deleted', {
      description: 'Channel deleted successfully',
      duration: 2000,
    });
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setNameEn(channel.nameEn);
    setNameAr(channel.nameAr);
    setChannelType(channel.channelType);
    setChannelUrl(channel.channelUrl);
    setImageUrl(channel.imageUrl);
    setVisibilityTerminals(
      Object.entries(channel.visibility)
        .filter(([key, value]) => value)
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    );
    setIsEditModalOpen(true);
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredChannels.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredChannels.map(c => c.id));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedRows.length;
    setChannels(channels.filter(c => !selectedRows.includes(c.id)));
    setSelectedRows([]);
    toast.success('Channels Deleted', {
      description: `${selectedCount} channel${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const handleInlineEdit = (id: string, field: 'nameEn' | 'nameAr' | 'channelUrl', value: string) => {
    setChannels(channels.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
    toast.success('Channel Updated', {
      description: 'Channel updated successfully',
      duration: 2000,
    });
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = 
      channel.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.nameAr.includes(searchQuery) ||
      channel.channelUrl.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterChannelType === 'All' || channel.channelType === filterChannelType;
    
    return matchesSearch && matchesFilter;
  });

  const hasSelectedRows = selectedRows.length > 0;

  const [sortField, setSortField] = useState<SortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (sortField === 'nameEn' || sortField === 'nameAr' || sortField === 'channelType') {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedChannels.length / rowsPerPage);
  const currentChannels = sortedChannels.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
      {/* Empty State */}
      {channels.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Tv size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Channels Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start adding TV channels to your system to get started.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
                />
              </div>

              {/* Filter */}
              <SingleSelectDropdown
                options={[{ value: 'All', label: 'All Types' }, ...channelTypes.map(type => ({ value: type, label: type }))]}
                value={filterChannelType}
                onChange={(value) => setFilterChannelType(value)}
                className="min-w-[180px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasSelectedRows && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <Plus size={18} strokeWidth={2} />
                Add Channel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
            {/* Top Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalItems={sortedChannels.length}
              itemsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleRowsPerPageChange}
              itemLabel="channels"
              showRowsPerPage={true}
            />
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: '50px' }} /> {/* Checkbox */}
                  <col style={{ width: '70px' }} /> {/* Icon */}
                  <col style={{ width: '140px' }} /> {/* Name EN */}
                  <col style={{ width: '140px' }} /> {/* Name AR */}
                  <col style={{ width: '110px' }} /> {/* Type */}
                  <col style={{ width: '320px' }} /> {/* Channel URL */}
                  <col style={{ width: '80px' }} /> {/* Actions */}
                </colgroup>
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-3 text-left">
                      <input
                        type="checkbox"
                        checked={filteredChannels.length > 0 && selectedRows.length === filteredChannels.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Icon
                    </th>
                    <th className="py-3 px-3 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleSort('nameEn')}>
                        Name EN
                        <ArrowUpDown size={12} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors" strokeWidth={2} />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleSort('nameAr')}>
                        Name AR
                        <ArrowUpDown size={12} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors" strokeWidth={2} />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleSort('channelType')}>
                        Type
                        <ArrowUpDown size={12} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors" strokeWidth={2} />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Channel URL
                    </th>
                    <th className="py-3 px-3 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-200">
                {currentChannels.map((channel) => (
                  <tr 
                    key={channel.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(channel.id)}
                        onChange={() => handleRowSelect(channel.id)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <InlineImageUpload
                        imageUrl={channel.imageUrl}
                        onImageChange={(imageUrl) => {
                          setChannels(channels.map(c => 
                            c.id === channel.id ? { ...c, imageUrl } : c
                          ));
                          toast.success('Logo Updated', {
                            description: 'Channel logo updated successfully',
                            duration: 2000,
                          });
                        }}
                        altText={channel.nameEn}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <InlineInput
                        value={channel.nameEn}
                        onChange={(value) => handleInlineEdit(channel.id, 'nameEn', value)}
                        className="font-medium text-[13px]"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <InlineInput
                        value={channel.nameAr}
                        onChange={(value) => handleInlineEdit(channel.id, 'nameAr', value)}
                        className="font-medium text-[13px]"
                        dir="rtl"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <InlineSelect
                        value={channel.channelType}
                        options={channelTypes}
                        colorize={true}
                        onChange={(value) => {
                          setChannels(channels.map(c => 
                            c.id === channel.id ? { ...c, channelType: value } : c
                          ));
                          toast.success('Channel Type Updated', {
                            description: 'Channel type updated successfully',
                            duration: 2000,
                          });
                        }}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <InlineInput
                        value={channel.channelUrl}
                        onChange={(value) => handleInlineEdit(channel.id, 'channelUrl', value)}
                        className="text-[13px]"
                        placeholder="No URL"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => setDeleteConfirmId(channel.id)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
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
            {/* Bottom Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalItems={sortedChannels.length}
              itemsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleRowsPerPageChange}
              itemLabel="channels"
              showRowsPerPage={true}
            />
          </div>
        </>
      )}

      {/* Add Channel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Channel</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Logo</label>
                
                {!imageUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-5 hover:border-[#4EBEE3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className="text-[#99A1AF]" strokeWidth={2.5} />
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload channel logo
                        </p>
                        <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={imageUrl} 
                      alt="Logo preview" 
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {image?.name || 'Channel logo'}
                      </p>
                      <p className="text-[10px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Logo image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={16} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Name</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Enter channel name in English"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Name</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="أدخل اسم القناة بالعربية"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="">Select channel type</option>
                  {channelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setShowVisibilityModal(true)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#4EBEE3]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} strokeWidth={2} />
                  Set Visibility ({visibilityTerminals.length})
                </button>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel URL</label>
                <input
                  type="url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://example.com/stream"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChannel}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {isEditModalOpen && editingChannel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Edit Channel</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingChannel(null);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Logo</label>
                
                {!imageUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-5 hover:border-[#4EBEE3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className="text-[#99A1AF]" strokeWidth={2.5} />
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload channel logo
                        </p>
                        <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={imageUrl} 
                      alt="Logo preview" 
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {image?.name || 'Channel logo'}
                      </p>
                      <p className="text-[10px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Logo image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={16} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Name</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Enter channel name in English"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Name</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="أدخل اسم القناة بالعربية"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="">Select channel type</option>
                  {channelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setShowVisibilityModal(true)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#4EBEE3]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} strokeWidth={2} />
                  Set Visibility ({visibilityTerminals.length})
                </button>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel URL</label>
                <input
                  type="url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://example.com/stream"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingChannel(null);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditChannel}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Delete Channel</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-[#6B7280]">
                Are you sure you want to delete this channel? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChannel(deleteConfirmId)}
                className="px-5 py-2.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-all text-[14px] font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Visibility Modal (from table Set button) */}
      <UnifiedVisibilityModal
        isOpen={visibilityModalChannelId !== null}
        onClose={() => setVisibilityModalChannelId(null)}
        itemName={channels.find(c => c.id === visibilityModalChannelId)?.nameEn || ''}
        terminals={mockTerminals}
        currentSelection={(() => {
          const channel = channels.find(c => c.id === visibilityModalChannelId);
          if (!channel) return [];
          const selected: string[] = [];
          mockTerminals.forEach(terminal => {
            if (channel.visibility.kids && terminal.group === 'Kids') selected.push(terminal.id);
            if (channel.visibility.adults && terminal.group === 'Adults') selected.push(terminal.id);
            if (channel.visibility.vip && terminal.group === 'VIP') selected.push(terminal.id);
          });
          return selected;
        })()}
        onSave={(selectedTerminals) => {
          if (visibilityModalChannelId) {
            setChannels(channels.map(c => 
              c.id === visibilityModalChannelId 
                ? { 
                    ...c, 
                    visibility: {
                      kids: selectedTerminals.some(id => mockTerminals.find(t => t.id === id)?.group === 'Kids'),
                      adults: selectedTerminals.some(id => mockTerminals.find(t => t.id === id)?.group === 'Adults'),
                      vip: selectedTerminals.some(id => mockTerminals.find(t => t.id === id)?.group === 'VIP')
                    }
                  }
                : c
            ));
            toast.success('Visibility Updated', {
              description: `Visibility updated for ${selectedTerminals.length} terminal(s)`,
              duration: 2000,
            });
            setVisibilityModalChannelId(null);
          }
        }}
      />

      {/* Add/Edit Modal Visibility */}
      <UnifiedVisibilityModal
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        title="Set Channel Visibility"
        terminals={mockTerminals}
        currentSelection={visibilityTerminals}
        onSave={(selectedTerminals) => {
          setVisibilityTerminals(selectedTerminals);
          setShowVisibilityModal(false);
        }}
      />
    </div>
  );
}