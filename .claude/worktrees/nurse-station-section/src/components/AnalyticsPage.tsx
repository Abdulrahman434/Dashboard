import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { SingleSelectDropdown } from './UnifiedDropdown';
import { ImageWithFallback } from './figma/ImageWithFallback';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import hospitalLogo from '../assets/DallahLogo.png';
import {
  TrendingUp,
  Download,
  Printer,
  Settings,
  Clock,
  Wifi,
  CheckCircle2,
  Monitor,
  WifiOff,
  Activity,
  TrendingDown,
  BarChart3,
  Users,
  PhoneCall,
  Zap,
  FileText,
  Tv,
  Star,
  Package,
  Bell,
  MessageSquare,
  Calendar,
  Award,
  Info,
  MonitorOff,
  Tablet,
  MousePointerClick,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { KPIWithSparkline } from './KPIWithSparkline';

type TimeRange = 'Last 7 Days' | 'Last 30 Days' | 'Last Quarter' | 'Last Year';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          // Check if this is duration/hours data
          const isDuration = entry.dataKey === 'duration';
          const isHours = entry.dataKey === 'hours' || entry.name === 'hours';
          const displayValue = typeof entry.value === 'number' 
            ? (isDuration || isHours ? `${entry.value.toFixed(1)} hours` : entry.value.toLocaleString())
            : entry.value;
          
          return (
            <p key={index} className="text-[11px] font-['Poppins',sans-serif]" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{displayValue}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
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
        <Info size={12} strokeWidth={2} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-white text-[#16274D] text-[11px] rounded-lg shadow-lg border border-gray-200 font-['Poppins',sans-serif] leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}></div>
        </div>
      )}
    </div>
  );
};

