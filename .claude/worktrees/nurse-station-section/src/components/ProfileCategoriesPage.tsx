import { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  order: number;
  selected: boolean;
  visibility: number;
}

const initialCategories: ProfileCategory[] = [
  { id: '1', nameEn: 'Vision', nameAr: 'الرؤية', order: 1, selected: false, visibility: 3 },
  { id: '2', nameEn: 'Mission', nameAr: 'الرسالة', order: 2, selected: false, visibility: 2 },
  { id: '3', nameEn: 'Value', nameAr: 'القيم', order: 3, selected: false, visibility: 5 },
  { id: '4', nameEn: 'Rights & Responsibilities', nameAr: 'حقوق وواجبات المريض', order: 4, selected: false, visibility: 1 },
  { id: '5', nameEn: 'Evacuation map', nameAr: 'خريطة الإخلاء', order: 5, selected: false, visibility: 4 },
  { id: '6', nameEn: 'Hotlines', nameAr: 'خطوط عاجلة', order: 6, selected: false, visibility: 2 }
];

export default function ProfileCategoriesPage() {
  const [categories, setCategories] = useState<ProfileCategory[]>(initialCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProfileCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: ''
  });

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
        duration: 2000,
      });
      return;
    }

    const newCategory: ProfileCategory = {
      id: Date.now().toString(),
      nameEn: formData.nameEn.trim(),
      nameAr: formData.nameAr.trim(),
      order: categories.length + 1,
      selected: false,
      visibility: 3
    };

    setCategories([...categories, newCategory]);
    setFormData({ nameEn: '', nameAr: '' });
    setIsAddModalOpen(false);
    
    toast.success('Category Added', {
      description: 'Profile category has been added successfully',
      duration: 2000,
    });
  };

  const handleEdit = (category: ProfileCategory) => {
    setEditingCategory(category);
    setFormData({
      nameEn: category.nameEn,
      nameAr: category.nameAr
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.nameEn.trim() || !formData.nameAr.trim()) {
      toast.error('Error', {
        description: 'Please fill in all fields',
        duration: 2000,
      });
      return;
    }

    if (!editingCategory) return;

    setCategories(categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, nameEn: formData.nameEn.trim(), nameAr: formData.nameAr.trim() }
        : cat
    ));
    
    setFormData({ nameEn: '', nameAr: '' });
    setEditingCategory(null);
    setIsEditModalOpen(false);
    
    toast.success('Category Updated', {
      description: 'Profile category has been updated successfully',
      duration: 2000,
    });
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setDeleteConfirmId(null);
    
    toast.success('Category Deleted', {
      description: 'Profile category has been deleted successfully',
      duration: 2000,
    });
  };

  const handleBulkDelete = () => {
    const selectedIds = categories.filter(cat => cat.selected).map(cat => cat.id);
    setCategories(categories.filter(cat => !cat.selected));
    setSelectAll(false);
    
    toast.success('Categories Deleted', {
      description: `${selectedIds.length} ${selectedIds.length === 1 ? 'category' : 'categories'} deleted successfully`,
      duration: 2000,
    });
  };

  const handleDeselectAll = () => {
    setCategories(categories.map(cat => ({ ...cat, selected: false })));
    setSelectAll(false);
  };

  const selectedCount = categories.filter(cat => cat.selected).length;
  const hasSelectedCategories = selectedCount > 0;

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setFormData({ nameEn: '', nameAr: '' });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setFormData({ nameEn: '', nameAr: '' });
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Profile Categories</h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Manage hospital profile categories displayed in the patient terminal
              </p>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-3">
              {hasSelectedCategories && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Trash2 size={18} strokeWidth={2} />
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <Plus size={18} strokeWidth={2} />
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State or Table */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Layers size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Profile Categories Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start by adding your first profile category. These will appear as tabs in the hospital profile section.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add First Category
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-center w-16">
                    <div 
                      onClick={handleSelectAll}
                      className={`w-5 h-5 rounded border-2 cursor-pointer mx-auto transition-all ${
                        selectAll
                          ? 'bg-[#4EBEE3] border-[#4EBEE3]'
                          : 'border-gray-300 hover:border-[#4EBEE3]'
                      } flex items-center justify-center`}
                    >
                      {selectAll && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Category (EN)
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Category (AR)
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-32">
                    Visibility
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <div 
                        onClick={() => handleSelectCategory(category.id)}
                        className={`w-5 h-5 rounded border-2 cursor-pointer mx-auto transition-all ${
                          category.selected
                            ? 'bg-[#4EBEE3] border-[#4EBEE3]'
                            : 'border-gray-300 hover:border-[#4EBEE3]'
                        } flex items-center justify-center`}
                      >
                        {category.selected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                        {category.nameEn}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif] font-medium">
                        {category.nameAr}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif] font-medium">
                        {category.visibility}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(category.id)}
                          className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
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
        </>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <Plus size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Add Category
                  </h2>
                  <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
                    Create a new profile category
                  </p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#6B7280]" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Category (EN) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Enter English category name"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Category (AR) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أدخل اسم الفئة بالعربية"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t-2 border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeAddModal}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] hover:bg-gray-50 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <Edit2 size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Edit Category
                  </h2>
                  <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
                    Update profile category details
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#6B7280]" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Category (EN) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Enter English category name"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                  Category (AR) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أدخل اسم الفئة بالعربية"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t-2 border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] hover:bg-gray-50 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#EF4444]/20 rounded-lg flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-[#EF4444]" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Delete Category
              </h3>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif] mb-6">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-[#16274D] hover:bg-gray-50 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
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