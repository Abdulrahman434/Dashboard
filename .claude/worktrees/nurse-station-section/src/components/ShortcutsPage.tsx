import { useState, useEffect } from 'react';
import { Zap, Plus, Search, Trash2, X, FileText, Link as LinkIcon, Video, Smartphone, Globe, GripVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Asset {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'PDF' | 'URL' | 'APK';
  icon: string;
  iconFileName?: string;
  skipClearCache: boolean;
  assignedCategories: string[];
  pdfFile?: string;
  pdfFileName?: string;
  url?: string;
  apkFile?: string;
  apkFileName?: string;
}

interface ShortcutItem {
  id: string;
  assetId: string;
  order: number;
  visibility: {
    kids: boolean;
    adults: boolean;
    vip: boolean;
    all: boolean;
  };
}

export default function ShortcutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load assets from Content Library
  const [contentLibraryAssets, setContentLibraryAssets] = useState<Asset[]>([]);
  
  // Shortcut items
  const [shortcutItems, setShortcutItems] = useState<ShortcutItem[]>(() => {
    const saved = localStorage.getItem('shortcuts-services');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Load patient services to check conflicts
  const [patientServicesItems, setPatientServicesItems] = useState<any[]>([]);

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Load Content Library assets
  useEffect(() => {
    const loadAssets = () => {
      const saved = localStorage.getItem('content-library-assets');
      if (saved) {
        setContentLibraryAssets(JSON.parse(saved));
      }
    };
    loadAssets();

    const handleStorageChange = () => {
      loadAssets();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load patient services and engagement hub for cross-section tracking
  const [engagementHubItems, setEngagementHubItems] = useState<any>({});

  useEffect(() => {
    const loadOtherSections = () => {
      const psItems = localStorage.getItem('patient-services-items');
      const ehItems = localStorage.getItem('engagement-hub-items');
      if (psItems) setPatientServicesItems(JSON.parse(psItems));
      if (ehItems) setEngagementHubItems(JSON.parse(ehItems));
    };
    loadOtherSections();

    const handleStorageChange = () => {
      loadOtherSections();
    };
    
    const handleFocus = () => {
      loadOtherSections();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save shortcut items to localStorage
  useEffect(() => {
    localStorage.setItem('shortcuts-services', JSON.stringify(shortcutItems));
  }, [shortcutItems]);

  // Get shortcut assets
  const getShortcutAssets = () => {
    return shortcutItems
      .map(item => {
        const asset = contentLibraryAssets.find(a => a.id === item.assetId);
        return asset ? { ...item, asset } : null;
      })
      .filter((item): item is ShortcutItem & { asset: Asset } => item !== null)
      .sort((a, b) => a.order - b.order);
  };

  // Filter assets for search
  const filteredShortcuts = getShortcutAssets().filter(shortcut => {
    if (!searchQuery) return true;
    return (
      shortcut.asset.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.asset.nameAr.includes(searchQuery)
    );
  });

  // Get available assets for adding (show all assets from Content Library)
  const getAvailableAssets = () => {
    return contentLibraryAssets;
  };

  // Check if asset is already in shortcuts
  const isAssetInShortcuts = (assetId: string) => {
    return shortcutItems.some(item => item.assetId === assetId);
  };

  // Check which other sections an asset is in
  const getAssetOtherSections = (assetId: string) => {
    const sections: string[] = [];
    
    // Check Engagement Hub (check all categories)
    const isInEngagementHub = Object.values(engagementHubItems).some((items: any) => 
      Array.isArray(items) && items.some((item: any) => item.assetId === assetId)
    );
    if (isInEngagementHub) {
      sections.push('Engagement Hub');
    }
    
    // Check Patient Services
    if (patientServicesItems.some((item: any) => item.assetId === assetId)) {
      sections.push('Patient Services');
    }
    
    return sections;
  };

  // Add items to shortcuts
  const handleAddItems = () => {
    const newItems: ShortcutItem[] = tempSelectedAssets.map((assetId, index) => ({
      id: `${Date.now()}-${index}`,
      assetId,
      order: shortcutItems.length + index,
      visibility: {
        kids: true,
        adults: true,
        vip: true,
        all: true
      }
    }));

    setShortcutItems(prev => [...prev, ...newItems]);

    toast.success(`${tempSelectedAssets.length} shortcut(s) added`);
    setShowAddModal(false);
    setTempSelectedAssets([]);
    setModalSearchQuery('');
  };

  // Remove shortcut
  const handleRemoveShortcut = (itemId: string) => {
    setShortcutItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Shortcut removed');
  };

  // Bulk delete functionality
  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredShortcuts.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredShortcuts.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    setShortcutItems(prev => prev.filter(item => !selectedItems.has(item.id)));
    toast.success(`${selectedItems.size} shortcut(s) deleted`);
    setSelectedItems(new Set());
    setShowBulkDeleteConfirm(false);
  };

  // Reorder shortcuts
  const moveShortcut = (fromIndex: number, toIndex: number) => {
    const newItems = [...shortcutItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update order values
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setShortcutItems(reorderedItems);
    toast.success('Shortcuts reordered');
  };

  // Drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    e.currentTarget.classList.add('bg-[#4EBEE3]/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-[#4EBEE3]/10');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[#4EBEE3]/10');
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    moveShortcut(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle visibility toggle
  const handleVisibilityToggle = (itemId: string, group: 'kids' | 'adults' | 'vip' | 'all') => {
    setShortcutItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      if (group === 'all') {
        const newAllValue = !item.visibility.all;
        return {
          ...item,
          visibility: {
            kids: newAllValue,
            adults: newAllValue,
            vip: newAllValue,
            all: newAllValue
          }
        };
      } else {
        const newVisibility = {
          ...item.visibility,
          [group]: !item.visibility[group],
          all: false
        };
        return { ...item, visibility: newVisibility };
      }
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText size={16} className="text-red-500" />;
      case 'URL':
        return <LinkIcon size={16} className="text-[#4EBEE3]" />;
      case 'APK':
        return <Smartphone size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Zap size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Shortcuts
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage the quick-access actions that appear on the patient home screen
          </p>
        </div>
        {filteredShortcuts.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            <Plus size={18} strokeWidth={2} />
            Add Shortcut
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {filteredShortcuts.length === 0 && !searchQuery ? (
          // Empty State
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Zap size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Shortcuts Added
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Get started by adding your first shortcut from the Content Library.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Shortcut
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>
              {selectedItems.size > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Delete ({selectedItems.size})
                </button>
              )}
            </div>

            {/* Shortcuts Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredShortcuts.length && filteredShortcuts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-12">
                      
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      English Name
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Arabic Name
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Type
                    </th>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Kids
                    </th>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Adults
                    </th>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      VIP
                    </th>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      All
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShortcuts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                          No shortcuts found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredShortcuts.map((shortcut, index) => (
                      <tr 
                        key={shortcut.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(shortcut.id)}
                            onChange={() => toggleSelection(shortcut.id)}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                            title="Drag to reorder"
                          >
                            <GripVertical size={18} strokeWidth={2} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#4EBEE3]/20 to-[#4EBEE3]/5 flex items-center justify-center">
                            {shortcut.asset.icon ? (
                              <img
                                src={shortcut.asset.icon}
                                alt={shortcut.asset.nameEn}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="text-[#4EBEE3] text-[14px] font-semibold font-['Poppins',sans-serif]">
                              {shortcut.asset.nameEn.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                            {shortcut.asset.nameEn}
                          </span>
                        </td>
                        <td className="px-6 py-4" dir="rtl">
                          <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                            {shortcut.asset.nameAr}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(shortcut.asset.type)}
                            <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                              {shortcut.asset.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={shortcut.visibility.kids}
                            disabled={shortcut.visibility.all}
                            onChange={() => handleVisibilityToggle(shortcut.id, 'kids')}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 accent-[#4EBEE3] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={shortcut.visibility.adults}
                            disabled={shortcut.visibility.all}
                            onChange={() => handleVisibilityToggle(shortcut.id, 'adults')}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 accent-[#4EBEE3] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={shortcut.visibility.vip}
                            disabled={shortcut.visibility.all}
                            onChange={() => handleVisibilityToggle(shortcut.id, 'vip')}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 accent-[#4EBEE3] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={shortcut.visibility.all}
                            onChange={() => handleVisibilityToggle(shortcut.id, 'all')}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 accent-[#4EBEE3] cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveShortcut(shortcut.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove shortcut"
                            >
                              <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add from Content Library Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                  Add Shortcut
                </h2>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                  Select assets from the Content Library to add as shortcuts
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTempSelectedAssets([]);
                  setModalSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {getAvailableAssets().filter(asset => {
                  if (!modalSearchQuery) return true;
                  const query = modalSearchQuery.toLowerCase();
                  return asset.nameEn.toLowerCase().includes(query) || 
                         asset.nameAr.includes(modalSearchQuery);
                }).length === 0 ? (
                  <div className="py-12 text-center">
                    <Zap size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                      {modalSearchQuery ? 'No assets found matching your search' : 'No assets available in Content Library'}
                    </p>
                  </div>
                ) : (
                  getAvailableAssets().filter(asset => {
                    if (!modalSearchQuery) return true;
                    const query = modalSearchQuery.toLowerCase();
                    return asset.nameEn.toLowerCase().includes(query) || 
                           asset.nameAr.includes(modalSearchQuery);
                  }).map((asset) => {
                    const isInShortcuts = isAssetInShortcuts(asset.id);
                    const isSelected = tempSelectedAssets.includes(asset.id);
                    const otherSections = getAssetOtherSections(asset.id);

                    return (
                      <div
                        key={asset.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isInShortcuts
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-[#4EBEE3] bg-[#4EBEE3]/5'
                            : 'border-gray-200 hover:border-[#4EBEE3]/50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isInShortcuts && !isSelected) {
                            setTempSelectedAssets([...tempSelectedAssets, asset.id]);
                          } else if (isSelected) {
                            setTempSelectedAssets(tempSelectedAssets.filter(id => id !== asset.id));
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {!isInShortcuts && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                            />
                          )}
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#4EBEE3]/20 to-[#4EBEE3]/5 flex items-center justify-center">
                            {asset.icon ? (
                              <img
                                src={asset.icon}
                                alt={asset.nameEn}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="text-[#4EBEE3] text-[18px] font-semibold font-['Poppins',sans-serif]">
                              {asset.nameEn.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                                {asset.nameEn}
                              </p>
                              <span className="text-[13px] text-gray-400 font-['Poppins',sans-serif]" dir="rtl">
                                • {asset.nameAr}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {getTypeIcon(asset.type)}
                                <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                                  {asset.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isInShortcuts ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[12px] font-medium font-['Poppins',sans-serif]">
                              Already in Shortcuts
                            </span>
                          ) : otherSections.length > 0 ? (
                            <div className="flex gap-1.5">
                              {otherSections.map((section) => (
                                <span 
                                  key={section}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                                    section === 'Engagement Hub'
                                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                      : 'bg-purple-50 text-purple-600 border border-purple-200'
                                  }`}
                                  title={`Also used in ${section}`}
                                >
                                  In {section}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                {tempSelectedAssets.length} shortcut(s) selected
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setTempSelectedAssets([]);
                    setModalSearchQuery('');
                  }}
                  className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItems}
                  disabled={tempSelectedAssets.length === 0}
                  className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add {tempSelectedAssets.length > 0 ? `(${tempSelectedAssets.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                Delete Shortcuts
              </h2>
              <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif] mb-6">
                Are you sure you want to delete {selectedItems.size} shortcut(s)? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
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