// Mini Sparkline Component
const MiniSparkline = ({ data, trend }: { data: number[], trend: 'up' | 'down' }) => {
  const chartData = data.map((value, index) => ({ value, index }));
  const color = trend === 'up' ? '#10B981' : '#EF4444';
  
  return (
    <div className="h-8 w-full min-h-[32px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={32}>
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function AnalyticsPage({ onNavigate, isPrintView = false }: { onNavigate?: (page: string) => void; isPrintView?: boolean }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 Days');
  
  // Global filter - view by Patient Groups or Hospital Wards
  const [globalViewBy, setGlobalViewBy] = useState<'By Patient Groups' | 'By Hospital Wards'>('By Patient Groups');
  
  // Individual chart filters (for service-specific filtering, not grouping)
  const [requestsTrendFilter, setRequestsTrendFilter] = useState('All');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('All Services');
  const [serviceStatusPatientGroupFilter, setServiceStatusPatientGroupFilter] = useState('All');
  const [topAssetsPatientGroupFilter, setTopAssetsPatientGroupFilter] = useState('All');

  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState<{
    terminalAnalytics: boolean;
    channelAnalytics: boolean;
    zoneAnalytics: boolean;
    engagementAnalytics: boolean;
    servicesAnalytics: boolean;
    contentAnalytics: boolean;
    notificationsOverview: boolean;
    surveyAnalytics: boolean;
  }>({
    terminalAnalytics: false,
    channelAnalytics: false,
    zoneAnalytics: false,
    engagementAnalytics: false,
    servicesAnalytics: false,
    contentAnalytics: false,
    notificationsOverview: false,
    surveyAnalytics: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset Top Assets filter when global view changes
  useEffect(() => {
    setTopAssetsPatientGroupFilter('All');
  }, [globalViewBy]);

  // Export to PDF function
  const handleExportPDF = async () => {
    console.log('Export started...');
    
    // Show loading toast
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-[#16274D] text-white px-4 py-3 rounded-lg shadow-xl z-50 font-[\'Poppins\',sans-serif] text-[14px]';
    loadingToast.textContent = 'Generating PDF...';
    document.body.appendChild(loadingToast);

    try {
      // Get the analytics content element
      const element = document.getElementById('analytics-export-content');
      console.log('Element found:', element);
      
      if (!element) {
        throw new Error('Export content element not found');
      }

      // Temporarily expand all collapsed sections for export
      const originalCollapsedState = { ...collapsedSections };
      setCollapsedSections({
        servicesOverview: false,
        engagementHub: false,
        channelAnalytics: false,
        terminalAnalytics: false,
        notificationsOverview: false
      });

      // Wait for DOM update and animations
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Creating canvas...');
      
      // Store original width and set fixed width for consistent rendering
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '1920px';
      element.style.maxWidth = '1920px';
      
      // Create canvas with better quality and fixed dimensions
      const canvas = await html2canvas(element, {
        scale: 3, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#F8FAFC',
        windowWidth: 1920, // Fixed width to match design
        windowHeight: element.scrollHeight,
        width: 1920,
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Set fixed width on cloned element too
          const clonedElement = clonedDoc.getElementById('analytics-export-content');
          if (clonedElement) {
            clonedElement.style.width = '1920px';
            clonedElement.style.maxWidth = '1920px';
          }
          
          // Convert any oklab/oklch colors to rgb for compatibility
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            
            // Get all inline and computed styles
            const inlineStyle = htmlEl.getAttribute('style') || '';
            
            // Check if the element has oklab/oklch in its inline styles
            if (inlineStyle.includes('oklab') || inlineStyle.includes('oklch')) {
              // Replace oklab/oklch with a fallback color
              const newStyle = inlineStyle
                .replace(/oklab\([^)]+\)/g, 'rgb(128, 128, 128)')
                .replace(/oklch\([^)]+\)/g, 'rgb(128, 128, 128)');
              htmlEl.setAttribute('style', newStyle);
            }
            
            // Also check computed styles and set explicit RGB values
            try {
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(el);
              if (computedStyle) {
                const bgColor = computedStyle.backgroundColor;
                const color = computedStyle.color;
                const borderColor = computedStyle.borderColor;
                
                // Only override if oklab/oklch is detected
                if (bgColor && (bgColor.includes('oklab') || bgColor.includes('oklch'))) {
                  htmlEl.style.backgroundColor = 'rgb(248, 250, 252)'; // Default light background
                }
                
                if (color && (color.includes('oklab') || color.includes('oklch'))) {
                  htmlEl.style.color = 'rgb(22, 39, 77)'; // Default text color
                }
                
                if (borderColor && (borderColor.includes('oklab') || borderColor.includes('oklch'))) {
                  htmlEl.style.borderColor = 'rgb(226, 232, 240)'; // Default border color
                }
              }
            } catch (e) {
              // Ignore errors accessing computed style
            }
          });
        }
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      // Restore original width
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      
      // Restore collapsed state
      setCollapsedSections(originalCollapsedState);

      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      console.log('Image data created');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Better margins - more space from edges
      const marginX = 15; // 15mm left/right margin
      const marginY = 15; // 15mm top/bottom margin
      
      const imgWidth = pageWidth - (marginX * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginY;

      // Add first page
      pdf.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - (marginY * 2));

      // Add additional pages if needed with better breaks
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft) + marginY;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - (marginY * 2));
      }

      // Generate filename with current date
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const filename = `CareInn_Analytics_Report_${dateStr}.pdf`;

      console.log('Saving PDF:', filename);
      // Save the PDF
      pdf.save(filename);

      // Success toast
      loadingToast.textContent = 'PDF downloaded successfully!';
      loadingToast.className = 'fixed top-4 right-4 bg-[#4EBEE3] text-white px-4 py-3 rounded-lg shadow-xl z-50 font-[\'Poppins\',sans-serif] text-[14px]';
      setTimeout(() => loadingToast.remove(), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      loadingToast.textContent = `Failed to generate PDF: ${error.message}`;
      loadingToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-xl z-50 font-[\'Poppins\',sans-serif] text-[14px]';
      setTimeout(() => loadingToast.remove(), 5000);
    }
  };

  // Print function with delay to ensure charts are rendered
  const handlePrintPDF = () => {
    // Show loading toast
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'Preparing print view...';
    loadingToast.className = 'fixed top-4 right-4 bg-[#4EBEE3] text-white px-4 py-3 rounded-lg shadow-xl z-50 font-[\'Poppins\',sans-serif] text-[14px]';
    document.body.appendChild(loadingToast);

    // Wait for charts to fully render before printing
    setTimeout(() => {
      loadingToast.remove();
      window.print();
    }, 500); // 500ms delay to ensure all charts are rendered
  };

  // Chart refs for animation
  const terminalAnalyticsRef = useRef(null);
  const channelAnalyticsRef = useRef(null);
  const engagementRef = useRef(null);
  const servicesRef = useRef(null);
  const contentRef = useRef(null);
  const notificationsRef = useRef(null);
  const surveyRef = useRef(null);

  const isTerminalAnalyticsInView = useInView(terminalAnalyticsRef, { once: true, margin: "-50px" });
  const isChannelAnalyticsInView = useInView(channelAnalyticsRef, { once: true, margin: "-50px" });
  const isEngagementInView = useInView(engagementRef, { once: true, margin: "-50px" });
  const isServicesInView = useInView(servicesRef, { once: true, margin: "-50px" });
  const isContentInView = useInView(contentRef, { once: true, margin: "-50px" });
  const isNotificationsInView = useInView(notificationsRef, { once: true, margin: "-50px" });
  const isSurveyInView = useInView(surveyRef, { once: true, margin: "-50px" });

  // Terminal sparkline data
  const terminalSparklineData = {
    total: [28, 29, 28, 30, 30, 29, 30],
    connected: [26, 27, 26, 28, 28, 27, 28],
    offline: [2, 2, 2, 2, 2, 2, 2],
    inUse: [23, 24, 25, 24, 25, 24, 25]
  };

  // Terminal Analytics Data - Uptime by Ward/Patient Group
  const uptimeByWard = [
    { name: '1A', uptime: 97.8, trend: 1.8, prevUptime: 96.0 },
    { name: '2B', uptime: 96.5, trend: -0.5, prevUptime: 97.0 },
    { name: '3C', uptime: 95.2, trend: 2.3, prevUptime: 92.9 },
    { name: '4A', uptime: 98.5, trend: 0.8, prevUptime: 97.7 },
    { name: '5B', uptime: 93.8, trend: -1.2, prevUptime: 95.0 },
    { name: '6C', uptime: 96.1, trend: 1.5, prevUptime: 94.6 }
  ];

  const uptimeByPatientGroup = [
    { name: 'Kids', uptime: 97.2, trend: 1.4, prevUptime: 95.8 },
    { name: 'Adults', uptime: 96.8, trend: 0.9, prevUptime: 95.9 },
    { name: 'VIP', uptime: 98.5, trend: 2.1, prevUptime: 96.4 }
  ];

  // Removed: uptimeDistribution, terminalDistributionData, connectionDistribution, usageDistribution
  // These were for current-state charts that have been removed

  // Engagement Performance - Total Session Duration (in hours)
  const engagementPerformanceByWard = [
    { name: '1A', duration: 206.7 },
    { name: '2B', duration: 261.3 },
    { name: '3C', duration: 149.2 },
    { name: '4A', duration: 155.3 },
    { name: '5B', duration: 130.8 },
    { name: '6C', duration: 186.7 }
  ];

  const engagementPerformanceByGroup = [
    { name: 'Kids', duration: 223.3 },
    { name: 'Adults', duration: 314.2 },
    { name: 'VIP', duration: 138.7 }
  ];

  const engagementPerformanceData = globalViewBy === 'By Hospital Wards'
    ? engagementPerformanceByWard
    : engagementPerformanceByGroup;

  // Peak Interaction Hours Data - 24 hours
  const peakInteractionHours = [
    { hour: '12 AM', interactions: 45 },
    { hour: '1 AM', interactions: 32 },
    { hour: '2 AM', interactions: 28 },
    { hour: '3 AM', interactions: 25 },
    { hour: '4 AM', interactions: 30 },
    { hour: '5 AM', interactions: 55 },
    { hour: '6 AM', interactions: 120 },
    { hour: '7 AM', interactions: 280 },
    { hour: '8 AM', interactions: 450 },
    { hour: '9 AM', interactions: 620 },
    { hour: '10 AM', interactions: 780 },
    { hour: '11 AM', interactions: 920 },
    { hour: '12 PM', interactions: 1050 },
    { hour: '1 PM', interactions: 1100 },
    { hour: '2 PM', interactions: 1200 },
    { hour: '3 PM', interactions: 1350 },
    { hour: '4 PM', interactions: 1480 },
    { hour: '5 PM', interactions: 1650 },
    { hour: '6 PM', interactions: 1820 },
    { hour: '7 PM', interactions: 1650 },
    { hour: '8 PM', interactions: 1350 },
    { hour: '9 PM', interactions: 980 },
    { hour: '10 PM', interactions: 650 },
    { hour: '11 PM', interactions: 280 },
  ];

  // Channel Analytics Data
  const channelCategoryBreakdown = [
    { name: 'Kids', value: 14, color: '#4EBEE3' },
    { name: 'Entertainment', value: 13, color: '#16274D' },
    { name: 'News', value: 9, color: '#93C5FD' },
    { name: 'Sports', value: 7, color: '#60A5FA' },
    { name: 'Religious', value: 2, color: '#DBEAFE' }
  ];

  // Active vs Inactive Channels
  const channelStatusData = [
    { name: 'Active', value: 38, color: '#4EBEE3' },  // brand primary
    { name: 'Inactive', value: 7, color: '#DBEAFE' }  // light blue
  ];

  const channelsByWard = [
    { name: '1A', channels: 42 },
    { name: '2B', channels: 38 },
    { name: '3C', channels: 35 },
    { name: '4A', channels: 28 },
    { name: '5B', channels: 30 },
    { name: '6C', channels: 32 }
  ];

  // TV/Channel Usage Data
  const peakViewingTimes = [
    { hour: '6 AM', views: 45 },
    { hour: '9 AM', views: 120 },
    { hour: '12 PM', views: 280 },
    { hour: '3 PM', views: 340 },
    { hour: '6 PM', views: 520 },
    { hour: '9 PM', views: 680 },
    { hour: '12 AM', views: 250 }
  ];

  const watchingHoursByGroup = [
    { name: 'Kids', hours: 1240 },
    { name: 'Adults', hours: 2850 },
    { name: 'VIP', hours: 680 }
  ];

  const watchingHoursByWard = [
    { name: '1A', hours: 1450 },
    { name: '2B', hours: 1320 },
    { name: '3C', hours: 1180 },
    { name: '4A', hours: 560 },
    { name: '5B', hours: 260 },
    { name: '6C', hours: 890 }
  ];

  const topChannels = [
    { name: 'HBO', hours: 450, category: 'Entertainment' },
    { name: 'CNN', hours: 420, category: 'News' },
    { name: 'ESPN', hours: 380, category: 'Sports' },
    { name: 'Disney Channel', hours: 340, category: 'Kids' },
    { name: 'Discovery', hours: 310, category: 'Entertainment' },
    { name: 'BBC News', hours: 280, category: 'News' },
    { name: 'Nickelodeon', hours: 265, category: 'Kids' },
    { name: 'Fox Sports', hours: 245, category: 'Sports' },
    { name: 'National Geographic', hours: 220, category: 'Entertainment' },
    { name: 'EWTN', hours: 195, category: 'Religious' }
  ];

  const topChannelsByGroup = [
    { name: 'MBC', hours: 450, category: 'Entertainment', group: 'Adults' },
    { name: 'MBC3', hours: 340, category: 'Kids', group: 'Kids' },
    { name: 'Al Arabiya', hours: 285, category: 'News', group: 'Adults' },
    { name: 'SBC', hours: 265, category: 'Entertainment', group: 'VIP' },
    { name: 'Quran', hours: 240, category: 'Religious', group: 'Adults' }
  ];

  const topChannelsByWard = [
    { name: 'MBC', hours: 380, category: 'Entertainment', ward: '1A' },
    { name: 'Al Arabiya', hours: 320, category: 'News', ward: '2B' },
    { name: 'SBC', hours: 290, category: 'Entertainment', ward: '1A' },
    { name: 'MBC3', hours: 275, category: 'Kids', ward: '3C' },
    { name: 'Quran', hours: 245, category: 'Religious', ward: '2B' }
  ];

  // Engagement Analytics Data
  const zoneInteractions = [
    { name: 'Engagement Hub', taps: 5950 },
    { name: 'Patient Services', taps: 3060 },
    { name: 'Shortcuts', taps: 8850 }
  ];

  const zoneByPatientGroup = [
    { group: 'Kids', engagement: 3200, services: 1800, shortcuts: 4200 },
    { group: 'Adults', engagement: 2100, services: 900, shortcuts: 3500 },
    { group: 'VIP', engagement: 650, services: 360, shortcuts: 1150 }
  ];

  const zoneByWard = [
    { group: '1A', engagement: 2800, services: 1500, shortcuts: 3800 },
    { group: '2B', engagement: 2500, services: 1300, shortcuts: 3200 },
    { group: '3C', engagement: 1900, services: 1100, shortcuts: 2900 },
    { group: '4A', engagement: 1200, services: 700, shortcuts: 1800 },
    { group: '5B', engagement: 950, services: 550, shortcuts: 1400 },
    { group: '6C', engagement: 1600, services: 900, shortcuts: 2400 }
  ];

  // Engagement Hub Analytics Data
  const totalEngagementTaps = 5950;
  const categoryTaps = [
    { name: 'Games', taps: 1450, percentage: 24.4, status: 'Active', terminals: 45 },
    { name: 'Social', taps: 980, percentage: 16.5, status: 'Active', terminals: 42 },
    { name: 'Reading', taps: 850, percentage: 14.3, status: 'Active', terminals: 38 },
    { name: 'Media', taps: 1200, percentage: 20.2, status: 'Active', terminals: 50 },
    { name: 'Meetings', taps: 640, percentage: 10.8, status: 'Active', terminals: 40 },
    { name: 'Internet', taps: 720, percentage: 12.1, status: 'Active', terminals: 35 },
    { name: 'Tools', taps: 520, percentage: 8.7, status: 'Inactive', terminals: 28 },
    { name: 'About Us', taps: 230, percentage: 3.8, status: 'Active', terminals: 50 }
  ];

  // Category assets distribution
  const categoryAssets = [
    { name: 'Games', assets: 156 },
    { name: 'Social', assets: 89 },
    { name: 'Reading', assets: 234 },
    { name: 'Media', assets: 412 },
    { name: 'Meetings', assets: 52 },
    { name: 'Internet', assets: 45 },
    { name: 'Tools', assets: 67 },
    { name: 'About Us', assets: 23 }
  ];

  // Category status summary
  const categoryStatusSummary = [
    { status: 'Active', count: categoryTaps.filter(c => c.status === 'Active').length },
    { status: 'Inactive', count: categoryTaps.filter(c => c.status === 'Inactive').length }
  ];

  // Category Performance Over Time (for line chart)
  const categoryPerformanceOverTime = [
    { day: 'Mon', Games: 185, Social: 142, Reading: 168, Media: 195, Meetings: 92, Internet: 98, Tools: 72, 'About Us': 35 },
    { day: 'Tue', Games: 220, Social: 156, Reading: 145, Media: 178, Meetings: 88, Internet: 105, Tools: 68, 'About Us': 42 },
    { day: 'Wed', Games: 198, Social: 178, Reading: 135, Media: 210, Meetings: 95, Internet: 125, Tools: 85, 'About Us': 38 },
    { day: 'Thu', Games: 175, Social: 195, Reading: 152, Media: 188, Meetings: 102, Internet: 142, Tools: 78, 'About Us': 45 },
    { day: 'Fri', Games: 245, Social: 168, Reading: 128, Media: 225, Meetings: 98, Internet: 138, Tools: 92, 'About Us': 52 },
    { day: 'Sat', Games: 162, Social: 135, Reading: 205, Media: 198, Meetings: 85, Internet: 88, Tools: 58, 'About Us': 28 },
    { day: 'Sun', Games: 148, Social: 122, Reading: 225, Media: 172, Meetings: 80, Internet: 75, Tools: 48, 'About Us': 32 }
  ];

  // Patient Services Analytics Data
  const housekeepingRequests = { total: 245, avgTime: '18 min', completed: 238 };
  const mealOrdering = { total: 892, avgTime: '12 min', completed: 885 };
  const virtualConsultation = { total: 156, avgTime: '24 min', completed: 149 };
  const careCallData = {
    total: 2270,
    attended: 1950,
    attendanceRate: '85.9%',
    byWard: [
      { name: '1A', calls: 520 },
      { name: '2B', calls: 680 },
      { name: '3C', calls: 450 },
      { name: '4A', calls: 380 },
      { name: '5B', calls: 240 },
      { name: '6C', calls: 410 }
    ],
    byGroup: [
      { name: 'Kids', calls: 890 },
      { name: 'Adults', calls: 1120 },
      { name: 'VIP', calls: 260 }
    ]
  };

  // Service Usage Comparison Data
  const serviceUsageComparisonAll = [
    { service: 'Meal Ordering', requests: 892 },
    { service: 'Housekeeping', requests: 245 },
    { service: 'Virtual Consultation', requests: 156 },
    { service: 'CareCall', requests: 324 }
  ];

  const serviceUsageComparisonByGroup = [
    { service: 'Meal Ordering', Adults: 520, Kids: 285, VIP: 87 },
    { service: 'Housekeeping', Adults: 145, Kids: 68, VIP: 32 },
    { service: 'Virtual Consultation', Adults: 92, Kids: 19, VIP: 45 },
    { service: 'CareCall', Adults: 185, Kids: 95, VIP: 44 }
  ];

  const serviceUsageComparisonByWard = [
    { service: 'Meal Ordering', '1A': 120, '2B': 150, '3C': 180, '4A': 110, '5A': 140, '5B': 92, '6C': 100 },
    { service: 'Housekeeping', '1A': 38, '2B': 42, '3C': 50, '4A': 35, '5A': 32, '5B': 25, '6C': 23 },
    { service: 'Virtual Consultation', '1A': 25, '2B': 28, '3C': 22, '4A': 18, '5A': 20, '5B': 15, '6C': 28 },
    { service: 'CareCall', '1A': 48, '2B': 52, '3C': 45, '4A': 42, '5A': 50, '5B': 38, '6C': 49 }
  ];

  const serviceUsageComparison = globalViewBy === 'By Patient Groups'
    ? serviceUsageComparisonByGroup 
    : serviceUsageComparisonByWard;

  // Service Request Status Breakdown Data
  // All Services, All Patient Groups
  const serviceStatusAll = [
    { service: 'Meal Ordering', Completed: 885, 'In Progress': 7 },
    { service: 'Housekeeping', Completed: 238, 'In Progress': 7 },
    { service: 'Virtual Consultation', Completed: 148, 'In Progress': 8 }
  ];

  // By Patient Groups
  const serviceStatusAdults = [
    { service: 'Meal Ordering', Completed: 515, 'In Progress': 5 },
    { service: 'Housekeeping', Completed: 141, 'In Progress': 4 },
    { service: 'Virtual Consultation', Completed: 88, 'In Progress': 4 }
  ];

  const serviceStatusKids = [
    { service: 'Meal Ordering', Completed: 282, 'In Progress': 3 },
    { service: 'Housekeeping', Completed: 66, 'In Progress': 2 },
    { service: 'Virtual Consultation', Completed: 18, 'In Progress': 1 }
  ];

  const serviceStatusVIP = [
    { service: 'Meal Ordering', Completed: 88, 'In Progress': 1 },
    { service: 'Housekeeping', Completed: 31, 'In Progress': 1 },
    { service: 'Virtual Consultation', Completed: 42, 'In Progress': 3 }
  ];

  // Filter by service type
  const getServiceStatusData = () => {
    // First filter by patient group
    let data = serviceStatusPatientGroupFilter === 'Adults' 
      ? serviceStatusAdults 
      : serviceStatusPatientGroupFilter === 'Kids'
      ? serviceStatusKids
      : serviceStatusPatientGroupFilter === 'VIP'
      ? serviceStatusVIP
      : serviceStatusAll;

    // Then filter by service if not "All Services"
    if (serviceStatusFilter !== 'All Services') {
      data = data.filter(item => item.service === serviceStatusFilter);
    }

    return data;
  };

  const serviceStatusData = getServiceStatusData();

  // Requests Trend by Hour - All
  const requestsTrendByHourAll = [
    { hour: '12 AM', requests: 12 },
    { hour: '1 AM', requests: 8 },
    { hour: '2 AM', requests: 5 },
    { hour: '3 AM', requests: 3 },
    { hour: '4 AM', requests: 6 },
    { hour: '5 AM', requests: 15 },
    { hour: '6 AM', requests: 35 },
    { hour: '7 AM', requests: 68 },
    { hour: '8 AM', requests: 95 },
    { hour: '9 AM', requests: 82 },
    { hour: '10 AM', requests: 78 },
    { hour: '11 AM', requests: 88 },
    { hour: '12 PM', requests: 102 },
    { hour: '1 PM', requests: 85 },
    { hour: '2 PM', requests: 72 },
    { hour: '3 PM', requests: 68 },
    { hour: '4 PM', requests: 58 },
    { hour: '5 PM', requests: 62 },
    { hour: '6 PM', requests: 75 },
    { hour: '7 PM', requests: 55 },
    { hour: '8 PM', requests: 42 },
    { hour: '9 PM', requests: 35 },
    { hour: '10 PM', requests: 28 },
    { hour: '11 PM', requests: 18 }
  ];

  // Requests Trend by Hour - Meal Ordering
  const requestsTrendByHourMealOrdering = [
    { hour: '12 AM', requests: 2 },
    { hour: '1 AM', requests: 1 },
    { hour: '2 AM', requests: 0 },
    { hour: '3 AM', requests: 0 },
    { hour: '4 AM', requests: 1 },
    { hour: '5 AM', requests: 3 },
    { hour: '6 AM', requests: 12 },
    { hour: '7 AM', requests: 28 },
    { hour: '8 AM', requests: 42 },
    { hour: '9 AM', requests: 35 },
    { hour: '10 AM', requests: 28 },
    { hour: '11 AM', requests: 38 },
    { hour: '12 PM', requests: 48 },
    { hour: '1 PM', requests: 35 },
    { hour: '2 PM', requests: 22 },
    { hour: '3 PM', requests: 18 },
    { hour: '4 PM', requests: 15 },
    { hour: '5 PM', requests: 22 },
    { hour: '6 PM', requests: 32 },
    { hour: '7 PM', requests: 25 },
    { hour: '8 PM', requests: 18 },
    { hour: '9 PM', requests: 12 },
    { hour: '10 PM', requests: 8 },
    { hour: '11 PM', requests: 5 }
  ];

  // Requests Trend by Hour - Housekeeping
  const requestsTrendByHourHousekeeping = [
    { hour: '12 AM', requests: 3 },
    { hour: '1 AM', requests: 2 },
    { hour: '2 AM', requests: 1 },
    { hour: '3 AM', requests: 1 },
    { hour: '4 AM', requests: 2 },
    { hour: '5 AM', requests: 5 },
    { hour: '6 AM', requests: 8 },
    { hour: '7 AM', requests: 18 },
    { hour: '8 AM', requests: 28 },
    { hour: '9 AM', requests: 22 },
    { hour: '10 AM', requests: 25 },
    { hour: '11 AM', requests: 28 },
    { hour: '12 PM', requests: 32 },
    { hour: '1 PM', requests: 28 },
    { hour: '2 PM', requests: 25 },
    { hour: '3 PM', requests: 22 },
    { hour: '4 PM', requests: 18 },
    { hour: '5 PM', requests: 15 },
    { hour: '6 PM', requests: 18 },
    { hour: '7 PM', requests: 12 },
    { hour: '8 PM', requests: 10 },
    { hour: '9 PM', requests: 8 },
    { hour: '10 PM', requests: 6 },
    { hour: '11 PM', requests: 4 }
  ];

  // Requests Trend by Hour - Consultation
  const requestsTrendByHourConsultation = [
    { hour: '12 AM', requests: 5 },
    { hour: '1 AM', requests: 3 },
    { hour: '2 AM', requests: 2 },
    { hour: '3 AM', requests: 1 },
    { hour: '4 AM', requests: 2 },
    { hour: '5 AM', requests: 4 },
    { hour: '6 AM', requests: 10 },
    { hour: '7 AM', requests: 15 },
    { hour: '8 AM', requests: 18 },
    { hour: '9 AM', requests: 15 },
    { hour: '10 AM', requests: 16 },
    { hour: '11 AM', requests: 14 },
    { hour: '12 PM', requests: 12 },
    { hour: '1 PM', requests: 13 },
    { hour: '2 PM', requests: 15 },
    { hour: '3 PM', requests: 18 },
    { hour: '4 PM', requests: 16 },
    { hour: '5 PM', requests: 15 },
    { hour: '6 PM', requests: 14 },
    { hour: '7 PM', requests: 11 },
    { hour: '8 PM', requests: 8 },
    { hour: '9 PM', requests: 9 },
    { hour: '10 PM', requests: 8 },
    { hour: '11 PM', requests: 6 }
  ];

  // Requests Trend by Hour - CareCall
  const requestsTrendByHourCareCall = [
    { hour: '12 AM', requests: 2 },
    { hour: '1 AM', requests: 2 },
    { hour: '2 AM', requests: 2 },
    { hour: '3 AM', requests: 1 },
    { hour: '4 AM', requests: 1 },
    { hour: '5 AM', requests: 3 },
    { hour: '6 AM', requests: 5 },
    { hour: '7 AM', requests: 7 },
    { hour: '8 AM', requests: 7 },
    { hour: '9 AM', requests: 10 },
    { hour: '10 AM', requests: 9 },
    { hour: '11 AM', requests: 8 },
    { hour: '12 PM', requests: 10 },
    { hour: '1 PM', requests: 9 },
    { hour: '2 PM', requests: 10 },
    { hour: '3 PM', requests: 10 },
    { hour: '4 PM', requests: 9 },
    { hour: '5 PM', requests: 10 },
    { hour: '6 PM', requests: 11 },
    { hour: '7 PM', requests: 7 },
    { hour: '8 PM', requests: 6 },
    { hour: '9 PM', requests: 6 },
    { hour: '10 PM', requests: 6 },
    { hour: '11 PM', requests: 3 }
  ];

  // Select the correct dataset based on filter
  const requestsTrendByHour = 
    requestsTrendFilter === 'Meal Ordering' ? requestsTrendByHourMealOrdering :
    requestsTrendFilter === 'Housekeeping' ? requestsTrendByHourHousekeeping :
    requestsTrendFilter === 'Consultation' ? requestsTrendByHourConsultation :
    requestsTrendFilter === 'CareCall' ? requestsTrendByHourCareCall :
    requestsTrendByHourAll;

  // Top Wards per Service
  const housekeepingTopWards = [
    { ward: '5A', requests: 80 },
    { ward: '6C', requests: 42 },
    { ward: '3B', requests: 30 }
  ];

  const mealOrderingTopWards = [
    { ward: '6C', requests: 120 },
    { ward: '5A', requests: 98 },
    { ward: '4A', requests: 76 }
  ];

  const virtualConsultationTopWards = [
    { ward: '5A', requests: 60 },
    { ward: '3B', requests: 45 },
    { ward: '6C', requests: 29 }
  ];

  // Patient Group Breakdown per Service
  const housekeepingByGroup = [
    { name: 'Adults', value: 145, color: '#4EBEE3' },
    { name: 'Kids', value: 68, color: '#357BA6' },
    { name: 'VIP', value: 32, color: '#1A4566' }
  ];

  const mealOrderingByGroup = [
    { name: 'Adults', value: 520, color: '#4EBEE3' },
    { name: 'Kids', value: 285, color: '#357BA6' },
    { name: 'VIP', value: 87, color: '#1A4566' }
  ];

  const virtualConsultationByGroup = [
    { name: 'Adults', value: 92, color: '#4EBEE3' },
    { name: 'VIP', value: 45, color: '#357BA6' },
    { name: 'Kids', value: 19, color: '#1A4566' }
  ];

  // CareCall Type Split
  const careCallTypeSplit = [
    { name: 'Total', value: 2270, color: '#4EBEE3' },
    { name: 'Attended', value: 1950, color: '#16274D' }
  ];

  // CareCall Top Wards
  const careCallTopWards = [
    { ward: '5A', calls: 120 },
    { ward: '6C', calls: 98 },
    { ward: '3B', calls: 87 },
    { ward: '4A', calls: 42 }
  ];

  // CareCall by Patient Group (for donut)
  const careCallByGroup = [
    { name: 'Adults', value: 185, color: '#4EBEE3' },
    { name: 'Kids', value: 95, color: '#357BA6' },
    { name: 'VIP', value: 44, color: '#1A4566' }
  ];

  // Sparkline trend data for KPIs
  const sparklineData = {
    housekeeping: {
      total: [18, 22, 19, 24, 21, 23, 25],
      totalChange: 8.5,
      totalTrend: 'up',
      completed: [17, 21, 18, 23, 20, 22, 24],
      completedChange: 7.2,
      completedTrend: 'up',
      avgTime: [22, 21, 20, 19, 19, 18, 18],
      avgTimeChange: -5.3,
      avgTimeTrend: 'down'
    },
    mealOrdering: {
      total: [65, 72, 78, 82, 85, 88, 89],
      totalChange: 12.4,
      totalTrend: 'up',
      completed: [64, 71, 77, 81, 84, 87, 88],
      completedChange: 11.8,
      completedTrend: 'up',
      avgTime: [15, 14, 13, 13, 12, 12, 12],
      avgTimeChange: -8.2,
      avgTimeTrend: 'down'
    },
    virtualConsultation: {
      total: [12, 13, 14, 15, 15, 16, 16],
      totalChange: 6.7,
      totalTrend: 'up',
      completed: [11, 12, 13, 14, 14, 15, 15],
      completedChange: 6.1,
      completedTrend: 'up',
      avgTime: [26, 25, 25, 24, 24, 24, 24],
      avgTimeChange: -3.8,
      avgTimeTrend: 'down'
    },
    careCall: {
      total: [205, 210, 215, 220, 223, 225, 227],
      totalChange: 10.7,
      totalTrend: 'up',
      attended: [175, 180, 183, 188, 190, 193, 195],
      attendedChange: 11.4,
      attendedTrend: 'up',
      attendanceRate: [84.5, 84.8, 85.0, 85.2, 85.5, 85.7, 85.9],
      attendanceRateChange: 1.7,
      attendanceRateTrend: 'up'
    }
  };

  // Content Library Data
  const contentLibraryData = [
    { type: 'APK', total: 18, active: 15, inactive: 3, taps: 3200 },
    { type: 'URL', total: 45, active: 36, inactive: 9, taps: 9490 },
    { type: 'PDF', total: 45, active: 28, inactive: 17, taps: 1420 }
  ];

  // Assets by Type (for pie chart) - Using CareInn color palette
  const assetsByType = [
    { name: 'APK', value: 18, color: '#4EBEE3' },
    { name: 'URL', value: 45, color: '#637381' },
    { name: 'PDF', value: 45, color: '#0F1729' }
  ];

  // Active vs Unused Assets (for pie chart)
  const totalActiveAssets = contentLibraryData.reduce((sum, item) => sum + item.active, 0);
  const totalInactiveAssets = contentLibraryData.reduce((sum, item) => sum + item.inactive, 0);
  const assetsActivityStatus = [
    { name: 'Active', value: totalActiveAssets, color: '#4EBEE3' },
    { name: 'Unused', value: totalInactiveAssets, color: '#637381' }
  ];

  // Top Used Assets - Total Session Duration (in hours) per Asset by Patient Group
  const topUsedAssetsAll = [
    { name: 'Netflix', type: 'APK', duration: 80.8 },
    { name: 'Meal Ordering', type: 'URL', duration: 65.3 },
    { name: 'Youtube', type: 'APK', duration: 57.5 },
    { name: 'Google Chrome', type: 'URL', duration: 48.0 },
    { name: 'CareCall', type: 'URL', duration: 39.0 }
  ];

  const topUsedAssetsAdult = [
    { name: 'Quran', type: 'APK', duration: 60.8 },
    { name: 'Google Chrome', type: 'URL', duration: 40.8 },
    { name: 'Netflix', type: 'APK', duration: 36.3 },
    { name: 'Meal Ordering', type: 'URL', duration: 30.8 },
    { name: 'CareCall', type: 'URL', duration: 23.7 }
  ];

  const topUsedAssetsKids = [
    { name: 'Tiktok', type: 'APK', duration: 54.7 },
    { name: 'Youtube', type: 'APK', duration: 49.2 },
    { name: 'Netflix', type: 'APK', duration: 31.5 },
    { name: 'Meal Ordering', type: 'URL', duration: 20.7 },
    { name: 'CareCall', type: 'URL', duration: 11.3 }
  ];

  const topUsedAssetsVIP = [
    { name: 'Netflix', type: 'APK', duration: 40.3 },
    { name: 'Google Chrome', type: 'URL', duration: 28.0 },
    { name: 'Meal Ordering', type: 'URL', duration: 22.5 },
    { name: 'CareCall', type: 'URL', duration: 14.8 }
  ];

  // Top Used Assets - By Hospital Wards
  const topUsedAssets1A = [
    { name: 'Netflix', type: 'APK', duration: 72.5 },
    { name: 'Meal Ordering', type: 'URL', duration: 58.2 },
    { name: 'Youtube', type: 'APK', duration: 45.8 },
    { name: 'Google Chrome', type: 'URL', duration: 38.5 },
    { name: 'CareCall', type: 'URL', duration: 32.0 }
  ];

  const topUsedAssets2B = [
    { name: 'Tiktok', type: 'APK', duration: 65.3 },
    { name: 'Youtube', type: 'APK', duration: 52.7 },
    { name: 'Meal Ordering', type: 'URL', duration: 48.5 },
    { name: 'Netflix', type: 'APK', duration: 41.2 },
    { name: 'CareCall', type: 'URL', duration: 28.8 }
  ];

  const topUsedAssets3C = [
    { name: 'Quran', type: 'APK', duration: 68.5 },
    { name: 'Google Chrome', type: 'URL', duration: 55.3 },
    { name: 'Meal Ordering', type: 'URL', duration: 43.0 },
    { name: 'Netflix', type: 'APK', duration: 38.7 },
    { name: 'CareCall', type: 'URL', duration: 31.2 }
  ];

  const topUsedAssets4A = [
    { name: 'Netflix', type: 'APK', duration: 48.3 },
    { name: 'Meal Ordering', type: 'URL', duration: 42.5 },
    { name: 'Google Chrome', type: 'URL', duration: 35.0 },
    { name: 'CareCall', type: 'URL', duration: 26.8 }
  ];

  const topUsedAssets5B = [
    { name: 'Youtube', type: 'APK', duration: 63.2 },
    { name: 'Netflix', type: 'APK', duration: 51.5 },
    { name: 'Meal Ordering', type: 'URL', duration: 46.3 },
    { name: 'Google Chrome', type: 'URL', duration: 39.7 },
    { name: 'CareCall', type: 'URL', duration: 33.5 }
  ];

  const topUsedAssets6C = [
    { name: 'Quran', type: 'APK', duration: 70.8 },
    { name: 'Meal Ordering', type: 'URL', duration: 54.2 },
    { name: 'Netflix', type: 'APK', duration: 47.3 },
    { name: 'Google Chrome', type: 'URL', duration: 41.0 },
    { name: 'CareCall', type: 'URL', duration: 35.7 }
  ];

  // Dynamic filter options based on global view
  const topAssetsFilterOptions = globalViewBy === 'By Patient Groups'
    ? ['All', 'Adult', 'Kids', 'VIP']
    : ['All', '1A', '2B', '3C', '4A', '5B', '6C'];

  // Get top assets data based on filter (patient group or ward)
  const getTopAssetsData = () => {
    if (globalViewBy === 'By Patient Groups') {
      switch (topAssetsPatientGroupFilter) {
        case 'Adult': return topUsedAssetsAdult;
        case 'Kids': return topUsedAssetsKids;
        case 'VIP': return topUsedAssetsVIP;
        default: return topUsedAssetsAll;
      }
    } else {
      // By Hospital Wards
      switch (topAssetsPatientGroupFilter) {
        case '1A': return topUsedAssets1A;
        case '2B': return topUsedAssets2B;
        case '3C': return topUsedAssets3C;
        case '4A': return topUsedAssets4A;
        case '5B': return topUsedAssets5B;
        case '6C': return topUsedAssets6C;
        default: return topUsedAssetsAll;
      }
    }
  };

  // Format duration for display (now expects hours instead of minutes)
  const formatDuration = (hours: number): string => {
    return `${hours.toFixed(1)} hrs`;
  };

  // Assets color mapping for stacked bar chart
  const assetsColors = {
    APK: '#10B981',       // green-500
    URL: '#4EBEE3',       // cyan/blue
    PDF: '#EF4444'        // red-500
  };

  // Assets Usage by Patient Group (stacked by asset type)
  const assetsUsageByGroup = [
    { name: 'Adults', APK: 720, URL: 3030, PDF: 2100 },
    { name: 'Kids', APK: 620, URL: 1850, PDF: 1450 },
    { name: 'VIP', APK: 280, URL: 910, PDF: 650 }
  ];

  // Assets Usage by Hospital Ward (stacked by asset type)
  const assetsUsageByWard = [
    { name: '1A', APK: 340, URL: 1180, PDF: 820 },
    { name: '2B', APK: 420, URL: 1450, PDF: 1020 },
    { name: '3C', APK: 260, URL: 870, PDF: 620 },
    { name: '4A', APK: 230, URL: 800, PDF: 550 },
    { name: '5A', APK: 150, URL: 490, PDF: 340 },
    { name: '5B', APK: 130, URL: 420, PDF: 300 },
    { name: '6C', APK: 180, URL: 600, PDF: 440 }
  ];

  // Notifications Data
  const notificationsData = {
    sent: 1250,
    delivered: 1180,
    acknowledged: 945,
    scheduled: 28,
    recurringActive: 12
  };

  const notificationsByGroup = [
    { name: 'Kids', sent: 520, delivered: 495, acknowledged: 430 },
    { name: 'Adults', sent: 580, delivered: 550, acknowledged: 475 },
    { name: 'VIP', sent: 150, delivered: 135, acknowledged: 40 }
  ];

  const notificationsByWard = [
    { name: '1A', sent: 320, delivered: 305, acknowledged: 265 },
    { name: '2B', sent: 380, delivered: 365, acknowledged: 310 },
    { name: '3C', sent: 280, delivered: 265, acknowledged: 225 },
    { name: '4A', sent: 180, delivered: 170, acknowledged: 145 },
    { name: '5B', sent: 90, delivered: 85, acknowledged: 70 },
    { name: '6C', sent: 200, delivered: 190, acknowledged: 160 }
  ];

  // Survey Data
  const surveyData = {
    overallScore: 4.2,
    totalResponses: 450,
    responseRate: 68,
    distribution: [
      { rating: '5 Stars', count: 245 },
      { rating: '4 Stars', count: 125 },
      { rating: '3 Stars', count: 50 },
      { rating: '2 Stars', count: 20 },
      { rating: '1 Star', count: 10 }
    ]
  };

  return (
    <div className={isPrintView ? "p-5 bg-white" : "h-full overflow-auto p-5 bg-[#F8FAFC]"}>
      {/* Page Header - Hidden in print view */}
      {!isPrintView && (
        <div className="mb-4 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Analytics
                </h2>
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                  Comprehensive system performance and usage insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[160px]">
                <SingleSelectDropdown
                  options={['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'Last Year']}
                  value={timeRange}
                  onChange={(value) => setTimeRange(value as TimeRange)}
                  className="text-[12px]"
                />
              </div>
              <div className="w-[180px]">
                <SingleSelectDropdown
                  options={['By Patient Groups', 'By Hospital Wards']}
                  value={globalViewBy}
                  onChange={(value) => setGlobalViewBy(value as 'By Patient Groups' | 'By Hospital Wards')}
                  className="text-[12px]"
                />
              </div>
              <button 
                onClick={handlePrintPDF}
                className="flex items-center gap-2 px-3 py-2 bg-[#4EBEE3] hover:bg-[#4EBEE3]/90 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <Download size={15} strokeWidth={2} />
                <span className="text-[12px] font-medium font-['Poppins',sans-serif]">Export</span>
              </button>
            </div>
          </div>

          {/* Hospital Info Card */}
          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center justify-between">
            {/* Left: Hospital Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={hospitalLogo} 
                  alt="Saint Louis Hospital Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Saint Louis Hospital (SLH)
                </h3>
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                  Jounieh - Lebanon
                </p>
              </div>
            </div>

            {/* Right: Total Terminals */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3]/10 border border-[#4EBEE3]/20 rounded-lg">
              <Tablet size={16} className="text-[#4EBEE3] rotate-90" strokeWidth={2} />
              <div>
                <p className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">Total Terminals</p>
                <p className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">30</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print View Header - Only shown in print view */}
      {isPrintView && (
        <div className="mb-4 no-print">
          <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
            CareInn Analytics Dashboard
          </h2>
          <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
            Report generated on {new Date().toLocaleDateString()} • Time range: {timeRange}
          </p>
        </div>
      )}

      {/* Export Content Wrapper */}
      <div id="analytics-export-content" className="flex flex-col gap-3">
        {/* ============================================ */}
        {/* SECTION 1 — TERMINAL ANALYTICS */}
        {/* ============================================ */}
        <div ref={terminalAnalyticsRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('terminalAnalytics')}
            >
              <Monitor size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Terminal Analytics
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.terminalAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.terminalAnalytics && (
            <>
          {/* Terminal Analytics Charts - Only Performance/Analytics Data */}
          <div className="grid grid-cols-2 gap-3 min-w-0 mb-3">
            {/* Engagement Performance */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4 min-w-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-3 flex items-center gap-1.5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Engagement Performance
                </h4>
                <div className="relative group">
                  <Info size={14} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[12px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Calculated based on the total session duration (in hours) for each patient group or ward during the selected period. Filtered by global filters above.
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full min-w-0 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <BarChart data={engagementPerformanceData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      height={40}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    {isTerminalAnalyticsInView && (
                      <Bar 
                        dataKey="duration" 
                        fill="#16274D" 
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={40}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Peak Interaction Hours */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4 min-w-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-3 flex items-center gap-1.5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Peak Interaction Hours
                </h4>
                <div className="relative group">
                  <Info size={14} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-56 bg-[#16274D] text-white text-[12px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Shows hourly interaction volume aggregated across the selected time period.
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full min-w-0 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <BarChart data={peakInteractionHours} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 9, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    {isTerminalAnalyticsInView && (
                      <Bar 
                        dataKey="interactions" 
                        fill="#4EBEE3" 
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={40}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 3 — CHANNEL ANALYTICS */}
        {/* ============================================ */}
        <div ref={channelAnalyticsRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('channelAnalytics')}
            >
              <Tv size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Channels Performance
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.channelAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.channelAnalytics && (
            <>
          {/* Metric Cards Row */}
          <motion.div
            className="grid grid-cols-3 gap-5 mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Total Channels */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Total Channels</p>
                <Tv size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">45</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[11px] text-[#10B981] font-['Poppins',sans-serif]">+5.2%</span>
              </div>
            </div>

            {/* Most Watched Category */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Most Watched Category</p>
                <TrendingUp size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Kids</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[11px] text-[#10B981] font-['Poppins',sans-serif]">+8.3%</span>
              </div>
            </div>

            {/* Least Watched Category */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Least Watched Category</p>
                <TrendingDown size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Religious</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown size={14} className="text-[#EF4444]" />
                <span className="text-[11px] text-[#EF4444] font-['Poppins',sans-serif]">-2.1%</span>
              </div>
            </div>
          </motion.div>

          {/* First Row: 3 Charts - Watching Hours, Top 5, Peak Viewing Times */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Watching Hours */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <h4 className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Watching Hours
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Total hours spent watching TV channels across the selected period, broken down by patient groups or hospital wards.
                  </div>
                </div>
              </div>

              <div className="h-[240px] w-full min-w-0 min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <BarChart 
                    data={globalViewBy === 'By Patient Groups' ? watchingHoursByGroup : watchingHoursByWard} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    {isChannelAnalyticsInView && (
                      <Bar 
                        dataKey="hours" 
                        fill="#4EBEE3" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={globalViewBy === 'By Patient Groups' ? 100 : 80}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Peak Viewing Times */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <h4 className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Peak Viewing Times
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Shows when patients are most actively watching TV throughout the day, helping identify peak engagement periods.
                  </div>
                </div>
              </div>

              <div className="h-[240px] w-full min-w-0 min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <AreaChart data={peakViewingTimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4EBEE3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4EBEE3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {isChannelAnalyticsInView && (
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#4EBEE3" 
                        strokeWidth={2}
                        fill="url(#viewsGradient)"
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top 5 Channels */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <h4 className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Top 5 Channels
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Ranks the most popular TV channels by total viewing hours, showing channel category and viewer demographic breakdown.
                  </div>
                </div>
              </div>

              <div className="h-[240px] space-y-2">
                {(globalViewBy === 'By Patient Groups' ? topChannelsByGroup : topChannelsByWard).map((channel, index) => (
                  <div key={index} className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#4EBEE3]/10">
                        <span className="text-[11px] font-semibold text-[#4EBEE3] font-['Poppins',sans-serif]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                          {channel.name}
                        </p>
                        <p className="text-[10px] text-[#6B7280] font-['Poppins',sans-serif]">
                          {channel.category} • {globalViewBy === 'By Patient Groups' ? channel.group : `Ward ${channel.ward}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        {channel.hours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 4 — ENGAGEMENT ANALYTICS */}
        {/* ============================================ */}
        <div ref={engagementRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('zoneAnalytics')}
            >
              <Users size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Zone Analytics
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.zoneAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.zoneAnalytics && (
            <>

          {/* Total Boxes */}
          <div className="grid grid-cols-4 gap-5 mb-5">
            <motion.div
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Total Interactions</span>
                <Activity size={18} className="text-[#4EBEE3]" />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                8,950
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+12.5%</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Engagement Hub</span>
                <Tv size={18} className="text-[#4EBEE3]" />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                5,950
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+8.2%</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Patient Services</span>
                <PhoneCall size={18} className="text-[#4EBEE3]" />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                1,200
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+15.3%</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Shortcuts</span>
                <Zap size={18} className="text-[#4EBEE3]" />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                1,800
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+18.7%</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Zone Interactions */}
            <motion.div 
              className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-1.5 mb-5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Zone Interactions
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Compares user interactions across the three main interface zones: Engagement Hub, Patient Services, and Shortcuts, broken down by patient demographics or ward location.
                  </div>
                </div>
              </div>

              <div className="h-[320px] w-full min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                  <BarChart data={globalViewBy === 'By Patient Groups' ? zoneByPatientGroup : zoneByWard} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                    <XAxis 
                      dataKey="group" 
                      tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    {isEngagementInView && (
                      <>
                        <Bar 
                          dataKey="engagement" 
                          fill="#4EBEE3" 
                          radius={[8, 8, 0, 0]} 
                          maxBarSize={40}
                          isAnimationActive={true}
                          animationDuration={1200}
                          name="Engagement Hub"
                        />
                        <Bar 
                          dataKey="services" 
                          fill="#16274D" 
                          radius={[8, 8, 0, 0]} 
                          maxBarSize={40}
                          isAnimationActive={true}
                          animationDuration={1200}
                          name="Patient Services"
                        />
                        <Bar 
                          dataKey="shortcuts" 
                          fill="#93C5FD" 
                          radius={[8, 8, 0, 0]} 
                          maxBarSize={40}
                          isAnimationActive={true}
                          animationDuration={1200}
                          name="Shortcuts"
                        />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4EBEE3]"></div>
                  <span className="text-[13px] font-['Poppins',sans-serif] text-[#16274D]">Engagement Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#16274D]"></div>
                  <span className="text-[13px] font-['Poppins',sans-serif] text-[#16274D]">Patient Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#93C5FD]"></div>
                  <span className="text-[13px] font-['Poppins',sans-serif] text-[#16274D]">Shortcuts</span>
                </div>
              </div>
            </motion.div>
          </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 4 — ENGAGEMENT ANALYTICS */}
        {/* ============================================ */}
        <div ref={engagementRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('engagementAnalytics')}
            >
              <Users size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Engagement Hub Analytics
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.engagementAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.engagementAnalytics && (
            <>

          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Total Taps KPI */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Total Taps</p>
                <Activity size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                {totalEngagementTaps.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+18.5%</span>
              </div>
            </div>

            {/* Top Tapped Category KPI */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Top Tapped</p>
                <TrendingUp size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Games
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+24.4%</span>
              </div>
            </div>

            {/* Least Tapped Category KPI */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Least Tapped</p>
                <TrendingDown size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                About Us
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown size={14} className="text-[#EF4444]" />
                <span className="text-[12px] text-[#EF4444] font-['Poppins',sans-serif]">-3.8%</span>
              </div>
            </div>
          </div>

          {/* Category Tap Distribution */}
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Category Tap Distribution
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Displays the most popular Engagement Hub categories ranked by total taps, helping identify which content patients interact with most.
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                <BarChart data={categoryTaps} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                          <p className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                            {data.name}
                          </p>
                          <p className="text-[13px] font-['Poppins',sans-serif] text-[#4EBEE3]">
                            Taps: <span className="font-semibold">{data.taps.toLocaleString()}</span>
                          </p>
                          <p className="text-[13px] font-['Poppins',sans-serif] text-[#16274D]">
                            Percentage: <span className="font-semibold">{data.percentage}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} cursor={false} />
                  <Bar 
                    dataKey="taps" 
                    fill="#4EBEE3" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 5 — PATIENT SERVICES ANALYTICS */}
        {/* ============================================ */}
        <div ref={servicesRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('servicesAnalytics')}
            >
              <PhoneCall size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Patient Services Performance
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.servicesAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.servicesAnalytics && (
            <>

          {/* Service Metrics Row */}
          <motion.div
            className="grid grid-cols-4 gap-5 mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Housekeeping</h4>
                <Package size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <KPIWithSparkline
                  label="Total"
                  value={housekeepingRequests.total}
                  change={sparklineData.housekeeping.totalChange}
                  trend={sparklineData.housekeeping.totalTrend as 'up' | 'down'}
                  sparklineData={sparklineData.housekeeping.total}
                  valueColor="#16274D"
                  valueSize="16px"
                />
                <KPIWithSparkline
                  label="Completed"
                  value={housekeepingRequests.completed}
                  change={sparklineData.housekeeping.completedChange}
                  trend={sparklineData.housekeeping.completedTrend as 'up' | 'down'}
                  sparklineData={sparklineData.housekeeping.completed}
                  valueColor="#10B981"
                  valueSize="14px"
                />
                <KPIWithSparkline
                  label="Avg Time"
                  value={housekeepingRequests.avgTime}
                  change={Math.abs(sparklineData.housekeeping.avgTimeChange)}
                  trend={sparklineData.housekeeping.avgTimeTrend as 'up' | 'down'}
                  sparklineData={sparklineData.housekeeping.avgTime}
                  valueColor="#4EBEE3"
                  valueSize="14px"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Meal Ordering</h4>
                <FileText size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <KPIWithSparkline
                  label="Total"
                  value={mealOrdering.total}
                  change={sparklineData.mealOrdering.totalChange}
                  trend={sparklineData.mealOrdering.totalTrend as 'up' | 'down'}
                  sparklineData={sparklineData.mealOrdering.total}
                  valueColor="#16274D"
                  valueSize="16px"
                />
                <KPIWithSparkline
                  label="Completed"
                  value={mealOrdering.completed}
                  change={sparklineData.mealOrdering.completedChange}
                  trend={sparklineData.mealOrdering.completedTrend as 'up' | 'down'}
                  sparklineData={sparklineData.mealOrdering.completed}
                  valueColor="#10B981"
                  valueSize="14px"
                />
                <KPIWithSparkline
                  label="Avg Time"
                  value={mealOrdering.avgTime}
                  change={Math.abs(sparklineData.mealOrdering.avgTimeChange)}
                  trend={sparklineData.mealOrdering.avgTimeTrend as 'up' | 'down'}
                  sparklineData={sparklineData.mealOrdering.avgTime}
                  valueColor="#4EBEE3"
                  valueSize="14px"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Virtual Consultation</h4>
                <MessageSquare size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <KPIWithSparkline
                  label="Total"
                  value={virtualConsultation.total}
                  change={sparklineData.virtualConsultation.totalChange}
                  trend={sparklineData.virtualConsultation.totalTrend as 'up' | 'down'}
                  sparklineData={sparklineData.virtualConsultation.total}
                  valueColor="#16274D"
                  valueSize="16px"
                />
                <KPIWithSparkline
                  label="Completed"
                  value={virtualConsultation.completed}
                  change={sparklineData.virtualConsultation.completedChange}
                  trend={sparklineData.virtualConsultation.completedTrend as 'up' | 'down'}
                  sparklineData={sparklineData.virtualConsultation.completed}
                  valueColor="#10B981"
                  valueSize="14px"
                />
                <KPIWithSparkline
                  label="Avg Time"
                  value={virtualConsultation.avgTime}
                  change={Math.abs(sparklineData.virtualConsultation.avgTimeChange)}
                  trend={sparklineData.virtualConsultation.avgTimeTrend as 'up' | 'down'}
                  sparklineData={sparklineData.virtualConsultation.avgTime}
                  valueColor="#4EBEE3"
                  valueSize="14px"
                />
              </div>
            </div>

            <div className="bg-[#4EBEE3]/10 rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">CareCall</h4>
                <PhoneCall size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <KPIWithSparkline
                  label="Total"
                  value={careCallData.total}
                  change={sparklineData.careCall.totalChange}
                  trend={sparklineData.careCall.totalTrend as 'up' | 'down'}
                  sparklineData={sparklineData.careCall.total}
                  valueColor="#16274D"
                  labelSize="11px"
                  valueSize="16px"
                />
                <KPIWithSparkline
                  label="Attended"
                  value={careCallData.attended}
                  change={sparklineData.careCall.attendedChange}
                  trend={sparklineData.careCall.attendedTrend as 'up' | 'down'}
                  sparklineData={sparklineData.careCall.attended}
                  valueColor="#16274D"
                  labelSize="11px"
                  valueSize="14px"
                />
                <KPIWithSparkline
                  label="Attendance Rate"
                  value={careCallData.attendanceRate}
                  change={sparklineData.careCall.attendanceRateChange}
                  trend={sparklineData.careCall.attendanceRateTrend as 'up' | 'down'}
                  sparklineData={sparklineData.careCall.attendanceRate}
                  valueColor="#4EBEE3"
                  labelSize="11px"
                  valueSize="14px"
                />
              </div>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* 1) SERVICE USAGE COMPARISON & STATUS BREAKDOWN */}
          {/* ============================================ */}
          <div className="grid grid-cols-2 gap-5 mt-5">
          <motion.div
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-1.5 mb-5">
              <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Service Usage Comparison
              </h4>
              <div className="relative group">
                <Info size={13} className="text-[#4EBEE3] cursor-help" />
                <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                  Compares total request volumes across different service types (Meal Ordering, Housekeeping, Consultation, CareCall) for the selected time period.
                </div>
              </div>
            </div>
            
            <div className="h-[240px] w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart 
                  data={serviceUsageComparison} 
                  layout="vertical"
                  margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.3} horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="service"
                    tick={{ fontSize: 12, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', paddingTop: '10px' }}
                    iconType="square"
                    iconSize={10}
                  />
                  {globalViewBy === 'By Patient Groups' ? (
                    isServicesInView && (
                      <>
                        <Bar dataKey="Adults" stackId="a" fill="#4EBEE3" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="Kids" stackId="a" fill="#357BA6" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="VIP" stackId="a" fill="#16274D" radius={[0, 8, 8, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                      </>
                    )
                  ) : (
                    isServicesInView && (
                      <>
                        <Bar dataKey="1A" stackId="a" fill="#4EBEE3" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="2B" stackId="a" fill="#357BA6" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="3C" stackId="a" fill="#2D6A8F" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="4A" stackId="a" fill="#1E4F6F" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="5A" stackId="a" fill="#1A4566" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="5B" stackId="a" fill="#16395D" radius={[0, 0, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                        <Bar dataKey="6C" stackId="a" fill="#16274D" radius={[0, 8, 8, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} />
                      </>
                    )
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Service Request Status Breakdown */}
          <motion.div
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Service Request Status Breakdown
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Shows the status of service requests during the selected period.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[120px]">
                  <SingleSelectDropdown
                    label=""
                    value={serviceStatusPatientGroupFilter}
                    onChange={setServiceStatusPatientGroupFilter}
                    options={['All', 'Adults', 'Kids', 'VIP']}
                    placeholder="Group"
                  />
                </div>
              </div>
            </div>
            
            <div className="h-[240px] w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart 
                  data={serviceStatusData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.3} horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="service"
                    tick={{ fontSize: 12, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', paddingTop: '10px' }}
                    iconType="square"
                    iconSize={10}
                  />
                  {isServicesInView && (
                    <>
                      <Bar 
                        dataKey="Completed" 
                        stackId="a" 
                        fill="#4EBEE3" 
                        radius={[0, 0, 0, 0]} 
                        maxBarSize={50} 
                        isAnimationActive={true} 
                        animationDuration={1200} 
                      />
                      <Bar 
                        dataKey="In Progress" 
                        stackId="a" 
                        fill="#16274D" 
                        radius={[0, 8, 8, 0]} 
                        maxBarSize={50} 
                        isAnimationActive={true} 
                        animationDuration={1200} 
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          </div>

          {/* ============================================ */}
          {/* 2) REQUESTS TREND BY HOUR */}
          {/* ============================================ */}
          <motion.div
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6 mt-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  Requests Trend by Hour
                </h4>
                <div className="relative group">
                  <Info size={13} className="text-[#4EBEE3] cursor-help" />
                  <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                    Shows the average number of service requests per hour across the selected date range. Each data point represents the typical request volume for that hour.
                  </div>
                </div>
              </div>
              <div className="w-[180px]">
                <SingleSelectDropdown
                  label=""
                  options={['All', 'Meal Ordering', 'Housekeeping', 'Consultation', 'CareCall']}
                  value={requestsTrendFilter}
                  onChange={(value) => setRequestsTrendFilter(value)}
                />
              </div>
            </div>
            
            <div className="h-[280px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={requestsTrendByHour} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4EBEE3" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4EBEE3" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    height={50}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {isServicesInView && (
                    <Area 
                      type="monotone"
                      dataKey="requests" 
                      stroke="#4EBEE3"
                      strokeWidth={2.5}
                      fill="url(#requestsGradient)"
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 6 — CONTENT LIBRARY ANALYTICS */}
        {/* ============================================ */}
        <div ref={contentRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('contentAnalytics')}
            >
              <Package size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Content Library Performance
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.contentAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.contentAnalytics && (
            <>

          {/* New Layout: Stacked Cards on Left + Top Used Assets Chart on Right */}
          <motion.div
            className="grid grid-cols-[280px_1fr] gap-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Left: Stacked Summary Cards */}
            <div className="flex flex-col gap-3">
              {contentLibraryData.map((content, index) => {
                const pieData = [
                  { name: 'Active', value: content.active, color: '#4EBEE3' },
                  { name: 'Inactive', value: content.inactive, color: '#64748B' }
                ];
                
                return (
                  <div key={index} className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5 flex items-center gap-5">
                    {/* Pie Chart */}
                    <div className="w-[70px] h-[70px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={70} minHeight={70}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx={35}
                            cy={35}
                            innerRadius={20}
                            outerRadius={32}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active }) => {
                              if (active) {
                                return (
                                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
                                    <p className="text-[12px] font-semibold text-[#16274D] mb-2 font-['Poppins',sans-serif]">
                                      {content.type}
                                    </p>
                                    {pieData.map((item, idx) => (
                                      <p key={idx} className="text-[11px] font-semibold font-['Poppins',sans-serif]" style={{ color: item.color }}>
                                        {item.name}: {item.value}
                                      </p>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Content Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{content.type}</h4>
                        <FileText size={16} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-['Poppins',sans-serif] mb-2">
                        <span className="text-[#6B7280]">
                          <span className="font-semibold text-[#4EBEE3]">{content.active}</span> / {content.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                        <span className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">Taps</span>
                        <span className="text-[14px] font-semibold text-[#4EBEE3] font-['Poppins',sans-serif]">{content.taps.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Top Used Assets Chart */}
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Top Used Assets
                  </h4>
                  <div className="relative group">
                    <Info size={12} className="text-[#4EBEE3] cursor-help" />
                    <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                      Based on the total session duration (in hours) for each asset during the selected period.
                    </div>
                  </div>
                </div>
                <div className="w-[150px]">
                  <div className="relative group">
                    <SingleSelectDropdown
                      label=""
                      options={topAssetsFilterOptions}
                      value={topAssetsPatientGroupFilter}
                      onChange={(value) => setTopAssetsPatientGroupFilter(value)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                      Filter asset usage based on the selected {globalViewBy === 'By Patient Groups' ? 'patient group' : 'hospital ward'}.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-[280px] w-full min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <BarChart 
                    data={getTopAssetsData()} 
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#637381', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
                      tickFormatter={(value) => formatDuration(value)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={120}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const asset = getTopAssetsData().find(a => a.name === payload.value);
                        const typeColor = asset ? assetsColors[asset.type as keyof typeof assetsColors] || '#637381' : '#637381';
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text 
                              x={0} 
                              y={0} 
                              dy={-8}
                              textAnchor="end" 
                              fill="#16274D" 
                              fontSize={11}
                              fontFamily="Poppins, sans-serif"
                              fontWeight={500}
                            >
                              {payload.value}
                            </text>
                            <rect
                              x={-70}
                              y={2}
                              width={65}
                              height={14}
                              rx={6}
                              fill={typeColor}
                              opacity={0.15}
                            />
                            <text 
                              x={-37} 
                              y={8}
                              dy={5}
                              textAnchor="middle" 
                              fill={typeColor} 
                              fontSize={9}
                              fontFamily="Poppins, sans-serif"
                              fontWeight={600}
                            >
                              {asset?.type || ''}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-[#4EBEE3]/30 rounded-lg shadow-lg p-3">
                              <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                                {data.name}
                              </p>
                              <p className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">
                                Type: <span className="font-semibold" style={{ color: assetsColors[data.type as keyof typeof assetsColors] }}>{data.type}</span>
                              </p>
                              <p className="text-[11px] text-[#637381] font-['Poppins',sans-serif]">
                                Duration: <span className="font-semibold text-[#16274D]">{formatDuration(data.duration)}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="duration" 
                      fill="#16274D"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 7 — NOTIFICATIONS ANALYTICS */}
        {/* ============================================ */}
        <div ref={notificationsRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('notificationsOverview')}
            >
              <Bell size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Notifications Overview
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.notificationsOverview ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.notificationsOverview && (
            <>

          {/* Notification Metrics Row */}
          <motion.div
            className="grid grid-cols-3 gap-5 mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Notifications Sent</p>
                <Bell size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{notificationsData.sent.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+14.2%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Delivered</p>
                <CheckCircle2 size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{notificationsData.delivered.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+12.8%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">Acknowledged</p>
                <Award size={18} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{notificationsData.acknowledged.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-[12px] text-[#10B981] font-['Poppins',sans-serif]">+16.5%</span>
              </div>
            </div>
          </motion.div>

          {/* Notification Chart - Single chart affected by global filter */}
          <motion.div 
            className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6 mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-1.5 mb-5">
              <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Notifications {globalViewBy === 'By Patient Groups' ? 'by Patient Group' : 'by Ward'}
              </h4>
              <div className="relative group">
                <Info size={13} className="text-[#4EBEE3] cursor-help" />
                <div className="absolute left-0 top-5 w-64 bg-[#16274D] text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-['Poppins',sans-serif]">
                  {globalViewBy === 'By Patient Groups' 
                    ? 'Shows how many notifications were sent, delivered, and acknowledged by each patient group.'
                    : 'Shows notification activity across wards, including sent, delivered, and acknowledged counts.'}
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full min-w-0 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart 
                  data={globalViewBy === 'By Patient Groups' ? notificationsByGroup : notificationsByWard} 
                  margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
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
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}
                    iconType="square"
                    iconSize={10}
                  />
                  {isNotificationsInView && (
                    <>
                      <Bar 
                        dataKey="sent" 
                        fill="#4EBEE3" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={50}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        name="Sent"
                      />
                      <Bar 
                        dataKey="delivered" 
                        fill="#357BA6" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={50}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        name="Delivered"
                      />
                      <Bar 
                        dataKey="acknowledged" 
                        fill="#16274D" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={50}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        name="Acknowledged"
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 8 — SURVEY & SATISFACTION */}
        {/* ============================================ */}
        <div ref={surveyRef} className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={() => toggleSection('surveyAnalytics')}
            >
              <Star size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Survey & Satisfaction
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-[#637381] transition-transform duration-200 ${collapsedSections.surveyAnalytics ? '' : 'rotate-180'}`} 
                strokeWidth={2} 
              />
            </div>
          </motion.div>

          {!collapsedSections.surveyAnalytics && (
            <>
        <motion.div 
          className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Overview
            </h4>
            <button 
              onClick={() => onNavigate?.('feedback-report')}
              className="px-4 py-2 bg-[#4EBEE3]/10 hover:bg-[#4EBEE3]/20 text-[#4EBEE3] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors"
            >
              View Full Report →
            </button>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-6">
            {/* Left: Overall Score */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#4EBEE3]/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star size={32} className="text-[#F59E0B] fill-[#F59E0B]" strokeWidth={2} />
                <span className="text-[48px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{surveyData.overallScore}</span>
              </div>
              <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif] mb-4">Overall Satisfaction</p>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-[12px] font-['Poppins',sans-serif]">
                  <span className="text-[#6B7280]">Total Responses:</span>
                  <span className="font-semibold text-[#16274D]">{surveyData.totalResponses.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] font-['Poppins',sans-serif]">
                  <span className="text-[#6B7280]">Response Rate:</span>
                  <span className="font-semibold text-[#4EBEE3]">{surveyData.responseRate}%</span>
                </div>
              </div>
            </div>

            {/* Right: Rating Distribution */}
            <div>
              <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-3">Rating Distribution</p>
              <div className="space-y-3">
                {surveyData.distribution.map((rating, index) => {
                  const percentage = (rating.count / surveyData.totalResponses) * 100;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] w-16">{rating.rating}</span>
                      <div className="flex-1 h-8 bg-[#F8FAFC] rounded-lg overflow-hidden border border-[#E2E8F0]">
                        <div 
                          className="h-full bg-[#4EBEE3] rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 10 && (
                            <span className="text-[11px] font-semibold text-white font-['Poppins',sans-serif]">
                              {rating.count.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-[#6B7280] font-['Poppins',sans-serif] w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
            </>
          )}
        </div>
      </div>
      {/* End Export Content Wrapper */}
    </div>
  );
}
