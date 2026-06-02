import React, { useState } from 'react';
import { Database, Plus, Trash2, X, Layers } from 'lucide-react';
import InlineEditCell from './InlineEditCell';

interface MirthConfig {
  id: string;
  serverIpv4: string;
  apiPort: string;
}

export function HISIntegrationPage() {
  const [configurations, setConfigurations] = useState<MirthConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal form state
  const [serverIpv4, setServerIpv4] = useState('');
  const [apiPort, setApiPort] = useState('');
  
  // Inline editing state
  const [editingField, setEditingField] = useState<{ configId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddConfiguration = () => {
    if (!serverIpv4 || !apiPort) return;

    const newConfig: MirthConfig = {
      id: `mirth-${Date.now()}`,
      serverIpv4,
      apiPort
    };

    setConfigurations([...configurations, newConfig]);
    setServerIpv4('');
    setApiPort('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setConfigurations(configurations.filter(config => config.id !== id));
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleUpdateField = (id: string, field: keyof MirthConfig, value: string) => {
    setConfigurations(configurations.map(config =>
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(configurations.map(c => c.id));
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
          <Layers size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            HIS Integration
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Configure Mirth Connect server settings for hospital information system integration
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
          {configurations.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Plus size={18} strokeWidth={2} />
              Add Mirth Configuration
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {configurations.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <Database className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No Mirth Configurations
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Add your first Mirth Connect server configuration to enable HIS integration
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            Add Mirth Configuration
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
                      checked={selectedIds.length === configurations.length && configurations.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Server IPv4
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Port
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {configurations.map((config) => (
                  <tr key={config.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(config.id)}
                        onChange={(e) => handleSelectOne(config.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {editingField?.configId === config.id && editingField.field === 'serverIpv4' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateField(config.id, 'serverIpv4', editValue);
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateField(config.id, 'serverIpv4', editValue);
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
                            setEditingField({ configId: config.id, field: 'serverIpv4' });
                            setEditValue(config.serverIpv4);
                          }}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] text-[#0f1729] font-['Poppins',sans-serif]"
                        >
                          {config.serverIpv4}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingField?.configId === config.id && editingField.field === 'apiPort' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateField(config.id, 'apiPort', editValue);
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateField(config.id, 'apiPort', editValue);
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
                            setEditingField({ configId: config.id, field: 'apiPort' });
                            setEditValue(config.apiPort);
                          }}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[14px] text-[#0f1729] font-['Poppins',sans-serif]"
                        >
                          {config.apiPort}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(config.id)}
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

      {/* Add Mirth Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="bg-[#4EBEE3] rounded-lg p-2">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Add Mirth Configuration
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setServerIpv4('');
                  setApiPort('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Server IPv4 Address */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Server IPv4 Address
                </label>
                <input
                  type="text"
                  value={serverIpv4}
                  onChange={(e) => setServerIpv4(e.target.value)}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                />
              </div>

              {/* API Port */}
              <div>
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  API Port
                </label>
                <input
                  type="text"
                  value={apiPort}
                  onChange={(e) => setApiPort(e.target.value)}
                  placeholder="e.g., 8080"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setServerIpv4('');
                  setApiPort('');
                }}
                className="px-4 py-2 text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddConfiguration}
                disabled={!serverIpv4 || !apiPort}
                className="bg-[#4EBEE3] hover:bg-[#3da9ce] text-white px-4 py-2 rounded-lg font-['Poppins',sans-serif] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}