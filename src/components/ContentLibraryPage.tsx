import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, X, Link as LinkIcon, FileText, Smartphone, Settings2, Image as ImageIcon, Video, Package, Globe, Eye, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';
import InlineImageUpload from './InlineImageUpload';
import TablePagination from './TablePagination';
import TableSortIcon from './TableSortIcon';
import { UnifiedVisibilityModal } from './UnifiedVisibilityModal';

// App icons from Unsplash
const chessIcon = 'https://images.unsplash.com/photo-1668904049172-2b62946a7008?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const careinnUIIcon = 'https://images.unsplash.com/photo-1649091245823-18be815da4f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const whatsappIcon = 'https://images.unsplash.com/photo-1636751364472-12bfad09b451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const snapchatIcon = 'https://images.unsplash.com/photo-1759932021109-ffbec9251f9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const quranIcon = 'https://images.unsplash.com/photo-1597505495109-7fc35bb64d8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const youtubeIcon = 'https://images.unsplash.com/photo-1649180543887-158357417159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const netflixIcon = 'https://images.unsplash.com/photo-1661077150377-26922fb352bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const puzzleIcon = 'https://images.unsplash.com/photo-1697382609227-396b70d82dfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const tiktokIcon = 'https://images.unsplash.com/photo-1657256031813-09b6863b37ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const chromeIcon = 'https://images.unsplash.com/photo-1762330917439-78d1a00e3fe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const calculatorIcon = 'https://images.unsplash.com/photo-1766991517518-918acb35e8e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const mirrorIcon = 'https://images.unsplash.com/photo-1620416265040-cc777cad1883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const callNurseIcon = 'https://images.unsplash.com/photo-1648224394449-d10dbff84b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const zoomIcon = 'https://images.unsplash.com/photo-1733376261111-2981e645dfd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const teamsIcon = 'https://images.unsplash.com/photo-1660032356057-efd3e1eb045c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const translatorIcon = 'https://images.unsplash.com/photo-1677827366481-5529ea6b87cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const babyCameraIcon = 'https://images.unsplash.com/photo-1701120285820-976b36f4e5a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const consultationIcon = 'https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const housekeepingIcon = 'https://images.unsplash.com/photo-1758272421751-963195322eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const mealOrderingIcon = 'https://images.unsplash.com/photo-1759696302352-f20e19869be2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';

type SortField = 'nameEn' | 'nameAr' | 'type' | 'skipClearCache' | 'status' | 'activeIn';
type SortDirection = 'asc' | 'desc';

interface Asset {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'PDF' | 'URL' | 'APK';
  icon: string;
  iconFileName?: string;
  skipClearCache: boolean;
  assignedCategories: string[];
  visibleTerminals?: string[]; // Array of terminal IDs where this asset is visible
  // Type-specific fields
  pdfFile?: string;
  pdfFileName?: string;
  url?: string;
  apkFile?: string;
  apkFileName?: string;
}

interface Terminal {
  id: string;
  deviceId: string;
  mrn: string;
  roomNo: string;
  bedNo: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  isConnected: boolean;
}

