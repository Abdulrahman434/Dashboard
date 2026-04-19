import { X, RefreshCw, Power, Download, RotateCcw, Monitor, Settings, Info } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner@2.0.3';
import { useSIPContacts } from '../contexts/SIPContext';

type ModalTabType = 'device-info' | 'device-usage';
type UsageTabType = 'engagement' | 'patient-services' | 'channels';

interface DeviceModalProps {
  isOpen: boolean;
  deviceId: string;
  isConnected?: boolean;
  server?: string;
  onClose: () => void;
}

const getUsageData = (tab: UsageTabType) => {
  switch (tab) {
    case 'engagement':
      return [
        { name: 'Media', interactions: 165 },
        { name: 'Games', interactions: 142 },
        { name: 'Social', interactions: 98 },
        { name: 'Reading', interactions: 76 },
        { name: 'Internet', interactions: 54 },
        { name: 'Tools', interactions: 31 },
        { name: 'Meeting', interactions: 23 },
        { name: 'About U', interactions: 18 }
      ];
    case 'patient-services':
      return [
        { name: 'CareCall', requests: 45 },
        { name: 'Food Ordering', requests: 38 },
        { name: 'Housekeeping', requests: 24 },
        { name: 'Consultation', requests: 12 }
      ];
    case 'channels':
      return [
        { name: 'Entertainment', hours: 45 },
        { name: 'News', hours: 32 },
        { name: 'Kids', hours: 18 },
        { name: 'Religious', hours: 12 },
        { name: 'Sports', hours: 8 }
      ];
  }
};

const getChartTitle = (tab: UsageTabType) => {
  switch (tab) {
    case 'engagement':
      return 'Engagement Hub Interactions';
    case 'patient-services':
      return 'Patient Services Requests';
    case 'channels':
      return 'Watch Time by Category';
  }
};

const getDataKey = (tab: UsageTabType) => {
  switch (tab) {
    case 'engagement':
      return 'interactions';
    case 'patient-services':
      return 'requests';
    case 'channels':
      return 'hours';
  }
};

const getUnitLabel = (tab: UsageTabType) => {
  switch (tab) {
    case 'engagement':
      return 'interactions';
    case 'patient-services':
      return 'requests';
    case 'channels':
      return 'hours';
  }
};

const getTabSpecificPeakHours = (tab: UsageTabType) => {
  switch (tab) {
    case 'engagement':
      return { time: '3PM - 7PM', label: 'Evening peak' };
    case 'patient-services':
      return { time: '11AM - 2PM', label: 'Lunch hours peak' };
    case 'channels':
      return { time: '7PM - 11PM', label: 'Prime time peak' };
  }
};

