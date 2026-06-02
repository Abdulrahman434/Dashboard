import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Activity,
  Settings,
  Clock,
  Wifi,
  Link2,
  Tablet,
  Monitor,
  MonitorOff,
  PlayCircle,
  PauseCircle,
  Grid3x3,
  AlertCircle,
  Info,
  Download,
  PhoneCall,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  LayoutGrid,
  Code,
  User,
  Upload,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Send,
  ImagePlus,
  Video,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Newspaper,
  Award,
  Zap,
  FileText,
  Database,
  BarChart3,
  Bell,
  Layers,
  Tv,
  ChevronDown,
  ChevronUp,
  Headset,
  Play
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import hospitalLogo from '../assets/DallahLogo.png';
const welcomeCardBg = '../assets/Dallah-Hospital1.jpg';
import { BarChartAnimated, PieChartAnimated, LineChartAnimated } from './DashboardCharts';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Tooltip Component
const MetricTooltip = ({ text, iconColor = '#637381' }: { text: string, iconColor?: string }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-1 hover:opacity-80 transition-opacity"
        style={{ color: iconColor }}
      >
        <Info size={14} strokeWidth={2} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white text-[#16274D] text-[13px] rounded-lg shadow-lg border border-gray-200 font-['Poppins',sans-serif] leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}></div>
        </div>
      )}
    </div>
  );
};

// Sample hospital data - replace with real data
const hospitalInfo = {
  name: 'Dallah Hospital',
  location: 'Riyadh, Saudi Arabia',
  totalTerminals: 30,
  appVersion: '3.2.1',
  lastLogin: 'Dec 7, 2025 at 9:42 AM'
};

// System Health Metrics
const systemHealth = {
  overall: 91.9,
  moduleConfiguration: 82.3,
  uptime: 98.2,
  terminalConnectivity: 93.3,
  integrationStatus: 100
};

// Terminal Metrics
const terminalMetrics = {
  total: 30,
  connected: 28,
  offline: 2,
  activeTerminals: 28,
  totalTemplates: 12
};

// Care Call Summary (last 24 hours)
const careCallSummary = {
  totalCalls: 87,
  avgDuration: '3m 24s',
  peakHour: '2-3 PM',
  longestCall: '12m 15s'
};

// Recent Activity Feed - only dashboard activities
const recentActivity = [
  { 
    type: 'content',
    text: 'New asset "WhatsApp" uploaded to Content Library',
    time: '2 min ago',
    icon: Activity
  },
  { 
    type: 'wallpaper',
    text: 'Wallpaper "Summer Beach Sunset" activated',
    time: '15 min ago',
    icon: Activity
  },
  { 
    type: 'wallpaper',
    text: 'New wallpaper "Wallpaper 1" added',
    time: '23 min ago',
    icon: Activity
  },
  { 
    type: 'notification',
    text: 'Notification "Ramadan Visiting Hours" sent',
    time: '45 min ago',
    icon: Activity
  },
  { 
    type: 'survey',
    text: 'Survey "Patient Experience Survey" activated',
    time: '1 hour ago',
    icon: Activity
  }
];



// System Configurations - Updated with all items
const systemConfigurations = [
  { id: 'wallpaper', title: 'Wallpaper', icon: ImagePlus, count: 0, status: 'pending', navKey: 'wallpaper-library' },
  { id: 'welcome', title: 'Welcome Note', icon: MessageCircle, count: 3, status: 'configured', navKey: 'greeting-message' },
  { id: 'newsfeed', title: 'News Feed', icon: Newspaper, count: 0, status: 'pending', navKey: 'news-feed' },
  { id: 'content-library', title: 'Content Library', icon: Database, count: 25, status: 'configured', navKey: 'content-library' },
  { id: 'channels', title: 'Channels', icon: Monitor, count: 45, status: 'configured', navKey: 'channels' },
  { id: 'hospital-profile', title: 'Hospital Profile', icon: Building2, count: 1, status: 'configured', navKey: 'hospital-settings' },
  { id: 'his-integration', title: 'HIS Integration', icon: Layers, count: 0, status: 'pending', navKey: 'integrations' },
  { id: 'sip-config', title: 'SIP Configuration', icon: Phone, count: 0, status: 'pending', navKey: 'care-call' },
];

