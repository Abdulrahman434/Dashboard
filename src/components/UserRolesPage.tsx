import React, { useState } from 'react';
import { UserCircle, Plus, Trash2, X, Edit2, Search, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface Permission {
  id: string;
  label: string;
}

interface PermissionModule {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  assignedUsers: number;
  permissions: string[]; // Array of permission IDs
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    permissions: [{ id: 'dashboard-view', label: 'View' }]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    permissions: [
      { id: 'analytics-view', label: 'View' },
      { id: 'analytics-export', label: 'Export' }
    ]
  },
  {
    id: 'site-config',
    name: 'Site Configuration',
    permissions: [
      { id: 'site-config-view', label: 'View' },
      { id: 'site-config-add', label: 'Add' },
      { id: 'site-config-edit', label: 'Edit' },
      { id: 'site-config-delete', label: 'Delete' }
    ]
  },
  {
    id: 'content-manager',
    name: 'Content Manager',
    permissions: [
      { id: 'feature-wallpaper', label: 'Wallpaper' },
      { id: 'feature-welcome-note', label: 'Welcome Note' },
      { id: 'feature-news-feed', label: 'News Feed' },
      { id: 'feature-notifications', label: 'Notifications' },
      { id: 'hospital-profile-add', label: 'Hospital Profile - Add' },
      { id: 'hospital-profile-edit', label: 'Hospital Profile - Edit' },
      { id: 'hospital-profile-configure', label: 'Hospital Profile - Configure' }
    ]
  },
  {
    id: 'content-library',
    name: 'Content Library',
    permissions: [
      { id: 'content-library-view', label: 'View' },
      { id: 'content-library-add', label: 'Add' },
      { id: 'content-library-edit', label: 'Edit' },
      { id: 'content-library-delete', label: 'Delete' }
    ]
  },
  {
    id: 'engagement-hub',
    name: 'Engagement Hub',
    permissions: [
      { id: 'engagement-manage-categories', label: 'Manage Categories' },
      { id: 'engagement-configure-category', label: 'Configure Category' },
      { id: 'engagement-add-asset', label: 'Add Asset' },
      { id: 'engagement-remove-asset', label: 'Remove Asset' }
    ]
  },
  {
    id: 'patient-services',
    name: 'Patient Services',
    permissions: [
      { id: 'patient-services-add', label: 'Add' },
      { id: 'patient-services-remove', label: 'Remove' },
      { id: 'patient-services-manage-visibility', label: 'Manage Visibility' }
    ]
  },
  {
    id: 'shortcuts',
    name: 'Shortcuts',
    permissions: [
      { id: 'shortcuts-add', label: 'Add' },
      { id: 'shortcuts-remove', label: 'Remove' },
      { id: 'shortcuts-manage-visibility', label: 'Manage Visibility' }
    ]
  },
  {
    id: 'channels',
    name: 'Channels',
    permissions: [
      { id: 'channels-view', label: 'View' },
      { id: 'channels-add', label: 'Add' },
      { id: 'channels-edit', label: 'Edit' },
      { id: 'channels-delete', label: 'Delete' },
      { id: 'channels-activate', label: 'Activate' }
    ]
  },
  {
    id: 'terminal-tour',
    name: 'Terminal Tour Guide',
    permissions: [
      { id: 'terminal-tour-view', label: 'View' },
      { id: 'terminal-tour-add', label: 'Add' },
      { id: 'terminal-tour-edit', label: 'Edit' },
      { id: 'terminal-tour-delete', label: 'Delete' }
    ]
  },
  {
    id: 'device-manager',
    name: 'Device Manager',
    permissions: [
      { id: 'device-activate', label: 'Activate' },
      { id: 'device-restart', label: 'Restart' },
      { id: 'device-refresh', label: 'Refresh' },
      { id: 'device-clear-cache', label: 'Clear Cache' },
      { id: 'device-view-details', label: 'View Details' }
    ]
  },
  {
    id: 'survey-manager',
    name: 'Survey Manager',
    permissions: [
      { id: 'survey-add', label: 'Add' },
      { id: 'survey-edit', label: 'Edit' },
      { id: 'survey-view', label: 'View' },
      { id: 'survey-push', label: 'Push' },
      { id: 'survey-activate', label: 'Activate' },
      { id: 'survey-delete', label: 'Delete' }
    ]
  },
  {
    id: 'survey-reports',
    name: 'Survey Reports',
    permissions: [
      { id: 'survey-reports-view', label: 'View' },
      { id: 'survey-reports-export', label: 'Export' }
    ]
  },
  {
    id: 'survey-responses',
    name: 'Survey Responses',
    permissions: [
      { id: 'survey-responses-view', label: 'View' },
      { id: 'survey-responses-export', label: 'Export' }
    ]
  },
  {
    id: 'hospital-profile',
    name: 'Hospital Profile',
    permissions: [
      { id: 'hospital-profile-add', label: 'Add' },
      { id: 'hospital-profile-edit', label: 'Edit' },
      { id: 'hospital-profile-configure', label: 'Configure' },
      { id: 'hospital-profile-upload', label: 'Upload Content' }
    ]
  },
  {
    id: 'his-integration',
    name: 'HIS Integration',
    permissions: [
      { id: 'his-view', label: 'View' },
      { id: 'his-add', label: 'Add' },
      { id: 'his-edit', label: 'Edit' }
    ]
  },
  {
    id: 'sip-configuration',
    name: 'SIP Configuration',
    permissions: [
      { id: 'sip-server', label: 'SIP Server' },
      { id: 'sip-device-credentials', label: 'SIP Device Credentials' },
      { id: 'sip-directory', label: 'SIP Directory' }
    ]
  },
  {
    id: 'control-panel-users',
    name: 'Control Panel - Users',
    permissions: [
      { id: 'users-view', label: 'View' },
      { id: 'users-add', label: 'Add' },
      { id: 'users-edit', label: 'Edit' },
      { id: 'users-delete', label: 'Delete' }
    ]
  },
  {
    id: 'control-panel-password',
    name: 'Password Updates',
    permissions: [
      { id: 'password-update', label: 'Update Password' },
      { id: 'terminal-password-update', label: 'Update Terminal Password' }
    ]
  },
  {
    id: 'logger',
    name: 'Logger',
    permissions: [
      { id: 'logger-integration-logs', label: 'Integration Logs (View)' },
      { id: 'logger-user-activity', label: 'User Activity Logs (View)' }
    ]
  }
];