/**
 * DEVELOPER GUIDE: Overall Peak Hours Calculation
 * ================================================
 * 
 * The "Overall Peak Hours" represents the time window when a patient has the 
 * HIGHEST COMBINED ACTIVITY across all three categories (Engagement Hub, 
 * Patient Services, and Channels).
 * 
 * CALCULATION ALGORITHM:
 * ----------------------
 * 
 * Step 1: Collect All Timestamped Activities
 * -------------------------------------------
 * Query all activities for the specific device/patient with timestamps:
 * 
 * SELECT timestamp, activity_type, category 
 * FROM device_activities 
 * WHERE device_id = 'mt15' 
 * AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
 * 
 * Example data:
 * [
 *   { timestamp: "2024-12-09 15:30:00", type: "engagement", category: "Media" },
 *   { timestamp: "2024-12-09 11:15:00", type: "patient-services", category: "CareCall" },
 *   { timestamp: "2024-12-09 20:45:00", type: "channels", category: "MBC" },
 *   // ... all activities
 * ]
 * 
 * Step 2: Group Activities by Hour of Day (0-23)
 * -----------------------------------------------
 * const hourlyActivity = Array(24).fill(0);
 * activities.forEach(activity => {
 *   const hour = new Date(activity.timestamp).getHours();
 *   hourlyActivity[hour]++;
 * });
 * 
 * Result: [0, 0, 0, 12, 18, 25, ...] // Index = hour, Value = activity count
 * 
 * Step 3: Find Continuous Time Window with Highest Activity
 * ----------------------------------------------------------
 * Use a sliding window approach to find the busiest consecutive period:
 * 
 * const WINDOW_SIZE = 4; // 4-hour window (adjustable based on requirements)
 * let maxActivity = 0;
 * let peakStartHour = 0;
 * 
 * for (let i = 0; i <= 24 - WINDOW_SIZE; i++) {
 *   const windowTotal = hourlyActivity
 *     .slice(i, i + WINDOW_SIZE)
 *     .reduce((sum, count) => sum + count, 0);
 *   
 *   if (windowTotal > maxActivity) {
 *     maxActivity = windowTotal;
 *     peakStartHour = i;
 *   }
 * }
 * 
 * Step 4: Format the Result
 * -------------------------
 * const peakEndHour = peakStartHour + WINDOW_SIZE;
 * 
 * function formatHour(hour: number): string {
 *   const period = hour >= 12 ? 'PM' : 'AM';
 *   const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
 *   return `${displayHour}${period}`;
 * }
 * 
 * function getPeakLabel(startHour: number): string {
 *   if (startHour >= 6 && startHour < 12) return "Morning peak";
 *   if (startHour >= 12 && startHour < 17) return "Afternoon peak";
 *   if (startHour >= 17 && startHour < 21) return "Evening peak";
 *   return "Night peak";
 * }
 * 
 * const overallPeak = {
 *   time: `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`,
 *   label: getPeakLabel(peakStartHour)
 * };
 * 
 * EXAMPLE OUTPUT:
 * ---------------
 * If peakStartHour = 14, WINDOW_SIZE = 4:
 * - time: "2PM - 6PM"
 * - label: "Afternoon peak"
 * 
 * KEY DIFFERENCES:
 * ----------------
 * 1. Tab-Specific Peak Hours:
 *    - Pattern-based (static)
 *    - Only looks at ONE category (e.g., only channels)
 *    - Different for each tab (Engagement: 3PM-7PM, Services: 11AM-2PM, etc.)
 * 
 * 2. Overall Peak Hours:
 *    - Data-driven (dynamic)
 *    - Combines ALL three categories
 *    - Same value regardless of which tab is selected
 *    - Updates as patient usage patterns change
 * 
 * CONFIGURATION:
 * --------------
 * - WINDOW_SIZE: Default 4 hours, adjust based on clinical requirements
 * - Time Period: Default last 30 days, can be changed to last 7 days, etc.
 * - Update Frequency: Recalculate daily or in real-time based on performance needs
 */