// Chart Data - Updated with correct content types
const contentLibraryData = [
  { name: 'APK', engagement: 45, patient: 32 },
  { name: 'Service', engagement: 78, patient: 54 },
  { name: 'Stream', engagement: 23, patient: 67 },
  { name: 'PDF', engagement: 42, patient: 28 },
  { name: 'URL', engagement: 12, patient: 8 }
];

// Channel Types - CareInn Blue Palette ONLY
const channelsData = [
  { name: 'Kids', value: 12, color: '#4EBEE3' },
  { name: 'Entertainment', value: 25, color: '#16274D' },
  { name: 'News', value: 18, color: '#3DA5CA' },
  { name: 'Sports', value: 20, color: '#5BC7E8' },
  { name: 'Religious', value: 25, color: '#2B3E5F' }
];

// Care Call Types - CareInn Blue Palette ONLY
const careCallTypes = [
  { name: 'Incoming', value: 52, color: '#4EBEE3' },
  { name: 'Outgoing', value: 35, color: '#16274D' }
];

const notificationsData = [
  { time: '6am', count: 5, terminals: 5 },
  { time: '9am', count: 12, terminals: 12 },
  { time: '12pm', count: 18, terminals: 18 },
  { time: '3pm', count: 25, terminals: 25 },
  // Current time is around 3pm, so line stops here but axis continues
  { time: '6pm', count: 25, terminals: null },
  { time: '9pm', count: 25, terminals: null }
];



// Auto-refresh interval options
const refreshIntervals = [
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
  { label: 'Off', value: 0 }
];

