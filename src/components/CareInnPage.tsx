import { useState, useEffect } from 'react';
import { Monitor, Search, Download, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Link as LinkIcon, RefreshCw, X, Power, RotateCcw, Trash, Settings, Tablet, MonitorOff, Home as HomeIcon, Bell, FileText, Image as ImageIcon, MoreVertical, Circle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';
import DeviceModal from './DeviceModal';
import InlineEditCell from './InlineEditCell';
import TablePagination from './TablePagination';
import MoreActionsModal from './MoreActionsModal';
import BulkActionsModal from './BulkActionsModal';
import UpdateAPKModal from './UpdateAPKModal';
import SetStaticIPModal from './SetStaticIPModal';

type TabType = 'device-location';
type ModalTabType = 'device-info' | 'device-usage';
type SortField = 'deviceId' | 'mrn' | 'roomNo' | 'bedNo' | 'building' | 'floor' | 'poc' | 'group' | 'server' | 'isConnected' | 'isActive';
type SortDirection = 'asc' | 'desc';
type DeviceInfoSortField = 'deviceId' | 'mrn' | 'appVersion' | 'ipAddress' | 'patientId' | 'deviceExtension' | 'connected' | 'logs';
type DeviceActionSortField = 'deviceId' | 'mrn' | 'patientId' | 'pendingNotification';
type DeviceServicesSortField = 'deviceId' | 'mrn';
type UsageTabType = 'system-services' | 'apps' | 'device-services';

interface Device {
  id: string;
  deviceId: string;
  mrn: string;
  roomNo: string;
  bedNo: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  server: string;
  isConnected: boolean; // Connection status
  isActive: boolean;
  tag: string;
  selected: boolean;
}

interface DeviceInfo {
  id: string;
  deviceId: string;
  mrn: string;
  appVersion: string;
  ipAddress: string;
  patientId: string;
  deviceExtension: string;
  connected: boolean;
  logs: string;
  selected: boolean;
}

interface DeviceAction {
  id: string;
  deviceId: string;
  mrn: string;
  patientId: string;
  pendingNotification: 'No' | 'Pending' | 'Yes';
  isActive: boolean;
  selected: boolean;
}

interface DeviceService {
  id: string;
  deviceId: string;
  mrn: string;
  selected: boolean;
}

interface CareInnPageProps {
  filters?: {
    connection?: string;
    status?: string;
  };
}

export default function CareInnPage({ filters = {} }: CareInnPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceInfos, setDeviceInfos] = useState<DeviceInfo[]>([]);
  const [deviceActions, setDeviceActions] = useState<DeviceAction[]>([]);
  const [deviceServices, setDeviceServices] = useState<DeviceService[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedDeviceConnected, setSelectedDeviceConnected] = useState<boolean>(true);
  const [selectedDeviceServer, setSelectedDeviceServer] = useState<string>('');
  const [modalActiveTab, setModalActiveTab] = useState<ModalTabType>('device-info');
  const [usageActiveTab, setUsageActiveTab] = useState<UsageTabType>('system-services');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deviceInfoSortField, setDeviceInfoSortField] = useState<DeviceInfoSortField>('deviceId');
  const [deviceInfoSortDirection, setDeviceInfoSortDirection] = useState<SortDirection>('asc');
  const [deviceActionSortField, setDeviceActionSortField] = useState<DeviceActionSortField>('deviceId');
  const [deviceActionSortDirection, setDeviceActionSortDirection] = useState<SortDirection>('asc');
  const [deviceServiceSortField, setDeviceServiceSortField] = useState<DeviceServicesSortField>('deviceId');
  const [deviceServiceSortDirection, setDeviceServiceSortDirection] = useState<SortDirection>('asc');
  
  // Bulk Actions states
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);
  const [isUpdateWelcomeNoteModalOpen, setIsUpdateWelcomeNoteModalOpen] = useState(false);
  const [isUpdateWallpaperModalOpen, setIsUpdateWallpaperModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);
  
  // Row Actions states
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedRowDeviceId, setSelectedRowDeviceId] = useState<string>('');
  const [selectedRowServer, setSelectedRowServer] = useState<string>('');
  
  // More Actions Modal states
  const [isMoreActionsModalOpen, setIsMoreActionsModalOpen] = useState(false);
  const [isUpdateAPKModalOpen, setIsUpdateAPKModalOpen] = useState(false);
  const [isSetStaticIPModalOpen, setIsSetStaticIPModalOpen] = useState(false);
  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false);
  
  // More Actions fields
  const [careinnVersion, setCareinnVersion] = useState('1.5.10');
  const [ipAddress, setIpAddress] = useState('10.11.0.50');
  const [patientAssigned, setPatientAssigned] = useState('123402');
  const [sipExtension, setSipExtension] = useState('3201');
  const [sipUsername, setSipUsername] = useState('3201');
  const [sipPassword, setSipPassword] = useState('');
  
  // Welcome Note counter for auto-generated IDs
  const [welcomeNoteCounter, setWelcomeNoteCounter] = useState(1);
  const [emergencyExtension, setEmergencyExtension] = useState('Nurse station 13');
  const [selectedGroup, setSelectedGroup] = useState('Kids');
  const [sipEnabled, setSipEnabled] = useState(false);
  
  // Toggle states
  const [kioskMode, setKioskMode] = useState(false);
  const [patientServices, setPatientServices] = useState(true);
  const [noAdmissionMode, setNoAdmissionMode] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(true);
  
  // Update APK modal fields
  const [newAPKVersion, setNewAPKVersion] = useState('');
  const [apkFile, setAPKFile] = useState<File | null>(null);
  
  // Set Static IP modal field
  const [newStaticIP, setNewStaticIP] = useState('');
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{deviceId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingTagDeviceId, setEditingTagDeviceId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  
  // Filter states
  const [filterPOC, setFilterPOC] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check for pending filter from alert navigation
  useEffect(() => {
    const pendingFilter = localStorage.getItem('careinn-pending-filter');
    const pendingDevice = localStorage.getItem('careinn-pending-device');
    
    if (pendingFilter === 'disconnected') {
      setFilterConnection('disconnected');
      // Clear the pending filter
      localStorage.removeItem('careinn-pending-filter');
      localStorage.removeItem('careinn-pending-device');
    }
  }, []);

  // Apply filters from navigation
  useEffect(() => {
    if (filters?.connection) {
      setFilterConnection(filters.connection);
    }
    if (filters?.status) {
      setFilterStatus(filters.status);
    }
  }, [filters]);

  // Load devices from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careinn_devices');
      if (stored) {
        const parsedDevices = JSON.parse(stored);
        
        // Check if we need to adjust device count (should be 30 total)
        if (parsedDevices.length !== 30) {
          // Reinitialize with correct count
          const sampleDevices: Device[] = Array.from({ length: 30 }, (_, i) => ({
            id: `${i + 1}`,
            deviceId: `mt15gwjh${896684016 + i}`,
            mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
            roomNo: `${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}`,
            bedNo: `${(i % 4) + 1}`.padStart(2, '0'),
            building: `${(i % 3) + 1}`.padStart(2, '0'),
            floor: `${(i % 5) + 1}`.padStart(2, '0'),
            poc: ['1A', '2B', '3C', '4A', '5B', '6C'][i % 6],
            group: ['Kids', 'Adults', 'VIP'][i % 3],
            server: `192.156.${68 + (i % 10)}/api`,
            isConnected: i >= 2, // Only first 2 devices are disconnected (device 0 and 1), 28 connected (devices 2-29)
            isActive: Math.random() > 0.3, // 70% active
            tag: '',
            selected: false
          }));
          setDevices(sampleDevices);
          localStorage.setItem('careinn_devices', JSON.stringify(sampleDevices));
        } else {
          // Migrate old data to include isConnected and tag fields if missing
          const migratedDevices = parsedDevices.map((device: Device, index: number) => ({
            ...device,
            isConnected: device.isConnected !== undefined ? device.isConnected : index >= 2,
            tag: device.tag !== undefined ? device.tag : ''
          }));
          setDevices(migratedDevices);
          localStorage.setItem('careinn_devices', JSON.stringify(migratedDevices));
        }
      } else {
        // Initialize with sample data (30 devices total, 2 disconnected, 28 connected)
        const sampleDevices: Device[] = Array.from({ length: 30 }, (_, i) => ({
          id: `${i + 1}`,
          deviceId: `mt15gwjh${896684016 + i}`,
          mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
          roomNo: `${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}`,
          bedNo: `${(i % 4) + 1}`.padStart(2, '0'),
          building: `${(i % 3) + 1}`.padStart(2, '0'),
          floor: `${(i % 5) + 1}`.padStart(2, '0'),
          poc: ['1A', '2B', '3C', '4A', '5B', '6C'][i % 6],
          group: ['Kids', 'Adults', 'VIP'][i % 3],
          server: `192.156.${68 + (i % 10)}/api`,
          isConnected: i >= 2, // Only first 2 devices are disconnected (device 0 and 1), 28 connected (devices 2-29)
          isActive: Math.random() > 0.3, // 70% active
          tag: '',
          selected: false
        }));
        setDevices(sampleDevices);
        localStorage.setItem('careinn_devices', JSON.stringify(sampleDevices));
      }

      // Load device info
      const storedInfo = localStorage.getItem('careinn_device_info');
      if (storedInfo) {
        setDeviceInfos(JSON.parse(storedInfo));
      } else {
        // Initialize with sample device info data
        const sampleDeviceInfos: DeviceInfo[] = Array.from({ length: 150 }, (_, i) => ({
          id: `${i + 1}`,
          deviceId: `mt15pwjn${896694016 + i}`,
          mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
          appVersion: `1.5.${10 + (i % 20)}`,
          ipAddress: `192.186.${211 + (i % 10)}.${1 + (i % 255)}`,
          patientId: `${1845014 + i}`,
          deviceExtension: `${30140 + i}`,
          connected: Math.random() > 0.2, // 80% connected
          logs: Math.random() > 0.3 ? 'Successful' : 'Export log',
          selected: false
        }));
        setDeviceInfos(sampleDeviceInfos);
        localStorage.setItem('careinn_device_info', JSON.stringify(sampleDeviceInfos));
      }

      // Load device actions
      const storedActions = localStorage.getItem('careinn_device_actions');
      if (storedActions) {
        setDeviceActions(JSON.parse(storedActions));
      } else {
        // Initialize with sample device action data
        const sampleDeviceActions: DeviceAction[] = Array.from({ length: 100 }, (_, i) => ({
          id: `${i + 1}`,
          deviceId: `mt15pwjn${896694016 + i}`,
          mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
          patientId: `${1845014 + i}`,
          pendingNotification: ['No', 'Pending', 'Yes'][i % 3],
          isActive: Math.random() > 0.5, // 50% active
          selected: false
        }));
        setDeviceActions(sampleDeviceActions);
        localStorage.setItem('careinn_device_actions', JSON.stringify(sampleDeviceActions));
      }

      // Load device services
      const storedServices = localStorage.getItem('careinn_device_services');
      if (storedServices) {
        setDeviceServices(JSON.parse(storedServices));
      } else {
        // Initialize with sample device service data
        const sampleDeviceServices: DeviceService[] = Array.from({ length: 100 }, (_, i) => ({
          id: `${i + 1}`,
          deviceId: `mt15pwjn${896694016 + i}`,
          mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
          selected: false
        }));
        setDeviceServices(sampleDeviceServices);
        localStorage.setItem('careinn_device_services', JSON.stringify(sampleDeviceServices));
      }
    }
  }, []);

  // Save to localStorage whenever devices change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_devices', JSON.stringify(devices));
    }
  }, [devices]);

  // Save device info to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_device_info', JSON.stringify(deviceInfos));
    }
  }, [deviceInfos]);

  // Save device actions to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_device_actions', JSON.stringify(deviceActions));
    }
  }, [deviceActions]);

  // Save device services to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_device_services', JSON.stringify(deviceServices));
    }
  }, [deviceServices]);

  // Close Quick Actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isQuickActionsOpen && !target.closest('.quick-actions-dropdown')) {
        setIsQuickActionsOpen(false);
      }
      if (openRowMenuId && !target.closest('.row-actions-menu')) {
        setOpenRowMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickActionsOpen, openRowMenuId]);

  // Filter and sort for Device Location
  const filteredDevices = devices.filter(device => {
    // Search filter
    const matchesSearch = device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.bedNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.poc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.group.toLowerCase().includes(searchQuery.toLowerCase());
    
    // POC filter
    const matchesPOC = filterPOC === 'all' || device.poc === filterPOC;
    
    // Group filter
    const matchesGroup = filterGroup === 'all' || device.group === filterGroup;
    
    // Connection filter
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && device.isConnected) ||
      (filterConnection === 'disconnected' && !device.isConnected);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && device.isActive) ||
      (filterStatus === 'inactive' && !device.isActive);
    
    return matchesSearch && matchesPOC && matchesGroup && matchesConnection && matchesStatus;
  }).sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    // Handle boolean sorting (for isConnected and isActive)
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return (aVal === bVal ? 0 : aVal ? -1 : 1) * direction;
    }
    
    return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
  });

  // Filter and sort for Device Info
  const filteredDeviceInfos = deviceInfos.filter(device => 
    device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[deviceInfoSortField];
    const bVal = b[deviceInfoSortField];
    const direction = deviceInfoSortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return (aVal === bVal ? 0 : aVal ? -1 : 1) * direction;
    }
    
    return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
  });

  // Filter and sort for Device Action
  const filteredDeviceActions = deviceActions.filter(device => 
    device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.pendingNotification.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[deviceActionSortField];
    const bVal = b[deviceActionSortField];
    const direction = deviceActionSortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return (aVal === bVal ? 0 : aVal ? -1 : 1) * direction;
    }
    
    return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
  });

  // Filter and sort for Device Services
  const filteredDeviceServices = deviceServices.filter(device => 
    device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[deviceServiceSortField];
    const bVal = b[deviceServiceSortField];
    const direction = deviceServiceSortDirection === 'asc' ? 1 : -1;
    return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
  });

  // Pagination calculations
  const getCurrentPageData = (data: any[]) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => Math.ceil(dataLength / rowsPerPage);

  const paginatedDevices = getCurrentPageData(filteredDevices);
  const paginatedDeviceInfos = getCurrentPageData(filteredDeviceInfos);
  const paginatedDeviceActions = getCurrentPageData(filteredDeviceActions);
  const paginatedDeviceServices = getCurrentPageData(filteredDeviceServices);

  const hasSelectedDevices = devices.some(device => device.selected);

  // Inline edit handler
  const handleInlineEdit = (id: string, field: string, newValue: any) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, [field]: newValue } : device
    ));
    setDeviceInfos(deviceInfos.map(info => 
      info.id === id ? { ...info, [field]: newValue } : info
    ));
    toast.success('Terminal Updated', {
      description: 'Changes saved successfully',
    });
  };
  const hasSelectedDeviceInfos = deviceInfos.some(device => device.selected);
  const hasSelectedDeviceActions = deviceActions.some(device => device.selected);
  const hasSelectedDeviceServices = deviceServices.some(device => device.selected);

  const handleToggleSelect = (id: string) => {
    setDevices(prev => prev.map(device => 
      device.id === id ? { ...device, selected: !device.selected } : device
    ));
  };

  const handleToggleSelectAll = () => {
    const allSelected = paginatedDevices.every(device => device.selected);
    setDevices(prev => prev.map(device => {
      if (paginatedDevices.find(pd => pd.id === device.id)) {
        return { ...device, selected: !allSelected };
      }
      return device;
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDeviceInfoSort = (field: DeviceInfoSortField) => {
    if (deviceInfoSortField === field) {
      setDeviceInfoSortDirection(deviceInfoSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setDeviceInfoSortField(field);
      setDeviceInfoSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDeviceActionSort = (field: DeviceActionSortField) => {
    if (deviceActionSortField === field) {
      setDeviceActionSortDirection(deviceActionSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setDeviceActionSortField(field);
      setDeviceActionSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDeviceServiceSort = (field: DeviceServicesSortField) => {
    if (deviceServiceSortField === field) {
      setDeviceServiceSortDirection(deviceServiceSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setDeviceServiceSortField(field);
      setDeviceServiceSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    toast.success('Export Started', {
      description: 'Your CSV file is being prepared for download',
      duration: 2000,
    });
  };



  const getGroupColor = (group: string) => {
    switch (group.toLowerCase()) {
      case 'kids':
        return 'bg-[#BDECFC] text-[#16274D]';
      case 'adults':
        return 'bg-[#16274D] text-white';
      case 'vip':
        return 'bg-[#00B8D9] text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPendingNotificationColor = (status: 'No' | 'Pending' | 'Yes') => {
    switch (status) {
      case 'No':
        return 'bg-[#10B981] text-white';
      case 'Pending':
        return 'bg-[#FCD34D] text-[#78350F]';
      case 'Yes':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const handleRefreshTerminal = (deviceId: string) => {
    toast.success('Terminal Refreshed', {
      description: `Device ${deviceId} terminal has been refreshed`,
      duration: 2000,
    });
  };

  const handleToggleActivation = (id: string) => {
    setDeviceActions(prev => prev.map(device => 
      device.id === id ? { ...device, isActive: !device.isActive } : device
    ));
    const device = deviceActions.find(d => d.id === id);
    toast.success(device?.isActive ? 'Device Deactivated' : 'Device Activated', {
      description: `Device has been ${device?.isActive ? 'deactivated' : 'activated'} successfully`,
      duration: 2000,
    });
  };

  const handleClearData = (deviceId: string) => {
    toast.success('Data Cleared', {
      description: `Device ${deviceId} data has been cleared`,
      duration: 2000,
    });
  };

  const handleReset = (deviceId: string) => {
    toast.success('Device Reset', {
      description: `Device ${deviceId} has been reset successfully`,
      duration: 2000,
    });
  };

  // Device Services handlers
  const handleSendAlert = (deviceId: string) => {
    toast.success('Alert Sent', {
      description: `Alert created for device ${deviceId}`,
      duration: 2000,
    });
  };

  const handleCustomGreeting = (deviceId: string) => {
    toast.success('Custom Greeting', {
      description: `Opening custom greeting editor for device ${deviceId}`,
      duration: 2000,
    });
  };

  const handleWallpaper = (deviceId: string) => {
    toast.success('Wallpaper', {
      description: `Opening wallpaper customizer for device ${deviceId}`,
      duration: 2000,
    });
  };

  const handleAssignApp = (deviceId: string) => {
    toast.success('Application Assigned', {
      description: `Applications assigned to device ${deviceId}`,
      duration: 2000,
    });
  };

  const handleAssignSIP = (deviceId: string) => {
    toast.success('SIP Configuration', {
      description: `SIP configuration assigned to device ${deviceId}`,
      duration: 2000,
    });
  };

  const handlePatientServices = (deviceId: string) => {
    toast.success('Patient Services', {
      description: `Opening patient services for device ${deviceId}`,
      duration: 2000,
    });
  };

  // Bulk Actions handlers
  const getSelectedDevices = () => {
    return devices.filter(d => d.selected);
  };

  const handleBulkRefresh = () => {
    const selected = getSelectedDevices();
    toast.success('Terminals Refreshed', {
      description: `${selected.length} terminal(s) have been refreshed`,
      duration: 2000,
    });
  };

  const handleBulkClearData = () => {
    const selected = getSelectedDevices();
    if (confirm(`Are you sure you want to clear data for ${selected.length} terminal(s)? This action cannot be undone.`)) {
      toast.success('Data Cleared', {
        description: `Data cleared for ${selected.length} terminal(s)`,
        duration: 2000,
      });
    }
  };

  const handleBulkReset = () => {
    const selected = getSelectedDevices();
    if (confirm(`Are you sure you want to reset ${selected.length} terminal(s)? This action cannot be undone.`)) {
      toast.success('Terminals Reset', {
        description: `${selected.length} terminal(s) have been reset successfully`,
        duration: 2000,
      });
    }
  };

  const handleBulkActivate = () => {
    const selected = getSelectedDevices();
    setDevices(prev => prev.map(device => 
      device.selected ? { ...device, isActive: true } : device
    ));
    toast.success('Terminals Activated', {
      description: `${selected.length} terminal(s) have been activated`,
      duration: 2000,
    });
  };

  const handleBulkDeactivate = () => {
    const selected = getSelectedDevices();
    setDevices(prev => prev.map(device => 
      device.selected ? { ...device, isActive: false } : device
    ));
    toast.success('Terminals Deactivated', {
      description: `${selected.length} terminal(s) have been deactivated`,
      duration: 2000,
    });
  };

  const handleDeselectAll = () => {
    setDevices(prev => prev.map(d => ({ ...d, selected: false })));
  };

  const handleDeviceClick = (deviceId: string) => {
    const device = devices.find(d => d.deviceId === deviceId);
    setSelectedDeviceId(deviceId);
    setSelectedDeviceConnected(device?.isConnected ?? true);
    setSelectedDeviceServer(device?.server ?? '192.156.68/api');
    setModalActiveTab('device-info');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeviceId('');
  };
  
  // Inline editing handlers
  const handleCellDoubleClick = (deviceId: string, field: string, currentValue: string) => {
    setEditingCell({ deviceId, field });
    setEditValue(currentValue);
  };
  
  const handleCellBlur = () => {
    if (editingCell) {
      // Update the device with new value
      setDevices(prev => prev.map(device => 
        device.deviceId === editingCell.deviceId 
          ? { ...device, [editingCell.field]: editValue }
          : device
      ));
    }
    setEditingCell(null);
    setEditValue('');
  };
  
  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Tag editing handlers
  const handleTagClick = (deviceId: string, currentValue: string) => {
    setEditingTagDeviceId(deviceId);
    setEditingTagValue(currentValue);
  };

  const handleTagSave = () => {
    if (editingTagDeviceId) {
      setDevices(prev => prev.map(device => 
        device.id === editingTagDeviceId 
          ? { ...device, tag: editingTagValue.trim() }
          : device
      ));
    }
    setEditingTagDeviceId(null);
    setEditingTagValue('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagSave();
    } else if (e.key === 'Escape') {
      setEditingTagDeviceId(null);
      setEditingTagValue('');
    }
  };

  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const renderPagination = (totalItems: number, itemLabel: string) => {
    return (
      <TablePagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setRowsPerPage}
        itemLabel={itemLabel}
        showRowsPerPage={true}
      />
    );
  };

  const SortIcon = ({ field, currentField, direction }: { field: string; currentField: string; direction: SortDirection }) => {
    if (field !== currentField) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return (
      <ArrowUpDown 
        size={14} 
        className={`text-[#4EBEE3] ${direction === 'desc' ? 'rotate-180' : ''}`} 
      />
    );
  };

  // Calculate summary statistics
  const totalUnits = devices.length;
  const connectedUnits = devices.filter(d => d.isConnected).length;
  const offlineUnits = totalUnits - connectedUnits;

  return (
    <div className="h-full overflow-auto p-3 md:p-5 lg:p-7">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <Tablet size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              CareInn15
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage CareInn15 devices and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total Terminals */}
        <button
          onClick={() => setFilterConnection('all')}
          className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
            filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex flex-col gap-1.5">
              <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Total Terminals</div>
              <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalUnits}</div>
            </div>
            <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
              <Tablet size={22} className="text-[#4EBEE3] rotate-90" strokeWidth={2} />
            </div>
          </div>
        </button>

        {/* Connected */}
        <button
          onClick={() => setFilterConnection('connected')}
          className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
            filterConnection === 'connected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex flex-col gap-1.5">
              <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected</div>
              <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedUnits}</div>
            </div>
            <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
              <Monitor size={22} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
          </div>
        </button>

        {/* Disconnected */}
        <button
          onClick={() => setFilterConnection('disconnected')}
          className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
            filterConnection === 'disconnected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex flex-col gap-1.5">
              <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected</div>
              <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{offlineUnits}</div>
            </div>
            <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
              <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>

      {/* Contextual Action Bar - Shows above filters when devices are selected */}
      {hasSelectedDevices && (
            <div className="bg-gradient-to-r from-[#F8F9FA] to-[#F0F9FB] border-2 border-[#4EBEE3]/20 rounded-xl shadow-md mb-4 relative z-50">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Left side - Selection count */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#4EBEE3] rounded-lg flex items-center justify-center">
                        <span className="text-white text-[14px] font-semibold font-['Poppins',sans-serif]">
                          {devices.filter(d => d.selected).length}
                        </span>
                      </div>
                      <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {devices.filter(d => d.selected).length === 1 ? 'terminal' : 'terminals'} selected
                      </span>
                    </div>
                    
                    <button
                      onClick={handleDeselectAll}
                      className="text-[13px] text-[#4EBEE3] hover:text-[#3DA5CA] font-medium font-['Poppins',sans-serif] transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex items-center gap-3">
                    {/* Quick Actions Dropdown */}
                    <div className="relative quick-actions-dropdown">
                      <button
                        onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium shadow-sm"
                      >
                        <Settings size={16} strokeWidth={2} />
                        Quick Actions
                        <ChevronDown size={16} strokeWidth={2} className={`transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isQuickActionsOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden">
                          <button
                            onClick={() => {
                              handleBulkRefresh();
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                              <RefreshCw size={16} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Refresh
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              handleBulkRestart();
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                              <RotateCcw size={16} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Restart
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              handleBulkClearData();
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                              <Trash size={16} className="text-red-600" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Clear Data
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              const selected = getSelectedDevices();
                              const updatedDevices = devices.map(d => 
                                d.selected ? { ...d, isActive: true } : d
                              );
                              setDevices(updatedDevices);
                              toast.success('Terminals Activated', {
                                description: `${selected.length} terminal(s) have been activated`,
                                duration: 2000,
                              });
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <Power size={16} className="text-green-600" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Activate
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              const selected = getSelectedDevices();
                              const updatedDevices = devices.map(d => 
                                d.selected ? { ...d, isActive: false } : d
                              );
                              setDevices(updatedDevices);
                              toast.success('Terminals Deactivated', {
                                description: `${selected.length} terminal(s) have been deactivated`,
                                duration: 2000,
                              });
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                              <MonitorOff size={16} className="text-gray-600" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Deactivate
                            </span>
                          </button>
                          
                          <div className="border-t-2 border-gray-200 my-1"></div>
                          
                          <button
                            onClick={() => {
                              setIsBulkActionsModalOpen(true);
                              setIsQuickActionsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                              <Settings size={16} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              More Actions
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar and Filters - Combined on one line */}
          <div className="mb-6 flex items-center justify-between gap-4">
            {/* Search - Left side */}
            <div className="relative w-80">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terminals..."
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>

            {/* Filters and Export - Right side */}
            <div className="flex items-center gap-4">
              {/* POC Filter */}
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  POC:
                </label>
                <div className="w-[140px]">
                  <SingleSelectDropdown
                    options={[
                      { value: 'all', label: 'All POCs' },
                      { value: '1A', label: '1A' },
                      { value: '2B', label: '2B' },
                      { value: '3C', label: '3C' },
                      { value: '4A', label: '4A' },
                      { value: '5B', label: '5B' },
                      { value: '6C', label: '6C' }
                    ]}
                    value={filterPOC}
                    onChange={(value) => setFilterPOC(value)}
                  />
                </div>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Group:
                </label>
                <div className="w-[140px]">
                  <SingleSelectDropdown
                    options={[
                      { value: 'all', label: 'All Groups' },
                      { value: 'Kids', label: 'Kids' },
                      { value: 'Adults', label: 'Adults' },
                      { value: 'VIP', label: 'VIP' }
                    ]}
                    value={filterGroup}
                    onChange={(value) => setFilterGroup(value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Active:
                </label>
                <div className="w-[140px]">
                  <SingleSelectDropdown
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'active', label: 'Activated' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value)}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200"></div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 text-[#16274D] rounded-lg transition-all font-['Poppins',sans-serif] text-[14px] font-medium"
                title="Export to CSV"
              >
                <Download size={18} strokeWidth={2} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Terminal Table or Empty State */}
          {filteredDevices.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                      <Monitor size={40} className="text-[#4EBEE3]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                      No Terminals Registered Yet!
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              {/* Top Pagination */}
              {renderPagination(filteredDevices.length, 'devices')}
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-0" style={{ tableLayout: 'auto' }}>
                  <colgroup>
                    <col style={{ width: '50px' }} /> {/* Checkbox */}
                    <col style={{ width: '150px' }} /> {/* Device ID */}
                    <col style={{ width: '130px' }} /> {/* Patient */}
                    <col style={{ width: '90px' }} /> {/* Room */}
                    <col style={{ width: '70px' }} /> {/* Bed */}
                    <col style={{ width: '70px' }} /> {/* Bldg */}
                    <col style={{ width: '70px' }} /> {/* Floor */}
                    <col style={{ width: '80px' }} /> {/* POC */}
                    <col style={{ width: '100px' }} /> {/* Group */}
                    <col style={{ width: '60px' }} /> {/* Status */}
                    <col style={{ width: '80px' }} /> {/* Active? */}
                    <col style={{ width: '120px' }} /> {/* Tag */}
                    <col style={{ width: '60px' }} /> {/* Actions */}
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={paginatedDevices.length > 0 && paginatedDevices.every(device => device.selected)}
                          onChange={handleToggleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('deviceId')}
                      >
                        <div className="flex items-center gap-2">
                          Device ID
                          <SortIcon field="deviceId" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('mrn')}
                      >
                        <div className="flex items-center gap-2">
                          Patient
                          <SortIcon field="mrn" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('roomNo')}
                      >
                        <div className="flex items-center gap-2">
                          Room
                          <SortIcon field="roomNo" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('bedNo')}
                      >
                        <div className="flex items-center gap-2">
                          Bed
                          <SortIcon field="bedNo" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('building')}
                      >
                        <div className="flex items-center gap-2">
                          Bldg
                          <SortIcon field="building" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('floor')}
                      >
                        <div className="flex items-center gap-2">
                          Floor
                          <SortIcon field="floor" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('poc')}
                      >
                        <div className="flex items-center gap-2">
                          POC
                          <SortIcon field="poc" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('group')}
                      >
                        <div className="flex items-center gap-2">
                          Group
                          <SortIcon field="group" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('isConnected')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <SortIcon field="isConnected" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center gap-2">
                          Active?
                          <SortIcon field="isActive" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th className="px-3 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                        Tag
                      </th>
                      <th className="px-3 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDevices.map((device, index) => (
                      <tr
                        key={device.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={device.selected}
                            onChange={() => handleToggleSelect(device.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <span 
                            onClick={() => handleDeviceClick(device.deviceId)}
                            className="text-[14px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] cursor-pointer font-['Poppins',sans-serif] transition-colors"
                          >
                            {device.deviceId}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.mrn}
                            onSave={(newValue) => handleInlineEdit(device.id, 'mrn', newValue)}
                            placeholder="MRN"
                          />
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.roomNo}
                            onSave={(newValue) => handleInlineEdit(device.id, 'roomNo', newValue)}
                            placeholder="Room Number"
                          />
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.bedNo}
                            onSave={(newValue) => handleInlineEdit(device.id, 'bedNo', newValue)}
                            placeholder="Bed Number"
                          />
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.building}
                            onSave={(newValue) => handleInlineEdit(device.id, 'building', newValue)}
                            placeholder="Building"
                          />
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.floor}
                            onSave={(newValue) => handleInlineEdit(device.id, 'floor', newValue)}
                            placeholder="Floor"
                          />
                        </td>
                        <td className="px-3 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          <InlineEditCell
                            value={device.poc}
                            onSave={(newValue) => handleInlineEdit(device.id, 'poc', newValue)}
                            placeholder="Point of Contact"
                          />
                        </td>
                        <td 
                          className="px-3 py-4 cursor-pointer"
                          onDoubleClick={() => handleCellDoubleClick(device.deviceId, 'group', device.group)}
                        >
                          {editingCell?.deviceId === device.deviceId && editingCell?.field === 'group' ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              autoFocus
                              className="w-full px-2 py-1 pr-7 text-[14px] text-[#16274D] font-['Poppins',sans-serif] border-2 border-[#4EBEE3] rounded focus:outline-none appearance-none cursor-pointer bg-white"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 6px center',
                                backgroundSize: '10px'
                              }}
                            >
                              <option value="Kids">Kids</option>
                              <option value="Adults">Adults</option>
                              <option value="VIP">VIP</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-md text-[12px] font-medium font-['Poppins',sans-serif] inline-flex items-center ${getGroupColor(device.group)}`}>
                              {device.group}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="inline-flex items-center justify-center">
                            <Circle 
                              size={12} 
                              className={device.isConnected ? 'text-green-600 fill-green-600' : 'text-red-600 fill-red-600'} 
                              strokeWidth={0}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <button
                            onClick={() => {
                              const updatedDevices = devices.map(d => 
                                d.id === device.id ? { ...d, isActive: !d.isActive } : d
                              );
                              setDevices(updatedDevices);
                              toast.success(device.isActive ? 'Device Deactivated' : 'Device Activated', { duration: 2000 });
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              device.isActive ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                            }`}
                            title={device.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                device.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-4">
                          {editingTagDeviceId === device.id ? (
                            <input
                              type="text"
                              value={editingTagValue}
                              onChange={(e) => setEditingTagValue(e.target.value)}
                              onBlur={handleTagSave}
                              onKeyDown={handleTagKeyDown}
                              autoFocus
                              className="w-full px-2 py-0.5 border-2 border-[#4EBEE3] rounded-full bg-white text-[12px] text-[#16274D] font-medium font-['Poppins',sans-serif] focus:outline-none"
                              placeholder="Add tag"
                            />
                          ) : device.tag ? (
                            <div
                              onClick={() => handleTagClick(device.id, device.tag)}
                              className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e0f7fd] cursor-pointer hover:bg-[#d0f0fa] transition-colors relative"
                              title="Click to edit"
                            >
                              <div className="absolute border border-[#4EBEE3] border-solid inset-[-1px] pointer-events-none rounded-full" />
                              <span className="font-['Poppins',sans-serif] font-medium leading-[18px] text-[#1e7a94] text-[12px] text-nowrap">
                                {device.tag}
                              </span>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleTagClick(device.id, '')}
                              className="cursor-pointer hover:bg-[#4EBEE3]/5 px-2 py-1 rounded transition-colors"
                              title="Click to add tag"
                            >
                              <span className="text-gray-400 italic text-[12px] font-['Poppins',sans-serif]">Add tag</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center relative">
                          <div className="relative inline-block row-actions-menu">
                            <button
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPosition({
                                  top: rect.top - 8,
                                  left: rect.right - 224 // 224px = width of menu (w-56 = 14rem = 224px)
                                });
                                setOpenRowMenuId(openRowMenuId === device.id ? null : device.id);
                                setSelectedRowDeviceId(device.deviceId);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center"
                            >
                              <MoreVertical size={18} className="text-gray-600" strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(filteredDevices.length, 'devices')}
            </div>
          )}

      {/* Device Details Modal */}
      <DeviceModal 
        isOpen={isModalOpen}
        deviceId={selectedDeviceId}
        isConnected={selectedDeviceConnected}
        server={selectedDeviceServer}
        onClose={handleCloseModal}
      />
      {isModalOpen && false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Device Info — {selectedDeviceId}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#16274D]" />
              </button>
            </div>

            {/* Modal Tabs - Fixed */}
            <div className="px-8 border-b-2 border-gray-200 flex-shrink-0">
              <div className="flex gap-8">
                <button
                  onClick={() => setModalActiveTab('device-info')}
                  className={`pb-4 px-1 font-['Poppins',sans-serif] text-[15px] font-medium transition-all duration-200 relative ${
                    modalActiveTab === 'device-info'
                      ? 'text-[#4EBEE3]'
                      : 'text-[#16274D]/60 hover:text-[#16274D]'
                  }`}
                >
                  Device Info
                  {modalActiveTab === 'device-info' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4EBEE3] rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setModalActiveTab('device-usage')}
                  className={`pb-4 px-1 font-['Poppins',sans-serif] text-[15px] font-medium transition-all duration-200 relative ${
                    modalActiveTab === 'device-usage'
                      ? 'text-[#4EBEE3]'
                      : 'text-[#16274D]/60 hover:text-[#16274D]'
                  }`}
                >
                  Device Usage
                  {modalActiveTab === 'device-usage' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4EBEE3] rounded-t-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              {modalActiveTab === 'device-info' && (
                <div className="space-y-6">
                  {/* Device Info Table */}
                  <div className="bg-white rounded-xl border-2 border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-1/4">
                            Item
                          </th>
                          <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                            Description
                          </th>
                          <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-1/4">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            Group
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] appearance-none cursor-pointer bg-white"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '12px'
                              }}
                            >
                              <option>Kids</option>
                              <option>Adults</option>
                              <option>VIP</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3DA5CA] transition-colors">
                              UPDATE
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                          <td className="px-6 py-4 text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            Activate / Deactivate
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4EBEE3]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4EBEE3]"></div>
                              </label>
                              <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Active</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3DA5CA] transition-colors">
                              APPLY
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            Notification
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4EBEE3]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4EBEE3]"></div>
                              </label>
                              <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Enable Notifications</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3DA5CA] transition-colors">
                              SAVE
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                          <td className="px-6 py-4 text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            Patient ID
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="Enter Patient ID"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-4 py-2 bg-[#4EBEE3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3DA5CA] transition-colors">
                              ASSIGN
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Terminal Actions */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                      Terminal Actions
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all">
                        <div className="w-12 h-12 bg-[#4EBEE3]/20 rounded-lg flex items-center justify-center">
                          <Power size={24} className="text-[#4EBEE3]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Reboot</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all">
                        <div className="w-12 h-12 bg-[#4EBEE3]/20 rounded-lg flex items-center justify-center">
                          <RefreshCw size={24} className="text-[#4EBEE3]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Refresh</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#EF4444] hover:bg-[#EF4444]/5 transition-all">
                        <div className="w-12 h-12 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                          <Trash size={24} className="text-[#EF4444]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Clear Data</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all">
                        <div className="w-12 h-12 bg-[#4EBEE3]/20 rounded-lg flex items-center justify-center">
                          <Settings size={24} className="text-[#4EBEE3]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalActiveTab === 'device-usage' && (
                <div className="space-y-6">
                  {/* Usage Chart */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                      Usage Overview
                    </h3>
                    <div className="h-64 flex items-end gap-4 border-b-2 border-gray-200 pb-4">
                      {[65, 45, 80, 55, 70, 40, 85, 60, 75, 50, 90, 65].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-[#4EBEE3] rounded-t-lg transition-all hover:bg-[#3DA5CA]"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif]">
                            {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usage Tabs */}
                  <div className="bg-white rounded-xl border-2 border-gray-200">
                    <div className="border-b-2 border-gray-200 px-6">
                      <div className="flex gap-6">
                        <button
                          onClick={() => setUsageActiveTab('system-services')}
                          className={`py-4 px-1 font-['Poppins',sans-serif] text-[14px] font-medium transition-all duration-200 relative ${
                            usageActiveTab === 'system-services'
                              ? 'text-[#4EBEE3]'
                              : 'text-[#16274D]/60 hover:text-[#16274D]'
                          }`}
                        >
                          System Services
                          {usageActiveTab === 'system-services' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4EBEE3]" />
                          )}
                        </button>
                        <button
                          onClick={() => setUsageActiveTab('apps')}
                          className={`py-4 px-1 font-['Poppins',sans-serif] text-[14px] font-medium transition-all duration-200 relative ${
                            usageActiveTab === 'apps'
                              ? 'text-[#4EBEE3]'
                              : 'text-[#16274D]/60 hover:text-[#16274D]'
                          }`}
                        >
                          Apps
                          {usageActiveTab === 'apps' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4EBEE3]" />
                          )}
                        </button>
                        <button
                          onClick={() => setUsageActiveTab('device-services')}
                          className={`py-4 px-1 font-['Poppins',sans-serif] text-[14px] font-medium transition-all duration-200 relative ${
                            usageActiveTab === 'device-services'
                              ? 'text-[#4EBEE3]'
                              : 'text-[#16274D]/60 hover:text-[#16274D]'
                          }`}
                        >
                          Device Services
                          {usageActiveTab === 'device-services' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4EBEE3]" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-[12px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Total Sessions</div>
                          <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">1,245</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-[12px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Avg Duration</div>
                          <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">4.2h</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-[12px] text-[#16274D]/60 font-['Poppins',sans-serif] mb-1">Peak Usage</div>
                          <div className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">92%</div>
                        </div>
                      </div>
                      <div className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] text-center py-8">
                        {usageActiveTab === 'system-services' && 'System services usage data'}
                        {usageActiveTab === 'apps' && 'Applications usage data'}
                        {usageActiveTab === 'device-services' && 'Device services usage data'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {isSendNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <Bell size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Send Notification
                  </h2>
                  <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                    Send to {deviceActions.filter(d => d.selected).length} selected terminal(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSendNotificationModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#16274D]" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter notification title..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter notification message..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t-2 border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSendNotificationModalOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Notification Sent', {
                    description: `Notification sent to ${deviceActions.filter(d => d.selected).length} terminal(s)`,
                    duration: 2000,
                  });
                  setIsSendNotificationModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Welcome Note Modal */}
      {isUpdateWelcomeNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Update Welcome Note
                  </h2>
                  <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                    Update for {deviceActions.filter(d => d.selected).length} selected terminal(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateWelcomeNoteModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#16274D]" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Welcome Title
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#637381]">
                    WN-{welcomeNoteCounter}
                  </div>
                  <p className="text-[12px] text-[#637381] font-['Poppins',sans-serif] mt-1">
                    Auto-generated ID
                  </p>
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Enter welcome message..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t-2 border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUpdateWelcomeNoteModalOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Welcome Note Updated', {
                    description: `Welcome note WN-${welcomeNoteCounter} created for ${deviceActions.filter(d => d.selected).length} terminal(s)`,
                    duration: 2000,
                  });
                  setWelcomeNoteCounter(welcomeNoteCounter + 1);
                  setIsUpdateWelcomeNoteModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
              >
                Update Welcome Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Screen Saver Modal */}
      {isUpdateWallpaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <ImageIcon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Update Screen Saver
                  </h2>
                  <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                    Update for {deviceActions.filter(d => d.selected).length} selected terminal(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateWallpaperModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#16274D]" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Screen Saver Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallpaper name..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Upload Screen Saver
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={32} className="text-gray-400" strokeWidth={1.5} />
                      <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[12px] text-[#637381] font-['Poppins',sans-serif]">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t-2 border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUpdateWallpaperModalOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Screen Saver Updated', {
                    description: `Screen saver updated for ${deviceActions.filter(d => d.selected).length} terminal(s)`,
                    duration: 2000,
                  });
                  setIsUpdateWallpaperModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
              >
                Update Screen Saver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {isManagementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                  <Settings size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Management
                  </h2>
                  <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif] mt-0.5">
                    Manage {devices.filter(d => d.selected).length} selected terminal(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManagementModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-[#16274D]" />
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {/* Section 1: SIP Configuration */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  SIP Configuration
                </h3>
                <div className="space-y-4">
                  {/* SIP Extension Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        SIP Extension
                      </span>
                    </div>
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
                  </div>

                  {sipEnabled && (
                    <>
                      {/* SIP Extension Input */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                          Extension Number
                        </label>
                        <input
                          type="text"
                          value={sipExtension}
                          onChange={(e) => setSipExtension(e.target.value)}
                          placeholder="3201"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                        />
                      </div>

                      {/* SIP Username */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                          SIP Username
                        </label>
                        <input
                          type="text"
                          value={sipUsername}
                          onChange={(e) => setSipUsername(e.target.value)}
                          placeholder="3201"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                        />
                      </div>

                      {/* SIP Password */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                          SIP Password
                        </label>
                        <input
                          type="password"
                          value={sipPassword}
                          onChange={(e) => setSipPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Group Assignment */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  Group Assignment
                </h3>
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                    Select Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none cursor-pointer bg-white"
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
                </div>
              </div>

              {/* Section 3: Terminal Settings */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  Terminal Settings
                </h3>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
                  <div className="grid grid-cols-4 gap-4">
                    {/* Kiosk Mode */}
                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3]/50 transition-colors">
                      <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
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

                    {/* Service Availability */}
                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3]/50 transition-colors">
                      <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Service Availability
                      </span>
                      <button
                        onClick={() => setServiceAvailability(!serviceAvailability)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          serviceAvailability ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            serviceAvailability ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* No Admission Mode */}
                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3]/50 transition-colors">
                      <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        No Admission Mode
                      </span>
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

                    {/* Prayer Widget */}
                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3]/50 transition-colors">
                      <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Prayer Widget
                      </span>
                      <button
                        onClick={() => setPrayerWidget(!prayerWidget)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          prayerWidget ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            prayerWidget ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Terminal Actions */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  Terminal Actions
                </h3>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
                  <div className="grid grid-cols-5 gap-3">
                    <button
                      onClick={() => {
                        toast.success('Refresh Terminal', {
                          description: `Refreshing ${devices.filter(d => d.selected).length} terminal(s)`,
                          duration: 2000,
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-[#4EBEE3]/20 rounded-lg flex items-center justify-center">
                        <RefreshCw size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Refresh
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Restart', {
                          description: `Restarting ${devices.filter(d => d.selected).length} terminal(s)`,
                          duration: 2000,
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                        <RotateCcw size={20} className="text-[#F59E0B]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Restart
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Clear Data', {
                          description: `Clearing data on ${devices.filter(d => d.selected).length} terminal(s)`,
                          duration: 2000,
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#EF4444] hover:bg-[#EF4444]/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                        <Trash size={20} className="text-[#EF4444]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Clear Data
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Activate', {
                          description: `Activating ${devices.filter(d => d.selected).length} terminal(s)`,
                          duration: 2000,
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#10B981] hover:bg-[#10B981]/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                        <Power size={20} className="text-[#10B981]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Activate
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Deactivate', {
                          description: `Deactivating ${devices.filter(d => d.selected).length} terminal(s)`,
                          duration: 2000,
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#6B7280] hover:bg-gray-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MonitorOff size={20} className="text-[#6B7280]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-medium text-[#16274D] font-['Poppins',sans-serif] text-center">
                        Deactivate
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Terminals List */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4">
                  Selected Terminals ({devices.filter(d => d.selected).length})
                </h3>
                <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg">
                  {devices.filter(d => d.selected).map((device) => (
                    <div
                      key={device.id}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          {device.deviceId}
                        </p>
                        <p className="text-[12px] text-[#637381] font-['Poppins',sans-serif]">
                          Room {device.roomNo} • Bed {device.bedNo}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-md text-[11px] font-medium font-['Poppins',sans-serif] ${getGroupColor(device.group)}`}>
                        {device.group}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t-2 border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsManagementModalOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Management Applied', {
                    description: `Changes applied to ${devices.filter(d => d.selected).length} terminal(s)`,
                    duration: 2000,
                  });
                  setIsManagementModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row Actions Menu - Fixed Positioning */}
      {openRowMenuId && menuPosition && (
        <div 
          className="fixed w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden row-actions-menu"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <button
            onClick={() => {
              toast.info('Refresh', { description: 'Refreshing device...', duration: 2000 });
              setOpenRowMenuId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Refresh
            </span>
          </button>
          <button
            onClick={() => {
              toast.info('Restart', { description: 'Restarting device...', duration: 2000 });
              setOpenRowMenuId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
          >
            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <RotateCcw size={16} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Restart
            </span>
          </button>
          <button
            onClick={() => {
              toast.info('Clear Data', { description: 'Clearing device data...', duration: 2000 });
              setOpenRowMenuId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
          >
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Trash size={16} className="text-red-600" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Clear Data
            </span>
          </button>
          
          <div className="border-t-2 border-gray-200 my-1"></div>
          
          <button
            onClick={() => {
              const device = devices.find(d => d.id === openRowMenuId);
              if (device) {
                setIsMoreActionsModalOpen(true);
                setSelectedRowDeviceId(device.deviceId);
                setSelectedRowServer(device.server);
                setSelectedGroup(device.group);
              }
              setOpenRowMenuId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              More Actions
            </span>
          </button>
        </div>
      )}

      {/* More Actions Modal */}
      <MoreActionsModal
        isOpen={isMoreActionsModalOpen}
        onClose={() => setIsMoreActionsModalOpen(false)}
        deviceId={selectedRowDeviceId}
        server={selectedRowServer}
        careinnVersion={careinnVersion}
        setCareinnVersion={setCareinnVersion}
        ipAddress={ipAddress}
        setIpAddress={setIpAddress}
        patientAssigned={patientAssigned}
        setPatientAssigned={setPatientAssigned}
        sipExtension={sipExtension}
        setSipExtension={setSipExtension}
        sipUsername={sipUsername}
        setSipUsername={setSipUsername}
        sipPassword={sipPassword}
        setSipPassword={setSipPassword}
        emergencyExtension={emergencyExtension}
        setEmergencyExtension={setEmergencyExtension}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        sipEnabled={sipEnabled}
        setSipEnabled={setSipEnabled}
        kioskMode={kioskMode}
        setKioskMode={setKioskMode}
        patientServices={patientServices}
        setPatientServices={setPatientServices}
        noAdmissionMode={noAdmissionMode}
        setNoAdmissionMode={setNoAdmissionMode}
        prayerTimes={prayerTimes}
        setPrayerTimes={setPrayerTimes}
        onUpdateAPK={() => {
          setIsUpdateAPKModalOpen(true);
        }}
        onSetStaticIP={() => {
          setIsSetStaticIPModalOpen(true);
        }}
        onClearData={() => {
          setIsClearDataConfirmOpen(true);
        }}
        onSave={() => {
          // Update the device's group in the devices array
          const updatedDevices = devices.map(device => {
            if (device.deviceId === selectedRowDeviceId) {
              return { ...device, group: selectedGroup };
            }
            return device;
          });
          setDevices(updatedDevices);
        }}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkActionsModalOpen}
        onClose={() => setIsBulkActionsModalOpen(false)}
        selectedCount={devices.filter(d => d.selected).length}
        sipExtension={sipExtension}
        setSipExtension={setSipExtension}
        sipUsername={sipUsername}
        setSipUsername={setSipUsername}
        sipPassword={sipPassword}
        setSipPassword={setSipPassword}
        emergencyExtension={emergencyExtension}
        setEmergencyExtension={setEmergencyExtension}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        sipEnabled={sipEnabled}
        setSipEnabled={setSipEnabled}
        kioskMode={kioskMode}
        setKioskMode={setKioskMode}
        patientServices={patientServices}
        setPatientServices={setPatientServices}
        noAdmissionMode={noAdmissionMode}
        setNoAdmissionMode={setNoAdmissionMode}
        prayerTimes={prayerTimes}
        setPrayerTimes={setPrayerTimes}
        onUpdateAPK={() => {
          toast.success('APK Update Initiated', {
            description: `CareInn APK update has been queued for ${devices.filter(d => d.selected).length} terminal(s)`,
            duration: 2000,
          });
        }}
        onSave={() => {
          // Update the selected devices' group in the devices array
          const updatedDevices = devices.map(device => {
            if (device.selected && selectedGroup) {
              return { ...device, group: selectedGroup };
            }
            return device;
          });
          setDevices(updatedDevices);
        }}
      />

      {/* Update APK Modal */}
      <UpdateAPKModal
        isOpen={isUpdateAPKModalOpen}
        onClose={() => {
          setIsUpdateAPKModalOpen(false);
        }}
        deviceId={selectedRowDeviceId}
      />

      {/* Set Static IP Modal */}
      <SetStaticIPModal
        isOpen={isSetStaticIPModalOpen}
        onClose={() => {
          setIsSetStaticIPModalOpen(false);
        }}
        deviceId={selectedRowDeviceId}
        currentIP={ipAddress}
        onSave={(newIP) => setIpAddress(newIP)}
      />

      {/* Clear Data Confirmation Dialog */}
      {isClearDataConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b-2 border-gray-200">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Confirm Clear Data
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                Are you sure you want to clear all patient data from this device? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-5 border-t-2 border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsClearDataConfirmOpen(false);
                }}
                className="px-4 py-2 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsClearDataConfirmOpen(false);
                  toast.success('Data Cleared', {
                    description: 'Patient data has been cleared from the device',
                    duration: 2000,
                  });
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}