export default function DeviceModal({ isOpen, deviceId, isConnected = true, server = '192.156.68/api', onClose }: DeviceModalProps) {
  const { contacts } = useSIPContacts();
  const [activeTab, setActiveTab] = useState<ModalTabType>('device-info');
  const [usageTab, setUsageTab] = useState<UsageTabType>('engagement');
  
  // State for Device Info settings
  const [careinnVersion, setCareinnVersion] = useState('1.5.10');
  const [ipAddress, setIpAddress] = useState('10.11.0.50');
  const [patientAssigned, setPatientAssigned] = useState('123402');
  const [sipExtension, setSipExtension] = useState('3201');
  const [sipUsername, setSipUsername] = useState('3201');
  const [sipPassword, setSipPassword] = useState('');
  const [emergencyExtension, setEmergencyExtension] = useState('1'); // Store contact ID
  const [selectedGroup, setSelectedGroup] = useState('Kids');
  const [sipEnabled, setSipEnabled] = useState(true);
  const [kioskMode, setKioskMode] = useState(false);
  const [patientServices, setPatientServices] = useState(true);
  const [noAdmissionMode, setNoAdmissionMode] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(true);

  if (!isOpen) return null;

  // Filter only emergency contacts
  const emergencyContacts = contacts.filter(contact => contact.isEmergency && contact.isActive);

  const handleUpdateAPK = () => {
    toast.success('APK Update Initiated', {
      description: 'CareInn APK update has been queued for terminal ' + deviceId,
      duration: 2000,
    });
  };

  const handleSetStaticIP = () => {
    toast.success('Static IP Configured', {
      description: 'Static IP has been set for terminal ' + deviceId,
      duration: 2000,
    });
  };

  const handleClearData = () => {
    toast.success('Data Cleared', {
      description: 'Terminal data has been cleared for ' + deviceId,
      duration: 2000,
    });
  };

  const handleSave = () => {
    toast.success('Settings Saved', {
      description: 'All changes have been applied successfully',
      duration: 2000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="px-8 py-5 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Device Info — {deviceId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-[#16274D]" />
          </button>
        </div>

        {/* Modal Tabs - Fixed */}
        <div className="px-8 flex-shrink-0 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('device-info')}
              className={`py-4 px-4 font-['Poppins',sans-serif] text-[15px] font-medium transition-all duration-200 relative ${
                activeTab === 'device-info'
                  ? 'text-[#4EBEE3]'
                  : 'text-[#16274D]/50 hover:text-[#16274D]/80'
              }`}
            >
              Device Info
              {activeTab === 'device-info' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4EBEE3]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('device-usage')}
              className={`py-4 px-4 font-['Poppins',sans-serif] text-[15px] font-medium transition-all duration-200 relative ${
                activeTab === 'device-usage'
                  ? 'text-[#4EBEE3]'
                  : 'text-[#16274D]/50 hover:text-[#16274D]/80'
              }`}
            >
              Device Usage
              {activeTab === 'device-usage' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4EBEE3]" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'device-info' && (
            <div className="space-y-6">
              {/* Terminal Information Table */}
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
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
                          onClick={handleUpdateAPK}
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
                          onClick={handleSetStaticIP}
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
                          onClick={handleClearData}
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
                          {emergencyContacts.map(contact => (
                            <option key={contact.id} value={contact.id}>{contact.nameEN} ({contact.extension})</option>
                          ))}
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
                        <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] inline-block ${
                          isConnected 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isConnected ? 'Connected' : 'Disconnected'}
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
          )}

          {activeTab === 'device-usage' && (
            <div className="space-y-4">
              {/* Main Container */}
              <div className="grid grid-cols-3 gap-4">
                {/* Left Side - Chart */}
                <div className="col-span-2 bg-white rounded-xl border-2 border-gray-200 p-4 flex flex-col overflow-hidden" style={{ height: '480px' }}>
                  {/* Header with Device ID */}
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      {getChartTitle(usageTab)}
                    </h3>
                    <div className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">Device: </span>
                      <span className="text-[11px] font-medium text-[#16274D] font-['Poppins',sans-serif]">{deviceId}</span>
                    </div>
                  </div>

                  {/* Tabs - Dashboard Style */}
                  <div className="mb-2 flex-shrink-0">
                    <div className="flex gap-1.5 bg-[#F8FAFC] rounded-lg p-1">
                      <button
                        onClick={() => setUsageTab('engagement')}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-[11px] font-medium font-['Poppins',sans-serif] transition-all ${
                          usageTab === 'engagement'
                            ? 'bg-[#4EBEE3] text-white shadow-sm'
                            : 'text-[#16274D] hover:bg-white'
                        }`}
                      >
                        Engagement
                      </button>
                      <button
                        onClick={() => setUsageTab('patient-services')}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-[11px] font-medium font-['Poppins',sans-serif] transition-all ${
                          usageTab === 'patient-services'
                            ? 'bg-[#4EBEE3] text-white shadow-sm'
                            : 'text-[#16274D] hover:bg-white'
                        }`}
                      >
                        Patient Services
                      </button>
                      <button
                        onClick={() => setUsageTab('channels')}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-[11px] font-medium font-['Poppins',sans-serif] transition-all ${
                          usageTab === 'channels'
                            ? 'bg-[#4EBEE3] text-white shadow-sm'
                            : 'text-[#16274D] hover:bg-white'
                        }`}
                      >
                        Channels
                      </button>
                    </div>
                  </div>

                  {/* Metrics Row - Smaller boxes side by side */}
                  <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
                    {/* Total Usage */}
                    <div className="bg-[#F8FAFC] rounded-lg p-2 border border-gray-200">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-0.5">
                        {usageTab === 'engagement' ? 'Total Interactions' : usageTab === 'patient-services' ? 'Total Requests' : 'Total Usage Hours'}
                      </div>
                      <div className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">
                        {getUsageData(usageTab).reduce((sum, item) => sum + (item[getDataKey(usageTab)] || 0), 0).toLocaleString()}{usageTab === 'channels' ? 'h' : ''}
                      </div>
                    </div>

                    {/* Tab-Specific Peak Hours */}
                    <div className="bg-[#F8FAFC] rounded-lg p-2 border border-gray-200">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-0.5">
                        {usageTab === 'engagement' ? 'Engagement Peak' : usageTab === 'patient-services' ? 'Service Peak' : 'Channel Peak'}
                      </div>
                      <div className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        {getTabSpecificPeakHours(usageTab).time}
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart - More vertical space */}
                  <div className="flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                      <BarChart data={getUsageData(usageTab)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#16274D', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#16274D', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: '8px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            padding: '6px 10px'
                          }}
                          cursor={false}
                        />
                        <Bar 
                          dataKey={getDataKey(usageTab)} 
                          fill="#4EBEE3" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={30}
                          onMouseEnter={(data, index, e) => {
                            const bar = e.target;
                            bar.setAttribute('fill', '#3DA5CA');
                          }}
                          onMouseLeave={(data, index, e) => {
                            const bar = e.target;
                            bar.setAttribute('fill', '#4EBEE3');
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Side - Cards */}
                <div className="flex flex-col gap-2.5" style={{ height: '480px' }}>
                  {/* Days Since Admission - Top Card */}
                  <div className="bg-gradient-to-br from-[#4EBEE3]/10 to-[#4EBEE3]/5 rounded-xl border-2 border-[#4EBEE3]/30 p-3.5">
                    <div className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">
                      Days Since Admission
                    </div>
                    <div className="text-[28px] font-semibold text-[#4EBEE3] font-['Poppins',sans-serif] leading-none mb-0.5">
                      7
                    </div>
                    <div className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif]">Patient stay duration</div>
                  </div>

                  {/* Rest of the cards in a flex container */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    {/* Top Engagement Category */}
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-1">
                        Top Engagement Category
                      </div>
                      <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-tight mb-0.5">
                        {getUsageData('engagement')[0].name}
                      </div>
                      <div className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">
                        <span className="text-[#4EBEE3] font-medium">{getUsageData('engagement')[0].interactions.toLocaleString()}</span> interactions
                      </div>
                    </div>

                    {/* Top Used Service */}
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-1">Top Used Service</div>
                      <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-tight mb-0.5">
                        {getUsageData('patient-services')[0].name}
                      </div>
                      <div className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">
                        <span className="text-[#4EBEE3] font-medium">{getUsageData('patient-services')[0].requests.toLocaleString()}</span> requests
                      </div>
                    </div>

                    {/* Top Watched Channel */}
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-1">Top Watched Channel</div>
                      <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-tight mb-0.5">
                        {getUsageData('channels')[0].name}
                      </div>
                      <div className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">
                        <span className="text-[#4EBEE3] font-medium">{getUsageData('channels')[0].hours.toLocaleString()}</span> hours
                      </div>
                    </div>

                    {/* Peak Usage Hours - Overall pattern */}
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                      <div className="text-[10px] text-[#637381] font-['Poppins',sans-serif] mb-1">Overall Peak Hours</div>
                      <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-tight mb-0.5">
                        2PM - 6PM
                      </div>
                      <div className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">Afternoon peak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}