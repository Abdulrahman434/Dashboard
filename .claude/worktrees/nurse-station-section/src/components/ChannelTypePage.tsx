import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, X, Tv, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';

interface ChannelType {
  id: string;
  nameEn: string;
  nameAr: string;
  createdAt: string;
}

type SortField = 'nameEn' | 'nameAr';
type SortDirection = 'asc' | 'desc';

const defaultChannelTypes: ChannelType[] = [
  {
    id: '1',
    nameEn: 'Kids',
    nameAr: 'الأطفال',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nameEn: 'Entertainment',
    nameAr: 'الترفيه',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    nameEn: 'News',
    nameAr: 'الأخبار',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    nameEn: 'Sports',
    nameAr: 'الرياضة',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    nameEn: 'Religious',
    nameAr: 'القنوات الدينية',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    nameEn: 'Stream',
    nameAr: 'بث حي',
    createdAt: new Date().toISOString(),
  },
];

export default function ChannelTypePage() {
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_channel_types');
      if (saved) {
        try {
          const savedTypes = JSON.parse(saved);
          // Merge with defaults to ensure new types are added
          const mergedTypes = [...savedTypes];
          defaultChannelTypes.forEach(defaultType => {
            const exists = savedTypes.find((t: ChannelType) => t.id === defaultType.id);
            if (!exists) {
              mergedTypes.push(defaultType);
            }
          });
          return mergedTypes;
        } catch (e) {
          return defaultChannelTypes;
        }
      }
    }
    return defaultChannelTypes;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChannelType, setEditingChannelType] = useState<ChannelType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_channel_types', JSON.stringify(channelTypes));
    }
  }, [channelTypes]);

  const resetForm = () => {
    setNameEn('');
    setNameAr('');
  };

  const handleAddChannelType = () => {
    if (!nameEn.trim()) {
      toast.error('English Name Required', {
        description: 'Please enter a channel type in English',
        duration: 2000,
      });
      return;
    }

    if (!nameAr.trim()) {
      toast.error('Arabic Name Required', {
        description: 'Please enter a channel type in Arabic',
        duration: 2000,
      });
      return;
    }

    const newChannelType: ChannelType = {
      id: Date.now().toString(),
      nameEn,
      nameAr,
      createdAt: new Date().toISOString(),
    };

    setChannelTypes([...channelTypes, newChannelType]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Channel Type Added', {
      description: 'Channel type added successfully',
      duration: 2000,
    });
  };

  const handleEditChannelType = () => {
    if (!editingChannelType) return;

    if (!nameEn.trim()) {
      toast.error('English Name Required', {
        description: 'Please enter a channel type in English',
        duration: 2000,
      });
      return;
    }

    if (!nameAr.trim()) {
      toast.error('Arabic Name Required', {
        description: 'Please enter a channel type in Arabic',
        duration: 2000,
      });
      return;
    }

    setChannelTypes(channelTypes.map(ct => 
      ct.id === editingChannelType.id
        ? {
            ...ct,
            nameEn,
            nameAr,
          }
        : ct
    ));

    setIsEditModalOpen(false);
    setEditingChannelType(null);
    resetForm();
    toast.success('Channel Type Updated', {
      description: 'Channel type updated successfully',
      duration: 2000,
    });
  };

  const handleDeleteChannelType = (id: string) => {
    setChannelTypes(channelTypes.filter(ct => ct.id !== id));
    setDeleteConfirmId(null);
    toast.success('Channel Type Deleted', {
      description: 'Channel type deleted successfully',
      duration: 2000,
    });
  };

  const handleEdit = (channelType: ChannelType) => {
    setEditingChannelType(channelType);
    setNameEn(channelType.nameEn);
    setNameAr(channelType.nameAr);
    setIsEditModalOpen(true);
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredChannelTypes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredChannelTypes.map(ct => ct.id));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedRows.length;
    setChannelTypes(channelTypes.filter(ct => !selectedRows.includes(ct.id)));
    setSelectedRows([]);
    toast.success('Channel Types Deleted', {
      description: `${selectedCount} channel type${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const handleInlineEdit = (id: string, field: 'nameEn' | 'nameAr', value: string) => {
    const oldChannelType = channelTypes.find(ct => ct.id === id);
    if (!oldChannelType) return;

    // Update channel type
    setChannelTypes(channelTypes.map(ct => 
      ct.id === id ? { ...ct, [field]: value } : ct
    ));

    // CASCADE: Update all channels that reference this channel type
    if (field === 'nameEn') {
      const channelsData = localStorage.getItem('careinn_channels');
      if (channelsData) {
        const channels = JSON.parse(channelsData);
        const updatedChannels = channels.map((channel: any) =>
          channel.channelType === oldChannelType.nameEn
            ? { ...channel, channelType: value }
            : channel
        );
        localStorage.setItem('careinn_channels', JSON.stringify(updatedChannels));
      }
    }

    toast.success('Channel Type Updated', {
      description: field === 'nameEn' 
        ? 'Changes cascaded to all linked channels' 
        : 'Channel type updated successfully',
      duration: 2000,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredChannelTypes = channelTypes.filter(channelType => {
    const matchesSearch = 
      channelType.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channelType.nameAr.includes(searchQuery);
    
    return matchesSearch;
  });

  const sortedChannelTypes = filteredChannelTypes.sort((a, b) => {
    if (sortField === 'nameEn') {
      return sortDirection === 'asc'
        ? a.nameEn.localeCompare(b.nameEn)
        : b.nameEn.localeCompare(a.nameEn);
    } else if (sortField === 'nameAr') {
      return sortDirection === 'asc'
        ? a.nameAr.localeCompare(b.nameAr)
        : b.nameAr.localeCompare(a.nameAr);
    }
    return 0;
  });

  const hasSelectedRows = selectedRows.length > 0;

  return (
    <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
      {/* Empty State */}
      {channelTypes.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Tv size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Channel Types Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start adding channel types to categorize your TV channels.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Channel Type
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
                  placeholder="Search channel types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
                />
              </div>
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
                Add Channel Type
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={filteredChannelTypes.length > 0 && selectedRows.length === filteredChannelTypes.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('nameEn')}>
                      Channel Type (EN)
                      <ArrowUpDown size={16} className={sortField === 'nameEn' ? 'text-[#4EBEE3]' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('nameAr')}>
                      Channel Type (AR)
                      <ArrowUpDown size={16} className={sortField === 'nameAr' ? 'text-[#4EBEE3]' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedChannelTypes.map((channelType) => (
                  <tr 
                    key={channelType.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(channelType.id)}
                        onChange={() => handleRowSelect(channelType.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineInput
                        value={channelType.nameEn}
                        onChange={(value) => handleInlineEdit(channelType.id, 'nameEn', value)}
                        className="font-medium"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineInput
                        value={channelType.nameAr}
                        onChange={(value) => handleInlineEdit(channelType.id, 'nameAr', value)}
                        className="font-medium"
                        dir="rtl"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => setDeleteConfirmId(channelType.id)}
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

      {/* Add Channel Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Channel Type</h3>
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
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type (English)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Enter channel type in English"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type (Arabic)</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="أدخل نوع القناة بالعربية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  dir="rtl"
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
                onClick={handleAddChannelType}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Channel Type Modal */}
      {isEditModalOpen && editingChannelType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Edit Channel Type</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingChannelType(null);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type (English)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Enter channel type in English"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Channel Type (Arabic)</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="أدخل نوع القناة بالعربية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingChannelType(null);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditChannelType}
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
              <h3 className="text-[18px] font-semibold text-[#16274D]">Delete Channel Type</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-[#6B7280]">
                Are you sure you want to delete this channel type? This action cannot be undone.
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
                onClick={() => handleDeleteChannelType(deleteConfirmId)}
                className="px-5 py-2.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-all text-[14px] font-medium shadow-sm"
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