import { useState } from 'react';
import { Building2, Layers, Plus, Edit2, Trash2, X, Check, User, Settings, Upload, FileText, Image as ImageIcon, Eye, Tablet, Monitor, MonitorX, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import PillTabs from './PillTabs';
import InlineEditCell from './InlineEditCell';
// Updated: 2025-01-12 - Checkbox column enabled

interface ProfileCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  order: number;
  selected: boolean;
  visibleTerminals: string[];
}

const initialCategories: ProfileCategory[] = [
  { id: '1', nameEn: 'Vision', nameAr: 'الرؤية', order: 1, selected: false, visibleTerminals: [] },
  { id: '2', nameEn: 'Mission', nameAr: 'الرسالة', order: 2, selected: false, visibleTerminals: [] },
  { id: '3', nameEn: 'Value', nameAr: 'القيم', order: 3, selected: false, visibleTerminals: [] },
  { id: '4', nameEn: 'Rights & Responsibilities', nameAr: 'حقوق وواجبات المريض', order: 4, selected: false, visibleTerminals: [] },
  { id: '5', nameEn: 'Evacuation map', nameAr: 'خريطة الإخلاء', order: 5, selected: false, visibleTerminals: [] },
  { id: '6', nameEn: 'Hotlines', nameAr: 'خطوط عاجلة', order: 6, selected: false, visibleTerminals: [] }
];

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

export default function HospitalProfilePage() {
  const [activeMainTab, setActiveMainTab] = useState<'categories' | 'content'>('categories');

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header - v2.1 with checkbox column */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#4ebee3]/10 flex items-center justify-center">
            <Building2 size={20} className="text-[#4ebee3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Hospital Profile</h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage hospital profile categories and content
            </p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Tabs and Content - Merged Container */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          {/* Pill Tabs */}
          <PillTabs
            tabs={[
              { id: 'categories', label: 'Profile Categories' },
              { id: 'content', label: 'Profile Content' }
            ]}
            activeTab={activeMainTab}
            onChange={setActiveMainTab}
          />

          {/* Tab Content */}
          {activeMainTab === 'categories' ? <ProfileCategoriesTab /> : <ProfileContentTab />}
        </div>
      </div>
    </div>
  );
}

