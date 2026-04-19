import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, Edit3, X, Upload, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import InlineTextarea from './InlineTextarea';
import InlineImageUpload from './InlineImageUpload';
import cbahiLogo from 'figma:asset/232156706526ba9a383a52a971062618a9589d03.png';
import isoLogo from 'figma:asset/6c410ff5efc7812722132da94a5737ea62157517.png';

interface Accreditation {
  id: string;
  title: string;
  descriptionEn: string;
  descriptionAr: string;
  logoUrl: string;
  createdAt: string;
}

const defaultAccreditations: Accreditation[] = [
  {
    id: '1',
    title: 'CBAHI',
    descriptionEn: 'Central Board for Accreditation of Healthcare Institutions - Accredited healthcare facility meeting national standards for quality and patient safety.',
    descriptionAr: 'المركز السعودي لاعتماد المنشآت الصحية - منشأة صحية معتمدة تلبي المعايير الوطنية للجودة وسلامة المرضى.',
    logoUrl: cbahiLogo,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'ISO 9001:2015',
    descriptionEn: 'International Organization for Standardization - Quality Management System certification demonstrating consistent quality service delivery.',
    descriptionAr: 'المنظمة الدولية للمعايير - شهادة نظام إدارة الجودة التي تثبت تقديم خدمات ذات جودة متسقة.',
    logoUrl: isoLogo,
    createdAt: new Date().toISOString(),
  },
];

