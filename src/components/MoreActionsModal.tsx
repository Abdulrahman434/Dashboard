import { X, Settings, Upload, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MoreActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  server?: string;
  careinnVersion: string;
  setCareinnVersion: (value: string) => void;
  ipAddress: string;
  setIpAddress: (value: string) => void;
  patientAssigned: string;
  setPatientAssigned: (value: string) => void;
  sipExtension: string;
  setSipExtension: (value: string) => void;
  sipUsername: string;
  setSipUsername: (value: string) => void;
  sipPassword: string;
  setSipPassword: (value: string) => void;
  emergencyExtension: string;
  setEmergencyExtension: (value: string) => void;
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  sipEnabled: boolean;
  setSipEnabled: (value: boolean) => void;
  kioskMode: boolean;
  setKioskMode: (value: boolean) => void;
  patientServices: boolean;
  setPatientServices: (value: boolean) => void;
  noAdmissionMode: boolean;
  setNoAdmissionMode: (value: boolean) => void;
  prayerTimes: boolean;
  setPrayerTimes: (value: boolean) => void;
  onUpdateAPK: () => void;
  onSetStaticIP: () => void;
  onClearData: () => void;
  onSave: () => void;
}

export default function MoreActionsModal({
  isOpen,
  onClose,
  deviceId,
  server = '192.156.68/api',
  careinnVersion,
  setCareinnVersion,
  ipAddress,
  setIpAddress,
  patientAssigned,
  setPatientAssigned,
  sipExtension,
  setSipExtension,
  sipUsername,
  setSipUsername,
  sipPassword,
  setSipPassword,
  emergencyExtension,
  setEmergencyExtension,
  selectedGroup,
  setSelectedGroup,
  sipEnabled,
  setSipEnabled,
  kioskMode,
  setKioskMode,
  patientServices,
  setPatientServices,
  noAdmissionMode,
  setNoAdmissionMode,
  prayerTimes,
  setPrayerTimes,
  onUpdateAPK,
  onSetStaticIP,
  onClearData,
  onSave,
}: MoreActionsModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    toast.success('Settings Saved', {
      description: 'All changes have been applied successfully',
      duration: 2000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Settings size={24} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Terminal Details
              </h2>
              <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif] mt-0.5">
                Configure settings for {deviceId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-[#16274D]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Terminal Information Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-1/3">
                    ITEM
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-1/3">
                    DESCRIPTION
                  </th>
                  <th className="px-6 py-4 text-right text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-1/3">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Device ID (SN) */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Device ID (SN)
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    {deviceId}
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    -
                  </td>
                </tr>

                {/* CareInn Version */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    CareInn Version
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    {careinnVersion}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={onUpdateAPK}
                      className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors"
                    >
                      Update APK
                    </button>
                  </td>
                </tr>

                {/* IP Address */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    IP Address
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    {ipAddress}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={onSetStaticIP}
                      className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors"
                    >
                      Set Static IP
                    </button>
                  </td>
                </tr>

                {/* Server */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Server
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    {server}
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    -
                  </td>
                </tr>

                {/* Patient Assigned */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Patient Assigned
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    {patientAssigned}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={onClearData}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors"
                    >
                      Clear Data
                    </button>
                  </td>
                </tr>

                {/* SIP Extension */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    SIP Extension
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={sipExtension}
                      onChange={(e) => setSipExtension(e.target.value)}
                      disabled={!sipEnabled}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSipEnabled(!sipEnabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        sipEnabled ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          sipEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                </tr>

                {/* SIP Username - Only show when SIP is enabled */}
                {sipEnabled && (
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                      SIP Username
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={sipUsername}
                        onChange={(e) => setSipUsername(e.target.value)}
                        disabled={!sipEnabled}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                      -
                    </td>
                  </tr>
                )}

                {/* SIP Password - Only show when SIP is enabled */}
                {sipEnabled && (
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                      SIP Password
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="password"
                        value={sipPassword}
                        onChange={(e) => setSipPassword(e.target.value)}
                        disabled={!sipEnabled}
                        placeholder="••••••"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                      -
                    </td>
                  </tr>
                )}

                {/* Emergency Extension */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Emergency Extension
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={emergencyExtension}
                      onChange={(e) => setEmergencyExtension(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none cursor-pointer bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="Nurse station 13">Nurse station 13</option>
                      <option value="Nurse station 14">Nurse station 14</option>
                      <option value="Nurse station 15">Nurse station 15</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    -
                  </td>
                </tr>

                {/* Server Connection */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Server Connection
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] inline-block">
                      Connected
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    -
                  </td>
                </tr>

                {/* Group */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    Group
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none cursor-pointer bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="Kids">Kids</option>
                      <option value="Adults">Adults</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terminal Settings Toggles */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Terminal Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Kiosk Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Kiosk Mode
                </span>
                <button
                  onClick={() => setKioskMode(!kioskMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    kioskMode ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      kioskMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Patient Services */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Patient Services
                </span>
                <button
                  onClick={() => setPatientServices(!patientServices)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    patientServices ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      patientServices ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* No Admission Mode with Tooltip */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 relative group">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                    No Admission
                  </span>
                  <div className="relative">
                    <Info size={16} className="text-gray-400 cursor-help" strokeWidth={2} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-['Poppins',sans-serif] z-10">
                      Nothing will show on screen
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setNoAdmissionMode(!noAdmissionMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    noAdmissionMode ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      noAdmissionMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Prayer Times */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Prayer Times
                </span>
                <button
                  onClick={() => setPrayerTimes(!prayerTimes)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    prayerTimes ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      prayerTimes ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-2 border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}