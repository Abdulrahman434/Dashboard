import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Settings, Upload, X, Monitor, MonitorOff, Tablet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';
import { UnifiedVisibilityModal } from './UnifiedVisibilityModal';

interface Wallpaper {
  id: string;
  image: string;
  visibleTerminals: string[]; // Array of terminal IDs
  isDefault: boolean;
}

// Mock terminals data (matching CareInn15 structure)
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

// Generate mock terminals
const generateMockTerminals = (): Terminal[] => {
  const buildings = ['Building A', 'Building B', 'Building C'];
  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
  const groups = ['Kids', 'Adults', 'VIP'];
  const pocs = ['North Wing', 'South Wing', 'East Wing', 'West Wing'];
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `terminal-${i}`,
    deviceId: `CareInn15-${String(i + 1).padStart(3, '0')}`,
    mrn: `MRN-${String(i + 1).padStart(5, '0')}`,
    roomNo: `${100 + Math.floor(i / 2)}`,
    bedNo: i % 2 === 0 ? 'A' : 'B',
    building: buildings[i % 3],
    floor: floors[i % 4],
    poc: pocs[i % 4],
    group: groups[i % 3],
    isConnected: i >= 2, // First 2 disconnected, rest connected
  }));
};

// IndexedDB helper functions for large file storage
const DB_NAME = 'CareInnDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallpaperMedia';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      // Also create screensaver store if it doesn't exist
      if (!db.objectStoreNames.contains('screensaverMedia')) {
        db.createObjectStore('screensaverMedia');
      }
    };
  });
};