export default function ContentLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('content-library-assets');
    let existingAssets: Asset[] = [];
    
    if (saved) {
      existingAssets = JSON.parse(saved);
    }
    
    // Check if entries already exist
    const hasChessEntry = existingAssets.some(asset => asset.id === 'chess-initial-entry');
    const hasCareInnUIEntry = existingAssets.some(asset => asset.id === 'careinn-ui-initial-entry');
    const hasWhatsAppEntry = existingAssets.some(asset => asset.id === 'whatsapp-initial-entry');
    const hasSnapchatEntry = existingAssets.some(asset => asset.id === 'snapchat-initial-entry');
    const hasQuranEntry = existingAssets.some(asset => asset.id === 'quran-initial-entry');
    const hasYouTubeEntry = existingAssets.some(asset => asset.id === 'youtube-initial-entry');
    const hasNetflixEntry = existingAssets.some(asset => asset.id === 'netflix-initial-entry');
    const hasPuzzleEntry = existingAssets.some(asset => asset.id === 'puzzle-initial-entry');
    const hasTikTokEntry = existingAssets.some(asset => asset.id === 'tiktok-initial-entry');
    const hasChromeEntry = existingAssets.some(asset => asset.id === 'chrome-initial-entry');
    const hasCalculatorEntry = existingAssets.some(asset => asset.id === 'calculator-initial-entry');
    const hasMirrorEntry = existingAssets.some(asset => asset.id === 'mirror-initial-entry');
    const hasCallNurseEntry = existingAssets.some(asset => asset.id === 'call-nurse-initial-entry');
    const hasZoomEntry = existingAssets.some(asset => asset.id === 'zoom-initial-entry');
    const hasTeamsEntry = existingAssets.some(asset => asset.id === 'teams-initial-entry');
    const hasTranslatorEntry = existingAssets.some(asset => asset.id === 'translator-initial-entry');
    const hasBabyCameraEntry = existingAssets.some(asset => asset.id === 'baby-camera-initial-entry');
    const hasConsultationEntry = existingAssets.some(asset => asset.id === 'consultation-initial-entry');
    const hasHousekeepingEntry = existingAssets.some(asset => asset.id === 'housekeeping-initial-entry');
    const hasMealOrderingEntry = existingAssets.some(asset => asset.id === 'meal-ordering-initial-entry');
    
    // Update existing entries with new icons and migrate visibleTerminals
    existingAssets = existingAssets.map(asset => {
      const baseAsset = {
        ...asset,
        visibleTerminals: asset.visibleTerminals || []
      };
      
      if (asset.id === 'whatsapp-initial-entry') {
        return { ...baseAsset, icon: whatsappIcon, iconFileName: 'whatsapp-icon.png' };
      }
      if (asset.id === 'calculator-initial-entry') {
        return { ...baseAsset, icon: calculatorIcon, iconFileName: 'calculator-icon.png' };
      }
      if (asset.id === 'mirror-initial-entry') {
        return { ...baseAsset, icon: mirrorIcon, iconFileName: 'mirror-icon.png' };
      }
      if (asset.id === 'call-nurse-initial-entry') {
        return { ...baseAsset, icon: callNurseIcon, iconFileName: 'call-nurse-icon.png' };
      }
      if (asset.id === 'zoom-initial-entry') {
        return { ...baseAsset, icon: zoomIcon, iconFileName: 'zoom-icon.png' };
      }
      if (asset.id === 'teams-initial-entry') {
        return { ...baseAsset, icon: teamsIcon, iconFileName: 'teams-icon.png' };
      }
      if (asset.id === 'translator-initial-entry') {
        return { ...baseAsset, icon: translatorIcon, iconFileName: 'translator-icon.png' };
      }
      if (asset.id === 'baby-camera-initial-entry') {
        return { ...baseAsset, icon: babyCameraIcon, iconFileName: 'baby-camera-icon.png' };
      }
      if (asset.id === 'consultation-initial-entry') {
        return { ...baseAsset, icon: consultationIcon, iconFileName: 'consultation-icon.png' };
      }
      if (asset.id === 'housekeeping-initial-entry') {
        return { ...baseAsset, icon: housekeepingIcon, iconFileName: 'housekeeping-icon.png' };
      }
      if (asset.id === 'meal-ordering-initial-entry') {
        return { ...baseAsset, icon: mealOrderingIcon, iconFileName: 'meal-ordering-icon.png' };
      }
      return baseAsset;
    });
    
    const newEntries: Asset[] = [];
    
    // Add chess entry if it doesn't exist
    if (!hasChessEntry) {
      newEntries.push({
        id: 'chess-initial-entry',
        nameEn: 'Chess',
        nameAr: 'الشطرنج',
        type: 'APK' as 'APK',
        icon: chessIcon,
        iconFileName: 'chess-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        apkFile: 'data:application/vnd.android.package-archive;base64,UEsDBBQAAAAIAMiRCFcAAAAAAAAAAAAAAAAJAAAATUVUQS1JTkYvAwBQSwcIAAAAAAAAAAAAAAA=',
        apkFileName: 'chess.apk'
      });
    }
    
    // Add CareInn Updated UI entry if it doesn't exist
    if (!hasCareInnUIEntry) {
      newEntries.push({
        id: 'careinn-ui-initial-entry',
        nameEn: 'CareInn Updated UI',
        nameAr: 'واجهة كيرإن الجديدة',
        type: 'PDF' as 'PDF',
        icon: careinnUIIcon,
        iconFileName: 'careinn-ui-icon.png',
        skipClearCache: true,
        assignedCategories: ['Patient Services'],
        pdfFile: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMi AwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMy AwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFBb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFRkCihDYXJlSW5uIFVwZGF0ZWQgVUkpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDE1IDAwMDAwIG4NCjAwMDAwMDAwNjQgMDAwMDAgbg0KMDAwMDAwMDEyMyAwMDAwMCBuDQowMDAwMDAwMjQ1IDAwMDAwIG4NCjAwMDAwMDAzMjggMDAwMDAgbg0KdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgo0MjEKJSVFT0Y=',
        pdfFileName: 'CareInn-Updated-UI.pdf'
      });
    }
    
    // Add WhatsApp entry if it doesn't exist
    if (!hasWhatsAppEntry) {
      newEntries.push({
        id: 'whatsapp-initial-entry',
        nameEn: 'WhatsApp',
        nameAr: 'واتساب',
        type: 'URL' as 'URL',
        icon: whatsappIcon,
        iconFileName: 'whatsapp-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://web.whatsapp.com'
      });
    }
    
    // Add Snapchat entry if it doesn't exist
    if (!hasSnapchatEntry) {
      newEntries.push({
        id: 'snapchat-initial-entry',
        nameEn: 'Snapchat',
        nameAr: 'سناب شات',
        type: 'URL' as 'URL',
        icon: snapchatIcon,
        iconFileName: 'snapchat-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://www.snapchat.com'
      });
    }
    
    // Add Quran entry if it doesn't exist
    if (!hasQuranEntry) {
      newEntries.push({
        id: 'quran-initial-entry',
        nameEn: 'Quran',
        nameAr: 'القرآن الكريم',
        type: 'URL' as 'URL',
        icon: quranIcon,
        iconFileName: 'quran-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'https://quran.com'
      });
    }
    
    // Add YouTube entry if it doesn't exist
    if (!hasYouTubeEntry) {
      newEntries.push({
        id: 'youtube-initial-entry',
        nameEn: 'YouTube',
        nameAr: 'يوتيوب',
        type: 'URL' as 'URL',
        icon: youtubeIcon,
        iconFileName: 'youtube-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://www.youtube.com'
      });
    }
    
    // Add Netflix entry if it doesn't exist
    if (!hasNetflixEntry) {
      newEntries.push({
        id: 'netflix-initial-entry',
        nameEn: 'Netflix',
        nameAr: 'نتفليكس',
        type: 'URL',
        icon: netflixIcon,
        iconFileName: 'netflix-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://www.netflix.com'
      });
    }
    
    // Add Puzzle entry if it doesn't exist
    if (!hasPuzzleEntry) {
      newEntries.push({
        id: 'puzzle-initial-entry',
        nameEn: 'Puzzle',
        nameAr: 'لعبة الألغاز',
        type: 'APK' as 'APK',
        icon: puzzleIcon,
        iconFileName: 'puzzle-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        apkFile: 'data:application/vnd.android.package-archive;base64,UEsDBBQAAAAIAMiRCFcAAAAAAAAAAAAAAAAJAAAATUVUQS1JTkYvAwBQSwcIAAAAAAAAAAAAAAA=',
        apkFileName: 'puzzle.apk'
      });
    }
    
    // Add TikTok entry if it doesn't exist
    if (!hasTikTokEntry) {
      newEntries.push({
        id: 'tiktok-initial-entry',
        nameEn: 'TikTok',
        nameAr: 'تيك توك',
        type: 'URL' as 'URL',
        icon: tiktokIcon,
        iconFileName: 'tiktok-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://www.tiktok.com'
      });
    }
    
    // Add Chrome entry if it doesn't exist
    if (!hasChromeEntry) {
      newEntries.push({
        id: 'chrome-initial-entry',
        nameEn: 'Chrome Browser',
        nameAr: 'متصفح كروم',
        type: 'URL' as 'URL',
        icon: chromeIcon,
        iconFileName: 'chrome-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://www.google.com/chrome'
      });
    }
    
    // Add Calculator entry if it doesn't exist
    if (!hasCalculatorEntry) {
      newEntries.push({
        id: 'calculator-initial-entry',
        nameEn: 'Calculator',
        nameAr: 'الآلة الحاسبة',
        type: 'URL',
        icon: calculatorIcon,
        iconFileName: 'calculator-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://calculator'
      });
    }
    
    // Add Mirror entry if it doesn't exist
    if (!hasMirrorEntry) {
      newEntries.push({
        id: 'mirror-initial-entry',
        nameEn: 'Mirror',
        nameAr: 'المرآة',
        type: 'URL',
        icon: mirrorIcon,
        iconFileName: 'mirror-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://mirror'
      });
    }
    
    // Add Call Nurse entry if it doesn't exist
    if (!hasCallNurseEntry) {
      newEntries.push({
        id: 'call-nurse-initial-entry',
        nameEn: 'Call Nurse',
        nameAr: 'طلب ممرضة',
        type: 'URL',
        icon: callNurseIcon,
        iconFileName: 'call-nurse-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://call-nurse'
      });
    }
    
    // Add Zoom entry if it doesn't exist
    if (!hasZoomEntry) {
      newEntries.push({
        id: 'zoom-initial-entry',
        nameEn: 'Zoom',
        nameAr: 'زوم',
        type: 'URL' as 'URL',
        icon: zoomIcon,
        iconFileName: 'zoom-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://zoom.us'
      });
    }
    
    // Add Teams entry if it doesn't exist
    if (!hasTeamsEntry) {
      newEntries.push({
        id: 'teams-initial-entry',
        nameEn: 'Microsoft Teams',
        nameAr: 'مايكروسوفت تيمز',
        type: 'URL' as 'URL',
        icon: teamsIcon,
        iconFileName: 'teams-icon.png',
        skipClearCache: false,
        assignedCategories: ['Engagement Hub'],
        url: 'https://teams.microsoft.com'
      });
    }
    
    // Add Translator entry if it doesn't exist
    if (!hasTranslatorEntry) {
      newEntries.push({
        id: 'translator-initial-entry',
        nameEn: 'Translator',
        nameAr: 'المترجم',
        type: 'URL' as 'URL',
        icon: translatorIcon,
        iconFileName: 'translator-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'https://translate.google.com'
      });
    }
    
    // Add Baby Camera entry if it doesn't exist
    if (!hasBabyCameraEntry) {
      newEntries.push({
        id: 'baby-camera-initial-entry',
        nameEn: 'Baby Camera',
        nameAr: 'كاميرا الطفل',
        type: 'URL',
        icon: babyCameraIcon,
        iconFileName: 'baby-camera-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://baby-camera'
      });
    }
    
    // Add Consultation entry if it doesn't exist
    if (!hasConsultationEntry) {
      newEntries.push({
        id: 'consultation-initial-entry',
        nameEn: 'Consultation',
        nameAr: 'الاستشارة الطبية',
        type: 'URL',
        icon: consultationIcon,
        iconFileName: 'consultation-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://consultation'
      });
    }
    
    // Add Housekeeping entry if it doesn't exist
    if (!hasHousekeepingEntry) {
      newEntries.push({
        id: 'housekeeping-initial-entry',
        nameEn: 'Housekeeping',
        nameAr: 'خدمة النظافة',
        type: 'URL',
        icon: housekeepingIcon,
        iconFileName: 'housekeeping-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://housekeeping'
      });
    }
    
    // Add Meal Ordering entry if it doesn't exist
    if (!hasMealOrderingEntry) {
      newEntries.push({
        id: 'meal-ordering-initial-entry',
        nameEn: 'Meal Ordering',
        nameAr: 'طلب الوجبات',
        type: 'URL',
        icon: mealOrderingIcon,
        iconFileName: 'meal-ordering-icon.png',
        skipClearCache: false,
        assignedCategories: ['Patient Services'],
        url: 'careinn://meal-ordering'
      });
    }
    
    return [...newEntries, ...existingAssets];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'PDF' | 'URL' | 'APK'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [activeInFilter, setActiveInFilter] = useState<'All' | 'Engagement Hub' | 'Patient Services' | 'Shortcuts'>('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [visibilityModalAssetId, setVisibilityModalAssetId] = useState<string | null>(null);
  
  // Mock terminals matching the fixed groups
  const [terminals] = useState<Terminal[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `TRM-240${i + 1}`,
      mrn: `MRN-7894${i + 5}`,
      roomNo: `${Math.floor(i / 2) + 2}0${(i % 2) + 1}`,
      bedNo: ['A', 'B', 'C', 'D'][i % 4],
      building: ['Main Tower', 'West Wing', 'East Wing'][i % 3],
      floor: `${Math.floor(i / 2) + 2}nd Floor`,
      poc: ['Dr. Sarah Ahmed', 'Dr. Michael Chen', 'Dr. Emily Roberts', 'Dr. James Wilson'][i % 4],
      group: ['Kids', 'Adults', 'VIP'][i % 3],
      isConnected: i >= 1
    }));
  });

  // Check for pending filter from alert navigation
  useEffect(() => {
    const pendingFilter = localStorage.getItem('content-library-pending-filter');
    
    if (pendingFilter === 'inactive') {
      setStatusFilter('Inactive');
      // Clear the pending filter
      localStorage.removeItem('content-library-pending-filter');
    }
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  
  // Bulk selection state
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');

  // Inline editing state
  const [editingField, setEditingField] = useState<{ assetId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState<string | null>(null);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const typeFileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    type: 'PDF' as 'PDF' | 'URL' | 'APK',
    icon: '',
    iconFileName: '',
    skipClearCache: false,
    assignedCategories: [] as string[],
    visibleTerminals: [] as string[],
    pdfFile: '',
    pdfFileName: '',
    url: '',
    apkFile: '',
    apkFileName: ''
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('content-library-assets', JSON.stringify(assets));
  }, [assets]);

  // Cleanup: Remove "Shortcuts" from all assets on mount (one-time cleanup)
  useEffect(() => {
    // Only run if we haven't done this cleanup before
    const cleanupDone = localStorage.getItem('shortcuts-cleanup-done');
    if (cleanupDone) return;

    const cleanedAssets = assets.map(asset => ({
      ...asset,
      assignedCategories: asset.assignedCategories.filter(cat => cat !== 'Shortcuts')
    }));
    
    // Only update if there were changes
    const hasChanges = assets.some(asset => asset.assignedCategories.includes('Shortcuts'));
    if (hasChanges) {
      setAssets(cleanedAssets);
      // Mark cleanup as done
      localStorage.setItem('shortcuts-cleanup-done', 'true');
    } else if (assets.length > 0) {
      // If there are assets but no Shortcuts category found, mark as done anyway
      localStorage.setItem('shortcuts-cleanup-done', 'true');
    }
  }, []); // Run only once on mount

  // Auto-refresh usage stats when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Poll for changes every 3 seconds to detect updates from other pages
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData({
      nameEn: '',
      nameAr: '',
      type: 'PDF',
      icon: '',
      iconFileName: '',
      skipClearCache: false,
      assignedCategories: [],
      visibleTerminals: [],
      pdfFile: '',
      pdfFileName: '',
      url: '',
      apkFile: '',
      apkFileName: ''
    });
  };

  const handleAddAsset = () => {
    if (!formData.nameEn.trim() || !formData.nameAr.trim() || !formData.icon) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate type-specific fields
    if (formData.type === 'PDF' && !formData.pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (formData.type === 'URL' && !formData.url) {
      toast.error('Please enter a URL');
      return;
    }
    if (formData.type === 'Stream' && !formData.streamUrl) {
      toast.error('Please enter a stream URL');
      return;
    }
    if (formData.type === 'APK' && !formData.apkFile) {
      toast.error('Please upload an APK file');
      return;
    }
    if (formData.type === 'Service' && !formData.serviceUrl) {
      toast.error('Please enter a service URL');
      return;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      type: formData.type,
      icon: formData.icon,
      iconFileName: formData.iconFileName,
      skipClearCache: formData.skipClearCache,
      assignedCategories: formData.assignedCategories,
      visibleTerminals: formData.visibleTerminals || [],
      pdfFile: formData.pdfFile,
      pdfFileName: formData.pdfFileName,
      url: formData.url,
      streamUrl: formData.streamUrl,
      apkFile: formData.apkFile,
      apkFileName: formData.apkFileName,
      serviceUrl: formData.serviceUrl
    };

    setAssets([...assets, newAsset]);
    toast.success('Asset added successfully');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditAsset = () => {
    if (!editingAsset) return;

    if (!formData.nameEn.trim() || !formData.nameAr.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedAssets = assets.map(asset =>
      asset.id === editingAsset.id
        ? {
            ...asset,
            nameEn: formData.nameEn,
            nameAr: formData.nameAr,
            type: formData.type,
            icon: formData.icon,
            iconFileName: formData.iconFileName,
            skipClearCache: formData.skipClearCache,
            assignedCategories: formData.assignedCategories,
            pdfFile: formData.pdfFile,
            pdfFileName: formData.pdfFileName,
            url: formData.url,
            streamUrl: formData.streamUrl,
            apkFile: formData.apkFile,
            apkFileName: formData.apkFileName,
            serviceUrl: formData.serviceUrl
          }
        : asset
    );

    setAssets(updatedAssets);
    toast.success('Asset updated successfully');
    setShowEditModal(false);
    setEditingAsset(null);
    resetForm();
  };

  const handleDeleteAsset = () => {
    if (!assetToDelete) return;

    setAssets(assets.filter(asset => asset.id !== assetToDelete.id));
    toast.success('Asset deleted successfully');
    setShowDeleteConfirm(false);
    setAssetToDelete(null);
  };

  const handleSaveVisibility = (selectedTerminals: string[]) => {
    if (!visibilityModalAssetId) return;
    
    setAssets(assets.map(asset =>
      asset.id === visibilityModalAssetId
        ? { ...asset, visibleTerminals: selectedTerminals }
        : asset
    ));
    
    toast.success('Visibility Updated', {
      description: `Visibility updated for ${selectedTerminals.length} terminal(s)`,
      duration: 2000,
    });
    setVisibilityModalAssetId(null);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      nameEn: asset.nameEn,
      nameAr: asset.nameAr,
      type: asset.type,
      icon: asset.icon,
      iconFileName: asset.iconFileName,
      skipClearCache: asset.skipClearCache,
      assignedCategories: asset.assignedCategories,
      pdfFile: asset.pdfFile || '',
      pdfFileName: asset.pdfFileName || '',
      url: asset.url || '',
      streamUrl: asset.streamUrl || '',
      apkFile: asset.apkFile || '',
      apkFileName: asset.apkFileName || '',
      serviceUrl: asset.serviceUrl || ''
    });
    setShowEditModal(true);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show warning for large files
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.info('Uploading large file... This may take a moment.');
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, icon: reader.result as string, iconFileName: file.name });
        toast.success('Icon uploaded successfully');
      };
      reader.onerror = () => {
        toast.error('Failed to upload icon');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'pdfFile' | 'apkFile') => {
    const file = e.target.files?.[0];
    if (file) {
      // Show warning for large files
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.info(`Uploading large ${fieldName === 'apkFile' ? 'APK' : 'PDF'} file (${Math.round(file.size / (1024 * 1024))}MB)... This may take a moment.`);
      }
      
      const reader = new FileReader();
      reader.onloadstart = () => {
        toast.info('Reading file...');
      };
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: reader.result as string, [`${fieldName}Name`]: file.name });
        toast.success(`${fieldName === 'apkFile' ? 'APK' : 'PDF'} uploaded successfully`);
      };
      reader.onerror = () => {
        toast.error(`Failed to upload ${fieldName === 'apkFile' ? 'APK' : 'PDF'}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions to check where assets are used
  const getAssetUsageLocations = (assetId: string): string[] => {
    // Force recalculation when refreshTrigger changes
    void refreshTrigger;
    
    const locations: string[] = [];
    
    // Check Engagement Hub - uses 'engagement-hub-items' key
    const engagementData = localStorage.getItem('engagement-hub-items');
    if (engagementData) {
      try {
        const categoryItems = JSON.parse(engagementData);
        const isInEngagement = Object.values(categoryItems).some((items: any) =>
          Array.isArray(items) && items.some((item: any) => item.assetId === assetId)
        );
        if (isInEngagement) locations.push('Engagement Hub');
      } catch (e) {}
    }
    
    // Check Patient Services - uses 'patient-services-items' key
    const servicesData = localStorage.getItem('patient-services-items');
    if (servicesData) {
      try {
        const serviceItems = JSON.parse(servicesData);
        const isInServices = serviceItems.some((item: any) => item.assetId === assetId);
        if (isInServices) locations.push('Patient Services');
      } catch (e) {}
    }
    
    // Check Shortcuts - uses 'shortcuts-services' key
    const shortcutsData = localStorage.getItem('shortcuts-services');
    if (shortcutsData) {
      try {
        const shortcutItems = JSON.parse(shortcutsData);
        console.log('Checking shortcuts for assetId:', assetId);
        console.log('Shortcut items:', shortcutItems);
        console.log('Shortcut items with assetId:', shortcutItems.filter((item: any) => item.assetId));
        const isInShortcuts = shortcutItems.some((item: any) => item.assetId === assetId);
        if (isInShortcuts) locations.push('Shortcuts');
      } catch (e) {
        console.error('Error parsing shortcuts:', e);
      }
    }
    
    return locations;
  };

  const isAssetActive = (assetId: string): boolean => {
    return getAssetUsageLocations(assetId).length > 0;
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameAr.includes(searchQuery);
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    
    // Status filter
    const assetIsActive = isAssetActive(asset.id);
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && assetIsActive) ||
      (statusFilter === 'Inactive' && !assetIsActive);
    
    // Active In filter
    const assetLocations = getAssetUsageLocations(asset.id);
    const matchesActiveIn = activeInFilter === 'All' || assetLocations.includes(activeInFilter);
    
    return matchesSearch && matchesType && matchesStatus && matchesActiveIn;
  }).sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    // Handle different sort fields
    if (sortField === 'skipClearCache') {
      // Boolean sorting: true first when ascending
      const aVal = a.skipClearCache ? 1 : 0;
      const bVal = b.skipClearCache ? 1 : 0;
      return (bVal - aVal) * direction;
    } else if (sortField === 'status') {
      // Status sorting based on isAssetActive
      const aActive = isAssetActive(a.id) ? 1 : 0;
      const bActive = isAssetActive(b.id) ? 1 : 0;
      return (bActive - aActive) * direction;
    } else if (sortField === 'activeIn') {
      // Active In sorting based on number of locations
      const aLocations = getAssetUsageLocations(a.id).length;
      const bLocations = getAssetUsageLocations(b.id).length;
      return (bLocations - aLocations) * direction;
    } else {
      // String sorting for nameEn, nameAr, type
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
    }
    
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter, activeInFilter]);

  // Inline editing handlers
  const startInlineEdit = (assetId: string, field: string, currentValue: string) => {
    setEditingField({ assetId, field });
    setEditValue(currentValue);
  };

  const saveInlineEdit = () => {
    if (!editingField) return;

    const updatedAssets = assets.map(asset => {
      if (asset.id === editingField.assetId) {
        // Handle 'input' field specially based on asset type
        if (editingField.field === 'input') {
          if (asset.type === 'URL') {
            return { ...asset, url: editValue };
          } else if (asset.type === 'PDF') {
            return { ...asset, pdfFileName: editValue };
          } else if (asset.type === 'APK') {
            return { ...asset, apkFileName: editValue };
          }
        }
        return { ...asset, [editingField.field]: editValue };
      }
      return asset;
    });

    setAssets(updatedAssets);
    setEditingField(null);
    setEditValue('');
    toast.success('Updated successfully');
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleTypeChange = (assetId: string, newType: 'PDF' | 'URL' | 'APK') => {
    // If changing to APK or PDF, trigger file browser
    if (newType === 'APK' || newType === 'PDF') {
      setEditingField({ assetId, field: 'type' });
      setEditValue(newType);
      setTimeout(() => {
        if (typeFileInputRef.current) {
          typeFileInputRef.current.click();
        }
      }, 100);
    } else {
      // For other types, just update the type
      const updatedAssets = assets.map(asset => {
        if (asset.id === assetId) {
          const updated = { ...asset, type: newType };
          // Clear type-specific fields
          delete updated.pdfFile;
          delete updated.pdfFileName;
          delete updated.apkFile;
          delete updated.apkFileName;
          delete updated.url;
          delete updated.streamUrl;
          delete updated.serviceUrl;
          return updated;
        }
        return asset;
      });
      setAssets(updatedAssets);
      toast.success('Type updated successfully');
    }
  };

  const handleTypeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingField || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileType = editValue as 'APK' | 'PDF';
    
    // Validate file type
    if (fileType === 'PDF' && file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    if (fileType === 'APK' && !file.name.endsWith('.apk')) {
      toast.error('Please select an APK file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      
      const updatedAssets = assets.map(asset => {
        if (asset.id === editingField.assetId) {
          const updated = { ...asset, type: fileType };
          // Clear all type-specific fields first
          delete updated.pdfFile;
          delete updated.pdfFileName;
          delete updated.apkFile;
          delete updated.apkFileName;
          delete updated.url;
          delete updated.streamUrl;
          delete updated.serviceUrl;
          
          // Set the appropriate fields for the new type
          if (fileType === 'PDF') {
            updated.pdfFile = base64Data;
            updated.pdfFileName = file.name;
          } else if (fileType === 'APK') {
            updated.apkFile = base64Data;
            updated.apkFileName = file.name;
          }
          return updated;
        }
        return asset;
      });

      setAssets(updatedAssets);
      setEditingField(null);
      setEditValue('');
      toast.success(`Type updated to ${fileType} successfully`);
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    if (typeFileInputRef.current) {
      typeFileInputRef.current.value = '';
    }
  };

  const toggleSkipClearCache = (assetId: string) => {
    const updatedAssets = assets.map(asset =>
      asset.id === assetId
        ? { ...asset, skipClearCache: !asset.skipClearCache }
        : asset
    );
    setAssets(updatedAssets);
    toast.success('Updated successfully');
  };

  const toggleCategory = (assetId: string, category: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const updatedCategories = asset.assignedCategories.includes(category)
      ? asset.assignedCategories.filter(c => c !== category)
      : [...asset.assignedCategories, category];

    const updatedAssets = assets.map(a =>
      a.id === assetId
        ? { ...a, assignedCategories: updatedCategories }
        : a
    );

    setAssets(updatedAssets);
  };

  const openCategoriesDropdown = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setTempCategories(asset.assignedCategories);
      setShowCategoriesDropdown(assetId);
    }
  };

  const saveCategoriesEdit = (assetId: string) => {
    // Validate before saving
    const hasPatientServices = tempCategories.includes('Patient Services');
    const hasShortcuts = tempCategories.includes('Shortcuts');
    
    if (tempCategories.length > 2) {
      toast.error('Maximum 2 categories allowed per asset');
      return;
    }
    
    if (hasPatientServices && hasShortcuts) {
      toast.error('Patient Services and Shortcuts cannot be assigned together');
      return;
    }
    
    const updatedAssets = assets.map(asset =>
      asset.id === assetId
        ? { ...asset, assignedCategories: tempCategories }
        : asset
    );
    setAssets(updatedAssets);
    setShowCategoriesDropdown(null);
    setTempCategories([]);
    toast.success('Categories updated successfully');
  };

  const handleInlineIconUpload = (assetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedAssets = assets.map(asset =>
          asset.id === assetId
            ? { ...asset, icon: reader.result as string, iconFileName: file.name }
            : asset
        );
        setAssets(updatedAssets);
        toast.success('Icon updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle view asset - different behavior based on type
  const handleViewAsset = (asset: Asset) => {
    switch (asset.type) {
      case 'PDF':
        if (asset.pdfFile) {
          setPreviewPdfUrl(asset.pdfFile);
          setShowPdfPreview(true);
        } else {
          toast.error('No PDF file available');
        }
        break;
      
      case 'URL':
        if (asset.url) {
          window.open(asset.url, '_blank');
          toast.success('Opening URL in new tab');
        } else {
          toast.error('No URL available');
        }
        break;
      
      case 'APK':
        if (asset.apkFile && asset.apkFileName) {
          // Create download link
          const link = document.createElement('a');
          link.href = asset.apkFile;
          link.download = asset.apkFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('Downloading APK file');
        } else {
          toast.error('No APK file available');
        }
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText size={16} className="text-red-500" />;
      case 'URL':
        return <LinkIcon size={16} className="text-[#4EBEE3]" />;
      case 'APK':
        return <Smartphone size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  // Bulk selection handlers
  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const toggleAllAssets = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(filteredAssets.map(asset => asset.id)));
    }
  };

  const handleBulkDelete = () => {
    const remainingAssets = assets.filter(asset => !selectedAssets.has(asset.id));
    setAssets(remainingAssets);
    toast.success(`${selectedAssets.size} asset(s) deleted successfully`);
    setSelectedAssets(new Set());
    setShowBulkDeleteConfirm(false);
  };

  const renderDynamicFields = () => {
    switch (formData.type) {
      case 'PDF':
        return (
          <div>
            <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              PDF File *
            </label>
            {formData.pdfFile ? (
              <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                    <FileText size={24} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">
                      {formData.pdfFileName || 'PDF File'}
                    </p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      File uploaded
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pdfFile: '', pdfFileName: '' })}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'pdfFile')}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                    <Upload size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Click to upload PDF
                    </p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                      PDF files supported
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 'URL':
        return (
          <div>
            <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
            />
          </div>
        );

      case 'APK':
        return (
          <div>
            <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              APK File *
            </label>
            {formData.apkFile ? (
              <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                    <Smartphone size={24} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">
                      {formData.apkFileName || 'APK File'}
                    </p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      File uploaded
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, apkFile: '', apkFileName: '' })}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                <input
                  type="file"
                  accept=".apk"
                  onChange={(e) => handleFileUpload(e, 'apkFile')}
                  className="hidden"
                  id="apk-upload"
                />
                <label htmlFor="apk-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                    <Upload size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Click to upload APK
                    </p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                      APK files supported
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Database size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Assets Hub
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Central repository for all assets used across Engagement Hub and Patient Services
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAssets.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              <Trash2 size={18} strokeWidth={2} />
              Delete ({selectedAssets.size})
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            <Plus size={18} strokeWidth={2} />
            Add Asset
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
          />
        </div>
        <SingleSelectDropdown
          options={[
            { value: 'All', label: 'All Types' },
            { value: 'PDF', label: 'PDF' },
            { value: 'URL', label: 'URL' },
            { value: 'APK', label: 'APK' }
          ]}
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as typeof typeFilter)}
        />
        <SingleSelectDropdown
          options={[
            { value: 'All', label: 'All' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
        />
        <SingleSelectDropdown
          options={[
            { value: 'All', label: 'Active In: All' },
            { value: 'Engagement Hub', label: 'Engagement Hub' },
            { value: 'Patient Services', label: 'Patient Services' },
            { value: 'Shortcuts', label: 'Shortcuts' }
          ]}
          value={activeInFilter}
          onChange={(value) => setActiveInFilter(value as typeof activeInFilter)}
        />
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredAssets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="assets"
          showRowsPerPage={false}
        />
        
        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-10">
                <input
                  type="checkbox"
                  checked={filteredAssets.length > 0 && selectedAssets.size === filteredAssets.length}
                  onChange={toggleAllAssets}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                />
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-14">
                Icon
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-28"
                onClick={() => handleSort('nameEn')}
              >
                <div className="flex items-center gap-2">
                  Name (EN)
                  <TableSortIcon field="nameEn" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-28"
                onClick={() => handleSort('nameAr')}
              >
                <div className="flex items-center gap-2">
                  Name (AR)
                  <TableSortIcon field="nameAr" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-16"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  <TableSortIcon field="type" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-28">
                Input
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-20"
                onClick={() => handleSort('skipClearCache')}
              >
                <div className="flex items-center gap-2">
                  Skip Cache
                  <TableSortIcon field="skipClearCache" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-16"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <TableSortIcon field="status" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors w-24"
                onClick={() => handleSort('activeIn')}
              >
                <div className="flex items-center gap-2">
                  Active In
                  <TableSortIcon field="activeIn" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={48} className="text-gray-300" strokeWidth={1.5} />
                    <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                      {searchQuery || typeFilter !== 'All' || statusFilter !== 'All' || activeInFilter !== 'All'
                        ? 'No assets found'
                        : 'No assets yet. Add your first asset to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedAssets.has(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <InlineImageUpload
                      imageUrl={asset.icon}
                      onImageChange={(imageUrl) => {
                        const updatedAssets = assets.map(a =>
                          a.id === asset.id ? { ...a, icon: imageUrl } : a
                        );
                        setAssets(updatedAssets);
                        toast.success('Icon updated successfully');
                      }}
                      altText={asset.nameEn}
                      size="sm"
                    />
                  </td>
                  <td className="px-3 py-3">
                    {editingField?.assetId === asset.id && editingField.field === 'nameEn' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveInlineEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit();
                          if (e.key === 'Escape') cancelInlineEdit();
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[12px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                      />
                    ) : (
                      <span
                        onClick={() => startInlineEdit(asset.id, 'nameEn', asset.nameEn)}
                        className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[12px] text-[#0f1729] font-['Poppins',sans-serif]"
                      >
                        {asset.nameEn}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3" dir="rtl">
                    {editingField?.assetId === asset.id && editingField.field === 'nameAr' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveInlineEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit();
                          if (e.key === 'Escape') cancelInlineEdit();
                        }}
                        autoFocus
                        dir="rtl"
                        className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[12px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                      />
                    ) : (
                      <span
                        onClick={() => startInlineEdit(asset.id, 'nameAr', asset.nameAr)}
                        className="cursor-pointer hover:text-[#4EBEE3] transition-colors text-[12px] text-[#0f1729] font-['Poppins',sans-serif]"
                      >
                        {asset.nameAr}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {editingField?.assetId === asset.id && editingField.field === 'type' ? (
                      <select
                        value={editValue}
                        onChange={(e) => {
                          const newType = e.target.value as 'PDF' | 'URL' | 'APK';
                          if (newType === 'APK' || newType === 'PDF') {
                            setEditValue(newType);
                            setTimeout(() => {
                              if (typeFileInputRef.current) {
                                typeFileInputRef.current.click();
                              }
                            }, 100);
                          } else {
                            handleTypeChange(asset.id, newType);
                            setEditingField(null);
                            setEditValue('');
                          }
                        }}
                        onBlur={() => {
                          if (editValue !== 'APK' && editValue !== 'PDF') {
                            cancelInlineEdit();
                          }
                        }}
                        autoFocus
                        className="w-full px-2 py-1 pr-7 border border-[#4EBEE3] rounded text-[12px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 appearance-none cursor-pointer bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 6px center',
                          backgroundSize: '10px'
                        }}
                      >
                        <option value="PDF">PDF</option>
                        <option value="URL">URL</option>
                        <option value="APK">APK</option>
                      </select>
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-[#4EBEE3] transition-colors"
                        onClick={() => startInlineEdit(asset.id, 'type', asset.type)}
                      >
                        {getTypeIcon(asset.type)}
                        <span className="text-[12px] text-[#0f1729] font-['Poppins',sans-serif]">
                          {asset.type}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {editingField?.assetId === asset.id && editingField.field === 'input' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveInlineEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit();
                          if (e.key === 'Escape') cancelInlineEdit();
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-[#4EBEE3] rounded text-[11px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20"
                      />
                    ) : (
                      <span 
                        onClick={() => {
                          // Only allow editing for URL type
                          if (asset.type === 'URL') {
                            const inputValue = asset.url || '';
                            startInlineEdit(asset.id, 'input', inputValue);
                          }
                        }}
                        className={`${asset.type === 'URL' ? 'cursor-pointer hover:text-[#4EBEE3]' : 'cursor-default'} transition-colors text-[11px] text-[#0f1729] font-['Poppins',sans-serif] truncate block max-w-[120px]`}
                        title={asset.type === 'URL' ? asset.url : asset.type === 'PDF' ? asset.pdfFileName : asset.apkFileName}
                      >
                        {asset.type === 'URL' ? asset.url : asset.type === 'PDF' ? asset.pdfFileName : asset.apkFileName}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div 
                      onClick={() => toggleSkipClearCache(asset.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                        asset.skipClearCache ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                      }`}
                    >
                      <div 
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          asset.skipClearCache ? 'transform translate-x-5' : ''
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const isActive = isAssetActive(asset.id);
                      return (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] cursor-help ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          title={isActive 
                            ? 'Asset is currently being used in Engagement Hub, Patient Services, or Shortcuts' 
                            : 'Asset is not assigned to any section yet'}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const locations = getAssetUsageLocations(asset.id);
                      return locations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {locations.map((location, idx) => {
                            // Different colors for each section
                            let colorClass = '';
                            if (location === 'Engagement Hub') {
                              colorClass = 'bg-[#4EBEE3]/10 text-[#4EBEE3]';
                            } else if (location === 'Patient Services') {
                              colorClass = 'bg-purple-100 text-purple-700';
                            } else if (location === 'Shortcuts') {
                              colorClass = 'bg-orange-100 text-orange-700';
                            }
                            
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center px-2 py-0.5 rounded ${colorClass} text-[11px] font-medium font-['Poppins',sans-serif]`}
                              >
                                {location}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400 font-['Poppins',sans-serif]">-</span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewAsset(asset)}
                        className="p-1.5 hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                        title={asset.type === 'APK' ? 'Download' : 'View'}
                      >
                        <Eye size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          setAssetToDelete(asset);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={filteredAssets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="assets"
          showRowsPerPage={false}
        />
      </div>

      {/* Add/Edit Asset Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                {showEditModal ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                  setEditingAsset(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Enter English name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                    Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="أدخل الاسم بالعربية"
                    dir="rtl"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                    Icon *
                  </label>
                  {formData.icon ? (
                    <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <img
                            src={formData.icon}
                            alt="Icon preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] truncate">
                            {formData.iconFileName || 'App Icon'}
                          </p>
                          <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                            Image uploaded
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: '', iconFileName: '' })}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                        id="icon-upload"
                      />
                      <label htmlFor="icon-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                          <Upload size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            Click to upload icon
                          </p>
                          <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Type Section */}
              <div>
                <h3 className="text-[16px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-4">
                  Type
                </h3>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as typeof formData.type })
                  }
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="PDF">PDF</option>
                  <option value="URL">URL</option>
                  <option value="APK">Application (APK)</option>
                </select>
              </div>

              {/* Skip Clear Cache Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                      Skip Clear Cache
                    </span>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                      When clear terminals cache
                    </p>
                  </div>
                  <div 
                    onClick={() => setFormData({ ...formData, skipClearCache: !formData.skipClearCache })}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.skipClearCache ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                    }`}
                  >
                    <div 
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        formData.skipClearCache ? 'transform translate-x-5' : ''
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Dynamic Fields Based on Type */}
              {renderDynamicFields()}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                  setEditingAsset(null);
                }}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={showEditModal ? handleEditAsset : handleAddAsset}
                className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                {showEditModal ? 'Update Asset' : 'Add Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && assetToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                Confirm Deletion
              </h2>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif]">
                Are you sure you want to delete <strong>{assetToDelete.nameEn}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAssetToDelete(null);
                }}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAsset}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                PDF Preview
              </h2>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setPreviewPdfUrl('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 p-6 min-h-0">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full rounded border border-gray-200"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                Confirm Bulk Deletion
              </h2>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif]">
                Are you sure you want to delete <strong>{selectedAssets.size} asset(s)</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Delete {selectedAssets.size} Asset(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for type change to APK/PDF */}
      <input
        ref={typeFileInputRef}
        type="file"
        accept={editValue === 'PDF' ? '.pdf' : '.apk'}
        onChange={handleTypeFileUpload}
        className="hidden"
      />
    </div>
  );
}