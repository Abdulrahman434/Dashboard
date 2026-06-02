/**
 * CollapsibleSidebar Component
 * 
 * PROTECTED COMPONENT - DO NOT MODIFY STYLING WITHOUT EXPLICIT APPROVAL
 * 
 * This component implements the CareInn sidebar navigation with:
 * - Light background theme (white with gray borders)
 * - CareInn blue (#4ebee3) for active states and toggle button
 * - Collapsible functionality with smooth transitions
 * - Flyout menus for collapsed state
 * - Logo visibility in both collapsed and expanded states
 * 
 * Key styling properties:
 * - Background: white (bg-white)
 * - Border: gray-200
 * - Active items: #4ebee3 with shadow
 * - Logo sizes: 170x85px (expanded), 70x88px (collapsed)
 * - Toggle button: circular blue (#4ebee3) positioned on the right edge
 * 
 * @version 2.0 - Stable
 * @lastModified 2024-12-10
 */

import { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid,
  FolderOpen,
  Layers,
  Wrench,
  Monitor,
  Building,
  MessageSquare,
  Building2,
  Settings,
  FileText,
  ListOrdered,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Key,
  Image,
  MapPin,
  Flag,
  MessageCircle,
  Rss,
  Bell,
  Award,
  Settings2,
  UserCog,
  Tv,
  Camera,
  Home as HomeIcon,
  Smartphone,
  Stethoscope,
  Monitor as MonitorIcon,
  Briefcase,
  Database,
  Sliders,
  PieChart,
  Phone,
  Server,
  Shield,
  BookOpen,
  User,
  Lock,
  Users2,
  ClipboardList,
  Activity,
  FileCheck,
  FilePlus,
  FileType,
  LifeBuoy,
  ExternalLink,
  Zap,
  AppWindow,
  UserCheck,
  ClipboardCheck,
  ListChecks,
  UserCircle,
  Grid3x3,
  TrendingUp,
  Tablet
} from 'lucide-react';
import { Fingerprint } from 'lucide-react';
import imgCareInnLogo from "figma:asset/1527704e7ade377192f897bbb5d87c3293623da3.png";
import { useNurseStations } from '../hooks/useNurseStations';

interface CollapsibleSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  onUpdatePassword?: () => void;
  onUpdateTerminalPassword?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string; icon: any }[];
  externalLink?: string;
  isHeader?: boolean; // New property for section headers
}

const navigationItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutGrid 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: TrendingUp 
  },
  { 
    id: 'asset-manager', 
    label: 'Site Configuration', 
    icon: FolderOpen,
    subItems: [
      { id: 'identity-settings', label: 'Identity Settings', icon: Fingerprint },
      { id: 'license-key', label: 'License Key', icon: Key },
      { id: 'site-manager-sub', label: 'Location', icon: MapPin },
      { id: 'his-integration', label: 'HIS Integration', icon: Layers },
      { id: 'terminal-tour', label: 'Terminal Tour Guide', icon: Flag }
    ]
  },
  { 
    id: 'content-manager', 
    label: 'Content Manager', 
    icon: Layers,
    subItems: [
      { id: 'wallpaper-library', label: 'Wallpaper', icon: Image },
      { id: 'greeting-message', label: 'Welcome Note', icon: MessageCircle },
      { id: 'news-feed', label: 'News Feed', icon: Rss },
      { id: 'alerts', label: 'Notifications', icon: Bell },
      { id: 'accreditation', label: 'Accreditation', icon: Award },
      { id: 'hospital-profile', label: 'Hospital Profile', icon: Building2 }
    ]
  },
  { 
    id: 'library', 
    label: 'Library', 
    icon: Database,
    subItems: [
      { id: 'content-library', label: 'Assets Hub', icon: Database },
      { id: 'engagement-hub', label: 'Engagement', icon: Grid3x3 },
      { id: 'patient-services', label: 'Patient Services', icon: Stethoscope }
    ]
  },
  { 
    id: 'shortcuts', 
    label: 'Shortcuts', 
    icon: Zap
  },
  { 
    id: 'channels', 
    label: 'Channels', 
    icon: Monitor
  },
  { 
    id: 'site-manager', 
    label: 'Device Manager', 
    icon: Building,
    subItems: [
      { id: 'careinn', label: 'CareInn15', icon: Tablet },
      { id: 'caresign', label: 'CareSign', icon: MonitorIcon },
      { id: 'android-tv', label: 'Android TV', icon: Smartphone },
      { id: 'bacnet-integration', label: 'Bacnet Integration', icon: Database }
    ]
  },
  {
    id: 'nurse-station-section',
    label: 'Nurse Station',
    icon: Stethoscope,
    subItems: [
      { id: 'nurse-station', label: 'Overview', icon: LayoutGrid },
      { id: 'nurse-station-manage', label: 'Manage', icon: Settings2 }
    ]
  },
  { 
    id: 'feedback-manager', 
    label: 'Survey', 
    icon: ClipboardCheck,
    subItems: [
      { id: 'feedback-manager-sub', label: 'Survey Manager', icon: ListChecks },
      { id: 'survey-responses', label: 'Survey Responses', icon: ClipboardList },
      { id: 'feedback-report', label: 'Survey Report', icon: PieChart }
    ]
  },
  { 
    id: 'sip-configuration', 
    label: 'SIP Configuration', 
    icon: Phone,
    subItems: [
      { id: 'sip-server', label: 'SIP Server', icon: Server },
      { id: 'sip-device-credentials', label: 'SIP Device Credentials', icon: Shield },
      { id: 'sip-directory', label: 'SIP Directory', icon: BookOpen }
    ]
  },
  { 
    id: 'control-panel', 
    label: 'Control Panel', 
    icon: Settings,
    subItems: [
      { id: 'users', label: 'Users', icon: Users2 },
      { id: 'users-roles', label: 'Users Roles', icon: UserCircle }
    ]
  },
  { 
    id: 'templates', 
    label: 'Templates', 
    icon: FileText 
  },
  { 
    id: 'logger', 
    label: 'Logger', 
    icon: ListOrdered,
    subItems: [
      { id: 'integration-logs', label: 'Integration Logs', icon: ClipboardList },
      { id: 'user-activity-logs', label: 'User Activity Logs', icon: Activity }
    ]
  },
  { 
    id: 'consent-manager', 
    label: 'Consent Manager', 
    icon: FileCheck,
    subItems: [
      { id: 'consent-type', label: 'Consent Type', icon: FileType },
      { id: 'consent-form', label: 'Consent Form', icon: FilePlus },
      { id: 'consent-record', label: 'Consent Record', icon: Users }
    ]
  },
  { 
    id: 'help-support', 
    label: 'Help & Support', 
    icon: LifeBuoy,
    externalLink: 'https://careinn.freshdesk.com/'
  },
];

