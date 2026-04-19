import { useState } from 'react';
import { Eye, EyeOff, Copy, Plus, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Key } from 'lucide-react';

interface APIKey {
  id: string;
  title: string;
  key: string;
  active: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  confirmType?: 'primary' | 'warning' | 'danger';
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmType = 'primary' }: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmButtonClass = 
    confirmType === 'danger' 
      ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
      : confirmType === 'warning'
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
      : 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-3">
          {title}
        </h3>
        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-['Poppins',sans-serif] text-[13px] font-medium transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LicenseKeyPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    { id: '1', title: 'API Key #1', key: 'ck_live_51MxYz2L3H4pQ5r6S7t8U9v0W1x2Y3z4A5b6C7d8E9f0G1h2I3j4K5l6M7n8', active: true },
    { id: '2', title: 'API Key #2', key: 'ck_live_42NyPq3M4I5oR6s7T8u9V0w1X2y3Z4a5B6c7D8e9F0g1H2i3J4k5L6m7N8o9', active: false },
  ]);

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'activate' | 'deactivate' | 'delete' | 'generate' | null;
    keyId: string | null;
    title: string;
    message: string;
    confirmText: string;
    confirmType: 'primary' | 'warning' | 'danger';
  }>({
    isOpen: false,
    type: null,
    keyId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmType: 'primary'
  });

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (key: string, title: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Copied to clipboard', {
      description: `${title} has been copied`,
      duration: 2000,
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Deactivating
      setConfirmModal({
        isOpen: true,
        type: 'deactivate',
        keyId: id,
        title: 'Confirm Deactivation',
        message: 'Are you sure you want to deactivate this API key? Services using this key may stop working.',
        confirmText: 'Deactivate',
        confirmType: 'warning'
      });
    } else {
      // Activating
      setConfirmModal({
        isOpen: true,
        type: 'activate',
        keyId: id,
        title: 'Confirm Activation',
        message: 'Are you sure you want to activate this API key?',
        confirmText: 'Activate',
        confirmType: 'primary'
      });
    }
  };

  const handleDeleteKey = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      keyId: id,
      title: 'Delete API Key',
      message: 'Are you sure you want to delete this API key? This action cannot be undone.',
      confirmText: 'Delete',
      confirmType: 'danger'
    });
  };

  const handleGenerateNewKey = () => {
    setConfirmModal({
      isOpen: true,
      type: 'generate',
      keyId: null,
      title: 'Generate New API Key',
      message: 'Generate a new key? You will need to update systems using the previous one.',
      confirmText: 'Generate',
      confirmType: 'primary'
    });
  };

  const confirmAction = () => {
    const { type, keyId } = confirmModal;

    if (type === 'activate' && keyId) {
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, active: true } : key
      ));
      toast.success('API Key Activated', {
        description: 'The API key has been successfully activated',
        duration: 2000,
      });
    } else if (type === 'deactivate' && keyId) {
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, active: false } : key
      ));
      toast.success('API Key Deactivated', {
        description: 'The API key has been successfully deactivated',
        duration: 2000,
      });
    } else if (type === 'delete' && keyId) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API Key Deleted', {
        description: 'The API key has been permanently deleted',
        duration: 2000,
      });
    } else if (type === 'generate') {
      const newId = (apiKeys.length + 1).toString();
      const newKey: APIKey = {
        id: newId,
        title: `API Key #${newId}`,
        key: `ck_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        active: false
      };
      setApiKeys(prev => [...prev, newKey]);
      toast.success('New API Key Generated', {
        description: 'A new API key has been created and added to your list',
        duration: 2000,
      });
    }

    setConfirmModal({
      isOpen: false,
      type: null,
      keyId: null,
      title: '',
      message: '',
      confirmText: '',
      confirmType: 'primary'
    });
  };

  const cancelAction = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      keyId: null,
      title: '',
      message: '',
      confirmText: '',
      confirmType: 'primary'
    });
  };

  const maskKey = (key: string) => {
    return '•'.repeat(key.length);
  };

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Key size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                License Key
              </h2>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Manage API keys and license configurations
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateNewKey}
            className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <Plus size={14} strokeWidth={2.5} />
            </div>
            Generate New Key
          </button>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-2 gap-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-6">
              {/* Header with Title and Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  {apiKey.title}
                </h3>
                <div className={`px-3 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                  apiKey.active 
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30' 
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {apiKey.active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* API Key Display with Eye and Copy Icons */}
              <div className="mb-5">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <code className="flex-1 font-mono text-[13px] text-[#16274D] overflow-hidden text-ellipsis">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="text-gray-400 hover:text-[#4EBEE3] transition-colors shrink-0"
                    title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key, apiKey.title)}
                    className="text-gray-400 hover:text-[#4EBEE3] transition-colors shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    Status
                  </span>
                  <button
                    onClick={() => handleToggleStatus(apiKey.id, apiKey.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      apiKey.active ? 'bg-[#10B981]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        apiKey.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="px-4 py-2 rounded-lg border-2 border-[#EF4444]/30 text-[#EF4444] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-[#EF4444]/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no keys) */}
      {apiKeys.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
              No API Keys Yet
            </h3>
            <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
              Generate your first API key to start integrating CareInn services with your applications.
            </p>
            <button
              onClick={handleGenerateNewKey}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium shadow-sm"
            >
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <Plus size={12} strokeWidth={2.5} />
              </div>
              Generate First Key
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmAction}
        onCancel={cancelAction}
        confirmText={confirmModal.confirmText}
        confirmType={confirmModal.confirmType}
      />
    </div>
  );
}