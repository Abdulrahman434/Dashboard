import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, Monitor } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: '8–32 characters',
    test: (pwd) => pwd.length >= 8 && pwd.length <= 32
  },
  {
    id: 'letter',
    label: 'At least one letter (A–Z or a–z)',
    test: (pwd) => /[a-zA-Z]/.test(pwd)
  },
  {
    id: 'digit',
    label: 'At least one digit (0–9)',
    test: (pwd) => /\d/.test(pwd)
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$% etc.)',
    test: (pwd) => /[^a-zA-Z0-9]/.test(pwd)
  }
];

interface UpdateTerminalPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateTerminalPasswordModal({ isOpen, onClose }: UpdateTerminalPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordRulesStatus, setPasswordRulesStatus] = useState<Record<string, boolean>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError('');
      setConfirmPasswordError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Validate password rules in real-time
  useEffect(() => {
    const status: Record<string, boolean> = {};
    PASSWORD_RULES.forEach(rule => {
      status[rule.id] = rule.test(newPassword);
    });
    setPasswordRulesStatus(status);
  }, [newPassword]);

  // Validate confirm password in real-time
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  }, [newPassword, confirmPassword]);

  const allRulesPassed = PASSWORD_RULES.every(rule => passwordRulesStatus[rule.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setCurrentPasswordError('');
    setConfirmPasswordError('');

    // Validate current password (mock validation - in real app this would be backend)
    if (!currentPassword) {
      setCurrentPasswordError('Current terminal password is required.');
      return;
    }

    // Mock: Check if current password is correct
    // In a real app, this would be validated by the backend
    const mockCurrentPassword = 'Terminal123!'; // Just for demo
    if (currentPassword !== mockCurrentPassword) {
      setCurrentPasswordError('Current terminal password is incorrect.');
      toast.error('Current terminal password is incorrect.');
      return;
    }

    // Validate new password rules
    if (!allRulesPassed) {
      toast.error('New terminal password does not meet the requirements.');
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    // Submit password change
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Terminal password updated successfully.');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10">
                <Monitor size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[18px] text-[#0f1729] font-['Poppins',sans-serif]">
                  Update Terminal Password
                </h2>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                  Change the password for terminal devices
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                Current Terminal Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setCurrentPasswordError('');
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg font-['Poppins',sans-serif] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 transition-all ${
                    currentPasswordError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#4EBEE3]'
                  }`}
                  placeholder="Enter current terminal password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} strokeWidth={2} />
                  ) : (
                    <Eye size={16} strokeWidth={2} />
                  )}
                </button>
              </div>
              {currentPasswordError && (
                <p className="mt-1.5 text-[12px] text-red-600 font-['Poppins',sans-serif] flex items-center gap-1">
                  <X size={12} />
                  {currentPasswordError}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                New Terminal Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] transition-all"
                  placeholder="Enter new terminal password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff size={16} strokeWidth={2} />
                  ) : (
                    <Eye size={16} strokeWidth={2} />
                  )}
                </button>
              </div>
              
              {/* Password Rules Checklist */}
              {newPassword && (
                <div className="mt-2.5 space-y-1.5">
                  {PASSWORD_RULES.map((rule) => {
                    const isPassed = passwordRulesStatus[rule.id];
                    return (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-2 text-[12px] font-['Poppins',sans-serif] transition-colors ${
                          isPassed ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            isPassed ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          {isPassed ? (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          ) : (
                            <X size={10} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                Confirm New Terminal Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg font-['Poppins',sans-serif] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 transition-all ${
                    confirmPasswordError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#4EBEE3]'
                  }`}
                  placeholder="Confirm new terminal password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} strokeWidth={2} />
                  ) : (
                    <Eye size={16} strokeWidth={2} />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-1.5 text-[12px] text-red-600 font-['Poppins',sans-serif] flex items-center gap-1">
                  <X size={12} />
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword || !allRulesPassed}
                className="flex-1 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white px-4 py-2.5 rounded-lg font-['Poppins',sans-serif] text-[13px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
