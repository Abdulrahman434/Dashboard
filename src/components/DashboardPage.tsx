import { useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import svgPaths from "../imports/svg-acmjk7rz42";
import { 
  Monitor,
  MonitorOff,
  Tablet,
  Grid3x3,
  Video,
  Smartphone,
  Clock,
  Send,
  Eye,
  TrendingUp,
  AlertCircle,
  Download,
  Activity,
  Settings,
  Wifi,
  Link2,
  CheckCircle2,
  PlayCircle,
  Info,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// CareInn Color Palette with new category colors
const COLORS = {
  darkBlue: '#16274D',
  lightBlue: '#4EBEE3',
  lightGrey: '#DDDDDE',
  cyan: '#22D3EE',
  teal: '#14B8A6',
  green: '#10B981',
  // New category colors
  vip: '#00B8D9',
  kids: '#BDECFC',
  adults: '#16274D',
};

// User type configurations
type UserType = 'All' | 'Kids' | 'Adults' | 'VIP';
type TimeRange = 'Today' | 'Last 30 days' | 'Last Quarter' | 'Last Year';

// Top 3 usage data based on time range
const getTop3Usage = (timeRange: TimeRange) => {
  switch (timeRange) {
    case 'Today':
      return [
        { name: 'YouTube', type: 'App', hours: 468, color: '#9CA3AF' },
        { name: 'LiveTV', type: 'Service', hours: 320, color: '#4EBEE3' },
        { name: 'MBC1', type: 'Channel', hours: 285, color: '#16274D' },
      ];
    case 'Last 30 days':
      return [
        { name: 'WhatsApp', type: 'App', hours: 4680, color: '#9CA3AF' },
        { name: 'Instagram', type: 'App', hours: 3380, color: '#9CA3AF' },
        { name: 'LiveTV', type: 'Service', hours: 2950, color: '#4EBEE3' },
      ];
    case 'Last Quarter':
      return [
        { name: 'LiveTV', type: 'Service', hours: 9850, color: '#4EBEE3' },
        { name: 'WhatsApp', type: 'App', hours: 8920, color: '#9CA3AF' },
        { name: 'Rotana', type: 'Channel', hours: 7650, color: '#16274D' },
      ];
    case 'Last Year':
      return [
        { name: 'LiveTV', type: 'Service', hours: 42300, color: '#4EBEE3' },
        { name: 'WhatsApp', type: 'App', hours: 38560, color: '#9CA3AF' },
        { name: 'MBC1', type: 'Channel', hours: 31240, color: '#16274D' },
      ];
    default:
      return [
        { name: 'WhatsApp', type: 'App', hours: 4680, color: '#9CA3AF' },
        { name: 'Instagram', type: 'App', hours: 3380, color: '#9CA3AF' },
        { name: 'LiveTV', type: 'Service', hours: 2950, color: '#4EBEE3' },
      ];
  }
};

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
        <Info size={11} strokeWidth={2} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-white text-[#16274D] text-[10px] rounded-lg shadow-lg border border-gray-200 font-['Poppins',sans-serif] leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}></div>
        </div>
      )}
    </div>
  );
};

