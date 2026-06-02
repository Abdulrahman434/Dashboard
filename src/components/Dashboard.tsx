import { useState, useRef, useEffect } from 'react';
import { RefreshCw, User, LogOut, Lock, Monitor as MonitorIcon, Menu, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CollapsibleSidebar from './CollapsibleSidebar';
import DashboardHome from './DashboardHome';
import DashboardPage from './DashboardPage';
import Dashboard2Page from './Dashboard2Page';
import HomePage from './HomePage';
import LicenseKeyPage from './LicenseKeyPage';
import EmptyState from './EmptyState';
import LocationPage from './LocationPage';
import TerminalTourGuidePage from './TerminalTourGuidePage';
import WallpaperPage from './WallpaperPage';
import WelcomeNotePage from './WelcomeNotePage';
import NewsFeedPage from './NewsFeedPage';
import NotificationsPage from './NotificationsPage';
import NotificationsPageCalendar from './NotificationsPageCalendar';
import AccreditationPage from './AccreditationPage';
import ContentLibraryPage from './ContentLibraryPage';
import EngagementHubPage from './EngagementHubPage';
import PatientServicesPageWithCategories from './PatientServicesPageWithCategories';
import ShortcutsPage from './ShortcutsPage';
import ApplicationsManagerPage from './ApplicationsManagerPage';
import ServicesPage from './ServicesPage';
import ChannelsPage from './ChannelsPage';
import ChannelTypePage from './ChannelTypePage';
import ChannelManagerPage from './ChannelManagerPage';
import CareInnPage from './CareInnPage';
import FeedbackManagerPage from './FeedbackManagerPage';
import FeedbackReportPage from './FeedbackReportPage';
import SurveyResponsesPage from './SurveyResponsesPage';
import ProfileCategoriesPage from './ProfileCategoriesPage';
import ProfilePage from './ProfilePage';
import HospitalProfilePage from './HospitalProfilePage';
import AnalyticsPage from './AnalyticsPage';
import PopulateContentLibrary from './PopulateContentLibrary';
import SIPServerPage from './SIPServerPage';
import SIPDeviceCredentialsPage from './SIPDeviceCredentialsPage';
import SIPDirectoryPage from './SIPDirectoryPage';
import { HISIntegrationPage } from './HISIntegrationPage';
import { UsersPage } from './UsersPage';
import { UserRolesPage } from './UserRolesPage';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import { UpdateTerminalPasswordModal } from './UpdateTerminalPasswordModal';
import TemplatesPage from './TemplatesPage';
import IdentitySettingsPage from './IdentitySettingsPage';
import NurseStationPage from './nurse-station/NurseStationPage';
import { MultiSelectDropdown } from './UnifiedDropdown';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeItem, setActiveItem] = useState(() => {
    // Load the last active page from localStorage on mount
    const savedPage = localStorage.getItem('careinn-active-page');
    return savedPage || 'dashboard';
  });
  const [navigationState, setNavigationState] = useState<{ deviceFilter?: string; assetFilter?: string; connection?: string; status?: string }>({});
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showUpdateTerminalPasswordModal, setShowUpdateTerminalPasswordModal] = useState(false);
  const [showRefreshTerminalModal, setShowRefreshTerminalModal] = useState(false);
  const [selectedTerminalGroups, setSelectedTerminalGroups] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Save active page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('careinn-active-page', activeItem);
  }, [activeItem]);

  const handleRefreshTerminal = () => {
    setShowRefreshTerminalModal(true);
  };

  const confirmRefreshTerminal = () => {
    const groupsText = selectedTerminalGroups.length > 0 
      ? selectedTerminalGroups.join(', ')
      : 'All groups';
    
    toast.success('Terminal Refreshed', {
      description: `Refreshing terminals in: ${groupsText}`,
      duration: 2000,
    });
    
    setShowRefreshTerminalModal(false);
    setSelectedTerminalGroups([]);
  };

  const handleNavigation = (item: string, filters?: { connection?: string; status?: string }) => {
    setActiveItem(item);
    setNavigationState(filters || {});
  };

  // Clear navigation state when changing pages manually (not via navigation)
  const handleItemClick = (item: string) => {
    setActiveItem(item);
    setNavigationState({});
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigation} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigation} />;
      case 'home':
        return <HomePage onNavigate={setActiveItem} />;
      case 'performance':
        return <DashboardPage onNavigate={handleNavigation} />;
      case 'dashboard2':
        return <Dashboard2Page />;
      case 'shortcuts':
        return <ShortcutsPage />;
      
      // Site Configuration - Main
      case 'asset-manager':
        return <EmptyState title="Site Configuration" />;
      
      // Site Configuration - Sub Items
      case 'identity-settings':
        return <IdentitySettingsPage />;
      case 'license-key':
        return <LicenseKeyPage />;
      case 'site-manager-sub':
        return <LocationPage />;
      case 'terminal-tour':
        return <TerminalTourGuidePage />;
      
      // Content Manager - Main
      case 'feature-manager':
        return <EmptyState title="Content Manager" />;
      
      // Content Manager - Sub Items
      case 'wallpaper-library':
        return <WallpaperPage />;
      case 'greeting-message':
        return <WelcomeNotePage />;
      case 'news-feed':
        return <NewsFeedPage />;
      case 'alerts':
        return <NotificationsPageCalendar />;
      case 'accreditation':
        return <AccreditationPage />;
      
      // Content Library
      case 'content-library':
        return <ContentLibraryPage />;
      
      // Engagement Hub
      case 'engagement-hub':
        return <EngagementHubPage />;
      
      // Patient Services
      case 'patient-services':
        return <PatientServicesPageWithCategories />;
      
      // Asset Builder - Main
      case 'asset-builder':
        return <ApplicationsManagerPage />;
      
      // Services - Main
      case 'services':
        return <ServicesPage />;
      
      // Channels - Main
      case 'channels':
        return <ChannelsPage />;
      
      // Channels - Sub Items
      case 'channel-types':
        return <ChannelTypePage />;
      case 'channels-sub':
        return <EmptyState title="Channels" />;
      case 'channels-manager':
        return <ChannelManagerPage />;
      
      // Device Manager - Main
      case 'site-manager':
        return <EmptyState title="Device Manager" />;
      
      // Device Manager - Sub Items
      case 'careinn':
        return <CareInnPage filters={navigationState} />;
      case 'caresign':
        return <EmptyState title="CareSign" />;
      case 'nurse-station':
        return <NurseStationPage />;
      case 'android-tv':
        return <EmptyState title="Android TV" />;
      case 'bacnet-integration':
        return <EmptyState title="Bacnet Integration" />;
      
      // Feedback Manager - Main
      case 'feedback-manager':
        return <EmptyState title="Feedback Manager" />;
      
      // Feedback Manager - Sub Items
      // NOTE: Menu shows "Survey Manager" but component is FeedbackManagerPage (legacy naming - see NAMING_DECISION.md)
      case 'feedback-manager-sub':
        return <FeedbackManagerPage />;
      // NOTE: Menu shows "Survey Report" but component is FeedbackReportPage (legacy naming - see NAMING_DECISION.md)
      case 'feedback-report':
        return <FeedbackReportPage />;
      case 'survey-responses':
        return <SurveyResponsesPage />;
      
      // Hospital Profile
      case 'hospital-profile':
        return <HospitalProfilePage />;
      
      // HIS Integration
      case 'his-integration':
        return <HISIntegrationPage />;
      
      // SIP Configuration - Main
      case 'sip-configuration':
        return <EmptyState title="SIP Configuration" />;
      
      // SIP Configuration - Sub Items
      case 'sip-server':
        return <SIPServerPage />;
      case 'sip-device-credentials':
        return <SIPDeviceCredentialsPage />;
      case 'sip-directory':
        return <SIPDirectoryPage />;
      
      // Control Panel - Main
      case 'control-panel':
        return <EmptyState title="Control Panel" />;
      
      // Control Panel - Sub Items
      case 'users':
        return <UsersPage />;
      case 'users-roles':
        return <UserRolesPage />;
      
      // Templates
      case 'templates':
        return <TemplatesPage />;
      
      // Logger - Main
      case 'logger':
        return <EmptyState title="Logger" />;
      
      // Logger - Sub Items
      case 'integration-logs':
        return <EmptyState title="Integration Logs" />;
      case 'user-activity-logs':
        return <EmptyState title="User Activity Logs" />;
      
      // Consent Manager - Main
      case 'consent-manager':
        return <EmptyState title="Consent Manager" />;
      
      // Consent Manager - Sub Items
      case 'consent-type':
        return <EmptyState title="Consent Type" />;
      case 'consent-form':
        return <EmptyState title="Consent Form" />;
      case 'consent-record':
        return <EmptyState title="Consent Record" />;
      
      // Default
      default:
        return <HomePage onNavigate={setActiveItem} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Auto-populate Content Library on first load */}
      <PopulateContentLibrary />
      
      <CollapsibleSidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick}
        onLogout={onLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        onUpdatePassword={() => setShowUpdatePasswordModal(true)}
        onUpdateTerminalPassword={() => setShowUpdateTerminalPasswordModal(true)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0 h-[70px] md:h-[100px]">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-[#16274D]" strokeWidth={2} />
          </button>

          <h1 className="text-[20px] md:text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            CareInn — System Management Portal
          </h1>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Refresh Terminal Button */}
            <button
              onClick={handleRefreshTerminal}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[12px] md:text-[14px] font-medium shadow-sm"
            >
              <RefreshCw size={14} className="md:w-4 md:h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Refresh Terminal</span>
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </div>
      </div>

      {/* Update Password Modal */}
      <UpdatePasswordModal 
        isOpen={showUpdatePasswordModal}
        onClose={() => setShowUpdatePasswordModal(false)}
      />

      {/* Update Terminal Password Modal */}
      <UpdateTerminalPasswordModal 
        isOpen={showUpdateTerminalPasswordModal}
        onClose={() => setShowUpdateTerminalPasswordModal(false)}
      />

      {/* Refresh Terminal Confirmation Modal */}
      {showRefreshTerminalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Refresh Terminal
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-[15px] text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Are you sure you want to refresh the terminal?
              </p>
              <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif] mb-5">
                This action will refresh all terminals in the selected group
              </p>

              {/* Terminal Groups Dropdown */}
              <div className="mb-1">
                <label className="block text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Select Terminal Groups
                </label>
                <MultiSelectDropdown
                  options={['Kids', 'Adults', 'VIP']}
                  selectedValues={selectedTerminalGroups}
                  onChange={setSelectedTerminalGroups}
                  placeholder="Select groups"
                  showSelectAll={true}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRefreshTerminalModal(false);
                  setSelectedTerminalGroups([]);
                }}
                className="px-4 py-2 border-2 border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefreshTerminal}
                className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}