export function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Panel form state
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions([]);
    setSearchQuery('');
    setExpandedModules([]);
    setIsPanelOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions);
    setSearchQuery('');
    setExpandedModules([]);
    setIsPanelOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) return;

    if (editingRole) {
      // Update existing role
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, name: roleName, permissions: selectedPermissions }
          : role
      ));
    } else {
      // Add new role
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleName,
        assignedUsers: 0,
        permissions: selectedPermissions
      };
      setRoles([...roles, newRole]);
    }

    setIsPanelOpen(false);
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions([]);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(roles.map(r => r.id));
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

  const toggleModule = (moduleId: string) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const toggleModuleSelectAll = (module: PermissionModule) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all from this module
      setSelectedPermissions(selectedPermissions.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all from this module
      const newPermissions = [...selectedPermissions];
      modulePermissionIds.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      setSelectedPermissions(newPermissions);
    }
  };

  const isModuleFullySelected = (module: PermissionModule) => {
    return module.permissions.every(p => selectedPermissions.includes(p.id));
  };

  const toggleSelectAllPermissions = () => {
    const allPermissionIds = PERMISSION_MODULES.flatMap(module => 
      module.permissions.map(p => p.id)
    );
    
    if (selectedPermissions.length === allPermissionIds.length) {
      // Deselect all
      setSelectedPermissions([]);
    } else {
      // Select all
      setSelectedPermissions(allPermissionIds);
    }
  };

  const isAllPermissionsSelected = () => {
    const allPermissionIds = PERMISSION_MODULES.flatMap(module => 
      module.permissions.map(p => p.id)
    );
    return selectedPermissions.length === allPermissionIds.length;
  };

  const isSomePermissionsSelected = () => {
    return selectedPermissions.length > 0 && !isAllPermissionsSelected();
  };

  const isModulePartiallySelected = (module: PermissionModule) => {
    const selectedCount = module.permissions.filter(p => selectedPermissions.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < module.permissions.length;
  };

  // Filter modules based on search
  const filteredModules = PERMISSION_MODULES.filter(module => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      module.name.toLowerCase().includes(query) ||
      module.permissions.some(p => p.label.toLowerCase().includes(query))
    );
  });

  // Get enabled modules for summary
  const enabledModules = PERMISSION_MODULES.filter(module =>
    module.permissions.some(p => selectedPermissions.includes(p.id))
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <UserCircle size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            User Roles
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Define roles and manage permission assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                selectedIds.forEach(id => handleDeleteRole(id));
                setSelectedIds([]);
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Trash2 size={18} strokeWidth={2} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          {roles.length > 0 && (
            <button
              onClick={handleAddRole}
              className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Plus size={18} strokeWidth={2} />
              Add Role
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {roles.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <UserCircle className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No roles created yet
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Create your first role to define permission sets for users
          </p>
          <button
            onClick={handleAddRole}
            className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === roles.length && roles.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Assigned Users
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Permissions Count
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(role.id)}
                        onChange={(e) => handleSelectOne(role.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                        {role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                        {role.assignedUsers}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#4EBEE3]/10 text-[#4EBEE3] font-['Poppins',sans-serif]">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors p-2 rounded-lg hover:bg-[#4EBEE3]/10"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Right Side Panel */}
      {isPanelOpen && (
        <>
          {/* Overlay - Covers entire viewport including sidebar */}
          <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={() => setIsPanelOpen(false)}
          >
            {/* Modal - Click inside won't close - Responsive width */}
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] xl:max-w-5xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4EBEE3] rounded-lg p-2">
                    <UserCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      {editingRole ? 'Edit Role' : 'Add Role'}
                    </h2>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Two Column Layout */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Column - Permission Selection */}
                <div className="flex-1 flex flex-col border-r border-gray-200 min-w-0">
                  <div className="px-4 xl:px-6 pt-4 pb-3 space-y-3 shrink-0">
                    {/* Role Name */}
                    <div>
                      <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1.5">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g., Administrator, Nurse, Doctor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                      />
                    </div>

                    {/* Search + Select All */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search permissions..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group px-3 xl:px-4 py-2 border border-gray-300 rounded-lg hover:border-[#4EBEE3] transition-colors shrink-0">
                        <input
                          type="checkbox"
                          checked={isAllPermissionsSelected()}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = isSomePermissionsSelected();
                            }
                          }}
                          onChange={toggleSelectAllPermissions}
                          className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                        />
                        <span className="text-[13px] font-medium text-gray-700 font-['Poppins',sans-serif] group-hover:text-[#4EBEE3] transition-colors whitespace-nowrap">
                          Select All
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Permissions List - Scrollable */}
                  <div className="flex-1 overflow-y-auto px-4 xl:px-6 pb-4">
                    {filteredModules.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                          No permissions found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredModules.map((module) => (
                          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Module Header */}
                            <div className="bg-gray-50 px-3 xl:px-4 py-2.5 flex items-center justify-between">
                              <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isModuleFullySelected(module)}
                                  ref={(el) => {
                                    if (el) {
                                      el.indeterminate = isModulePartiallySelected(module);
                                    }
                                  }}
                                  onChange={() => toggleModuleSelectAll(module)}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3] shrink-0"
                                />
                                <span className="text-[13px] xl:text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] truncate">
                                  {module.name}
                                </span>
                              </label>
                              <span className="text-[12px] text-gray-500 font-['Poppins',sans-serif] ml-2 shrink-0">
                                {module.permissions.filter(p => selectedPermissions.includes(p.id)).length}/{module.permissions.length}
                              </span>
                            </div>

                            {/* Module Permissions */}
                            <div className="p-3 xl:p-4 space-y-2 bg-white">
                              {module.permissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3] shrink-0"
                                  />
                                  <span className="text-[12px] xl:text-[13px] text-[#0f1729] font-['Poppins',sans-serif]">
                                    {permission.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Selected Permissions Summary */}
                <div className="w-72 xl:w-80 flex flex-col bg-gray-50 shrink-0">
                  <div className="px-4 xl:px-5 py-4 border-b border-gray-200">
                    <h3 className="text-[13px] xl:text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      Selected Permissions
                    </h3>
                    <p className="text-[11px] xl:text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                      {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} across {enabledModules.length} module{enabledModules.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 xl:px-5 py-4">
                    {selectedPermissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-gray-200 rounded-full p-3 mb-3">
                          <Check className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                          No permissions selected yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enabledModules.map((module) => {
                          const selectedInModule = module.permissions.filter(p => 
                            selectedPermissions.includes(p.id)
                          );
                          
                          if (selectedInModule.length === 0) return null;

                          return (
                            <div key={module.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="bg-[#4EBEE3]/5 px-3 py-2 flex items-center justify-between">
                                <span className="text-[11px] xl:text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif] truncate pr-2">
                                  {module.name}
                                </span>
                                <span className="text-[10px] xl:text-[11px] text-gray-500 font-['Poppins',sans-serif] shrink-0">
                                  {selectedInModule.length}/{module.permissions.length}
                                </span>
                              </div>
                              <div className="p-3 space-y-1.5">
                                {selectedInModule.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                                  >
                                    <span className="text-[11px] xl:text-[12px] text-[#0f1729] font-['Poppins',sans-serif] pr-2">
                                      {permission.label}
                                    </span>
                                    <button
                                      onClick={() => togglePermission(permission.id)}
                                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0"
                                      title="Remove"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions in Summary */}
                  {selectedPermissions.length > 0 && (
                    <div className="px-4 xl:px-5 py-3 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedPermissions([])}
                        className="w-full px-3 py-2 text-[11px] xl:text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors font-['Poppins',sans-serif]"
                      >
                        Clear All Selections
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-4 xl:px-6 py-4 border-t border-gray-200 bg-white shrink-0">
                <div className="text-[11px] xl:text-[12px] text-gray-600 font-['Poppins',sans-serif]">
                  {selectedPermissions.length > 0 ? (
                    <>
                      {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                    </>
                  ) : (
                    'No permissions selected'
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="px-3 xl:px-4 py-2 text-[13px] xl:text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={!roleName.trim()}
                    className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 xl:px-6 py-2 rounded-lg font-['Poppins',sans-serif] text-[13px] xl:text-[14px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}