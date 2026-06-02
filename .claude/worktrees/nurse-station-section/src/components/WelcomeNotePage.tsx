import { useState, useEffect } from 'react';
import { FileText, Plus, X, Trash2, Search, Edit, Save, AlertTriangle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import InlineTextarea from './InlineTextarea';
import { UnifiedVisibilityModal } from './UnifiedVisibilityModal';

interface WelcomeNote {
  id: string;
  title: string;
  englishDescription: string;
  arabicDescription: string;
  selected: boolean;
  visibleTerminals: string[]; // Array of terminal IDs
}

// Terminal interface for visibility modal
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

// Generate mock terminals - matching the Wallpaper page structure
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

export default function WelcomeNotePage() {
  const [welcomeNotes, setWelcomeNotes] = useState<WelcomeNote[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_welcome_notes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Migrate old data: add visibleTerminals if missing
          return parsed.map((note: any) => ({
            ...note,
            visibleTerminals: note.visibleTerminals || []
          }));
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityModalNoteId, setVisibilityModalNoteId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<ConfirmDeleteModalProps>({
    isOpen: false,
    onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
    onConfirm: () => {},
    title: '',
    message: ''
  });

  // Mock terminals data (same as in Wallpaper page)
  const terminals: Terminal[] = generateMockTerminals();

  // Save to localStorage whenever welcomeNotes change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_welcome_notes', JSON.stringify(welcomeNotes));
    }
  }, [welcomeNotes]);

  const handleInlineEdit = (id: string, field: keyof WelcomeNote, newValue: any) => {
    setWelcomeNotes(welcomeNotes.map(note => 
      note.id === id ? { ...note, [field]: newValue } : note
    ));
    toast.success('Welcome Note Updated', {
      description: 'Changes saved successfully',
    });
  };

  const handleAddWelcomeNote = (title: string, englishDescription: string, arabicDescription: string) => {
    const newWelcomeNote: WelcomeNote = {
      id: Date.now().toString(),
      title,
      englishDescription,
      arabicDescription,
      selected: false,
      visibleTerminals: [] // Initialize with an empty array
    };

    setWelcomeNotes(prev => [...prev, newWelcomeNote]);
    setIsModalOpen(false);
    toast.success('Welcome Note Added', {
      description: `${title} has been added successfully`,
      duration: 2000,
    });
  };

  const handleToggleSelect = (id: string) => {
    setWelcomeNotes(prev => prev.map(note => 
      note.id === id ? { ...note, selected: !note.selected } : note
    ));
  };

  const handleToggleSelectAll = () => {
    const allSelected = filteredNotes.every(note => note.selected);
    setWelcomeNotes(prev => prev.map(note => {
      // Only toggle notes that are in the filtered results
      if (filteredNotes.find(fn => fn.id === note.id)) {
        return { ...note, selected: !allSelected };
      }
      return note;
    }));
  };

  const handleDeleteSelected = () => {
    const selectedCount = welcomeNotes.filter(note => note.selected).length;
    setWelcomeNotes(prev => prev.filter(note => !note.selected));
    toast.success('Welcome Notes Deleted', {
      description: `${selectedCount} note${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const handleDeleteSingle = (id: string) => {
    const noteToDelete = welcomeNotes.find(note => note.id === id);
    setWelcomeNotes(prev => prev.filter(note => note.id !== id));
    toast.success('Welcome Note Deleted', {
      description: `${noteToDelete?.title} has been deleted successfully`,
      duration: 2000,
    });
  };

  const filteredNotes = welcomeNotes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.englishDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.arabicDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSelectedNotes = welcomeNotes.some(note => note.selected);

  const handleSaveVisibility = (noteId: string, selectedTerminals: string[]) => {
    setWelcomeNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, visibleTerminals: selectedTerminals } : note
    ));
    setVisibilityModalNoteId(null);
    toast.success('Visibility Updated', {
      description: 'Changes saved successfully',
    });
  };

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <MessageCircle size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] font-bold font-normal">
              Welcome Note
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Create and manage welcome notes for patients
            </p>
          </div>
        </div>
        {welcomeNotes.length > 0 && (
          <div className="flex items-center justify-end gap-3">
            {hasSelectedNotes && (
              <button
                onClick={() => {
                  const selectedCount = welcomeNotes.filter(note => note.selected).length;
                  setConfirmDeleteModal({
                    isOpen: true,
                    onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
                    onConfirm: handleDeleteSelected,
                    title: 'Delete Welcome Notes',
                    message: `Are you sure you want to delete ${selectedCount} welcome note${selectedCount > 1 ? 's' : ''}?`
                  });
                }}
                className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <Trash2 size={16} strokeWidth={2} />
                Delete
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
            >
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <Plus size={14} strokeWidth={2.5} />
              </div>
              Add Welcome Note
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {welcomeNotes.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Welcome Notes
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  No welcome notes have been added yet. Create your first welcome note to get started.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Welcome Note
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search welcome notes..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>
          </div>

          {/* Welcome Notes Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredNotes.length > 0 && filteredNotes.every(note => note.selected)}
                        onChange={handleToggleSelectAll}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]  tracking-wide">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]  tracking-wide">
                     Description (EN)
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]  tracking-wide">
                      Description (AR)
                    </th>
                    <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]  tracking-wide">
                      Visibility
                    </th>
                    <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]  tracking-wide w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note, index) => (
                    <tr 
                      key={note.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === filteredNotes.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={note.selected}
                          onChange={() => handleToggleSelect(note.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineInput
                          value={note.title}
                          onChange={(value) => handleInlineEdit(note.id, 'title', value)}
                          className="font-medium"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineTextarea
                          value={note.englishDescription}
                          onChange={(value) => handleInlineEdit(note.id, 'englishDescription', value)}
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <InlineTextarea
                          value={note.arabicDescription}
                          onChange={(value) => handleInlineEdit(note.id, 'arabicDescription', value)}
                          dir="rtl"
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setVisibilityModalNoteId(note.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all font-['Poppins',sans-serif] text-[13px] font-medium"
                        >
                          Set ({note.visibleTerminals.length})
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setConfirmDeleteModal({
                              isOpen: true,
                              onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
                              onConfirm: () => handleDeleteSingle(note.id),
                              title: 'Delete Welcome Note',
                              message: `Are you sure you want to delete the welcome note "${note.title}"?`
                            })}
                            className="p-2 text-[#EF4444] hover:text-[#DC2626] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Welcome Note Modal */}
      <AddWelcomeNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddWelcomeNote}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.onClose}
        onConfirm={confirmDeleteModal.onConfirm}
        title={confirmDeleteModal.title}
        message={confirmDeleteModal.message}
      />

      {/* Visibility Modal */}
      {visibilityModalNoteId && (() => {
        const note = welcomeNotes.find(n => n.id === visibilityModalNoteId);
        return (
          <UnifiedVisibilityModal
            isOpen={true}
            onClose={() => setVisibilityModalNoteId(null)}
            itemName={note?.title || 'Welcome Note'}
            terminals={terminals}
            currentSelection={note?.visibleTerminals || []}
            onSave={(selectedTerminals) => handleSaveVisibility(visibilityModalNoteId, selectedTerminals)}
          />
        );
      })()}
    </div>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-[#EF4444]" strokeWidth={2} />
          </div>
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {title}
          </h3>
        </div>

        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6 ml-15">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddWelcomeNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, englishDescription: string, arabicDescription: string) => void;
}

function AddWelcomeNoteModal({ isOpen, onClose, onSave }: AddWelcomeNoteModalProps) {
  const [title, setTitle] = useState('');
  const [englishDescription, setEnglishDescription] = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  
  // Welcome Note counter for auto-generation
  const [welcomeNoteCounter, setWelcomeNoteCounter] = useState(() => {
    const stored = localStorage.getItem('careinn_welcome_note_counter');
    return stored ? parseInt(stored, 10) : 1;
  });

  // Auto-generate welcome note title when modal opens
  useEffect(() => {
    if (isOpen) {
      const autoTitle = `WN-${welcomeNoteCounter}`;
      setTitle(autoTitle);
    }
  }, [isOpen, welcomeNoteCounter]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim() && englishDescription.trim() && arabicDescription.trim()) {
      onSave(title, englishDescription, arabicDescription);
      // Increment the welcome note counter
      setWelcomeNoteCounter(prev => prev + 1);
      localStorage.setItem('careinn_welcome_note_counter', (welcomeNoteCounter + 1).toString());
      setTitle('');
      setEnglishDescription('');
      setArabicDescription('');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setEnglishDescription('');
    setArabicDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Add Welcome Note
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            readOnly
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 font-['Poppins',sans-serif] text-[14px] text-gray-500 cursor-not-allowed"
          />
          <p className="text-[11px] text-gray-500 mt-1 font-['Poppins',sans-serif]">
            Auto-generated welcome note ID
          </p>
        </div>

        {/* English Description Field */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            English Description
          </label>
          <textarea
            value={englishDescription}
            onChange={(e) => setEnglishDescription(e.target.value)}
            placeholder="Enter English description..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
          />
        </div>

        {/* Arabic Description Field */}
        <div className="mb-6">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            Arabic Description
          </label>
          <textarea
            value={arabicDescription}
            onChange={(e) => setArabicDescription(e.target.value)}
            placeholder="أدخل الوصف العربي..."
            rows={4}
            dir="rtl"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}