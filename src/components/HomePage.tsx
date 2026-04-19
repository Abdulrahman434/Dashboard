import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  MessageCircle, 
  Newspaper, 
  Award, 
  Phone, 
  Building2, 
  Image, 
  Grid3x3, 
  Monitor, 
  Wrench, 
  Database, 
  Bell,
  FileText,
  FolderOpen,
  Layers,
  ArrowRight,
  PlusCircle,
  Edit3,
  Send,
  X,
  Info,
  Tablet,
  Activity,
  Code,
  Upload,
  Star,
  ImagePlus,
  Clock,
  Users,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Wifi,
  Video,
  User,
  AlertCircle,
  Settings,
  Lightbulb,
  HeadphonesIcon,
  Sparkles
} from 'lucide-react';
import welcomeCardBg from 'figma:asset/9f307baa43454259684292ff315517715b08023f.png';
import hospitalLogo from 'figma:asset/e12a3a251eb94c15608dabc0eea2fba556939a4d.png';
import CareInnPattern from '../imports/CareInnPattern11-76-5550';
import UpdateWallpaperModal from '../imports/Container-110-233';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ImageWithFallback } from './figma/ImageWithFallback';

const moduleStatusData = [
  { id: 'api-keys', title: 'API Keys', icon: Key, status: 'Configured', description: '2 API Keys Added' },
  { id: 'welcome', title: 'Welcome Note', icon: FileText, status: 'Configured', description: '1 Welcome Note Added' },
  { id: 'news', title: 'Latest News', icon: Newspaper, status: 'Pending', description: '0 Latest News Added' },
  { id: 'accreditation', title: 'Accreditation', icon: Award, status: 'Configured', description: '2 Accreditation Items Added' },
  { id: 'sip', title: 'SIP Server', icon: Phone, status: 'Configured', description: 'Active SIP Server → 10.20.0.10' },
  { id: 'profile', title: 'Hospital Profile', icon: Building2, status: 'Configured', description: '1 Hospital Profile Added' },
  { id: 'wallpapers', title: 'Wallpapers', icon: Image, status: 'Pending', description: '0 Wallpapers Added' },
  { id: 'applications', title: 'Applications', icon: Grid3x3, status: 'Pending', description: '0 Applications Added' },
  { id: 'channels', title: 'Channels', icon: Monitor, status: 'Configured', description: '45 Channels Added' },
  { id: 'services', title: 'Services', icon: Wrench, status: 'Configured', description: '6 Services Added' },
  { id: 'integration', title: 'BDS / HIS Integration', icon: Database, status: 'Pending', description: 'Not configured yet' },
  { id: 'staff', title: 'Staff Directory', icon: Users, status: 'Pending', description: '0 Staff Members Added' },
  { id: 'security', title: 'Security Settings', icon: ShieldCheck, status: 'Pending', description: 'Not configured yet' },
  { id: 'alerts', title: 'Notifications', icon: Bell, status: 'Configured', description: '4 Notification Groups Added' },
  { id: 'greeting', title: 'Welcome Note', icon: MessageCircle, status: 'Configured', description: '1 Welcome Note Added' },
  { id: 'content', title: 'Content Manager', icon: FolderOpen, status: 'Configured', description: '18 Content Items Added' },
  { id: 'features', title: 'Content Manager', icon: Layers, status: 'Configured', description: '7 Features Added' },
];

const activityFeedData = [
  { id: 1, action: 'Channel configuration updated', user: 'Sarah Saleh', time: '2 minutes ago', icon: Monitor },
  { id: 2, action: 'Welcome Note published', user: 'Adeel Khalid', time: '15 minutes ago', icon: FileText },
  { id: 3, action: 'New Accreditation added', user: 'Sarah Saleh', time: '1 hour ago', icon: Award },
  { id: 4, action: 'Wallpaper updated', user: 'Adeel Khalid', time: '2 hours ago', icon: Image },
];