// Small Donut Chart Component
const SmallDonutChart = ({ active, total, colors }: { active: number, total: number, colors: { active: string, inactive: string } }) => {
  const inactive = total - active;
  const data = [
    { name: 'Activated', value: active },
    { name: 'Inactive', value: inactive }
  ];
  
  return (
    <div className="w-[56px] h-[56px]">
      <PieChart width={56} height={56}>
        <Pie
          data={data}
          cx={28}
          cy={28}
          innerRadius={20}
          outerRadius={28}
          startAngle={90}
          endAngle={450}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? colors.active : colors.inactive} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

// Fixed order for all charts - DO NOT SORT
const SERVICES_ORDER = ['LiveTV', 'Games', 'Reading', 'Social', 'Media', 'Tools', 'Call'];
const CHANNELS_ORDER = ['Saudi 1', 'MBC1', 'Rotana', 'MBC3', 'Rotana C.', 'SpaceT.'];
const APPS_ORDER = ['WhatsApp', 'X', 'TikTok', 'Instagram', 'Telegram', 'Snap', 'FB'];

// Generate data for "All" view - single totals
const generateAllServicesData = (timeRange: TimeRange) => {
  const multiplier = timeRange === 'Today' ? 0.1 : timeRange === 'Last 30 days' ? 1 : timeRange === 'Last Quarter' ? 3 : 12;
  
  const data: { [key: string]: number } = {
    'LiveTV': Math.round((890 + 1050 + 1420) * multiplier),
    'Games': Math.round((1450 + 380 + 420) * multiplier),
    'Reading': Math.round((520 + 780 + 850) * multiplier),
    'Social': Math.round((120 + 1120 + 980) * multiplier),
    'Media': Math.round((720 + 650 + 720) * multiplier),
    'Tools': Math.round((150 + 520 + 580) * multiplier),
    'Call': Math.round((80 + 890 + 1680) * multiplier),
  };
  
  return SERVICES_ORDER.map(name => ({ name, hours: data[name] }));
};

const generateAllChannelsData = (timeRange: TimeRange) => {
  const multiplier = timeRange === 'Today' ? 0.1 : timeRange === 'Last 30 days' ? 1 : timeRange === 'Last Quarter' ? 3 : 12;
  
  const data: { [key: string]: number } = {
    'Saudi 1': Math.round((280 + 1120 + 780) * multiplier),
    'MBC1': Math.round((320 + 980 + 1050) * multiplier),
    'Rotana': Math.round((180 + 850 + 1380) * multiplier),
    'MBC3': Math.round((1520 + 420 + 520) * multiplier),
    'Rotana C.': Math.round((450 + 680 + 1180) * multiplier),
    'SpaceT.': Math.round((1280 + 180 + 280) * multiplier),
  };
  
  return CHANNELS_ORDER.map(name => ({ name, hours: data[name] }));
};

const generateAllAppsData = (timeRange: TimeRange) => {
  const multiplier = timeRange === 'Today' ? 0.1 : timeRange === 'Last 30 days' ? 1 : timeRange === 'Last Quarter' ? 3 : 12;
  
  const data: { [key: string]: number } = {
    'WhatsApp': Math.round((720 + 1780 + 2180) * multiplier),
    'X': Math.round((280 + 1050 + 1120) * multiplier),
    'TikTok': Math.round((1680 + 720 + 620) * multiplier),
    'Instagram': Math.round((980 + 1120 + 1280) * multiplier),
    'Telegram': Math.round((420 + 680 + 1520) * multiplier),
    'Snap': Math.round((1280 + 520 + 480) * multiplier),
    'FB': Math.round((180 + 880 + 880) * multiplier),
  };
  
  return APPS_ORDER.map(name => ({ name, hours: data[name] }));
};

const generateAllNotificationsData = (timeRange: TimeRange) => {
  if (timeRange === 'Today') {
    const hours = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
    return hours.map((name, idx) => ({
      name,
      sent: Math.round(1 + idx * 0.5 + Math.random() * 0.5),
      acknowledged: Math.round(0.5 + idx * 0.4 + Math.random() * 0.4),
    }));
  }
  
  if (timeRange === 'Last 30 days') {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    return weeks.map((name, idx) => ({
      name,
      sent: Math.round(8 + idx * 2 + Math.random() * 2),
      acknowledged: Math.round(6 + idx * 1.5 + Math.random() * 1.5),
    }));
  }
  
  if (timeRange === 'Last Quarter') {
    const months = ['M1', 'M2', 'M3'];
    return months.map((name, idx) => ({
      name,
      sent: Math.round(35 + idx * 5 + Math.random() * 4),
      acknowledged: Math.round(28 + idx * 4 + Math.random() * 3),
    }));
  }
  
  // Last Year
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((name, idx) => ({
    name,
    sent: Math.round(40 + idx * 3 + Math.random() * 5),
    acknowledged: Math.round(32 + idx * 2.5 + Math.random() * 4),
  }));
};

// Generate single category data with FIXED ORDER
const generateSingleCategoryData = (category: UserType, timeRange: TimeRange, dataType: 'services' | 'channels' | 'apps') => {
  const multiplier = timeRange === 'Today' ? 0.1 : timeRange === 'Last 30 days' ? 1 : timeRange === 'Last Quarter' ? 3 : 12;
  
  const baseData = {
    services: {
      Kids: {
        'Games': 1450, 'LiveTV': 890, 'Media': 720, 'Reading': 520,
        'Tools': 150, 'Social': 120, 'Call': 80,
      },
      Adults: {
        'Social': 1120, 'LiveTV': 1050, 'Call': 890, 'Reading': 780,
        'Media': 650, 'Tools': 520, 'Games': 380,
      },
      VIP: {
        'Call': 1680, 'LiveTV': 1420, 'Social': 980, 'Reading': 850,
        'Media': 720, 'Tools': 580, 'Games': 420,
      }
    },
    channels: {
      Kids: {
        'MBC3': 1520, 'SpaceT.': 1280, 'Rotana C.': 450,
        'MBC1': 320, 'Saudi 1': 280, 'Rotana': 180,
      },
      Adults: {
        'Saudi 1': 1120, 'MBC1': 980, 'Rotana': 850,
        'Rotana C.': 680, 'MBC3': 420, 'SpaceT.': 180,
      },
      VIP: {
        'Rotana': 1380, 'Rotana C.': 1180, 'MBC1': 1050,
        'Saudi 1': 780, 'MBC3': 520, 'SpaceT.': 280,
      }
    },
    apps: {
      Kids: {
        'TikTok': 1680, 'Snap': 1280, 'Instagram': 980, 'WhatsApp': 720,
        'Telegram': 420, 'X': 280, 'FB': 180,
      },
      Adults: {
        'WhatsApp': 1780, 'Instagram': 1120, 'X': 1050, 'FB': 880,
        'TikTok': 720, 'Telegram': 680, 'Snap': 520,
      },
      VIP: {
        'WhatsApp': 2180, 'Telegram': 1520, 'Instagram': 1280, 'X': 1120,
        'FB': 880, 'TikTok': 620, 'Snap': 480,
      }
    }
  };
  
  if (category === 'All') return [];
  
  const order = dataType === 'services' ? SERVICES_ORDER : dataType === 'channels' ? CHANNELS_ORDER : APPS_ORDER;
  const categoryData = baseData[dataType][category];
  
  return order.map(name => ({ 
    name, 
    hours: Math.round((categoryData[name] || 0) * multiplier) 
  }));
};

const generateSingleCategoryNotifications = (category: UserType, timeRange: TimeRange) => {
  if (category === 'All') return [];
  
  const categoryRates = {
    Kids: { sentPerDay: 1.5, ackRate: 0.85 },
    Adults: { sentPerDay: 2, ackRate: 0.88 },
    VIP: { sentPerDay: 2.5, ackRate: 0.92 },
  };
  
  const rates = categoryRates[category];
  
  if (timeRange === 'Today') {
    const hours = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
    return hours.map((name, idx) => {
      const sent = Math.round((rates.sentPerDay / 6) * (1 + idx * 0.15) + Math.random() * 1);
      const acknowledged = Math.round(sent * rates.ackRate);
      return { name, sent, acknowledged };
    });
  }
  
  if (timeRange === 'Last 30 days') {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    return weeks.map((name, idx) => {
      const sent = Math.round(rates.sentPerDay * 7 * (1 + idx * 0.1) + Math.random() * 3);
      const acknowledged = Math.round(sent * rates.ackRate);
      return { name, sent, acknowledged };
    });
  }
  
  if (timeRange === 'Last Quarter') {
    const months = ['M1', 'M2', 'M3'];
    return months.map((name, idx) => {
      const sent = Math.round(rates.sentPerDay * 30 * (1 + idx * 0.08) + Math.random() * 8);
      const acknowledged = Math.round(sent * rates.ackRate);
      return { name, sent, acknowledged };
    });
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((name, idx) => {
    const sent = Math.round(rates.sentPerDay * 30 * (1 + idx * 0.05) + Math.random() * 15);
    const acknowledged = Math.round(sent * rates.ackRate);
    return { name, sent, acknowledged };
  });
};

// Custom Tooltip Component for Hours
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[11px] font-['Poppins',sans-serif]" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}h</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip Component for Notifications (Count)
const NotificationTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[11px] font-['Poppins',sans-serif]" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface DashboardPageProps {
  onNavigate?: (page: string, filters?: { connection?: string; status?: string }) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const [userType, setUserType] = useState<UserType>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days');

  // System Health Metrics
  const uptime = 99.2;
  const unitsConnectivity = 93.3;
  const moduleConfiguration = 83.3;
  const integrationStatus = 100; // Binary: 0 or 100
  
  // System Health = average (excluding integration as it's binary)
  const systemHealth = ((uptime + unitsConnectivity + moduleConfiguration) / 3).toFixed(1);
  
  // Determine health status color
  const getHealthColor = (value: number) => {
    if (value >= 95) return '#10B981';
    if (value >= 85) return '#4EBEE3';
    if (value >= 75) return '#F59E0B';
    return '#EF4444';
  };

  // Refs for chart animation control
  const servicesChartRef = useRef(null);
  const channelsChartRef = useRef(null);
  const appsChartRef = useRef(null);
  const notificationsChartRef = useRef(null);

  // Track if charts are in view
  const isServicesInView = useInView(servicesChartRef, { once: true, margin: "-50px" });
  const isChannelsInView = useInView(channelsChartRef, { once: true, margin: "-50px" });
  const isAppsInView = useInView(appsChartRef, { once: true, margin: "-50px" });
  const isNotificationsInView = useInView(notificationsChartRef, { once: true, margin: "-50px" });

  // Generate data based on selections
  const servicesData = userType === 'All' ? generateAllServicesData(timeRange) : generateSingleCategoryData(userType, timeRange, 'services');
  const channelsData = userType === 'All' ? generateAllChannelsData(timeRange) : generateSingleCategoryData(userType, timeRange, 'channels');
  const appsData = userType === 'All' ? generateAllAppsData(timeRange) : generateSingleCategoryData(userType, timeRange, 'apps');
  const notificationsData = userType === 'All' ? generateAllNotificationsData(timeRange) : generateSingleCategoryNotifications(userType, timeRange);

  // Calculate totals
  const servicesTotal = servicesData.reduce((sum, item) => sum + (item.hours || 0), 0);
  const channelsTotal = channelsData.reduce((sum, item) => sum + (item.hours || 0), 0);
  const appsTotal = appsData.reduce((sum, item) => sum + (item.hours || 0), 0);
  const notificationsSent = notificationsData.reduce((sum, item) => sum + (item.sent || 0), 0);
  const notificationsAck = notificationsData.reduce((sum, item) => sum + (item.acknowledged || 0), 0);
  const acknowledgmentRate = notificationsSent > 0 ? ((notificationsAck / notificationsSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="h-full overflow-auto p-5 bg-[#F8FAFC]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <LayoutGrid size={16} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Dashboard
              </h2>
              <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                Monitor system performance and analytics
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#4EBEE3] hover:bg-[#4EBEE3]/90 text-white rounded-lg transition-colors shadow-sm hover:shadow-md">
            <Download size={15} strokeWidth={2} />
            <span className="text-[12px] font-medium font-['Poppins',sans-serif]">Export</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        
        {/* Top Section: System Health + Metrics - Side by Side */}
        <div className="grid grid-cols-[0.8fr_2.2fr] gap-3">
          {/* System Health - Left Side */}
          <motion.div 
            className="bg-[#16274D] rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(22,39,77,0.4),0px_16px_32px_-4px_rgba(22,39,77,0.3)] transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="px-4 py-2.5">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="text-[14px] font-semibold text-white font-['Poppins',sans-serif]">
                    System Health
                  </h3>
                  <MetricTooltip text="Overall system health calculated from uptime, terminal connectivity, and module configuration metrics." iconColor="white" />
                </div>
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-lg bg-white/10 backdrop-blur-sm">
                  <Activity size={18} className="text-white" strokeWidth={2} />
                </div>
              </div>
              
              {/* Overall Health Score */}
              <div className="mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[26px] font-semibold font-['Poppins',sans-serif] text-white">
                    {systemHealth}%
                  </span>
                  <span className="text-[11px] font-medium text-white/80 font-['Poppins',sans-serif]">Overall</span>
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="space-y-1.5">
                {/* Module Configuration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Settings size={11} className="text-white/80" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-white/90 font-['Poppins',sans-serif]">Module Configuration</span>
                    <MetricTooltip text="Percentage of system modules that have been fully configured and are ready for use." iconColor="white" />
                  </div>
                  <span className="text-[11px] font-semibold text-white font-['Poppins',sans-serif]">{moduleConfiguration}%</span>
                </div>

                {/* Uptime */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-white/80" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-white/90 font-['Poppins',sans-serif]">Uptime (30 days)</span>
                    <MetricTooltip text="System availability calculated over the last 30 days." iconColor="white" />
                  </div>
                  <span className="text-[11px] font-semibold text-white font-['Poppins',sans-serif]">{uptime}%</span>
                </div>

                {/* Terminal Connectivity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wifi size={11} className="text-white/80" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-white/90 font-['Poppins',sans-serif]">Terminal Connectivity</span>
                    <MetricTooltip text="Shows percentage of terminals that are currently connected to server." iconColor="white" />
                  </div>
                  <span className="text-[11px] font-semibold text-white font-['Poppins',sans-serif]">{unitsConnectivity}%</span>
                </div>

                {/* Integration Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link2 size={11} className="text-white/80" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-white/90 font-['Poppins',sans-serif]">Integration Status</span>
                    <MetricTooltip text="100%: all required integrations are functioning normally. 0%: one or more integrations are not functioning." iconColor="white" />
                  </div>
                  <span className="text-[11px] font-semibold text-white font-['Poppins',sans-serif]">{integrationStatus}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metrics Cards - Right Side - 2 Rows x 3 Columns */}
          <div className="grid grid-cols-3 gap-2 auto-rows-fr">
            {/* Total Terminals */}
            <motion.div 
              className="bg-[#4EBEE3] rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => onNavigate?.('careinn')}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-white/90 font-['Poppins',sans-serif]">Total</div>
                    <MetricTooltip text="Total number of patient terminals registered in the system." iconColor="white" />
                  </div>
                  <div className="text-[24px] font-semibold text-white font-['Poppins',sans-serif] leading-none">30</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-white/10">
                  <Tablet size={18} className="text-white rotate-90" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Connected Terminals */}
            <motion.div 
              className="bg-white rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => onNavigate?.('careinn', { connection: 'connected' })}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected Terminals</div>
                    <MetricTooltip text="Terminals currently online and connected to the server." />
                  </div>
                  <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">28</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Disconnected Terminals */}
            <motion.div 
              className="bg-white rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => onNavigate?.('careinn', { connection: 'disconnected' })}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected Terminals</div>
                    <MetricTooltip text="Terminals disconnected from the server." />
                  </div>
                  <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">2</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Activated Terminals */}
            <motion.div 
              className="bg-white rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => onNavigate?.('careinn', { status: 'activated' })}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Activated</div>
                    <MetricTooltip text="Terminals that are currently activated in the system." />
                  </div>
                  <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">25</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-[#4EBEE3]/10">
                  <CheckCircle2 size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Terminals In Use */}
            <motion.div 
              className="bg-white rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">In Use</div>
                    <MetricTooltip text="Terminals currently assigned to admitted patients." />
                  </div>
                  <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">22</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-[#4EBEE3]/10">
                  <PlayCircle size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Idle Terminals */}
            <motion.div 
              className="bg-white rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] hover:-translate-y-1 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center justify-between px-4 py-2 gap-2 h-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <div className="text-[10px] font-medium text-[#637381] font-['Poppins',sans-serif]">Idle</div>
                    <MetricTooltip text="Activated terminals not currently assigned to patients." />
                  </div>
                  <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">3</div>
                </div>
                <div className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-[#4EBEE3]/10">
                  <Clock size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Row: Top 3 Overall Usage + Vertical Totals with Donut Charts */}
        <div className="grid grid-cols-3 gap-3">
          {/* Column 1 & 2: Top 3 Overall Usage */}
          <motion.div 
            className="col-span-2 bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Top 3 Overall Usage
              </h3>
              
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="text-[12px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#4EBEE3]/30 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjMTYyNzREIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat"
              >
                <option>Today</option>
                <option>Last 30 days</option>
                <option>Last Quarter</option>
                <option>Last Year</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-3">
              {getTop3Usage(timeRange).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[#4EBEE3]/20 hover:border-[#4EBEE3]/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4EBEE3] text-white font-semibold text-[14px] font-['Poppins',sans-serif]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] mt-0.5">
                      Total usage hours
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span 
                    className="px-3 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif]"
                    style={{ 
                      backgroundColor: `${item.color}10`, 
                      color: item.color 
                    }}
                  >
                    {item.type}
                  </span>
                  <span className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    {item.hours.toLocaleString()}h
                  </span>
                </div>
              </div>
              ))}
            </div>
          </motion.div>

          {/* Column 3: Vertical Totals Cards - Compact */}
          <motion.div 
            className="flex flex-col gap-4 justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Total Services - Light Blue */}
            <div className="bg-[#4EBEE3] rounded-[14px] shadow-sm">
              <div className="flex items-center justify-between px-6 py-5 gap-4">
                <div className="relative shrink-0 size-[70px]">
                  {/* Background circle */}
                  <div className="absolute inset-[5px]">
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="28" stroke="rgba(145, 158, 171, 0.16)" strokeWidth="3" />
                    </svg>
                  </div>
                  {/* Progress circle - 83.3% */}
                  <div className="absolute inset-[5px]" style={{ transform: 'rotate(-90deg)' }}>
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <motion.circle 
                        cx="30" 
                        cy="30" 
                        r="28" 
                        stroke="rgba(219, 246, 255, 1)" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        strokeDasharray="176 176"
                        initial={{ strokeDashoffset: 176 }}
                        whileInView={{ strokeDashoffset: 29.3 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                      />
                    </svg>
                  </div>
                  {/* Percentage text */}
                  <div className="absolute flex items-center justify-center inset-0 text-white font-semibold text-[13px] font-['Poppins',sans-serif]">
                    83%
                  </div>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <p className="text-[17px] font-bold text-white font-['Poppins',sans-serif]">Total Services</p>
                </div>

                <div className="flex flex-col gap-0.5 items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-white font-['Poppins',sans-serif]">Total:</span>
                    <span className="text-[20px] font-bold leading-none text-white font-['Poppins',sans-serif]">12</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-white font-['Poppins',sans-serif]">Activated:</span>
                    <span className="text-[20px] font-bold leading-none text-white font-['Poppins',sans-serif]">10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Channels - Dark Blue */}
            <div className="bg-[#16274D] rounded-[14px] shadow-sm">
              <div className="flex items-center justify-between px-6 py-5 gap-4">
                <div className="relative shrink-0 size-[70px]">
                  {/* Background circle */}
                  <div className="absolute inset-[5px]">
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="28" stroke="rgba(145, 158, 171, 0.16)" strokeWidth="3" />
                    </svg>
                  </div>
                  {/* Progress circle with gradient - 84.4% */}
                  <div className="absolute inset-[5px]" style={{ transform: 'rotate(-90deg)' }}>
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <defs>
                        <linearGradient id="channelsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#61F3F3" />
                          <stop offset="100%" stopColor="#00B8D9" />
                        </linearGradient>
                      </defs>
                      <motion.circle 
                        cx="30" 
                        cy="30" 
                        r="28" 
                        stroke="url(#channelsGrad)" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        strokeDasharray="176 176"
                        initial={{ strokeDashoffset: 176 }}
                        whileInView={{ strokeDashoffset: 27.5 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
                      />
                    </svg>
                  </div>
                  {/* Percentage text */}
                  <div className="absolute flex items-center justify-center inset-0 text-white font-semibold text-[13px] font-['Poppins',sans-serif]">
                    84%
                  </div>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <p className="text-[17px] font-bold text-white font-['Poppins',sans-serif]">Total Channels</p>
                </div>

                <div className="flex flex-col gap-0.5 items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-white font-['Poppins',sans-serif]">Total:</span>
                    <span className="text-[20px] font-bold leading-none text-white font-['Poppins',sans-serif]">45</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-white font-['Poppins',sans-serif]">Activated:</span>
                    <span className="text-[20px] font-bold leading-none text-white font-['Poppins',sans-serif]">38</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Apps - Light Grey */}
            <div className="bg-[#DDDDDE] rounded-[14px] shadow-sm">
              <div className="flex items-center justify-between px-6 py-5 gap-4">
                <div className="relative shrink-0 size-[70px]">
                  {/* Background circle */}
                  <div className="absolute inset-[5px]">
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="28" stroke="rgba(145, 158, 171, 0.16)" strokeWidth="3" />
                    </svg>
                  </div>
                  {/* Progress circle - 83.3% */}
                  <div className="absolute inset-[5px]" style={{ transform: 'rotate(-90deg)' }}>
                    <svg className="block size-full" fill="none" viewBox="0 0 60 60">
                      <motion.circle 
                        cx="30" 
                        cy="30" 
                        r="28" 
                        stroke="#4EBEE3" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        strokeDasharray="176 176"
                        initial={{ strokeDashoffset: 176 }}
                        whileInView={{ strokeDashoffset: 29.3 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
                      />
                    </svg>
                  </div>
                  {/* Percentage text */}
                  <div className="absolute flex items-center justify-center inset-0 text-[#16274D] font-semibold text-[13px] font-['Poppins',sans-serif]">
                    83%
                  </div>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <p className="text-[17px] font-bold text-[#16274D] font-['Poppins',sans-serif]">Total Apps</p>
                </div>

                <div className="flex flex-col gap-0.5 items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-[#16274D] font-['Poppins',sans-serif]">Total:</span>
                    <span className="text-[20px] font-bold leading-none text-[#16274D] font-['Poppins',sans-serif]">18</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium opacity-70 text-[#16274D] font-['Poppins',sans-serif]">Activated:</span>
                    <span className="text-[20px] font-bold leading-none text-[#16274D] font-['Poppins',sans-serif]">15</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row: Most Used Services + Most Watched Channels + Most Used Apps */}
        <div className="grid grid-cols-3 gap-5">
          {/* Most Used Services */}
          <motion.div 
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="mb-5">
              <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                Most Used Services
              </h3>
              
              {/* Filters */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-1.5 bg-[#F8FAFC] rounded-lg p-1.5">
                  {(['All', 'Kids', 'Adults', 'VIP'] as UserType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserType(type)}
                      className={`flex-1 px-4 py-2 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all ${
                        userType === type
                          ? 'bg-[#4EBEE3] text-white shadow-sm'
                          : 'text-[#16274D] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="text-[12px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#4EBEE3]/30 rounded-lg px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option>Today</option>
                  <option>Last 30 days</option>
                  <option>Last Quarter</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>

            <div className="mb-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#4EBEE3]/20">
              <p className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Total Usage Hours</p>
              <p className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{servicesTotal.toLocaleString()}h</p>
            </div>

            <div ref={servicesChartRef} className="h-[280px] min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart 
                  data={servicesData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  {isServicesInView && (
                    <Bar 
                      dataKey="hours" 
                      fill={COLORS.lightBlue} 
                      radius={[8, 8, 0, 0]} 
                      maxBarSize={60}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      onMouseEnter={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', '#3DA5CA');
                      }}
                      onMouseLeave={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', COLORS.lightBlue);
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Most Watched Channels */}
          <motion.div 
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="mb-5">
              <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                Most Watched Channels
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-1.5 bg-[#F8FAFC] rounded-lg p-1.5">
                  {(['All', 'Kids', 'Adults', 'VIP'] as UserType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserType(type)}
                      className={`flex-1 px-4 py-2 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all ${
                        userType === type
                          ? 'bg-[#4EBEE3] text-white shadow-sm'
                          : 'text-[#16274D] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="text-[12px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#4EBEE3]/30 rounded-lg px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option>Today</option>
                  <option>Last 30 days</option>
                  <option>Last Quarter</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>

            <div className="mb-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#16274D]/20">
              <p className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Total Watch Hours</p>
              <p className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{channelsTotal.toLocaleString()}h</p>
            </div>

            <div ref={channelsChartRef} className="h-[280px] min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart 
                  data={channelsData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  {isChannelsInView && (
                    <Bar 
                      dataKey="hours" 
                      fill={COLORS.lightBlue} 
                      radius={[8, 8, 0, 0]} 
                      maxBarSize={60}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      onMouseEnter={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', '#3DA5CA');
                      }}
                      onMouseLeave={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', COLORS.lightBlue);
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Most Used Apps */}
          <motion.div 
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="mb-5">
              <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                Most Used Apps
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-1.5 bg-[#F8FAFC] rounded-lg p-1.5">
                  {(['All', 'Kids', 'Adults', 'VIP'] as UserType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserType(type)}
                      className={`flex-1 px-4 py-2 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all ${
                        userType === type
                          ? 'bg-[#4EBEE3] text-white shadow-sm'
                          : 'text-[#16274D] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="text-[12px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#4EBEE3]/30 rounded-lg px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option>Today</option>
                  <option>Last 30 days</option>
                  <option>Last Quarter</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>

            <div className="mb-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#22D3EE]/20">
              <p className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Total App Usage Hours</p>
              <p className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{appsTotal.toLocaleString()}h</p>
            </div>

            <div ref={appsChartRef} className="h-[280px] min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart 
                  data={appsData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  {isAppsInView && (
                    <Bar 
                      dataKey="hours" 
                      fill={COLORS.lightBlue} 
                      radius={[8, 8, 0, 0]} 
                      maxBarSize={60}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      onMouseEnter={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', '#3DA5CA');
                      }}
                      onMouseLeave={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', COLORS.lightBlue);
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Notifications Insights - Full Width */}
        <motion.div 
          className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="mb-5">
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
              Notifications Insights
            </h3>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1.5 bg-[#F8FAFC] rounded-lg p-1.5 flex-1 max-w-md">
                {(['All', 'Kids', 'Adults', 'VIP'] as UserType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setUserType(type)}
                    className={`flex-1 px-4 py-2 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all ${
                      userType === type
                        ? 'bg-[#4EBEE3] text-white shadow-sm'
                        : 'text-[#16274D] hover:bg-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="text-[12px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#4EBEE3]/30 rounded-lg px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-[#4EBEE3] transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px'
                }}
              >
                <option>Today</option>
                <option>Last 30 days</option>
                <option>Last Quarter</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-[#F8FAFC] rounded-lg border border-[#4EBEE3]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-[#4EBEE3]/15 rounded-lg">
                  <Send size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-medium text-[#16274D]/60 font-['Poppins',sans-serif]">Sent</p>
              </div>
              <p className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{notificationsSent.toLocaleString()}</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg border border-[#4EBEE3]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-[#4EBEE3]/15 rounded-lg">
                  <Eye size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-medium text-[#16274D]/60 font-['Poppins',sans-serif]">Acknowledged</p>
              </div>
              <p className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{notificationsAck.toLocaleString()}</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg border border-[#4EBEE3]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-[#4EBEE3]/15 rounded-lg">
                  <TrendingUp size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-medium text-[#16274D]/60 font-['Poppins',sans-serif]">Acknowledgment Rate</p>
              </div>
              <p className="text-[24px] font-semibold text-[#4EBEE3] font-['Poppins',sans-serif]">{acknowledgmentRate}%</p>
            </div>
          </div>

          <div ref={notificationsChartRef} className="h-[280px] min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <BarChart 
                data={notificationsData} 
                margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip content={<NotificationTooltip />} cursor={false} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
                  iconType="circle"
                />
                {isNotificationsInView && (
                  <>
                    <Bar 
                      dataKey="sent" 
                      fill={COLORS.darkBlue} 
                      radius={[8, 8, 0, 0]} 
                      name="Sent" 
                      maxBarSize={80}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      onMouseEnter={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', '#0D1B3A');
                      }}
                      onMouseLeave={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', COLORS.darkBlue);
                      }}
                    />
                    <Bar 
                      dataKey="acknowledged" 
                      fill={COLORS.lightBlue} 
                      radius={[8, 8, 0, 0]} 
                      name="Acknowledged" 
                      maxBarSize={80}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      onMouseEnter={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', '#3DA5CA');
                      }}
                      onMouseLeave={(data, index, e) => {
                        const bar = e.target;
                        bar.setAttribute('fill', COLORS.lightBlue);
                      }}
                    />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}