export default function AccreditationPage() {
  const [accreditations, setAccreditations] = useState<Accreditation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_accreditations');
      const dataVersion = localStorage.getItem('careinn_accreditations_version');
      const currentVersion = '2025-cbahi-iso';
      
      // If version is outdated or missing, use fresh data
      if (dataVersion !== currentVersion) {
        localStorage.setItem('careinn_accreditations_version', currentVersion);
        return defaultAccreditations;
      }
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // If saved data is empty, return default accreditations
          if (parsed.length === 0) {
            return defaultAccreditations;
          }
          return parsed;
        } catch (e) {
          return defaultAccreditations;
        }
      }
    }
    return defaultAccreditations;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccreditation, setEditingAccreditation] = useState<Accreditation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_accreditations', JSON.stringify(accreditations));
    }
  }, [accreditations]);

  const resetForm = () => {
    setTitle('');
    setDescriptionEn('');
    setDescriptionAr('');
    setLogo(null);
    setLogoUrl('');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoUrl('');
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoUrl('');
  };

  const handleAddAccreditation = () => {
    if (!title.trim()) {
      toast.error('Title Required', {
        description: 'Please enter an accreditation title',
        duration: 2000,
      });
      return;
    }

    const newAccreditation: Accreditation = {
      id: Date.now().toString(),
      title,
      descriptionEn,
      descriptionAr,
      logoUrl,
      createdAt: new Date().toISOString(),
    };

    setAccreditations([...accreditations, newAccreditation]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Accreditation Added', {
      description: 'Accreditation added successfully',
      duration: 2000,
    });
  };

  const handleEditAccreditation = () => {
    if (!editingAccreditation) return;

    if (!title.trim()) {
      toast.error('Title Required', {
        description: 'Please enter an accreditation title',
        duration: 2000,
      });
      return;
    }

    setAccreditations(accreditations.map(a => 
      a.id === editingAccreditation.id
        ? {
            ...a,
            title,
            descriptionEn,
            descriptionAr,
            logoUrl,
          }
        : a
    ));

    setIsEditModalOpen(false);
    setEditingAccreditation(null);
    resetForm();
    toast.success('Accreditation Updated', {
      description: 'Accreditation updated successfully',
      duration: 2000,
    });
  };

  const handleDeleteAccreditation = (id: string) => {
    setAccreditations(accreditations.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    toast.success('Accreditation Deleted', {
      description: 'Accreditation deleted successfully',
      duration: 2000,
    });
  };

  const handleInlineEdit = (id: string, field: keyof Accreditation, newValue: any) => {
    setAccreditations(accreditations.map(acc => 
      acc.id === id ? { ...acc, [field]: newValue } : acc
    ));
  };

  const handleEdit = (accreditation: Accreditation) => {
    setEditingAccreditation(accreditation);
    setTitle(accreditation.title);
    setDescriptionEn(accreditation.descriptionEn);
    setDescriptionAr(accreditation.descriptionAr);
    setLogoUrl(accreditation.logoUrl);
    setIsEditModalOpen(true);
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredAccreditations.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAccreditations.map(a => a.id));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedRows.length;
    setAccreditations(accreditations.filter(a => !selectedRows.includes(a.id)));
    setSelectedRows([]);
    toast.success('Accreditations Deleted', {
      description: `${selectedCount} accreditation${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const filteredAccreditations = accreditations.filter(accreditation => {
    const matchesSearch = 
      accreditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accreditation.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accreditation.descriptionAr.includes(searchQuery);
    
    return matchesSearch;
  });

  const hasSelectedRows = selectedRows.length > 0;

  return (
    <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <Award size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Accreditation
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage hospital accreditations and certifications
            </p>
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {accreditations.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl border-2 border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Award size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Accreditations Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start adding hospital accreditations and certifications to get started.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Accreditation
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Top Bar */}
          <motion.div 
            className="flex items-center justify-between mb-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
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
                  placeholder="Search accreditations..."
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
                Add Accreditation
              </button>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div 
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={filteredAccreditations.length > 0 && selectedRows.length === filteredAccreditations.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Logo
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Title
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                     Description (EN)
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                     Description (AR)
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccreditations.map((accreditation) => (
                  <tr 
                    key={accreditation.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(accreditation.id)}
                        onChange={() => handleRowSelect(accreditation.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineImageUpload
                        imageUrl={accreditation.logoUrl}
                        onImageChange={(imageUrl) => {
                          handleInlineEdit(accreditation.id, 'logoUrl', imageUrl);
                          toast.success('Logo updated successfully');
                        }}
                        altText={accreditation.title}
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineInput
                        value={accreditation.title}
                        onChange={(value) => handleInlineEdit(accreditation.id, 'title', value)}
                        className="font-medium"
                        placeholder="Accreditation Title"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineTextarea
                        value={accreditation.descriptionEn}
                        onChange={(value) => handleInlineEdit(accreditation.id, 'descriptionEn', value)}
                        placeholder="English Description"
                        rows={2}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineTextarea
                        value={accreditation.descriptionAr}
                        onChange={(value) => handleInlineEdit(accreditation.id, 'descriptionAr', value)}
                        placeholder="Arabic Description"
                        dir="rtl"
                        rows={2}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => setDeleteConfirmId(accreditation.id)}
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
          </motion.div>
        </>
      )}

      {/* Add Accreditation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Accreditation</h3>
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
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter accreditation title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Enter English description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="أدخل الوصف بالعربية"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Upload Logo</label>
                
                {!logoUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4EBEE3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                        </div>
                        <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload logo image
                        </p>
                        <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {logo?.name || 'Logo image'}
                      </p>
                      <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Logo image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
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
                onClick={handleAddAccreditation}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Accreditation Modal */}
      {isEditModalOpen && editingAccreditation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Edit Accreditation</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAccreditation(null);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter accreditation title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Enter English description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="أدخل الوصف بالعربية"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Upload Logo</label>
                
                {!logoUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4EBEE3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                        </div>
                        <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload logo image
                        </p>
                        <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {logo?.name || 'Logo image'}
                      </p>
                      <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Logo image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAccreditation(null);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAccreditation}
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
              <h3 className="text-[18px] font-semibold text-[#16274D]">Delete Accreditation</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-[#6B7280]">
                Are you sure you want to delete this accreditation? This action cannot be undone.
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
                onClick={() => handleDeleteAccreditation(deleteConfirmId)}
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