const quickTipsData = [
  'You can update wallpapers from the Device Manager section.',
  'Welcome Notes help personalize the patient experience.',
  'Use Notifications to create alert groups quickly.',
  'Configure SIP Server for seamless communication.',
];

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps = {}) {
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [isUpdateWelcomeOpen, setIsUpdateWelcomeOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);
  const [isAddAccreditationOpen, setIsAddAccreditationOpen] = useState(false);
  const [isUpdateWallpaperOpen, setIsUpdateWallpaperOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Add News fields
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDescriptionEn, setNewsDescriptionEn] = useState('');
  const [newsDescriptionAr, setNewsDescriptionAr] = useState('');

  // Welcome Note fields
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeDescriptionEn, setWelcomeDescriptionEn] = useState('');
  const [welcomeDescriptionAr, setWelcomeDescriptionAr] = useState('');
  
  // Welcome Note counter for auto-generation
  const [welcomeNoteCounter, setWelcomeNoteCounter] = useState(() => {
    const stored = localStorage.getItem('careinn_welcome_note_counter');
    return stored ? parseInt(stored, 10) : 1;
  });

  // Auto-generate welcome note title when modal opens
  useEffect(() => {
    if (isUpdateWelcomeOpen) {
      const autoTitle = `WN-${welcomeNoteCounter}`;
      setWelcomeTitle(autoTitle);
    }
  }, [isUpdateWelcomeOpen, welcomeNoteCounter]);

  // Notification fields
  const [notifHeaderEn, setNotifHeaderEn] = useState('');
  const [notifBodyEn, setNotifBodyEn] = useState('');
  const [notifHeaderAr, setNotifHeaderAr] = useState('');
  const [notifBodyAr, setNotifBodyAr] = useState('');
  const [notifGroups, setNotifGroups] = useState<string[]>([]);

  // Accreditation fields
  const [accreditationTitle, setAccreditationTitle] = useState('');
  const [accreditationDescriptionEn, setAccreditationDescriptionEn] = useState('');
  const [accreditationDescriptionAr, setAccreditationDescriptionAr] = useState('');
  const [accreditationLogo, setAccreditationLogo] = useState<File | null>(null);
  const [accreditationLogoUrl, setAccreditationLogoUrl] = useState<string>('');

  // Wallpaper fields
  const [wallpaperImage, setWallpaperImage] = useState<File | null>(null);
  const [wallpaperActive, setWallpaperActive] = useState(true);
  const [wallpaperCategories, setWallpaperCategories] = useState<string[]>([]);

  const handleSaveNews = () => {
    console.log('Saving news:', { newsTitle, newsDescriptionEn, newsDescriptionAr });
    setIsAddNewsOpen(false);
    setNewsTitle('');
    setNewsDescriptionEn('');
    setNewsDescriptionAr('');
  };

  const handleSaveWelcome = () => {
    console.log('Saving welcome note:', { welcomeTitle, welcomeDescriptionEn, welcomeDescriptionAr });
    setIsUpdateWelcomeOpen(false);
    // Increment the welcome note counter
    setWelcomeNoteCounter(prev => prev + 1);
    localStorage.setItem('careinn_welcome_note_counter', (welcomeNoteCounter + 1).toString());
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', { notifHeaderEn, notifBodyEn, notifHeaderAr, notifBodyAr, notifGroups });
    setIsSendNotificationOpen(false);
    setNotifHeaderEn('');
    setNotifBodyEn('');
    setNotifHeaderAr('');
    setNotifBodyAr('');
    setNotifGroups([]);
  };

  const handleSaveAccreditation = () => {
    console.log('Saving accreditation:', { accreditationTitle, accreditationDescriptionEn, accreditationDescriptionAr, accreditationLogo });
    setIsAddAccreditationOpen(false);
    setAccreditationTitle('');
    setAccreditationDescriptionEn('');
    setAccreditationDescriptionAr('');
    setAccreditationLogo(null);
    setAccreditationLogoUrl('');
  };

  const handleAccreditationLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAccreditationLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccreditationLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAccreditationLogoUrl('');
    }
  };

  const handleRemoveAccreditationLogo = () => {
    setAccreditationLogo(null);
    setAccreditationLogoUrl('');
  };

  const handleSaveWallpaper = () => {
    console.log('Saving wallpaper:', { wallpaperImage, wallpaperActive, wallpaperCategories });
    setIsUpdateWallpaperOpen(false);
    setWallpaperImage(null);
    setWallpaperActive(true);
    setWallpaperCategories([]);
  };

  // Filter only pending modules
  const pendingModules = moduleStatusData.filter(module => module.status === 'Pending');

  return (
    <div className="h-full overflow-auto">
      <div className="h-full flex flex-col px-8 py-5 gap-5">
        
        {/* Row 1: Hospital Header Card + Greeting Card */}
        <div className="grid gap-5" style={{ minHeight: '180px', gridTemplateColumns: '1fr 28.5%' }}>
          {/* Hospital Header Card */}
          <motion.div 
            className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden flex items-center" 
            style={{ minHeight: '180px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative z-10 flex items-center gap-6 w-full">
              {/* Hospital Logo */}
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-[#4EBEE3]/20 hover:shadow-xl transition-all duration-300 hover:scale-105 p-2">
                  {console.log('Hospital Logo URL:', hospitalLogo)}
                  <ImageWithFallback src={hospitalLogo} alt="Saint Louis Hospital Logo" />
                </div>
              </div>

              {/* Hospital Name */}
              <div className="flex-1">
                <h2 className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                  Saint Louis Hospital (SLH)
                </h2>
                <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                  Jounieh - Lebanon
                </p>
              </div>

              {/* Stats Cards */}
              <div className="flex items-stretch gap-3">
                {/* Total Terminals */}
                <div className="bg-[#4EBEE3] rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] transition-all duration-200">
                  <div className="flex items-center justify-between px-6 py-4 min-w-[160px] gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px] font-medium text-white/90 font-['Poppins',sans-serif]">Total Terminals</div>
                      <div className="text-[32px] font-semibold text-white font-['Poppins',sans-serif] leading-none">30</div>
                    </div>
                    <div className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-white/20">
                      <Tablet size={24} className="text-white rotate-90" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* App Version */}
                <div className="bg-[#16274D] rounded-xl shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)] transition-all duration-200">
                  <div className="flex items-center justify-between px-6 py-4 min-w-[160px] gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px] font-medium text-white/90 font-['Poppins',sans-serif]">App Version</div>
                      <div className="text-[32px] font-semibold text-white font-['Poppins',sans-serif] leading-none">3.2.1</div>
                    </div>
                    <div className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-white/20">
                      <Code size={24} className="text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Greeting Card */}
          <motion.div 
            className="relative rounded-xl overflow-hidden shadow-sm" 
            style={{ minHeight: '180px' }}
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
            
            <div className="relative z-10 p-7 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-white font-['Poppins',sans-serif] tracking-wide">
                  Saturday, November 29, 2025
                </p>
                <div className="flex items-center gap-3">
                  <User size={20} className="text-white" strokeWidth={2.5} />
                  <h2 className="text-[19px] font-semibold text-white font-['Poppins',sans-serif]">
                    Welcome back, Sara
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => onNavigate?.('performance')}
                  className="bg-[#4EBEE3] text-white px-4 py-2 rounded-lg hover:bg-[#3DA5CA] transition-all shadow-md hover:shadow-lg text-[12px] font-medium font-['Poppins',sans-serif]"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Helpful Shortcuts (70%) + Pending Configurations (30%) */}
        <div className={`grid gap-5 items-end ${pendingModules.length > 0 ? '' : 'grid-cols-1'}`} style={pendingModules.length > 0 ? { gridTemplateColumns: '70% 30%' } : {}}>
          {/* Helpful Shortcuts - 70% width */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col" 
            style={{ height: '520px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <Settings size={17} className="text-[#4EBEE3]" strokeWidth={2} />
              Helpful Shortcuts
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Add Latest News */}
              <button
                onClick={() => setIsAddNewsOpen(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <PlusCircle size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Add Latest News
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Publish updates
                    </div>
                  </div>
                </div>
              </button>

              {/* Update Welcome Note */}
              <button
                onClick={() => setIsUpdateWelcomeOpen(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <Edit3 size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Update Welcome Note
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Customize patient message
                    </div>
                  </div>
                </div>
              </button>

              {/* Send Notification */}
              <button
                onClick={() => setIsSendNotificationOpen(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <Send size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Send Notification
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Alert patients
                    </div>
                  </div>
                </div>
              </button>

              {/* Add Accreditation */}
              <button
                onClick={() => setIsAddAccreditationOpen(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <Star size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Add Accreditation
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Showcase Recognitions
                    </div>
                  </div>
                </div>
              </button>

              {/* Update Wallpaper */}
              <button
                onClick={() => setIsUpdateWallpaperOpen(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                    <ImagePlus size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Update Wallpaper
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Change layouts
                    </div>
                  </div>
                </div>
              </button>

              {/* Nurse Station */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                      <Monitor size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                    </div>
                    <ExternalLink size={14} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Nurse Station
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Nurse dashboard
                    </div>
                  </div>
                </div>
              </a>

              {/* CareSuite */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                      <Sparkles size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                    </div>
                    <ExternalLink size={14} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      CareSuite
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Housekeeping app
                    </div>
                  </div>
                </div>
              </a>

              {/* CareConnect */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                      <Video size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                    </div>
                    <ExternalLink size={14} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      CareConnect
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Tele-consultation
                    </div>
                  </div>
                </div>
              </a>

              {/* Get Support */}
              <a
                href="https://careinn.freshdesk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#4EBEE3] hover:shadow-md transition-all duration-200 group text-left block"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 bg-[#4EBEE3]/10 rounded-lg w-fit group-hover:bg-[#4EBEE3]/20 transition-colors">
                      <MessageCircle size={18} strokeWidth={2} className="text-[#4EBEE3]" />
                    </div>
                    <ExternalLink size={14} strokeWidth={2} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                      Get Support
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Get help anytime!
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Pending Configurations - 30% width */}
          {pendingModules.length > 0 && (
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col" 
              style={{ height: '520px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
                <AlertCircle size={17} className="text-[#F59E0B]" strokeWidth={2} />
                Pending Configurations
              </h3>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-1">
                {pendingModules.map((module) => {
                  const IconComponent = module.icon;
                  
                  return (
                    <button
                      key={module.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 hover:border-[#4ebee3]/40 hover:bg-white hover:shadow-md transition-all duration-200 text-left group flex items-center gap-3"
                    >
                      {/* Icon */}
                      <div className="shrink-0 p-2 bg-[#4ebee3]/10 rounded-lg">
                        <IconComponent size={18} className="text-[#4ebee3]" strokeWidth={1.8} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-0.5 line-clamp-1">
                          {module.title}
                        </div>
                        <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif] line-clamp-1">
                          {module.description}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="shrink-0">
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-medium font-['Poppins',sans-serif] bg-amber-50 text-amber-700 border border-amber-200">
                          {module.status}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Row 3: Recent Activity + Quick Tips */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '70% 30%' }}>
          {/* Recent Activity */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col" 
            style={{ height: '340px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <Clock size={17} className="text-[#4EBEE3]" strokeWidth={2} />
              Recent Activity
            </h3>
            <div className="space-y-3 flex-1">
              {activityFeedData.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="p-1.5 bg-[#4ebee3]/10 rounded-lg shrink-0">
                      <IconComponent size={13} className="text-[#4ebee3]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-0.5">
                        {activity.action}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                        {activity.user}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-['Poppins',sans-serif] whitespace-nowrap">
                      {activity.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col" 
            style={{ height: '340px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <Lightbulb size={17} className="text-[#4EBEE3]" strokeWidth={2} />
              Quick Tips
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
              {quickTipsData.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="p-1 bg-[#4ebee3]/10 rounded-lg shrink-0 mt-0.5">
                    <Info size={12} className="text-[#4ebee3]" strokeWidth={1.5} />
                  </div>
                  <div className="text-[13px] text-[#16274D] font-['Poppins',sans-serif] leading-relaxed">
                    {tip}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Latest News Modal */}
      {isAddNewsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Latest News</h3>
              <button
                onClick={() => setIsAddNewsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Title</label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Enter news title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={newsDescriptionEn}
                  onChange={(e) => setNewsDescriptionEn(e.target.value)}
                  placeholder="Enter English description"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={newsDescriptionAr}
                  onChange={(e) => setNewsDescriptionAr(e.target.value)}
                  placeholder="أدخل الوصف بالعربية"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsAddNewsOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNews}
                className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Welcome Note Modal */}
      {isUpdateWelcomeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Update Welcome Note</h3>
              <button
                onClick={() => setIsUpdateWelcomeOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Title</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-[14px] text-gray-500 font-['Poppins',sans-serif] cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-['Poppins',sans-serif]">
                  Auto-generated welcome note ID
                </p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={welcomeDescriptionEn}
                  onChange={(e) => setWelcomeDescriptionEn(e.target.value)}
                  placeholder="Enter English description"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={welcomeDescriptionAr}
                  onChange={(e) => setWelcomeDescriptionAr(e.target.value)}
                  placeholder="أدخل الوصف بالعربية"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsUpdateWelcomeOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWelcome}
                className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {isSendNotificationOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Send Notification</h3>
              <button
                onClick={() => setIsSendNotificationOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Header</label>
                <input
                  type="text"
                  value={notifHeaderEn}
                  onChange={(e) => setNotifHeaderEn(e.target.value)}
                  placeholder="Enter English header"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Body</label>
                <textarea
                  value={notifBodyEn}
                  onChange={(e) => setNotifBodyEn(e.target.value)}
                  placeholder="Enter English body text"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Header</label>
                <input
                  type="text"
                  value={notifHeaderAr}
                  onChange={(e) => setNotifHeaderAr(e.target.value)}
                  placeholder="أدخل العنوان بالعربية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D]"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Body</label>
                <textarea
                  value={notifBodyAr}
                  onChange={(e) => setNotifBodyAr(e.target.value)}
                  placeholder="أدخل النص بالعربية"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Select Group</label>
                <MultiSelectDropdown
                  options={['Floor 1', 'Floor 2', 'Floor 3', 'ICU', 'Emergency', 'Pediatrics', 'VIP']}
                  selectedValues={notifGroups}
                  onChange={setNotifGroups}
                  placeholder="Select groups"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsSendNotificationOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Accreditation Modal */}
      {isAddAccreditationOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Accreditation</h3>
              <button
                onClick={() => setIsAddAccreditationOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Title</label>
                <input
                  type="text"
                  value={accreditationTitle}
                  onChange={(e) => setAccreditationTitle(e.target.value)}
                  placeholder="Enter accreditation title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={accreditationDescriptionEn}
                  onChange={(e) => setAccreditationDescriptionEn(e.target.value)}
                  placeholder="Enter English description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={accreditationDescriptionAr}
                  onChange={(e) => setAccreditationDescriptionAr(e.target.value)}
                  placeholder="أدخل الصف بالعربية"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Upload Logo</label>
                
                {!accreditationLogoUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAccreditationLogoChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4ebee3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                        </div>
                        <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload logo image
                        </p>
                        <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={accreditationLogoUrl} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {accreditationLogo?.name}
                      </p>
                      <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Logo image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveAccreditationLogo}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsAddAccreditationOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccreditation}
                className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Wallpaper Modal */}
      {isUpdateWallpaperOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="w-full max-w-2xl mx-4">
            <UpdateWallpaperModal 
              onClose={() => setIsUpdateWallpaperOpen(false)}
              onSave={handleSaveWallpaper}
            />
          </div>
        </div>
      )}
    </div>
  );
}