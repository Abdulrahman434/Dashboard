import { X, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

interface UpdateAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
}

export default function UpdateAPKModal({ isOpen, onClose, deviceId }: UpdateAPKModalProps) {
  const [versionNumber, setVersionNumber] = useState('');
  const [apkFile, setAPKFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAPKFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!versionNumber || !apkFile) {
      toast.error('Please fill all fields', {
        description: 'Version number and APK file are required',
        duration: 2000,
      });
      return;
    }

    toast.success('APK Update Started', {
      description: `Updating ${deviceId} to version ${versionNumber}`,
      duration: 2000,
    });
    onClose();
    setVersionNumber('');
    setAPKFile(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Update APK
              </h2>
              <p className="text-[12px] text-[#637381] font-['Poppins',sans-serif] mt-0.5">
                Upload new APK version
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
          {/* Version Number */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              Version Number
            </label>
            <input
              type="text"
              value={versionNumber}
              onChange={(e) => setVersionNumber(e.target.value)}
              placeholder="e.g., 1.5.11"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            />
          </div>

          {/* APK File Upload */}
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
              APK File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".apk"
                onChange={handleFileChange}
                className="hidden"
                id="apk-upload"
              />
              <label
                htmlFor="apk-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-colors"
              >
                <Upload size={18} className="text-gray-400" strokeWidth={2} />
                <span className="text-[14px] text-gray-600 font-['Poppins',sans-serif]">
                  {apkFile ? apkFile.name : 'Choose APK file...'}
                </span>
              </label>
            </div>
            {apkFile && (
              <p className="mt-2 text-[12px] text-[#637381] font-['Poppins',sans-serif]">
                File size: {(apkFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
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
            onClick={handleUpload}
            className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            Upload & Update
          </button>
        </div>
      </div>
    </div>
  );
}