const saveToIndexedDB = async (key: string, data: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getFromIndexedDB = async (key: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const deleteFromIndexedDB = async (key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export default function WallpaperPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [visibilityModalWallpaperId, setVisibilityModalWallpaperId] = useState<string | null>(null);
  const [editWallpaperId, setEditWallpaperId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [terminals] = useState<Terminal[]>(generateMockTerminals());

  // Load wallpapers from localStorage (metadata) and IndexedDB (images)
  useEffect(() => {
    const loadWallpapers = async () => {
      try {
        const stored = localStorage.getItem('careinn_wallpapers');
        if (stored) {
          const wallpaperMetadata = JSON.parse(stored);
          // Load images from IndexedDB
          const wallpapersWithImages = await Promise.all(
            wallpaperMetadata.map(async (wp: Wallpaper) => {
              const image = await getFromIndexedDB(`wallpaper_${wp.id}`);
              return {
                ...wp,
                image: image || ''
              };
            })
          );
          setWallpapers(wallpapersWithImages);
        }
      } catch (e) {
        console.error('Error loading wallpapers:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadWallpapers();
  }, []);

  // Save wallpapers to localStorage (metadata) and IndexedDB (images)
  const saveWallpapers = async (updatedWallpapers: Wallpaper[]) => {
    try {
      // Save images to IndexedDB
      await Promise.all(
        updatedWallpapers.map(wp => 
          saveToIndexedDB(`wallpaper_${wp.id}`, wp.image)
        )
      );
      
      // Save metadata to localStorage (without images)
      const metadata = updatedWallpapers.map(({ image, ...rest }) => rest);
      localStorage.setItem('careinn_wallpapers', JSON.stringify(metadata));
      
      setWallpapers(updatedWallpapers);
    } catch (e) {
      console.error('Error saving wallpapers:', e);
      toast.error('Failed to save wallpapers. Please try again.');
    }
  };

  const handleAddWallpaper = async (wallpaperData: { image: string; setAsDefault: boolean }) => {
    const newWallpaper: Wallpaper = {
      id: Date.now().toString(),
      image: wallpaperData.image,
      visibleTerminals: [], // Start with no terminals selected
      isDefault: wallpaperData.setAsDefault,
    };
    
    // If this is set as default, unset all others
    const updatedWallpapers = wallpaperData.setAsDefault 
      ? wallpapers.map(w => ({ ...w, isDefault: false }))
      : wallpapers;
    
    await saveWallpapers([...updatedWallpapers, newWallpaper]);
    setIsAddModalOpen(false);
    toast.success('Wallpaper added successfully');
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from IndexedDB
      await deleteFromIndexedDB(`wallpaper_${id}`);
      
      // Update state and localStorage
      const updated = wallpapers.filter(w => w.id !== id);
      await saveWallpapers(updated);
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
      toast.success('Wallpaper deleted successfully');
    } catch (e) {
      console.error('Error deleting wallpaper:', e);
      toast.error('Failed to delete wallpaper');
    }
  };

  const handleSetDefault = async (id: string) => {
    // Only one wallpaper can be default, so unset all others
    const updated = wallpapers.map(w => ({
      ...w,
      isDefault: w.id === id
    }));
    await saveWallpapers(updated);
    toast.success('Default wallpaper updated');
  };

  const handleEditWallpaper = async (wallpaperData: { image: string }) => {
    if (!editWallpaperId) return;
    
    const updated = wallpapers.map(w =>
      w.id === editWallpaperId ? { ...w, image: wallpaperData.image } : w
    );
    await saveWallpapers(updated);
    setEditWallpaperId(null);
    toast.success('Wallpaper updated successfully');
  };

  const handleSaveVisibility = async (wallpaperId: string, selectedTerminals: string[]) => {
    const updated = wallpapers.map(w =>
      w.id === wallpaperId ? { ...w, visibleTerminals: selectedTerminals } : w
    );
    await saveWallpapers(updated);
    setVisibilityModalWallpaperId(null);
    toast.success('Visibility updated successfully');
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === wallpapers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(wallpapers.map(w => w.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const selectedCount = selectedRows.length;
      
      // Delete from IndexedDB
      await Promise.all(
        selectedRows.map(id => deleteFromIndexedDB(`wallpaper_${id}`))
      );
      
      // Update state and localStorage
      const updated = wallpapers.filter(w => !selectedRows.includes(w.id));
      await saveWallpapers(updated);
      setSelectedRows([]);
      toast.success(`${selectedCount} wallpaper${selectedCount > 1 ? 's' : ''} deleted successfully`);
    } catch (e) {
      console.error('Error deleting wallpapers:', e);
      toast.error('Failed to delete wallpapers');
    }
  };

  const hasSelectedRows = selectedRows.length > 0;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4EBEE3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-[#637381] font-['Poppins',sans-serif]">Loading wallpapers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div 
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <ImageIcon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Wallpaper
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage background wallpapers for different user groups
            </p>
          </div>
        </div>
        {wallpapers.length > 0 && (
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
              onClick={() => setIsConfigureModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors shadow-sm"
            >
              <Settings size={18} strokeWidth={2} />
              <span className="text-[14px] font-medium font-['Poppins',sans-serif]">Configure</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-[#4EBEE3] hover:bg-[#4EBEE3]/90 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={18} strokeWidth={2} />
              <span className="text-[14px] font-medium font-['Poppins',sans-serif]">Add Wallpaper</span>
            </button>
          </div>
        )}
      </div>

      {wallpapers.length === 0 ? (
        // Empty State - White Container like Terminal Tour Guide and Location pages
        <div 
          className="bg-white rounded-xl border-2 border-gray-200 shadow-sm"
        >
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Wallpapers Added
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Get started by adding your first wallpaper. You can assign wallpapers to different user groups.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Wallpaper
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Table View
        <div 
          className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={wallpapers.length > 0 && selectedRows.length === wallpapers.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Wallpaper
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Visibility
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Default
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {wallpapers.map((wallpaper) => {
                  return (
                    <tr key={wallpaper.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(wallpaper.id)}
                          onChange={() => handleRowSelect(wallpaper.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <img 
                          src={wallpaper.image} 
                          alt="Wallpaper" 
                          onClick={() => setPreviewImage(wallpaper.image)}
                          className="h-16 w-24 object-cover rounded-lg border border-[#E5E7EB] cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setVisibilityModalWallpaperId(wallpaper.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all font-['Poppins',sans-serif] text-[13px] font-medium"
                        >
                          Set ({wallpaper.visibleTerminals.length})
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={wallpaper.isDefault}
                          onChange={() => handleSetDefault(wallpaper.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        {wallpaper.isDefault ? (
                          <button
                            disabled
                            className="inline-flex items-center justify-center p-2 text-gray-300 cursor-not-allowed rounded-lg"
                            title="Cannot delete default wallpaper"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(wallpaper.id)}
                            className="inline-flex items-center justify-center p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Wallpaper Modal */}
      {isAddModalOpen && (
        <AddWallpaperModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddWallpaper}
        />
      )}

      {/* Configure Modal */}
      {isConfigureModalOpen && (
        <ConfigureModal
          onClose={() => setIsConfigureModalOpen(false)}
        />
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 rounded-full size-10 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={24} className="text-white" strokeWidth={2} />
            </button>
            <img 
              src={previewImage} 
              alt="Wallpaper Preview" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Delete Wallpaper
              </h3>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[14px] text-[#637381] font-['Poppins',sans-serif] mb-6">
              Are you sure you want to delete this wallpaper?
            </p>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-5 py-2.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Modal */}
      {visibilityModalWallpaperId && (() => {
        const wallpaper = wallpapers.find(w => w.id === visibilityModalWallpaperId);
        return (
          <UnifiedVisibilityModal
            isOpen={true}
            onClose={() => setVisibilityModalWallpaperId(null)}
            itemName={`Wallpaper ${wallpapers.indexOf(wallpaper!) + 1}`}
            terminals={terminals}
            currentSelection={wallpaper?.visibleTerminals || []}
            onSave={(selectedTerminals) => handleSaveVisibility(visibilityModalWallpaperId, selectedTerminals)}
          />
        );
      })()}

      {/* Edit Wallpaper Modal */}
      {editWallpaperId && (
        <EditWallpaperModal
          onClose={() => setEditWallpaperId(null)}
          onSave={handleEditWallpaper}
          currentImage={wallpapers.find(w => w.id === editWallpaperId)?.image || ''}
        />
      )}
    </div>
  );
}

// Add Wallpaper Modal Component
interface AddWallpaperModalProps {
  onClose: () => void;
  onSave: (data: { image: string; setAsDefault: boolean }) => void;
}

function AddWallpaperModal({ onClose, onSave }: AddWallpaperModalProps) {
  const [wallpaperImage, setWallpaperImage] = useState<File | null>(null);
  const [wallpaperImageUrl, setWallpaperImageUrl] = useState<string>('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (15MB limit)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 15) {
        toast.error('File is too large. Please use an image under 15MB.');
        e.target.value = ''; // Reset input
        return;
      }

      setWallpaperImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallpaperImageUrl(reader.result as string);
      };
      reader.onerror = () => {
        toast.error('Failed to load image. Please try again.');
        setWallpaperImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setWallpaperImage(null);
    setWallpaperImageUrl('');
  };

  const handleSave = () => {
    if (!wallpaperImageUrl) {
      toast.error('Please upload an image');
      return;
    }
    onSave({
      image: wallpaperImageUrl,
      setAsDefault,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
      <div className="bg-white rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[600px]">
        {/* Header */}
        <div className="h-[72.617px] border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Add Wallpaper
            </h3>
            <button
              onClick={onClose}
              className="rounded-[10px] size-[32px] hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={20} className="text-gray-500" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              Image Upload
            </label>
            
            {!wallpaperImageUrl ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4ebee3] transition-all duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Click to upload wallpaper image
                    </p>
                    <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                      PNG, JPG up to 15MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                <img 
                  src={wallpaperImageUrl} 
                  alt="Wallpaper preview" 
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    {wallpaperImage?.name}
                  </p>
                  <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                    Wallpaper image uploaded
                  </p>
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Remove image"
                >
                  <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* Set as Default Checkbox */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Set as Default Wallpaper
            </label>
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[rgba(249,250,251,0.5)] border-t border-gray-200 h-[74.873px] flex items-center justify-end px-6 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Configure Modal Component
interface ConfigureModalProps {
  onClose: () => void;
}

// Screensaver IndexedDB functions
const getScreensaverFromIndexedDB = async (key: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('screensaverMedia', 'readonly');
    const store = transaction.objectStore('screensaverMedia');
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const saveScreensaverToIndexedDB = async (key: string, data: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('screensaverMedia', 'readwrite');
    const store = transaction.objectStore('screensaverMedia');
    const request = store.put(data, key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const deleteScreensaverFromIndexedDB = async (key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('screensaverMedia', 'readwrite');
    const store = transaction.objectStore('screensaverMedia');
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

function ConfigureModal({ onClose }: ConfigureModalProps) {
  const [slideshowTimer, setSlideshowTimer] = useState(30);
  const [addScreenSaver, setAddScreenSaver] = useState(false);
  const [screenSaverTimeout, setScreenSaverTimeout] = useState(15);
  const [screenSaverImage, setScreenSaverImage] = useState<File | null>(null);
  const [screenSaverImageData, setScreenSaverImageData] = useState<string>('');
  const [screenSaverFileName, setScreenSaverFileName] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Load configuration from localStorage when modal opens
  useEffect(() => {
    const loadConfig = async () => {
      const stored = localStorage.getItem('careinn_wallpaper_config');
      if (stored) {
        try {
          const config = JSON.parse(stored);
          setSlideshowTimer(config.slideshowTimer || 30);
          setScreenSaverTimeout(config.screenSaverTimeout || 15);
          
          // Load screensaver image/video from IndexedDB
          const mediaData = await getScreensaverFromIndexedDB('screensaver_media');
          if (mediaData) {
            setAddScreenSaver(true);
            setScreenSaverImageData(mediaData);
            setScreenSaverFileName(config.screenSaverFileName || '');
          }
        } catch (e) {
          console.error('Error loading wallpaper config:', e);
        }
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      // Save large media file to IndexedDB
      if (screenSaverImageData) {
        await saveScreensaverToIndexedDB('screensaver_media', screenSaverImageData);
      } else {
        // Remove from IndexedDB if no image
        await deleteScreensaverFromIndexedDB('screensaver_media');
      }

      // Save configuration metadata to localStorage (without the large image data)
      const configData = {
        slideshowTimer,
        addScreenSaver,
        screenSaverTimeout,
        screenSaverFileName,
      };
      
      localStorage.setItem('careinn_wallpaper_config', JSON.stringify(configData));
      toast.success('Configuration saved successfully');
      onClose();
    } catch (e) {
      toast.error('Failed to save configuration. Please try again.');
      console.error('Error saving wallpaper config:', e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (15MB limit)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 15) {
        toast.error('File is too large. Please use a file under 15MB.');
        e.target.value = ''; // Reset input
        return;
      }

      setScreenSaverImage(file);
      setScreenSaverFileName(file.name);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenSaverImageData(reader.result as string);
      };
      reader.onerror = () => {
        toast.error('Failed to load file. Please try again.');
        setScreenSaverImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setScreenSaverImage(null);
    setScreenSaverImageData('');
    setScreenSaverFileName('');
  };

  const displayFileName = screenSaverImage?.name || screenSaverFileName;
  const hasImage = screenSaverImageData !== '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Configure Wallpaper
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Slideshow Timer */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            Slideshow Timer (Seconds)
          </label>
          <input
            type="number"
            value={slideshowTimer}
            onChange={(e) => setSlideshowTimer(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            min="1"
          />
        </div>

        {/* Add Screen Saver Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
            Add Screen Saver
          </label>
          <button
            onClick={() => setAddScreenSaver(!addScreenSaver)}
            className={`relative h-[28px] w-[52px] rounded-full transition-colors ${
              addScreenSaver ? 'bg-[#4EBEE3]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                addScreenSaver ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ScreenSaver Image Upload - Only show when toggle is active */}
        {addScreenSaver && (
          <>
            {/* Screensaver Timeout Setting */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Screensaver Timeout (Minutes)
              </label>
              <input
                type="number"
                value={screenSaverTimeout}
                onChange={(e) => setScreenSaverTimeout(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                min="1"
              />
            </div>

          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              Screensaver
            </label>
            
            {!hasImage ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4ebee3] transition-all duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Click to upload screensaver image or video
                    </p>
                    <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                      JPG, PNG, MP4, MOV up to 15MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                {screenSaverImageData.startsWith('data:video') ? (
                  <video 
                    src={screenSaverImageData} 
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowPreview(true)}
                    muted
                  />
                ) : (
                  <img 
                    src={screenSaverImageData} 
                    alt="Screensaver preview" 
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowPreview(true)}
                  />
                )}
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    {displayFileName}
                  </p>
                  <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                    Screensaver {screenSaverImageData.startsWith('data:video') ? 'video' : 'image'} uploaded
                  </p>
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Remove image"
                >
                  <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
          </>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>

      {/* Screensaver Preview Modal */}
      {showPreview && screenSaverImageData && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] font-['Poppins',sans-serif] p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 rounded-full size-10 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={24} className="text-white" strokeWidth={2} />
            </button>
            {screenSaverImageData.startsWith('data:video') ? (
              <video 
                src={screenSaverImageData} 
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img 
                src={screenSaverImageData} 
                alt="Screensaver Preview" 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Visibility Modal Component
interface VisibilityModalProps {
  onClose: () => void;
  wallpaperId: string;
  currentWallpapers: Wallpaper[];
  onSave: (wallpaperId: string, selectedTerminals: string[]) => void;
}

function VisibilityModal({ onClose, wallpaperId, currentWallpapers, onSave }: VisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [terminals] = useState<Terminal[]>(generateMockTerminals());
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');

  // Load selected terminals for the wallpaper
  useEffect(() => {
    const wallpaper = currentWallpapers.find(w => w.id === wallpaperId);
    if (wallpaper) {
      setSelectedTerminals(wallpaper.visibleTerminals);
    }
  }, [wallpaperId, currentWallpapers]);

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      // Deselect all filtered terminals
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      // Select all filtered terminals
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSave = () => {
    onSave(wallpaperId, selectedTerminals);
    toast.success(`Visibility updated for ${selectedTerminals.length} terminal(s)`);
    onClose();
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Filter terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Wallpaper Visibility
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Tablet size={22} className="text-[#4EBEE3] rotate-90" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Connected */}
            <button
              onClick={() => setFilterConnection('connected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'connected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Disconnected */}
            <button
              onClick={() => setFilterConnection('disconnected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'disconnected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
                <SingleSelectDropdown
                  options={[
                    { value: 'all', label: 'All Groups' },
                    { value: 'Kids', label: 'Kids' },
                    { value: 'Adults', label: 'Adults' },
                    { value: 'VIP', label: 'VIP' }
                  ]}
                  value={filterGroup}
                  onChange={(value) => setFilterGroup(value)}
                />
              </div>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
            >
              {filteredTerminals.every(t => selectedTerminals.includes(t.id)) && filteredTerminals.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredTerminals.length > 0 && filteredTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Device ID
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        MRN
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Group
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Connection
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            {terminal.deviceId}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.mrn}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium font-['Poppins',sans-serif] ${
                            terminal.group === 'Kids' ? 'bg-[#BDECFC]/20 text-[#0891B2]' :
                            terminal.group === 'Adults' ? 'bg-[#16274D]/10 text-[#16274D]' :
                            'bg-[#00B8D9]/10 text-[#00B8D9]'
                          }`}>
                            {terminal.group}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {terminal.isConnected ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[13px] font-medium text-green-600 font-['Poppins',sans-serif]">Connected</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-[13px] font-medium text-gray-500 font-['Poppins',sans-serif]">Disconnected</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Selected Count */}
          {selectedTerminals.length > 0 && (
            <div className="mt-4 p-3 bg-[#4EBEE3]/10 rounded-lg border border-[#4EBEE3]/30">
              <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                <span className="text-[#4EBEE3]">{selectedTerminals.length}</span> terminal{selectedTerminals.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-[rgba(249,250,251,0.5)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Wallpaper Modal Component
interface EditWallpaperModalProps {
  onClose: () => void;
  onSave: (data: { image: string }) => void;
  currentImage: string;
}

function EditWallpaperModal({ onClose, onSave, currentImage }: EditWallpaperModalProps) {
  const [wallpaperImage, setWallpaperImage] = useState<File | null>(null);
  const [wallpaperImageUrl, setWallpaperImageUrl] = useState<string>(currentImage);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (15MB limit)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 15) {
        toast.error('File is too large. Please use an image under 15MB.');
        e.target.value = ''; // Reset input
        return;
      }

      setWallpaperImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallpaperImageUrl(reader.result as string);
      };
      reader.onerror = () => {
        toast.error('Failed to load image. Please try again.');
        setWallpaperImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setWallpaperImage(null);
    setWallpaperImageUrl(currentImage);
  };

  const handleSave = () => {
    if (!wallpaperImageUrl) {
      toast.error('Please upload an image');
      return;
    }
    onSave({
      image: wallpaperImageUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
      <div className="bg-white rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[600px]">
        {/* Header */}
        <div className="h-[72.617px] border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Edit Wallpaper
            </h3>
            <button
              onClick={onClose}
              className="rounded-[10px] size-[32px] hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={20} className="text-gray-500" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              Image Upload
            </label>
            
            {!wallpaperImageUrl ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4ebee3] transition-all duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Click to upload wallpaper image
                    </p>
                    <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                      PNG, JPG up to 15MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                <img 
                  src={wallpaperImageUrl} 
                  alt="Wallpaper preview" 
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    {wallpaperImage?.name || 'Current wallpaper'}
                  </p>
                  <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                    Wallpaper image uploaded
                  </p>
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Remove image"
                >
                  <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[rgba(249,250,251,0.5)] border-t border-gray-200 h-[74.873px] flex items-center justify-end px-6 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
