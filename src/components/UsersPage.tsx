import React, { useState, useEffect } from 'react';
import { Users2, Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { SingleSelectDropdown } from './UnifiedDropdown';
import { useCareSuite } from '../hooks/useCareSuite';
import { userService, USER_EVENT, User } from '../services/userService';

const USER_ROLES = ['IT', 'PX', 'Nurse Station'];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  useEffect(() => {
    const load = () => setUsers(userService.listUsers());
    load();
    window.addEventListener(USER_EVENT, load);
    return () => window.removeEventListener(USER_EVENT, load);
  }, []);
  
  // Modal form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [department, setDepartment] = useState('');
  const [teamCategoryId, setTeamCategoryId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [modalImage, setModalImage] = useState<string>('');
  const [userType, setUserType] = useState<'Doctor' | 'Nurse' | 'Staff'>('Staff');

  // CareSuite team categories, for the optional "Team Category" field below.
  const { categories: teamCategories } = useCareSuite();

  // Inline edit state
  const [editingField, setEditingField] = useState<{ userId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingTeamCategoryId, setEditingTeamCategoryId] = useState<string | null>(null);
  const [editingUserTypeId, setEditingUserTypeId] = useState<string | null>(null);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 8 || pwd.length > 32) {
      errors.push('Length must be 8–32 characters');
    }
    if (!/[A-Za-z]/.test(pwd)) {
      errors.push('At least one letter (A–Z or a–z)');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('At least one digit (0–9)');
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      errors.push('At least one special character');
    }
    
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
  };

  const handleImageChange = (id: string, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      userService.updateUser(id, { image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddUser = () => {
    if (!username || !password || !userRole || passwordErrors.length > 0) return;

    userService.createUser({
      username,
      userRole,
      department: department.trim() || undefined,
      teamCategoryId: teamCategoryId || undefined,
      image: modalImage || undefined,
      userType,
    });
    setUsername('');
    setPassword('');
    setUserRole('');
    setDepartment('');
    setTeamCategoryId('');
    setModalImage('');
    setUserType('Staff');
    setPasswordErrors([]);
    setIsModalOpen(false);
  };

  const handleUpdateDepartment = (id: string, value: string) => {
    userService.updateUser(id, { department: value.trim() || undefined });
  };

  const handleUpdateTeamCategory = (id: string, value: string) => {
    userService.updateUser(id, { teamCategoryId: value || undefined });
    setEditingTeamCategoryId(null);
  };

  const handleDelete = (id: string) => {
    userService.removeUser(id);
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleUpdateUsername = (id: string, value: string) => {
    userService.updateUser(id, { username: value });
  };

  const handleUpdateUserRole = (id: string, value: string) => {
    userService.updateUser(id, { userRole: value });
    setEditingRoleId(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Users2 size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Users
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage user accounts and access permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                selectedIds.forEach(id => handleDelete(id));
                setSelectedIds([]);
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Trash2 size={18} strokeWidth={2} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          {users.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Plus size={18} strokeWidth={2} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <Users2 className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No Users
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Add your first user to get started with user management
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-20">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    User Role
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Team Category
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <label className="cursor-pointer block relative group w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(user.id, e.target.files?.[0])}
                        />
                        {user.image ? (
                          <img src={user.image} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[14px] font-bold text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[9px] text-white font-medium">Edit</span>
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      {editingField?.userId === user.id && editingField.field === 'username' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateUsername(user.id, editValue);
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateUsername(user.id, editValue);
                              setEditingField(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingField(null);
                              setEditValue('');
                            }
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingField({ userId: user.id, field: 'username' });
                            setEditValue(user.username);
                          }}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] text-[#0f1729] font-['Poppins',sans-serif]"
                        >
                          {user.username}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUserTypeId === user.id ? (
                        <select
                          value={user.userType || 'Staff'}
                          onChange={(e) => {
                            userService.updateUser(user.id, { userType: e.target.value as any });
                            setEditingUserTypeId(null);
                          }}
                          onBlur={() => setEditingUserTypeId(null)}
                          autoFocus
                          className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                        >
                          <option value="Doctor">Doctor</option>
                          <option value="Nurse">Nurse</option>
                          <option value="Staff">Staff</option>
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingUserTypeId(user.id)}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] text-[#0f1729] font-['Poppins',sans-serif]"
                        >
                          {user.userType || 'Staff'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingRoleId === user.id ? (
                        <select
                          value={user.userRole}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          onBlur={() => setEditingRoleId(null)}
                          autoFocus
                          className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                        >
                          {USER_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingRoleId(user.id)}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] text-[#0f1729] font-['Poppins',sans-serif]"
                        >
                          {user.userRole}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingField?.userId === user.id && editingField.field === 'department' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateDepartment(user.id, editValue);
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateDepartment(user.id, editValue);
                              setEditingField(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingField(null);
                              setEditValue('');
                            }
                          }}
                          autoFocus
                          placeholder="Optional"
                          className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingField({ userId: user.id, field: 'department' });
                            setEditValue(user.department || '');
                          }}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] font-['Poppins',sans-serif]"
                        >
                          {user.department || <span className="text-gray-400">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingTeamCategoryId === user.id ? (
                        <select
                          value={user.teamCategoryId || ''}
                          onChange={(e) => handleUpdateTeamCategory(user.id, e.target.value)}
                          onBlur={() => setEditingTeamCategoryId(null)}
                          autoFocus
                          className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                        >
                          <option value="">No category</option>
                          {teamCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingTeamCategoryId(user.id)}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] font-['Poppins',sans-serif]"
                        >
                          {teamCategories.find(c => c.id === user.teamCategoryId)?.nameEn || <span className="text-gray-400">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
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
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="bg-[#4EBEE3] rounded-lg p-2">
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Add User
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUsername('');
                  setPassword('');
                  setUserRole('');
                  setDepartment('');
                  setTeamCategoryId('');
                  setPasswordErrors([]);
                  setShowPassword(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Image */}
              <div className="flex flex-col items-center justify-center pb-2">
                <label className="cursor-pointer block relative group w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#4EBEE3] bg-gray-50 flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setModalImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {modalImage ? (
                    <img src={modalImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-[12px] text-gray-500 font-medium font-['Poppins',sans-serif]">Upload Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[11px] text-white font-medium">Choose</span>
                  </div>
                </label>
              </div>

              {/* Username (Email ID) */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Username (Email ID)
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., user@hospital.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    Password Requirements:
                  </p>
                  <ul className="space-y-0.5">
                    <li className={`text-[11px] font-['Poppins',sans-serif] flex items-start gap-1 ${
                      password && password.length >= 8 && password.length <= 32 
                        ? 'text-green-600' 
                        : passwordErrors.includes('Length must be 8–32 characters') 
                        ? 'text-red-500' 
                        : 'text-[#64748B]'
                    }`}>
                      <span className="mt-0.5">•</span>
                      <span>Length 8–32 characters</span>
                    </li>
                    <li className={`text-[11px] font-['Poppins',sans-serif] flex items-start gap-1 ${
                      password && /[A-Za-z]/.test(password) 
                        ? 'text-green-600' 
                        : passwordErrors.includes('At least one letter (A–Z or a–z)') 
                        ? 'text-red-500' 
                        : 'text-[#64748B]'
                    }`}>
                      <span className="mt-0.5">•</span>
                      <span>At least one letter (A–Z or a–z)</span>
                    </li>
                    <li className={`text-[11px] font-['Poppins',sans-serif] flex items-start gap-1 ${
                      password && /[0-9]/.test(password) 
                        ? 'text-green-600' 
                        : passwordErrors.includes('At least one digit (0–9)') 
                        ? 'text-red-500' 
                        : 'text-[#64748B]'
                    }`}>
                      <span className="mt-0.5">•</span>
                      <span>At least one digit (0–9)</span>
                    </li>
                    <li className={`text-[11px] font-['Poppins',sans-serif] flex items-start gap-1 ${
                      password && /[^A-Za-z0-9]/.test(password) 
                        ? 'text-green-600' 
                        : passwordErrors.includes('At least one special character') 
                        ? 'text-red-500' 
                        : 'text-[#64748B]'
                    }`}>
                      <span className="mt-0.5">•</span>
                      <span>At least one special character (non‑alphanumeric)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* User Type */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  User Type
                </label>
                <SingleSelectDropdown
                  options={[
                    { value: 'Doctor', label: 'Doctor' },
                    { value: 'Nurse', label: 'Nurse' },
                    { value: 'Staff', label: 'Staff' }
                  ]}
                  value={userType}
                  onChange={(val) => setUserType(val as any)}
                  placeholder="Select User Type"
                />
              </div>

              {/* User Role */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  User Role
                </label>
                <SingleSelectDropdown
                  options={USER_ROLES}
                  value={userRole}
                  onChange={setUserRole}
                  placeholder="Select a role"
                />
              </div>

              {/* Department (optional) */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Department <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Housekeeping"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                />
              </div>

              {/* Team Category (optional) — links this user to a CareSuite team category */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Team Category <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <SingleSelectDropdown
                  options={[{ value: '', label: 'No category' }, ...teamCategories.map(c => ({ value: c.id, label: c.nameEn }))]}
                  value={teamCategoryId}
                  onChange={setTeamCategoryId}
                  placeholder="No category"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUsername('');
                  setPassword('');
                  setUserRole('');
                  setDepartment('');
                  setTeamCategoryId('');
                  setModalImage('');
                  setUserType('Staff');
                  setPasswordErrors([]);
                  setShowPassword(false);
                }}
                className="px-4 py-2 text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!username || !password || !userRole || passwordErrors.length > 0}
                className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 py-2 rounded-lg font-['Poppins',sans-serif] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}