import { useState } from 'react';
import { Server, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';

interface SIPServer {
  id: string;
  serverIp: string;
  backupServerIp: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (server: Omit<SIPServer, 'id' | 'createdAt'>) => void;
}

function AddServerModal({ isOpen, onClose, onAdd }: AddServerModalProps) {
  const [serverIp, setServerIp] = useState('');
  const [backupServerIp, setBackupServerIp] = useState('');
  const [isActive, setIsActive] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serverIp.trim()) {
      toast.error('Server IP is required');
      return;
    }

    onAdd({
      serverIp: serverIp.trim(),
      backupServerIp: backupServerIp.trim(),
      status: isActive ? 'Active' : 'Inactive'
    });

    // Reset form
    setServerIp('');
    setBackupServerIp('');
    setIsActive(true);
    onClose();
  };

  const handleCancel = () => {
    setServerIp('');
    setBackupServerIp('');
    setIsActive(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
          Add SIP Server
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {/* Server IP */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Server IP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                placeholder="e.g., 192.168.1.100"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              />
            </div>

            {/* Backup Server IP */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Backup Server IP
              </label>
              <input
                type="text"
                value={backupServerIp}
                onChange={(e) => setBackupServerIp(e.target.value)}
                placeholder="e.g., 192.168.1.101"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              />
            </div>

            {/* Activate Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Activate
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
            >
              Add Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serverIp: string;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, serverIp }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-3">
          Delete SIP Server
        </h3>
        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
          Are you sure you want to delete the server with IP <span className="font-semibold text-[#16274D]">{serverIp}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
          >
            Delete Server
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SIPServerPage() {
  const [servers, setServers] = useState<SIPServer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    serverId: string | null;
    serverIp: string;
  }>({
    isOpen: false,
    serverId: null,
    serverIp: ''
  });

  const handleAddServer = (newServer: Omit<SIPServer, 'id' | 'createdAt'>) => {
    const server: SIPServer = {
      id: Date.now().toString(),
      ...newServer,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setServers([...servers, server]);
    toast.success('SIP Server Added', {
      description: `Server ${server.serverIp} has been added successfully`,
      duration: 2000,
    });
  };

  const handleDeleteServer = (serverId: string, serverIp: string) => {
    setDeleteModal({
      isOpen: true,
      serverId,
      serverIp
    });
  };

  const confirmDelete = () => {
    if (deleteModal.serverId) {
      setServers(servers.filter(s => s.id !== deleteModal.serverId));
      toast.success('SIP Server Deleted', {
        description: `Server ${deleteModal.serverIp} has been deleted successfully`,
        duration: 2000,
      });
    }
    setDeleteModal({ isOpen: false, serverId: null, serverIp: '' });
  };

  const handleUpdateServerIp = (serverId: string, newIp: string) => {
    setServers(servers.map(server => 
      server.id === serverId ? { ...server, serverIp: newIp } : server
    ));
    toast.success('Server IP Updated', {
      description: 'Server IP has been updated successfully',
      duration: 2000,
    });
  };

  const handleUpdateBackupServerIp = (serverId: string, newIp: string) => {
    setServers(servers.map(server => 
      server.id === serverId ? { ...server, backupServerIp: newIp } : server
    ));
    toast.success('Backup Server IP Updated', {
      description: 'Backup Server IP has been updated successfully',
      duration: 2000,
    });
  };

  // Empty state
  if (servers.length === 0) {
    return (
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
              <Server size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[20px] md:text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                SIP Server
              </h2>
              <p className="text-[13px] md:text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Configure SIP server settings and backup servers
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center mb-4">
            <Server className="w-8 h-8 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No SIP Servers
          </h3>
          <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Get started by adding your first SIP server configuration. You can manage server IPs and backup configurations.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        {/* Add Server Modal */}
        <AddServerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddServer}
        />
      </div>
    );
  }

  // Table view
  return (
    <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
            <Server size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[20px] md:text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              SIP Server
            </h2>
            <p className="text-[13px] md:text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Configure SIP server settings and backup servers
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Server
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Server IP
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Backup Server IP
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <InlineInput
                      value={server.serverIp}
                      onChange={(value) => handleUpdateServerIp(server.id, value)}
                      placeholder="Enter Server IP"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <InlineInput
                      value={server.backupServerIp}
                      onChange={(value) => handleUpdateBackupServerIp(server.id, value)}
                      placeholder="Enter Backup Server IP"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] ${
                        server.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {server.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {server.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteServer(server.id, server.serverIp)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Server"
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

      {/* Add Server Modal */}
      <AddServerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddServer}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, serverId: null, serverIp: '' })}
        onConfirm={confirmDelete}
        serverIp={deleteModal.serverIp}
      />
    </div>
  );
}