// Custom Tooltip Components
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-[10px] text-[#4EBEE3] font-['Poppins',sans-serif]">
          Engagement: {payload[0].value}
        </p>
        <p className="text-[10px] text-[#16274D] font-['Poppins',sans-serif]">
          Patient Services: {payload[1].value}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
          {payload[0].payload.time}
        </p>
        <p className="text-[10px] text-[#4EBEE3] font-['Poppins',sans-serif]">
          Notifications: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

interface DashboardHomeProps {
  onNavigate?: (page: string, filters?: { connection?: string; status?: string }) => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  
  // Modal state for Send Notification
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Notification modal states
  const [recipientType, setRecipientType] = useState<'patient-groups' | 'hospital-wards'>('patient-groups');
  const [selectedPatientGroups, setSelectedPatientGroups] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const [isPatientGroupDropdownOpen, setIsPatientGroupDropdownOpen] = useState(false);

  // System configurations filter
  const [configFilter, setConfigFilter] = useState<'all' | 'pending' | 'configured'>('all');

  const totalAssets = contentLibraryData.reduce((sum, item) => sum + item.engagement + item.patient, 0);
  const totalChannels = channelsData.reduce((sum, item) => sum + item.value, 0);
  const notificationsSentToday = notificationsData.reduce((sum, item) => sum + item.count, 0);

  // Group and ward options for notifications
  const groupOptions = ['Kids', 'Adults', 'VIP'];
  const wardOptions = ['1A', '2B', '3C', '4A', '5B', '6C'];

  // Handle patient group selection for notifications
  const handlePatientGroupToggle = (group: string) => {
    if (group === 'Select All') {
      if (selectedPatientGroups.length === groupOptions.length) {
        setSelectedPatientGroups([]);
      } else {
        setSelectedPatientGroups([...groupOptions]);
      }
    } else {
      if (selectedPatientGroups.includes(group)) {
        setSelectedPatientGroups(selectedPatientGroups.filter(g => g !== group));
      } else {
        setSelectedPatientGroups([...selectedPatientGroups, group]);
      }
    }
  };

  // Handle ward selection for notifications
  const handleWardToggle = (ward: string) => {
    if (ward === 'Select All') {
      if (selectedWards.length === wardOptions.length) {
        setSelectedWards([]);
      } else {
        setSelectedWards([...wardOptions]);
      }
    } else {
      if (selectedWards.includes(ward)) {
        setSelectedWards(selectedWards.filter(w => w !== ward));
      } else {
        setSelectedWards([...selectedWards, ward]);
      }
    }
  };

  return (
    <>
    <div className="h-full overflow-auto px-2 md:px-3 lg:px-4 xl:px-5 py-2 md:py-2.5 lg:py-3 gap-2 md:gap-2.5 lg:gap-3 flex flex-col">
      {/* Row 1: Hospital Header Card + Welcome Card */}
      <div className="grid gap-2 md:gap-2.5 lg:gap-3 grid-cols-1 xl:grid-cols-[1fr_28.5%] items-start">
        {/* Left Column: Hospital Card */}
        <div className="flex flex-col gap-2 md:gap-2.5 lg:gap-3 h-full order-2 xl:order-1">
          {/* Hospital Header Card with Metrics - Compact */}
          <motion.div 
            className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-3.5 lg:p-4 overflow-hidden flex flex-col gap-2 md:gap-2.5 lg:gap-3 h-full" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Hospital Info Section */}
            <div className="flex items-center gap-2 md:gap-2.5">
              {/* Hospital Logo */}
              <div className="shrink-0">
                <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center shadow-md border border-[#4EBEE3]/20 hover:shadow-lg transition-all duration-300 hover:scale-105 p-1">
                  <img 
                    src={hospitalLogo} 
                    alt="Saint Louis Hospital Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div className="flex-1">
                <h2 className="text-[13px] md:text-[14px] lg:text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-0.5">
                  {hospitalInfo.name}
                </h2>
                <p className="text-[10px] md:text-[10.5px] lg:text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                  {hospitalInfo.location}
                </p>
              </div>
            </div>

            {/* Metrics Grid - System Health + 6 Terminal Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-2 md:gap-2.5 lg:gap-3 items-stretch">
              {/* System Health - Left Side */}
              <div className="bg-[#16274D] rounded-lg shadow-sm border border-[#16274D] flex">
                <div className="px-3 md:px-3.5 lg:px-4 py-2 md:py-2.5 lg:py-3 h-full flex flex-col w-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center">
                      <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-white font-['Poppins',sans-serif] whitespace-nowrap">
                        System Health
                      </h3>
                      <MetricTooltip text="Overall system health calculated from uptime, terminal connectivity, and system configurations." iconColor="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-white/10">
                      <Activity size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Overall Health Score */}
                  <div className="mb-1.5 md:mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[20px] md:text-[22px] lg:text-[24px] font-semibold font-['Poppins',sans-serif] text-white">
                        {systemHealth.overall}%
                      </span>
                      <span className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-white/60 font-['Poppins',sans-serif]">Overall</span>
                    </div>
                  </div>

                  {/* Sub-metrics */}
                  <div className="space-y-1 md:space-y-1.5 flex-1 flex flex-col justify-evenly">
                    {/* System Configurations */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Settings size={10} className="md:w-[10.5px] md:h-[10.5px] lg:w-[11px] lg:h-[11px] text-white/50 shrink-0" strokeWidth={2} />
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-[8.5px] md:text-[9px] lg:text-[9.5px] font-medium text-white/70 font-['Poppins',sans-serif] whitespace-nowrap truncate">System Configurations</span>
                          <MetricTooltip text="Percentage of system configurations that have been fully configured and are ready for use." iconColor="rgba(255,255,255,0.5)" />
                        </div>
                      </div>
                      <span className="text-[10px] md:text-[10.5px] lg:text-[11px] font-semibold text-white font-['Poppins',sans-serif] text-right tabular-nums ml-2 shrink-0">{systemHealth.moduleConfiguration}%</span>
                    </div>

                    {/* Uptime */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Clock size={10} className="md:w-[10.5px] md:h-[10.5px] lg:w-[11px] lg:h-[11px] text-white/50 shrink-0" strokeWidth={2} />
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-[8.5px] md:text-[9px] lg:text-[9.5px] font-medium text-white/70 font-['Poppins',sans-serif] whitespace-nowrap truncate">Uptime (Last 24 hours)</span>
                          <MetricTooltip text="System availability calculated over the last 24 hours." iconColor="rgba(255,255,255,0.5)" />
                        </div>
                      </div>
                      <span className="text-[10px] md:text-[10.5px] lg:text-[11px] font-semibold text-white font-['Poppins',sans-serif] text-right tabular-nums ml-2 shrink-0">{systemHealth.uptime}%</span>
                    </div>

                    {/* Terminal Connectivity */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Wifi size={10} className="md:w-[10.5px] md:h-[10.5px] lg:w-[11px] lg:h-[11px] text-white/50 shrink-0" strokeWidth={2} />
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-[8.5px] md:text-[9px] lg:text-[9.5px] font-medium text-white/70 font-['Poppins',sans-serif] whitespace-nowrap truncate">Terminal Connectivity</span>
                          <MetricTooltip text="Shows percentage of terminals that are currently connected to server." iconColor="rgba(255,255,255,0.5)" />
                        </div>
                      </div>
                      <span className="text-[10px] md:text-[10.5px] lg:text-[11px] font-semibold text-white font-['Poppins',sans-serif] text-right tabular-nums ml-2 shrink-0">93.3%</span>
                    </div>

                    {/* Integration Status */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Link2 size={10} className="md:w-[10.5px] md:h-[10.5px] lg:w-[11px] lg:h-[11px] text-white/50 shrink-0" strokeWidth={2} />
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-[8.5px] md:text-[9px] lg:text-[9.5px] font-medium text-white/70 font-['Poppins',sans-serif] whitespace-nowrap truncate">Integration Status</span>
                          <MetricTooltip text="100%: all required integrations are functioning normally. 0%: one or more integrations are not functioning." iconColor="rgba(255,255,255,0.5)" />
                        </div>
                      </div>
                      <span className="text-[10px] md:text-[10.5px] lg:text-[11px] font-semibold text-white font-['Poppins',sans-serif] text-right tabular-nums ml-2 shrink-0">{systemHealth.integrationStatus}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Cards - Right Side - 2 Rows x 3 Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2 lg:gap-2.5 grid-rows-2 items-stretch">
                {/* Total Terminals */}
                <div 
                  onClick={() => onNavigate?.('careinn')}
                  className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <Tablet size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3] rotate-90" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Total Terminals</div>
                      <MetricTooltip text="Total number of patient terminals registered in the system." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{terminalMetrics.total}</div>
                  </div>
                </div>

                {/* Connected */}
                <div 
                  onClick={() => onNavigate?.('careinn', { connection: 'connected' })}
                  className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <Monitor size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3]" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected</div>
                      <MetricTooltip text="Terminals currently online and connected to the server." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{terminalMetrics.connected}</div>
                  </div>
                </div>

                {/* Disconnected */}
                <div 
                  onClick={() => onNavigate?.('careinn', { connection: 'disconnected' })}
                  className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <MonitorOff size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3]" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected</div>
                      <MetricTooltip text="Terminals disconnected from the server." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{terminalMetrics.offline}</div>
                  </div>
                </div>

                {/* Activated */}
                <div 
                  onClick={() => onNavigate?.('careinn', { status: 'active' })}
                  className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <Tablet size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3] rotate-90" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Activated</div>
                      <MetricTooltip text="Terminals activated and ready for patient assignment." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{terminalMetrics.activeTerminals}</div>
                  </div>
                </div>

                {/* In-Use */}
                <div className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <PlayCircle size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3]" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">In-Use</div>
                      <MetricTooltip text="Terminals with at least one interaction in the past hour." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">25</div>
                  </div>
                </div>

                {/* Idle */}
                <div className="bg-[#F9FAFB] rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="flex flex-col px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 lg:py-3 h-full">
                    <div className="flex items-center justify-center w-[28px] h-[28px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px] rounded-lg bg-[#4EBEE3]/10 mb-1.5 md:mb-2">
                      <PauseCircle size={13} className="md:w-[14px] md:h-[14px] lg:w-4 lg:h-4 text-[#4EBEE3]" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="text-[9px] md:text-[9.5px] lg:text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Idle</div>
                      <MetricTooltip text="Active terminals that have no interaction for >= 1 hour." />
                    </div>
                    <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">3</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>


        </div>

        {/* Right Column Row 1: Welcome Card + Notifications */}
        <div className="flex flex-col gap-2 md:gap-2.5 lg:gap-3 h-full order-1 xl:order-2">
          {/* Welcome Card - FIXED HEIGHT */}
          <motion.div 
            className="relative rounded-lg overflow-hidden shadow-sm" 
            style={{ minHeight: '120px', maxHeight: '140px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${welcomeCardBg})` 
              }}
            ></div>
            
            {/* Gradient Overlay - Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400/90 via-gray-300/70 to-transparent"></div>
            
            {/* Bottom Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-gray-500/60"></div>
            
            <div className="relative z-10 p-3 md:p-3.5 lg:p-4 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-1 md:gap-1.5">
                <p className="text-[8.5px] md:text-[9px] text-white font-['Poppins',sans-serif] tracking-wide">
                  Saturday, December 7, 2025
                </p>
                <div className="flex items-center gap-1 md:gap-1.5">
                  <User size={13} className="md:w-[14px] md:h-[14px] text-white" strokeWidth={2.5} />
                  <h2 className="text-[12px] md:text-[13px] lg:text-[14px] font-semibold text-white font-['Poppins',sans-serif]">
                    Welcome back, Admin
                  </h2>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[8px] md:text-[8.5px] text-white/80 font-['Poppins',sans-serif] flex items-center gap-1">
                    <Clock size={9} className="md:w-[9.5px] md:h-[9.5px] text-white/80" strokeWidth={2} />
                    Last login: {hospitalInfo.lastLogin}
                  </p>
                  <p className="text-[8px] md:text-[8.5px] text-white/80 font-['Poppins',sans-serif] flex items-center gap-1">
                    <Code size={9} className="md:w-[9.5px] md:h-[9.5px] text-white/80" strokeWidth={2} />
                    App Version: {hospitalInfo.appVersion}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <button 
                  onClick={() => onNavigate?.('analytics')}
                  className="bg-[#4EBEE3] text-white px-3 py-1.5 rounded-lg hover:bg-[#3DA5CA] transition-all shadow-md hover:shadow-lg text-[10px] md:text-[10.5px] font-medium font-['Poppins',sans-serif]"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notifications Sent Today */}
          <motion.div 
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-3.5 lg:p-4 flex-1 flex flex-col min-h-[160px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] flex items-center gap-1.5">
                <Bell size={11} className="md:w-3 md:h-3 text-[#4EBEE3]" strokeWidth={2} />
                Notifications Sent Today
              </h3>
              <button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
              >
                <Send size={11} className="md:w-3 md:h-3 text-white" strokeWidth={2} />
                <span className="text-[9px] md:text-[10px] lg:text-[10.5px] font-medium font-['Poppins',sans-serif]">Send</span>
              </button>
            </div>
            <div className="w-full h-[140px] min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
                <LineChart data={notificationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'Poppins' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    height={20}
                  />
                  <YAxis 
                    domain={[0, 30]}
                    ticks={[0, 10, 20, 30]}
                    tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'Poppins' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="terminals" 
                    stroke="#4EBEE3" 
                    strokeWidth={2}
                    dot={{ fill: '#4EBEE3', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Row 2: System Configurations + Quick Links */}
      <div className="grid gap-2 md:gap-2.5 lg:gap-3 grid-cols-1 xl:grid-cols-[1fr_28.5%] items-start">
        {/* System Configurations */}
        <motion.div 
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-3.5 lg:p-4" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
        <div className="flex items-center justify-between mb-2 md:mb-2.5">
          <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] flex items-center gap-1 md:gap-1.5">
            <Settings size={11} className="md:w-3 md:h-3 text-[#4EBEE3]" strokeWidth={2} />
            System Configurations
          </h3>
          <select
              value={configFilter}
              onChange={(e) => setConfigFilter(e.target.value as 'all' | 'pending' | 'configured')}
              className="text-[10px] md:text-[10.5px] font-['Poppins',sans-serif] text-[#16274D] bg-white border border-gray-200 rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 pr-6 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '10px'
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="configured">Configured</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2 lg:gap-2.5">
          {systemConfigurations
            .filter(config => configFilter === 'all' || config.status === configFilter)
            .map((config) => {
            const IconComponent = config.icon;
            
            return (
              <button
                key={config.id}
                onClick={() => {
                  if (config.navKey) onNavigate?.(config.navKey);
                }}
                className="bg-[#F8FAFC] rounded-lg border border-gray-200 p-2 md:p-2.5 hover:border-[#4ebee3]/40 hover:shadow-md transition-all duration-200 text-left group h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-2 w-full">
                  {/* Icon */}
                  <div className="shrink-0 p-1.5 bg-[#4EBEE3]/10 rounded-lg group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <IconComponent size={14} className="text-[#4ebee3]" strokeWidth={2} />
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`shrink-0 px-1.5 py-0.5 rounded-full text-[8px] md:text-[8.5px] font-medium font-['Poppins',sans-serif] ${
                    config.status === 'pending' 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'bg-green-50 text-green-600 border border-green-200'
                  }`}>
                    {config.status === 'pending' ? 'Pending' : 'Configured'}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="text-[11px] md:text-[11.5px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-0.5 line-clamp-2">
                    {config.title}
                  </div>
                  <div className="text-[9px] md:text-[9.5px] text-[#6B7280] font-['Poppins',sans-serif]">
                    {config.count} item{config.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div 
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-3.5 lg:p-4 flex flex-col" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2 md:mb-2.5">
          Quick Links
        </h3>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          {/* CareConnect */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-2 md:p-2.5 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
          >
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 bg-[#4EBEE3]/10 rounded-lg group-hover:bg-[#4EBEE3]/20 transition-colors">
                <Video size={13} strokeWidth={2} className="text-[#4EBEE3]" />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] md:text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  CareConnect
                </div>
              </div>
              <ExternalLink size={11} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
            </div>
          </a>

          {/* CareSuite */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-2 md:p-2.5 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
          >
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 bg-[#4EBEE3]/10 rounded-lg group-hover:bg-[#4EBEE3]/20 transition-colors">
                <Sparkles size={13} strokeWidth={2} className="text-[#4EBEE3]" />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] md:text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  CareSuite
                </div>
              </div>
              <ExternalLink size={11} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
            </div>
          </a>

          {/* Nurse Station */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-2 md:p-2.5 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
          >
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 bg-[#4EBEE3]/10 rounded-lg group-hover:bg-[#4EBEE3]/20 transition-colors">
                <Monitor size={13} strokeWidth={2} className="text-[#4EBEE3]" />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] md:text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Nurse Station
                </div>
              </div>
              <ExternalLink size={11} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
            </div>
          </a>

          {/* Get Support */}
          <a
            href="https://careinn.freshdesk.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-2 md:p-2.5 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
          >
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 bg-[#4EBEE3]/10 rounded-lg group-hover:bg-[#4EBEE3]/20 transition-colors">
                <MessageCircle size={13} strokeWidth={2} className="text-[#4EBEE3]" />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] md:text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Get Support
                </div>
              </div>
              <ExternalLink size={11} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
            </div>
          </a>
        </div>
      </motion.div>
    </div>

    {/* Row 3: Recent Activity (Full Width) */}
    <motion.div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-3.5 lg:p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2 md:mb-2.5">
            <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Recent Activity
            </h3>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-[10px] md:text-[10.5px] font-['Poppins',sans-serif] text-[#16274D] bg-white border border-gray-200 rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 pr-6 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '10px'
              }}
            >
              {refreshIntervals.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  Auto-refresh: {interval.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 md:p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-2 md:gap-2.5">
                    <div className="w-6 h-6 md:w-7 md:h-7 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                      <IconComponent size={12} className="text-[#4EBEE3]" />
                    </div>
                    <div>
                      <p className="text-[10.5px] md:text-[11px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {activity.text}
                      </p>
                      {activity.duration && (
                        <p className="text-[9px] md:text-[9.5px] text-[#6B7280] font-['Poppins',sans-serif]">
                          Duration: {activity.duration}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] md:text-[9.5px] text-[#6B7280] font-['Poppins',sans-serif] whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
    </div>

    {/* Send Notification Modal */}
    {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotificationModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[900px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
              <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Send Notification</h2>
              <button onClick={() => setShowNotificationModal(false)} className="text-[#89898A] hover:text-[#16274D] transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Row 1: Title (EN) and Title (AR) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2 block">Title (EN)</label>
                  <input 
                    type="text" 
                    placeholder="Enter English title..." 
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] placeholder:text-[#C4C4C4] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2 block">Title (AR)</label>
                  <input 
                    type="text" 
                    placeholder="أدخل العنوان العربي..." 
                    dir="rtl"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] placeholder:text-[#C4C4C4] transition-colors text-right" 
                  />
                </div>
              </div>

              {/* Row 2: Desc. (EN) and Desc. (AR) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2 block">Desc. (EN)</label>
                  <textarea 
                    placeholder="Enter English description..." 
                    rows={3} 
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] placeholder:text-[#C4C4C4] resize-none transition-colors"
                  ></textarea>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2 block">Desc. (AR)</label>
                  <textarea 
                    placeholder="أدخل الوصف العربي..." 
                    rows={3} 
                    dir="rtl"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] placeholder:text-[#C4C4C4] resize-none transition-colors text-right"
                  ></textarea>
                </div>
              </div>

              {/* To: Radio Buttons */}
              <div>
                <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-3 block">To:</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        recipientType === 'patient-groups' ? 'border-[#4EBEE3]' : 'border-gray-300'
                      }`}
                      onClick={() => setRecipientType('patient-groups')}
                    >
                      {recipientType === 'patient-groups' && (
                        <div className="w-2 h-2 rounded-full bg-[#4EBEE3]"></div>
                      )}
                    </div>
                    <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Patient Groups</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        recipientType === 'hospital-wards' ? 'border-[#4EBEE3]' : 'border-gray-300'
                      }`}
                      onClick={() => setRecipientType('hospital-wards')}
                    >
                      {recipientType === 'hospital-wards' && (
                        <div className="w-2 h-2 rounded-full bg-[#4EBEE3]"></div>
                      )}
                    </div>
                    <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Hospital Wards</span>
                  </label>
                </div>
              </div>

              {/* Patient Groups Dropdown */}
              {recipientType === 'patient-groups' && (
                <div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg text-[14px] font-['Poppins',sans-serif] flex items-center justify-between transition-colors ${
                        isPatientGroupDropdownOpen ? 'border-[#4EBEE3] bg-white' : 'border-gray-200 bg-white hover:border-[#4EBEE3]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPatientGroupDropdownOpen(!isPatientGroupDropdownOpen);
                      }}
                    >
                      <span className={selectedPatientGroups.length > 0 ? "text-[#16274D]" : "text-[#89898A]"}>
                        {selectedPatientGroups.length > 0 
                          ? selectedPatientGroups.length === groupOptions.length 
                            ? 'All groups selected'
                            : selectedPatientGroups.join(', ')
                          : 'Select patient groups'
                        }
                      </span>
                      {isPatientGroupDropdownOpen ? (
                        <ChevronUp size={18} className="text-[#89898A]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#89898A]" />
                      )}
                    </button>
                    
                    {/* Patient Group Dropdown Content */}
                    {isPatientGroupDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white border-2 border-[#4EBEE3] rounded-lg p-3 space-y-2.5 max-h-[200px] overflow-y-auto shadow-lg">
                        {/* Select All */}
                        <label 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePatientGroupToggle('Select All');
                          }}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            selectedPatientGroups.length === groupOptions.length
                              ? 'bg-[#4EBEE3]'
                              : 'bg-white border-2 border-gray-300'
                          }`}>
                            {selectedPatientGroups.length === groupOptions.length && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                            Select All
                          </span>
                        </label>

                        {/* Individual Groups */}
                        {groupOptions.map((group) => (
                          <label 
                            key={group} 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePatientGroupToggle(group);
                            }}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              selectedPatientGroups.includes(group)
                                ? 'bg-[#4EBEE3]'
                                : 'bg-white border-2 border-gray-300'
                            }`}>
                              {selectedPatientGroups.includes(group) && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                              {group}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hospital Wards Dropdown */}
              {recipientType === 'hospital-wards' && (
                <div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg text-[14px] font-['Poppins',sans-serif] flex items-center justify-between transition-colors ${
                        isWardDropdownOpen ? 'border-[#4EBEE3] bg-white' : 'border-gray-200 bg-white hover:border-[#4EBEE3]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsWardDropdownOpen(!isWardDropdownOpen);
                      }}
                    >
                      <span className={selectedWards.length > 0 ? "text-[#16274D]" : "text-[#89898A]"}>
                        {selectedWards.length > 0 
                          ? selectedWards.length === wardOptions.length 
                            ? 'All wards selected'
                            : selectedWards.join(', ')
                          : 'Select wards'
                        }
                      </span>
                      {isWardDropdownOpen ? (
                        <ChevronUp size={18} className="text-[#89898A]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#89898A]" />
                      )}
                    </button>
                    
                    {/* Ward Dropdown Content */}
                    {isWardDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white border-2 border-[#4EBEE3] rounded-lg p-3 space-y-2.5 max-h-[200px] overflow-y-auto shadow-lg">
                        {/* Select All */}
                        <label 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={(e) => {
                            e.preventDefault();
                            handleWardToggle('Select All');
                          }}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            selectedWards.length === wardOptions.length
                              ? 'bg-[#4EBEE3]'
                              : 'bg-white border-2 border-gray-300'
                          }`}>
                            {selectedWards.length === wardOptions.length && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                            Select All
                          </span>
                        </label>

                        {/* Individual Wards */}
                        {wardOptions.map((ward) => (
                          <label 
                            key={ward} 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={(e) => {
                              e.preventDefault();
                              handleWardToggle(ward);
                            }}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              selectedWards.includes(ward)
                                ? 'bg-[#4EBEE3]'
                                : 'bg-white border-2 border-gray-300'
                            }`}>
                              {selectedWards.includes(ward) && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                              {ward}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end pt-5 mt-5 border-t border-gray-200">
              <button 
                onClick={() => setShowNotificationModal(false)} 
                className="px-6 py-2.5 text-[14px] font-medium font-['Poppins',sans-serif] text-[#16274D] border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium font-['Poppins',sans-serif] shadow-sm hover:shadow-md">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}