export default function CollapsibleSidebar({ activeItem, onItemClick, onLogout, isMobileMenuOpen, onMobileMenuClose, onUpdatePassword, onUpdateTerminalPassword }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number; left: number } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live Nurse Station list — created stations appear as nested entries under
  // the Nurse Station section (single source: nurseStationService store).
  const { stations } = useNurseStations();
  const navItems: MenuItem[] = navigationItems.map((item) => {
    if (item.id !== 'nurse-station-section') return item;
    return {
      ...item,
      subItems: [
        ...(item.subItems || []),
        ...stations.map((s) => ({ id: `ns:${s.id}`, label: s.name, icon: Stethoscope })),
      ],
    };
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasSubItems: boolean) => {
    if (hasSubItems && !isCollapsed) {
      toggleExpanded(itemId);
    } else if (!hasSubItems) {
      onItemClick(itemId);
    }
  };

  const handleMouseEnterItem = (itemId: string) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setHoveredItem(itemId);
    
    // Calculate flyout position
    const element = itemRefs.current[itemId];
    if (element) {
      const rect = element.getBoundingClientRect();
      setFlyoutPosition({
        top: rect.top,
        left: rect.right + 12 // 12px gap from sidebar
      });
    }
  };

  const handleMouseLeaveItem = () => {
    // Set a timeout before closing - allows moving to flyout
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setFlyoutPosition(null);
    }, 100);
  };

  const handleMouseEnterFlyout = () => {
    // Clear any pending timeout when entering flyout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeaveFlyout = () => {
    // Close immediately when leaving flyout
    setHoveredItem(null);
    setFlyoutPosition(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleUserMenuClose = () => {
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`bg-white flex flex-col border-r border-gray-200 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 relative z-50 h-screen ${
          isCollapsed ? 'w-[82px]' : 'w-[240px]'
        } ${
          isMobileMenuOpen ? 'fixed left-0 top-0' : 'max-lg:hidden'
        }`}
      >
        {/* Logo Container */}
        <div className="h-[100px] flex items-center justify-center border-b border-gray-200 relative shrink-0">
          <div className="flex items-center justify-center">
            {isCollapsed ? (
              <div className="w-[70px] h-[88px]">
                <img 
                  src={imgCareInnLogo} 
                  alt="CareInn" 
                  className="w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-[170px] h-[85px]">
                <img 
                  src={imgCareInnLogo} 
                  alt="CareInn" 
                  className="w-full h-full object-contain" 
                />
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#4ebee3] hover:bg-[#3da5ca] border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-20"
          >
            {isCollapsed ? (
              <ChevronRight size={18} strokeWidth={2.5} className="text-white" />
            ) : (
              <ChevronLeft size={18} strokeWidth={2.5} className="text-white" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-[12px] pt-[24px] space-y-[4px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isExpanded = expandedItems.includes(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            // Render section header
            if (item.isHeader) {
              return (
                <div 
                  key={item.id}
                  className="pt-4 pb-2 px-3"
                >
                  {!isCollapsed && (
                    <h3 className="text-[11px] font-semibold text-[#16274D]/50 uppercase tracking-wider font-['Poppins',sans-serif]">
                      {item.label}
                    </h3>
                  )}
                  {isCollapsed && (
                    <div className="h-px bg-gray-200" />
                  )}
                </div>
              );
            }
            
            return (
              <div 
                key={item.id}
                className="relative"
                ref={(el) => { itemRefs.current[item.id] = el; }}
              >
                {/* Main Item */}
                {item.externalLink ? (
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-full h-[48px] rounded-[14px] flex items-center gap-3 px-3
                      transition-all duration-200 group
                      font-['Poppins',sans-serif] relative
                      ${isActive 
                        ? 'bg-[#4ebee3] shadow-[0px_10px_15px_-3px_rgba(78,190,227,0.3),0px_4px_6px_-4px_rgba(78,190,227,0.3)]' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                      <Icon 
                        size={20} 
                        strokeWidth={1.67}
                        className={`
                          transition-colors duration-200
                          ${isActive 
                            ? 'text-white' 
                            : 'text-[#16274D] group-hover:text-[#4ebee3]'
                          }
                        `}
                      />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span 
                          className={`
                            flex-1 text-left truncate text-[12.5px] font-medium
                            transition-colors duration-200
                            ${isActive 
                              ? 'text-white' 
                              : 'text-[#16274D] group-hover:text-[#4ebee3]'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                        <div className="shrink-0">
                          <ExternalLink 
                            size={16} 
                            strokeWidth={2}
                            className={`
                              transition-colors duration-200
                              ${isActive ? 'text-white' : 'text-[#16274D] group-hover:text-[#4ebee3]'}
                            `}
                          />
                        </div>
                      </>
                    )}
                  </a>
                ) : (
                  <button
                    onClick={() => handleItemClick(item.id, hasSubItems)}
                    onMouseEnter={() => hasSubItems && isCollapsed && handleMouseEnterItem(item.id)}
                    onMouseLeave={() => hasSubItems && isCollapsed && handleMouseLeaveItem()}
                    className={`
                      w-full h-[48px] rounded-[14px] flex items-center gap-3 px-3
                      transition-all duration-200 group
                      font-['Poppins',sans-serif] relative
                      ${isActive 
                        ? 'bg-[#4ebee3] shadow-[0px_10px_15px_-3px_rgba(78,190,227,0.3),0px_4px_6px_-4px_rgba(78,190,227,0.3)]' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                      <Icon 
                        size={20} 
                        strokeWidth={1.67}
                        className={`
                          transition-colors duration-200
                          ${isActive 
                            ? 'text-white' 
                            : 'text-[#16274D] group-hover:text-[#4ebee3]'
                          }
                        `}
                      />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span 
                          className={`
                            flex-1 text-left truncate text-[13px] font-medium
                            transition-colors duration-200
                            ${isActive 
                              ? 'text-white' 
                              : 'text-[#16274D] group-hover:text-[#4ebee3]'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                        {hasSubItems && (
                          <div className="shrink-0">
                            {isExpanded ? (
                              <ChevronUp 
                                size={16} 
                                strokeWidth={2}
                                className={`
                                  transition-colors duration-200
                                  ${isActive ? 'text-white' : 'text-[#4ebee3]'}
                                `}
                              />
                            ) : (
                              <ChevronDown 
                                size={16} 
                                strokeWidth={2}
                                className={`
                                  transition-colors duration-200
                                  ${isActive ? 'text-white' : 'text-[#4ebee3]'}
                                `}
                              />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )}
                
                {/* Arrow Indicator for Collapsed State */}
                {isCollapsed && hasSubItems && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                    <ChevronRight 
                      size={12} 
                      strokeWidth={2.5}
                      className={`
                        transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-[#4ebee3] opacity-70 group-hover:opacity-100'}
                      `}
                    />
                  </div>
                )}

                {/* Expanded Sub Items - Show when sidebar is not collapsed and item is expanded */}
                {!isCollapsed && hasSubItems && isExpanded && (
                  <div className="mt-1 mb-2 ml-3 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeItem === subItem.id;
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onItemClick(subItem.id)}
                          className={`
                            w-full h-[42px] rounded-[10px] flex items-center gap-3 px-3 pl-4
                            transition-all duration-150 group
                            font-['Poppins',sans-serif]
                            ${isSubActive 
                              ? 'bg-[#4ebee3]/12 shadow-sm ring-1 ring-[#4ebee3]/25' 
                              : 'hover:bg-gray-50/80'
                            }
                          `}
                        >
                          <div className="shrink-0">
                            <SubIcon 
                              size={17} 
                              strokeWidth={1.7}
                              className={`
                                transition-colors duration-150
                                ${isSubActive 
                                  ? 'text-[#4ebee3]' 
                                  : 'text-[#6B7280] group-hover:text-[#4ebee3]'
                                }
                              `}
                            />
                          </div>
                          <span 
                            className={`
                              truncate text-[12.5px] font-medium
                              transition-colors duration-150
                              ${isSubActive 
                                ? 'text-[#4ebee3]' 
                                : 'text-[#16274D] group-hover:text-[#4ebee3]'
                              }
                            `}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile Card */}
        <div className="border-t border-gray-200 shrink-0 relative" ref={userMenuRef}>
          <button
            onClick={handleUserMenuClick}
            className={`w-full px-[16px] py-[16px] flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#4EBEE3] flex items-center justify-center shrink-0">
              <User size={20} className="text-white" strokeWidth={2} />
            </div>
            
            {/* User Info - Only show when expanded */}
            {!isCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] text-[#16274D] font-['Poppins',sans-serif] font-semibold truncate">
                  Admin
                </p>
                <p className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif] truncate">
                  admin@careinn.com
                </p>
              </div>
            )}
            
            {/* Chevron - Only show when expanded */}
            {!isCollapsed && (
              <ChevronUp 
                size={16} 
                strokeWidth={2}
                className={`text-[#16274D]/40 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className={`absolute bg-white rounded-lg shadow-lg border-2 border-gray-200 py-2 z-[10000] ${
              isCollapsed 
                ? 'left-full ml-2 bottom-0 w-64' 
                : 'bottom-full mb-2 left-4 right-4'
            }`}>
              {/* User Info Section - Show in collapsed state */}
              {isCollapsed && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1">
                    Admin
                  </p>
                  <p className="text-[13px] text-[#16274D]/70 font-['Poppins',sans-serif]">
                    admin@careinn.com
                  </p>
                </div>
              )}

              {/* Update Password */}
              <button
                onClick={() => {
                  handleUserMenuClose();
                  onUpdatePassword?.();
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-200"
              >
                <Lock size={18} className="text-[#16274D]" strokeWidth={2} />
                <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Update Password
                </span>
              </button>

              {/* Update Terminal Password */}
              <button
                onClick={() => {
                  handleUserMenuClose();
                  onUpdateTerminalPassword?.();
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-200"
              >
                <MonitorIcon size={18} className="text-[#16274D]" strokeWidth={2} />
                <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  Update Terminal Password
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  handleUserMenuClose();
                  onLogout();
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <LogOut size={18} className="text-[#EF4444]" strokeWidth={2} />
                <span className="text-[13px] font-medium text-[#EF4444] font-['Poppins',sans-serif]">
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Flyout Menu Portal - Rendered at document level */}
        {isCollapsed && hoveredItem && flyoutPosition && (() => {
          const item = navItems.find(nav => nav.id === hoveredItem);
          if (!item || !item.subItems) return null;
          
          const Icon = item.icon;
          
          return (
            <div 
              className="fixed bg-white rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-200 py-3.5 px-2.5 min-w-[260px] z-[9999]"
              style={{
                top: `${flyoutPosition.top}px`,
                left: `${flyoutPosition.left}px`,
              }}
              onMouseEnter={handleMouseEnterFlyout}
              onMouseLeave={handleMouseLeaveFlyout}
            >
              {/* Flyout Header */}
              <div className="px-3 pb-3 mb-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4ebee3]/10 rounded-lg shrink-0">
                    <Icon size={18} className="text-[#4ebee3]" strokeWidth={1.8} />
                  </div>
                  <span className="text-[14.5px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-tight">
                    {item.label}
                  </span>
                </div>
              </div>
              
              {/* Flyout Sub Items */}
              <div className="space-y-1">
                {item.subItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeItem === subItem.id;
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        onItemClick(subItem.id);
                        setHoveredItem(null);
                        setFlyoutPosition(null);
                      }}
                      className={`
                        w-full h-[44px] rounded-[10px] flex items-center gap-3 px-3.5
                        transition-all duration-150 group
                        font-['Poppins',sans-serif]
                        ${isSubActive 
                          ? 'bg-[#4ebee3]/12 shadow-sm ring-1 ring-[#4ebee3]/25' 
                          : 'hover:bg-gray-50/80'
                        }
                      `}
                    >
                      <div className="shrink-0">
                        <SubIcon 
                          size={17} 
                          strokeWidth={1.7}
                          className={`
                            transition-colors duration-150
                            ${isSubActive 
                              ? 'text-[#4ebee3]' 
                              : 'text-[#6B7280] group-hover:text-[#4ebee3]'
                            }
                          `}
                        />
                      </div>
                      <span 
                        className={`
                          truncate text-[13.5px] font-medium
                          transition-colors duration-150
                          ${isSubActive 
                            ? 'text-[#4ebee3]' 
                            : 'text-[#16274D] group-hover:text-[#4ebee3]'
                          }
                        `}
                      >
                        {subItem.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}