// Profile Categories Tab Component
function ProfileCategoriesTab() {
  const [categories, setCategories] = useState<ProfileCategory[]>(initialCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProfileCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [visibilityModalId, setVisibilityModalId] = useState<string | null>(null);
  const [showBulkVisibilityModal, setShowBulkVisibilityModal] = useState(false);
  const [addVisibilityTerminals, setAddVisibilityTerminals] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: ''
  });

  const selectedCount = categories.filter(cat => cat.selected).length;

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat =>
    cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.nameAr.includes(searchQuery)
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCategories(categories.map(cat => ({ ...cat, selected: newSelectAll })));
  };

  const handleSelectCategory = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, selected: !cat.selected } : cat
    ));
  };

  const handleAdd = () => {
    if (!formData.nameEn.trim() || !formData.nameAr.trim()) {
      toast.error('Error', {
        description: 'Please fill in all fields',
        className: 'font-[Poppins,sans-serif]'
      });
      return;
    }

    const newCategory: ProfileCategory = {
      id: Date.now().toString(),
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      order: categories.length + 1,
      selected: false,
      visibleTerminals: addVisibilityTerminals
    };

    setCategories([...categories, newCategory]);
    setFormData({ nameEn: '', nameAr: '' });
    setAddVisibilityTerminals([]);
    setIsAddModalOpen(false);
    
    toast.success('Success', {
      description: 'Profile category added successfully',
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleEdit = () => {
    if (!editingCategory || !formData.nameEn.trim() || !formData.nameAr.trim()) {
      toast.error('Error', {
        description: 'Please fill in all fields',
        className: 'font-[Poppins,sans-serif]'
      });
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === editingCategory.id
        ? { ...cat, nameEn: formData.nameEn, nameAr: formData.nameAr }
        : cat
    ));

    setFormData({ nameEn: '', nameAr: '' });
    setIsEditModalOpen(false);
    setEditingCategory(null);
    
    toast.success('Success', {
      description: 'Profile category updated successfully',
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setDeleteConfirmId(null);
    
    toast.success('Success', {
      description: 'Profile category deleted successfully',
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleBulkDelete = () => {
    const selectedCategories = categories.filter(cat => cat.selected);
    if (selectedCategories.length === 0) {
      toast.error('Error', {
        description: 'Please select at least one category to delete',
        className: 'font-[Poppins,sans-serif]'
      });
      return;
    }

    setCategories(categories.filter(cat => !cat.selected));
    setSelectAll(false);
    
    toast.success('Success', {
      description: `${selectedCategories.length} categories deleted successfully`,
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleSaveVisibility = (categoryId: string, selectedTerminals: string[]) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, visibleTerminals: selectedTerminals } : cat
    ));
    
    toast.success('Success', {
      description: 'Visibility settings updated',
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleBulkSetVisibility = (selectedTerminals: string[]) => {
    setCategories(categories.map(cat =>
      cat.selected ? { ...cat, visibleTerminals: selectedTerminals } : cat
    ));
    
    toast.success('Success', {
      description: `Visibility updated for ${selectedCount} categories`,
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const openEditModal = (category: ProfileCategory) => {
    setEditingCategory(category);
    setFormData({ nameEn: category.nameEn, nameAr: category.nameAr });
    setIsEditModalOpen(true);
  };

  const handleInlineEdit = (categoryId: string, field: 'nameEn' | 'nameAr', value: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
    toast.success('Success', {
      description: 'Category updated successfully',
      className: 'font-[Poppins,sans-serif]'
    });
  };

  return (
    <>
      {/* Actions Bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
        {/* Search Bar - Left Side */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
          />
        </div>
        
        {/* Action Buttons - Right Side */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <>
              <button
                onClick={() => setShowBulkVisibilityModal(true)}
                className="flex items-center gap-2 h-9 px-4 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#4EBEE3]/5 transition-colors"
              >
                <Eye size={16} strokeWidth={2} />
                Set Visibility ({selectedCount})
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 h-9 px-4 bg-red-500 text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} strokeWidth={2} />
                Delete ({selectedCount})
              </button>
            </>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 h-9 px-4 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      {categories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#16274D] tracking-wider font-['Poppins',sans-serif]">
                  Name (EN)
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#16274D]  tracking-wider font-['Poppins',sans-serif]">
                  Name (AR)
                </th>
                <th className="px-6 py-3 text-center text-[12px] font-semibold text-[#16274D]  tracking-wider font-['Poppins',sans-serif]">
                  Visibility
                </th>
                <th className="px-6 py-3 text-center text-[12px] font-semibold text-[#16274D] tracking-wider font-['Poppins',sans-serif]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={category.selected}
                      onChange={() => handleSelectCategory(category.id)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                    <InlineEditCell
                      value={category.nameEn}
                      onSave={(value) => handleInlineEdit(category.id, 'nameEn', value)}
                      className="text-[13px] text-[#16274D] font-['Poppins',sans-serif]"
                    />
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif]" dir="rtl">
                    <InlineEditCell
                      value={category.nameAr}
                      onSave={(value) => handleInlineEdit(category.id, 'nameAr', value)}
                      className="text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif]"
                      dir="rtl"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setVisibilityModalId(category.id)}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all font-['Poppins',sans-serif] text-[13px] font-medium"
                    >
                      Set ({category.visibleTerminals.length})
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Layers size={32} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No Categories Yet
          </h3>
          <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
            Start by adding your first profile category. These will appear as tabs in the hospital profile section.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4ebee3] text-white rounded-lg text-[14px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2} />
            Add First Category
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddCategoryModal
          formData={formData}
          setFormData={setFormData}
          visibilityTerminals={addVisibilityTerminals}
          setVisibilityTerminals={setAddVisibilityTerminals}
          onClose={() => {
            setIsAddModalOpen(false);
            setFormData({ nameEn: '', nameAr: '' });
            setAddVisibilityTerminals([]);
          }}
          onSave={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Edit Profile Category
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                  setFormData({ nameEn: '', nameAr: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                  placeholder="Enter category name in English"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                  placeholder="أدخل اسم الفئة بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                  setFormData({ nameEn: '', nameAr: '' });
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Visibility Modal */}
      {visibilityModalId && (
        <VisibilityModal
          onClose={() => setVisibilityModalId(null)}
          category={categories.find(c => c.id === visibilityModalId)!}
          terminals={mockTerminals}
          onSave={(selectedTerminals) => {
            handleSaveVisibility(visibilityModalId, selectedTerminals);
            setVisibilityModalId(null);
          }}
        />
      )}

      {/* Bulk Visibility Modal */}
      {showBulkVisibilityModal && (
        <BulkVisibilityModal
          onClose={() => setShowBulkVisibilityModal(false)}
          categoryCount={selectedCount}
          terminals={mockTerminals}
          onSave={(selectedTerminals) => {
            handleBulkSetVisibility(selectedTerminals);
            setShowBulkVisibilityModal(false);
          }}
        />
      )}
    </>
  );
}

// Add Category Modal Component
interface AddCategoryModalProps {
  formData: { nameEn: string; nameAr: string };
  setFormData: (data: { nameEn: string; nameAr: string }) => void;
  visibilityTerminals: string[];
  setVisibilityTerminals: (terminals: string[]) => void;
  onClose: () => void;
  onSave: () => void;
}

function AddCategoryModal({ formData, setFormData, visibilityTerminals, setVisibilityTerminals, onClose, onSave }: AddCategoryModalProps) {
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Add Profile Category
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                Name (English)
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                placeholder="Enter category name in English"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                Name (Arabic)
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                placeholder="أدخل اسم الفئة بالعربية"
                dir="rtl"
              />
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
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-[12px]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Visibility Modal for Add */}
      {showVisibilityModal && (
        <VisibilityModal
          onClose={() => setShowVisibilityModal(false)}
          category={{ id: 'new', nameEn: formData.nameEn || 'New Category', nameAr: formData.nameAr || 'فئة جديدة', order: 0, selected: false, visibleTerminals: visibilityTerminals }}
          terminals={mockTerminals}
          onSave={(selectedTerminals) => {
            setVisibilityTerminals(selectedTerminals);
            setShowVisibilityModal(false);
          }}
          isAddMode={true}
        />
      )}
    </>
  );
}

// Visibility Modal Component
interface VisibilityModalProps {
  onClose: () => void;
  category: ProfileCategory;
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
  isAddMode?: boolean;
}

type TerminalSortField = 'deviceId' | 'mrn' | 'roomNo' | 'bedNo' | 'building' | 'floor' | 'poc' | 'group' | 'isConnected';
type SortDirection = 'asc' | 'desc';

function VisibilityModal({ onClose, category, terminals, onSave, isAddMode = false }: VisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>(category.visibleTerminals);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
    if (!isAddMode) {
      toast.success('Visibility settings updated');
    }
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Get unique groups
  const groups = Array.from(new Set(terminals.map(t => t.group)));

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header - VisibilityModal (Single Category) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {category.nameEn}
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
                  <MonitorX size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Filter by Group */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
              Filter by Group
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Terminals Table - Visibility Modal (Single Category) */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('deviceId')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Device ID <SortIcon field="deviceId" />
                    </th>
                    <th
                      onClick={() => handleSort('mrn')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      MRN <SortIcon field="mrn" />
                    </th>
                    <th
                      onClick={() => handleSort('roomNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Room <SortIcon field="roomNo" />
                    </th>
                    <th
                      onClick={() => handleSort('bedNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Bed <SortIcon field="bedNo" />
                    </th>
                    <th
                      onClick={() => handleSort('building')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Building <SortIcon field="building" />
                    </th>
                    <th
                      onClick={() => handleSort('floor')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Floor <SortIcon field="floor" />
                    </th>
                    <th
                      onClick={() => handleSort('poc')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      POC <SortIcon field="poc" />
                    </th>
                    <th
                      onClick={() => handleSort('group')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Group <SortIcon field="group" />
                    </th>
                    <th
                      onClick={() => handleSort('isConnected')}
                      className="px-4 py-3 text-center text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Status <SortIcon field="isConnected" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedTerminals.map((terminal) => (
                    <tr key={terminal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTerminals.includes(terminal.id)}
                          onChange={() => handleTerminalSelect(terminal.id)}
                          className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.deviceId}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.mrn}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.roomNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.bedNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.building}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.floor}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.poc}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.group}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                          terminal.isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {terminal.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
            <span className="font-semibold">{selectedTerminals.length}</span> terminal{selectedTerminals.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bulk Visibility Modal Component  
interface BulkVisibilityModalProps {
  onClose: () => void;
  categoryCount: number;
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
}

function BulkVisibilityModal({ onClose, categoryCount, terminals, onSave }: BulkVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
    toast.success(`Visibility updated for ${categoryCount} categories`);
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Get unique groups
  const groups = Array.from(new Set(terminals.map(t => t.group)));

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {categoryCount} Categor{categoryCount !== 1 ? 'ies' : 'y'}
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
                  <MonitorX size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Filter by Group */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
              Filter by Group
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Terminals Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('deviceId')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Device ID <SortIcon field="deviceId" />
                    </th>
                    <th
                      onClick={() => handleSort('mrn')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      MRN <SortIcon field="mrn" />
                    </th>
                    <th
                      onClick={() => handleSort('roomNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Room <SortIcon field="roomNo" />
                    </th>
                    <th
                      onClick={() => handleSort('bedNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Bed <SortIcon field="bedNo" />
                    </th>
                    <th
                      onClick={() => handleSort('building')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Building <SortIcon field="building" />
                    </th>
                    <th
                      onClick={() => handleSort('floor')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Floor <SortIcon field="floor" />
                    </th>
                    <th
                      onClick={() => handleSort('poc')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      POC <SortIcon field="poc" />
                    </th>
                    <th
                      onClick={() => handleSort('group')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Group <SortIcon field="group" />
                    </th>
                    <th
                      onClick={() => handleSort('isConnected')}
                      className="px-4 py-3 text-center text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Status <SortIcon field="isConnected" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedTerminals.map((terminal) => (
                    <tr key={terminal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTerminals.includes(terminal.id)}
                          onChange={() => handleTerminalSelect(terminal.id)}
                          className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.deviceId}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.mrn}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.roomNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.bedNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.building}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.floor}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.poc}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.group}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                          terminal.isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {terminal.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
            <span className="font-semibold">{selectedTerminals.length}</span> terminal{selectedTerminals.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Content Tab Component
function ProfileContentTab() {
  const [categories] = useState(initialCategories.map(cat => ({ ...cat, visible: true })));
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

  const handleFileUpload = (language: 'en' | 'ar', file: File) => {
    const url = URL.createObjectURL(file);
    const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
    
    setTabContents(prev => {
      const existing = prev.find(tc => tc.categoryId === activeTab);
      if (existing) {
        return prev.map(tc =>
          tc.categoryId === activeTab
            ? {
                ...tc,
                ...(language === 'en'
                  ? { fileEnUrl: url, fileEnName: file.name, fileEnType: fileType }
                  : { fileArUrl: url, fileArName: file.name, fileArType: fileType })
              }
            : tc
        );
      } else {
        return [
          ...prev,
          {
            categoryId: activeTab,
            fileEnUrl: language === 'en' ? url : '',
            fileEnName: language === 'en' ? file.name : '',
            fileEnType: language === 'en' ? fileType : null,
            fileArUrl: language === 'ar' ? url : '',
            fileArName: language === 'ar' ? file.name : '',
            fileArType: language === 'ar' ? fileType : null
          }
        ];
      }
    });

    toast.success('Success', {
      description: `File uploaded successfully for ${language === 'en' ? 'English' : 'Arabic'}`,
      className: 'font-[Poppins,sans-serif]'
    });
  };

  const handleDeleteFile = (language: 'en' | 'ar') => {
    setTabContents(prev =>
      prev.map(tc =>
        tc.categoryId === activeTab
          ? {
              ...tc,
              ...(language === 'en'
                ? { fileEnUrl: '', fileEnName: '', fileEnType: null }
                : { fileArUrl: '', fileArName: '', fileArType: null })
            }
          : tc
      )
    );

    toast.success('Success', {
      description: `File removed successfully`,
      className: 'font-[Poppins,sans-serif]'
    });
  };

  return (
    <>
      {visibleCategories.length > 0 ? (
        <>
          {/* Category Tabs */}
          <div className="border-b border-gray-200 bg-gray-50/30 px-6 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-0">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`
                    px-6 py-3 text-[13px] font-medium font-['Poppins',sans-serif] 
                    border-b-2 transition-all duration-200 whitespace-nowrap
                    ${activeTab === category.id
                      ? 'border-[#4ebee3] text-[#4ebee3] bg-white'
                      : 'border-transparent text-[#16274D]/60 hover:text-[#16274D] hover:bg-gray-50/50'
                    }
                  `}
                >
                  {category.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* File Upload Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English File */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  English Content
                </h3>
                
                {activeContent?.fileEnUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {activeContent.fileEnType === 'image' ? (
                        <ImageIcon size={20} className="text-[#4ebee3]" />
                      ) : (
                        <FileText size={20} className="text-[#4ebee3]" />
                      )}
                      <span className="flex-1 text-[13px] text-[#16274D] font-['Poppins',sans-serif] truncate">
                        {activeContent.fileEnName}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewFile({
                          url: activeContent.fileEnUrl,
                          type: activeContent.fileEnType!,
                          name: activeContent.fileEnName
                        })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
                      >
                        <Eye size={16} strokeWidth={2} />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeleteFile('en')}
                        className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4ebee3] hover:bg-[#4ebee3]/5 transition-all">
                      <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-[13px] text-[#16274D] font-['Poppins',sans-serif] mb-1">
                        Click to upload
                      </p>
                      <p className="text-[12px] text-[#16274D]/60 font-['Poppins',sans-serif]">
                        Image or PDF (max 15MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('en', file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Arabic File */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-[15px] font-semibold text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] mb-4" dir="rtl">
                  المحتوى العربي
                </h3>
                
                {activeContent?.fileArUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" dir="rtl">
                      <span className="flex-1 text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] truncate">
                        {activeContent.fileArName}
                      </span>
                      {activeContent.fileArType === 'image' ? (
                        <ImageIcon size={20} className="text-[#4ebee3]" />
                      ) : (
                        <FileText size={20} className="text-[#4ebee3]" />
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteFile('ar')}
                        className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 rounded-lg text-[13px] font-medium font-['Baloo_Bhaijaan_2',sans-serif] hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => setPreviewFile({
                          url: activeContent.fileArUrl,
                          type: activeContent.fileArType!,
                          name: activeContent.fileArName
                        })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Baloo_Bhaijaan_2',sans-serif] hover:bg-[#3da5ca] transition-colors"
                      >
                        <Eye size={16} strokeWidth={2} />
                        معاينة
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4ebee3] hover:bg-[#4ebee3]/5 transition-all">
                      <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] mb-1" dir="rtl">
                        انقر للتحميل
                      </p>
                      <p className="text-[12px] text-[#16274D]/60 font-['Baloo_Bhaijaan_2',sans-serif]" dir="rtl">
                        صورة أو PDF (بحد أقصى 15 ميجابايت)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('ar', file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User size={32} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No Categories Available
          </h3>
          <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif]">
            Please add categories in the Profile Categories tab first
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Preview: {previewFile.name}
              </h2>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  title={previewFile.name}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Configure Tab
              </h2>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={configFormData.nameEn}
                  onChange={(e) => setConfigFormData({ ...configFormData, nameEn: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={configFormData.nameAr}
                  onChange={(e) => setConfigFormData({ ...configFormData, nameAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Baloo_Bhaijaan_2',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
                  dir="rtl"
                  disabled
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="visible"
                  checked={configFormData.visible}
                  onChange={(e) => setConfigFormData({ ...configFormData, visible: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#4ebee3] focus:ring-[#4ebee3] cursor-pointer"
                  disabled
                />
                <label htmlFor="visible" className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] cursor-pointer">
                  Visible to patients
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
