import { X, Network } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

interface SetStaticIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  currentIP: string;
  onSave: (newIP: string) => void;
}

export default function SetStaticIPModal({ isOpen, onClose, deviceId, currentIP, onSave }: SetStaticIPModalProps) {
  const [newIP, setNewIP] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newIP) {
      toast.error('Please enter an IP address', {
        duration: 2000,
      });
      return;
    }

    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(newIP)) {
      toast.error('Invalid IP address format', {
        description: 'Please enter a valid IP address (e.g., 192.168.1.100)',
        duration: 2000,
      });
      return;
    }

    onSave(newIP);
    toast.success('Static IP Set', {
      description: `IP address updated for ${deviceId}`,
      duration: 2000,
    });
    onClose();
    setNewIP('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Network size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Set Static IP
              </h2>
              <p className="text-[12px] text-[#637381] font-['Poppins',sans-serif] mt-0.5">
                Configure network settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#16274D]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Current IP */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              Current IP Address
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#637381]">
              {currentIP}
            </div>
          </div>

          {/* New IP */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              New Static IP Address
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="e.g., 192.168.1.100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            />
            <p className="mt-2 text-[12px] text-[#637381] font-['Poppins',sans-serif]">
              Enter the new static IP address in the format: xxx.xxx.xxx.xxx
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            Set IP
          </button>
        </div>
      </div>
    </div>
  );
}
