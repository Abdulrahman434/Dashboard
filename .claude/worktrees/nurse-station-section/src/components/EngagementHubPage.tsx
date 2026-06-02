import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Settings2, Grid3x3, FileText, Link as LinkIcon, Video, Smartphone, Globe, Upload, Eye, EyeOff, Sliders, Pause, GripVertical, Monitor, MonitorOff, Tablet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import TablePagination from './TablePagination';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PillTabs from './PillTabs';
import { SingleSelectDropdown } from './UnifiedDropdown';
import { UnifiedVisibilityModal } from './UnifiedVisibilityModal';

interface Asset {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'PDF' | 'URL' | 'APK';
  icon: string;
  iconFileName?: string;
  skipClearCache: boolean;
  assignedCategories: string[];
  pdfFile?: string;
  pdfFileName?: string;
  url?: string;
  apkFile?: string;
  apkFileName?: string;
}

interface CategoryItem {
  id: string;
  assetId: string;
  order: number;
  visible: boolean;
  visibleTerminals: string[]; // Array of terminal IDs where this item is visible
}

interface CategoryConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  visibleTerminals: string[]; // Array of terminal IDs
  isActive: boolean;
  order: number;
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



export default function EngagementHubPage() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load assets from Content Library
  const [contentLibraryAssets, setContentLibraryAssets] = useState<Asset[]>([]);
  const [patientServices, setPatientServices] = useState<any[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Selection state for bulk delete
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // All categories (dynamic)
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    const saved = localStorage.getItem('engagement-hub-categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data to ensure visibleTerminals exists
      return parsed.map((cat: any) => ({
        ...cat,
        visibleTerminals: cat.visibleTerminals || []
      }));
    }
    // Default categories
    return [
      { 
        id: 'games',
        nameEn: 'Games', 
        nameAr: 'الألعاب', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 0
      },
      { 
        id: 'social',
        nameEn: 'Social', 
        nameAr: 'التواصل', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 1
      },
      { 
        id: 'reading',
        nameEn: 'Reading', 
        nameAr: 'القراءة', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 2
      },
      { 
        id: 'media',
        nameEn: 'Media', 
        nameAr: 'الوسائط', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 3
      },
      { 
        id: 'internet',
        nameEn: 'Internet', 
        nameAr: 'الإنترنت', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 4
      },
      { 
        id: 'tools',
        nameEn: 'Tools', 
        nameAr: 'الأدوات', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 5
      },
      { 
        id: 'about-us',
        nameEn: 'About Us', 
        nameAr: 'عنا', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 6
      },
      { 
        id: 'meetings',
        nameEn: 'Meetings', 
        nameAr: 'الاجتماعات', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 7
      },
      { 
        id: 'shortcuts',
        nameEn: 'Shortcuts', 
        nameAr: 'الاختصارات', 
        icon: '', 
        visibleTerminals: ['1', '2', '3', '4', '5'],
        isActive: true,
        order: 8
      }
    ];
  });

  // Category assets (which assets are in which category)
  const [categoryItems, setCategoryItems] = useState<Record<string, CategoryItem[]>>(() => {
    const saved = localStorage.getItem('engagement-hub-items');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data to ensure visibleTerminals exists on all items
      const migrated: Record<string, CategoryItem[]> = {};
      for (const [key, items] of Object.entries(parsed)) {
        migrated[key] = (items as any[]).map((item: any) => ({
          ...item,
          visibleTerminals: item.visibleTerminals || []
        }));
      }
      return migrated;
    }
    return {};
  });

  // Mock terminals - matching CareInn15 structure
  const generateMockTerminals = (): Terminal[] => {
    const rooms = ['101', '102', '103', '201', '202', '203', '301', '302', '303', '401'];
    const beds = ['A', 'B', 'C'];
    const buildings = ['Main', 'North', 'South'];
    const floors = ['1', '2', '3', '4'];
    const pocs = ['Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Emergency'];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      deviceId: `CareInn15-${String(i + 1).padStart(3, '0')}`,
      mrn: `MRN-${String(i + 1).padStart(5, '0')}`,
      roomNo: rooms[i % rooms.length],
      bedNo: beds[i % beds.length],
      building: buildings[i % buildings.length],
      floor: floors[i % floors.length],
      poc: pocs[i % pocs.length],
      group: ['Kids', 'Adults', 'VIP'][i % 3],
      isConnected: i >= 2, // First 2 disconnected, rest connected
    }));
  };

  const [terminals] = useState<Terminal[]>(generateMockTerminals());

  // Load patient services and shortcuts for cross-section tracking
  const [patientServicesItems, setPatientServicesItems] = useState<any[]>([]);
  const [shortcutsItems, setShortcutsItems] = useState<any[]>([]);

  useEffect(() => {
    const loadOtherSections = () => {
      const psItems = localStorage.getItem('patient-services-items');
      const scItems = localStorage.getItem('shortcuts-services');
      if (psItems) setPatientServicesItems(JSON.parse(psItems));
      if (scItems) setShortcutsItems(JSON.parse(scItems));
    };
    loadOtherSections();

    const handleStorageChange = () => {
      loadOtherSections();
    };
    
    const handleFocus = () => {
      loadOtherSections();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [visibilityModalItemId, setVisibilityModalItemId] = useState<string | null>(null);
  const [configureTab, setConfigureTab] = useState<'settings'>('settings');

  // Temp states for modals
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([]);
  const [tempGlobalVisibility, setTempGlobalVisibility] = useState<string[]>([]);
  const [tempConfig, setTempConfig] = useState<CategoryConfig | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [newCategoryForm, setNewCategoryForm] = useState({
    nameEn: '',
    nameAr: '',
    icon: ''
  });

  // Visibility modal state
  const [visibilityModalCategoryId, setVisibilityModalCategoryId] = useState<string | null>(null);
  const [showBulkVisibilityModal, setShowBulkVisibilityModal] = useState(false);
  const [showAddModalVisibility, setShowAddModalVisibility] = useState(false);

  // Set initial active tab
  useEffect(() => {
    // Prefer active categories, but allow inactive ones if no active exist
    const activeCategories = categories.filter(cat => cat.isActive).sort((a, b) => a.order - b.order);
    const allCategories = [...categories].sort((a, b) => a.order - b.order);
    
    if (!activeTab && allCategories.length > 0) {
      // Set to first active category, or first category if none are active
      if (activeCategories.length > 0) {
        setActiveTab(activeCategories[0].id);
      } else {
        setActiveTab(allCategories[0].id);
      }
    }
  }, [categories, activeTab]);

  // Load Content Library assets and Patient Services
  useEffect(() => {
    const loadAssets = () => {
      const saved = localStorage.getItem('content-library-assets');
      if (saved) {
        setContentLibraryAssets(JSON.parse(saved));
      }
    };
    
    const loadPatientServices = () => {
      const saved = localStorage.getItem('patient-services');
      if (saved) {
        setPatientServices(JSON.parse(saved));
      }
    };
    
    loadAssets();
    loadPatientServices();

    const handleStorageChange = () => {
      loadAssets();
      loadPatientServices();
    };
    
    const handlePatientServicesUpdate = () => {
      loadPatientServices();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('patient-services-updated', handlePatientServicesUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('patient-services-updated', handlePatientServicesUpdate);
    };
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('engagement-hub-categories', JSON.stringify(categories));
  }, [categories]);

  // Save category assets to localStorage
  useEffect(() => {
    localStorage.setItem('engagement-hub-items', JSON.stringify(categoryItems));
  }, [categoryItems]);

  // Get active categories (sorted by order)
  const getActiveCategories = () => {
    return categories.filter(cat => cat.isActive).sort((a, b) => a.order - b.order);
  };

  // Get all categories (sorted by order) - for display in tabs
  const getAllCategories = () => {
    return categories.sort((a, b) => a.order - b.order);
  };

  // Get active category count
  const getActiveCategoryCount = () => {
    return categories.filter(cat => cat.isActive).length;
  };

  // Get current category config
  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === activeTab);
  };

  // Get assets for current category
  const getCategoryAssets = () => {
    const items = categoryItems[activeTab] || [];
    return items
      .map(item => contentLibraryAssets.find(asset => asset.id === item.assetId))
      .filter((asset): asset is Asset => asset !== undefined)
      .sort((a, b) => {
        const aItem = items.find(i => i.assetId === a.id);
        const bItem = items.find(i => i.assetId === b.id);
        return (aItem?.order || 0) - (bItem?.order || 0);
      });
  };

  // Filter assets for search
  const filteredAssets = getCategoryAssets().filter(asset => {
    if (!searchQuery) return true;
    return (
      asset.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameAr.includes(searchQuery)
    );
  });

  // Pagination calculations
  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Get available assets for adding
  const getAvailableAssets = () => {
    return contentLibraryAssets; // Show all assets from Content Library
  };

  // Check if asset is already in ANY Engagement Hub category
  const isAssetInCategory = (assetId: string) => {
    return Object.values(categoryItems).some((items: any) => 
      Array.isArray(items) && items.some((item: any) => item.assetId === assetId)
    );
  };

  // Check if asset is already in Patient Services
  const isAssetInPatientServices = (assetId: string): boolean => {
    return patientServices.some((service: any) => {
      if (service.type === 'Asset' && service.contentItems) {
        return service.contentItems.includes(assetId);
      }
      return false;
    });
  };

  // Check which other sections an asset is in
  const getAssetOtherSections = (assetId: string) => {
    const sections: string[] = [];
    if (isAssetInPatientServices(assetId)) {
      sections.push('Patient Services');
    }
    return sections;
  };

  // Add assets to category
  const handleAddItems = () => {
    const existingItems = categoryItems[activeTab] || [];
    const newItems: CategoryItem[] = tempSelectedAssets.map((assetId, index) => ({
      id: `${Date.now()}-${index}`,
      assetId,
      order: existingItems.length + index,
      visible: true,
      visibleTerminals: tempGlobalVisibility // Use global visibility for all items
    }));

    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: [...existingItems, ...newItems]
    }));

    // Update Content Library to mark these assets as used in Engagement Hub
    const updatedAssets = contentLibraryAssets.map(asset => {
      if (tempSelectedAssets.includes(asset.id)) {
        const categories = [...asset.assignedCategories];
        if (!categories.includes('Engagement Hub')) {
          categories.push('Engagement Hub');
        }
        return { ...asset, assignedCategories: categories };
      }
      return asset;
    });
    setContentLibraryAssets(updatedAssets);
    localStorage.setItem('content-library-assets', JSON.stringify(updatedAssets));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('engagement-hub-updated'));

    const currentCat = getCurrentCategory();
    toast.success(`${tempSelectedAssets.length} asset(s) added to ${currentCat?.nameEn}`);
    setShowAddItemModal(false);
    setTempSelectedAssets([]);
    setTempGlobalVisibility([]);
    setModalSearchQuery('');
  };

  // Remove asset from category
  const handleRemoveItem = (itemId: string) => {
    // Find the asset ID being removed
    const itemToRemove = (categoryItems[activeTab] || []).find(item => item.id === itemId);
    
    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter(item => item.id !== itemId)
    }));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    
    // Check if this asset is still used in any other Engagement Hub category
    if (itemToRemove) {
      const isStillUsed = Object.entries(categoryItems).some(([catId, items]) => 
        catId !== activeTab && items.some(item => item.assetId === itemToRemove.assetId)
      );
      
      // If not used anywhere in Engagement Hub, remove from assignedCategories
      if (!isStillUsed) {
        const updatedAssets = contentLibraryAssets.map(asset => {
          if (asset.id === itemToRemove.assetId) {
            return {
              ...asset,
              assignedCategories: asset.assignedCategories.filter(cat => cat !== 'Engagement Hub')
            };
          }
          return asset;
        });
        setContentLibraryAssets(updatedAssets);
        localStorage.setItem('content-library-assets', JSON.stringify(updatedAssets));
      }
    }
    
    toast.success('Asset removed from category');
  };

  // Toggle item visibility
  const handleToggleVisibility = (itemId: string) => {
    const currentItems = categoryItems[activeTab] || [];
    const item = currentItems.find(i => i.id === itemId);
    const newVisibility = item ? !item.visible : true;
    
    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(i =>
        i.id === itemId ? { ...i, visible: newVisibility } : i
      )
    }));
    
    toast.success(newVisibility ? 'Asset shown' : 'Asset hidden');
  };

  // Save visibility settings for an item
  const handleSaveItemVisibility = (itemId: string, selectedTerminals: string[]) => {
    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(i =>
        i.id === itemId ? { ...i, visibleTerminals: selectedTerminals } : i
      )
    }));
    toast.success('Visibility settings updated');
  };

  // Bulk set visibility for selected items (save from terminals modal)
  const handleBulkSetVisibility = (selectedTerminals: string[]) => {
    if (selectedItems.length === 0) return;
    
    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(item =>
        selectedItems.includes(item.id) ? { ...item, visibleTerminals: selectedTerminals } : item
      )
    }));
    
    toast.success(`Visibility updated for ${selectedItems.length} item(s)`);
    setShowBulkVisibilityModal(false);
    setSelectedItems([]);
  };

  // Save global visibility from Add Modal
  const handleSaveAddModalVisibility = (selectedTerminals: string[]) => {
    setTempGlobalVisibility(selectedTerminals);
    setShowAddModalVisibility(false);
    toast.success(`Visibility set for ${selectedTerminals.length} terminal(s)`);
  };

  // Bulk delete assets from category
  const handleBulkDeleteItems = () => {
    if (selectedItems.length === 0) return;
    
    // Get the asset IDs being removed
    const itemsToRemove = (categoryItems[activeTab] || []).filter(item => selectedItems.includes(item.id));
    const assetIdsToRemove = itemsToRemove.map(item => item.assetId);
    
    setCategoryItems(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter(item => !selectedItems.includes(item.id))
    }));
    
    // Check each removed asset to see if it's still used in other Engagement Hub categories
    const updatedAssets = contentLibraryAssets.map(asset => {
      if (assetIdsToRemove.includes(asset.id)) {
        const isStillUsed = Object.entries(categoryItems).some(([catId, items]) => 
          catId !== activeTab && items.some(item => item.assetId === asset.id)
        );
        
        if (!isStillUsed) {
          return {
            ...asset,
            assignedCategories: asset.assignedCategories.filter(cat => cat !== 'Engagement Hub')
          };
        }
      }
      return asset;
    });
    setContentLibraryAssets(updatedAssets);
    localStorage.setItem('content-library-assets', JSON.stringify(updatedAssets));
    
    const currentCat = getCurrentCategory();
    toast.success(`${selectedItems.length} asset(s) removed from ${currentCat?.nameEn}`);
    setSelectedItems([]);
  };

  // Toggle selection
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const currentItems = (categoryItems[activeTab] || []).map(item => item.id);
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems);
    }
  };

  // Open configure modal
  const openConfigureModal = () => {
    const currentCat = getCurrentCategory();
    if (currentCat) {
      setTempConfig({ ...currentCat });
      setShowConfigureModal(true);
      setConfigureTab('settings');
    }
  };

  // Open configure modal for specific category from Manage Categories
  const handleConfigureCategory = (category: CategoryConfig) => {
    setTempConfig({ ...category });
    setActiveTab(category.id);
    setShowManageCategoriesModal(false);
    setShowConfigureModal(true);
    setConfigureTab('settings');
  };

  // Save configuration
  const handleSaveConfiguration = () => {
    if (!tempConfig) return;

    setCategories(prev => prev.map(cat => 
      cat.id === tempConfig.id ? tempConfig : cat
    ));

    toast.success('Category configuration saved');
    setShowConfigureModal(false);
    setTempConfig(null);
  };

  // Handle icon upload for configuration
  const handleConfigIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (tempConfig) {
          setTempConfig({ ...tempConfig, icon: reader.result as string });
          toast.success('Icon uploaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle new category icon upload
  const handleNewCategoryIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategoryForm(prev => ({ ...prev, icon: reader.result as string }));
        toast.success('Icon uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save category visibility
  const handleSaveCategoryVisibility = (categoryId: string, selectedTerminals: string[]) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, visibleTerminals: selectedTerminals } : cat
    ));
  };

  // Toggle category active status
  const handleToggleCategoryActive = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (category.isActive) {
      // Deactivating - tab stays on the deactivated category so user can still view/configure
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, isActive: false } : cat
      ));
      toast.success(`${category.nameEn} deactivated`);
    } else {
      // Activating
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, isActive: true } : cat
      ));
      toast.success(`${category.nameEn} activated`);
    }
  };

  // Create new category
  const handleCreateCategory = () => {
    if (!newCategoryForm.nameEn || !newCategoryForm.nameAr) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCategory: CategoryConfig = {
      id: `category-${Date.now()}`,
      nameEn: newCategoryForm.nameEn,
      nameAr: newCategoryForm.nameAr,
      icon: newCategoryForm.icon,
      visibleTerminals: terminals.map(t => t.id), // All terminals by default
      isActive: true,
      order: categories.length
    };

    setCategories(prev => [...prev, newCategory]);
    
    if (canActivate) {
      toast.success(`Category "${newCategoryForm.nameEn}" created and activated`);
    } else {
      toast.success(`Category "${newCategoryForm.nameEn}" created (inactive - activate from Manage Categories)`);
    }
    
    setShowCreateCategoryModal(false);
    setNewCategoryForm({ nameEn: '', nameAr: '', icon: '' });
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (confirm(`Are you sure you want to delete "${category.nameEn}"? All assets in this category will be removed.`)) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // Remove all assets from this category
      setCategoryItems(prev => {
        const newItems = { ...prev };
        delete newItems[categoryId];
        return newItems;
      });

      toast.success(`Category "${category.nameEn}" deleted`);
      
      // Switch to first remaining category if current tab was deleted
      if (activeTab === categoryId) {
        const remainingCategories = categories.filter(cat => cat.id !== categoryId).sort((a, b) => a.order - b.order);
        if (remainingCategories.length > 0) {
          setActiveTab(remainingCategories[0].id);
        }
      }
    }
  };

  // Bulk activate selected categories
  const handleBulkActivate = () => {
    console.log('=== BULK ACTIVATE START ===');
    console.log('1. Function called');
    console.log('2. selectedCategories:', selectedCategories);
    console.log('3. categories:', categories);
    
    const activeCount = getActiveCategoryCount();
    console.log('4. activeCount:', activeCount);
    
    const selectedInactiveCount = selectedCategories.filter(id => {
      const cat = categories.find(c => c.id === id);
      return cat && !cat.isActive;
    }).length;
    
    console.log('5. selectedInactiveCount:', selectedInactiveCount);
    console.log('6. Updating categories...');
    setCategories(prev => prev.map(cat =>
      selectedCategories.includes(cat.id) ? { ...cat, isActive: true } : cat
    ));
    console.log('7. Categories updated');
    toast.success(`${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} activated`);
    console.log('8. Toast shown');
    setSelectedCategories([]);
    console.log('9. Selection cleared');
    console.log('=== BULK ACTIVATE END ===');
  };

  // Check if bulk activate has inactive categories selected
  const canBulkActivate = () => {
    const selectedInactiveCount = selectedCategories.filter(id => {
      const cat = categories.find(c => c.id === id);
      return cat && !cat.isActive;
    }).length;
    return selectedInactiveCount > 0;
  };

  // Get bulk activate button tooltip
  const getBulkActivateTooltip = () => {
    const selectedInactiveCount = selectedCategories.filter(id => {
      const cat = categories.find(c => c.id === id);
      return cat && !cat.isActive;
    }).length;
    
    if (selectedInactiveCount === 0) {
      return 'No inactive categories selected';
    }
    
    return `Activate ${selectedInactiveCount} categor${selectedInactiveCount === 1 ? 'y' : 'ies'}`;
  };

  // Bulk deactivate selected categories
  const handleBulkDeactivate = () => {
    setCategories(prev => prev.map(cat =>
      selectedCategories.includes(cat.id) ? { ...cat, isActive: false } : cat
    ));
    toast.success(`${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} deactivated`);
    setSelectedCategories([]);
  };

  // Bulk delete selected categories
  const handleBulkDeleteCategories = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}? This cannot be undone.`)) {
      setCategories(prev => prev.filter(cat => !selectedCategories.includes(cat.id)));
      
      // Remove assets for deleted categories
      setCategoryItems(prev => {
        const newItems = { ...prev };
        selectedCategories.forEach(id => {
          delete newItems[id];
        });
        return newItems;
      });

      toast.success(`${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} deleted`);
      
      // If current tab was deleted, switch to first remaining category
      if (selectedCategories.includes(activeTab)) {
        const remainingCategories = categories.filter(cat => !selectedCategories.includes(cat.id)).sort((a, b) => a.order - b.order);
        if (remainingCategories.length > 0) {
          setActiveTab(remainingCategories[0].id);
        }
      }
      
      setSelectedCategories([]);
    }
  };

  // Move category to new position
  const moveCategory = (dragIndex: number, hoverIndex: number) => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const dragCategory = sortedCategories[dragIndex];
    const newCategories = [...sortedCategories];
    
    // Remove from old position
    newCategories.splice(dragIndex, 1);
    // Insert at new position
    newCategories.splice(hoverIndex, 0, dragCategory);
    
    // Update order values
    const reorderedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));
    
    setCategories(reorderedCategories);
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

  const allCategories = getAllCategories();
  const currentCategory = getCurrentCategory();

  // Draggable Category Component for drag-and-drop reordering
  interface DraggableCategoryProps {
    category: CategoryConfig;
    index: number;
    moveCategory: (dragIndex: number, hoverIndex: number) => void;
  }

  const DraggableCategory = ({ category, index, moveCategory }: DraggableCategoryProps) => {
    const [{ isDragging }, drag, preview] = useDrag({
      type: 'CATEGORY',
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver }, drop] = useDrop({
      accept: 'CATEGORY',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveCategory(item.index, index);
          item.index = index;
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={(node) => preview(drop(node))}
        className={`border rounded-lg p-3 transition-all ${
          selectedCategories.includes(category.id)
            ? 'border-[#4EBEE3] bg-[#4EBEE3]/5'
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-[#4EBEE3]/50' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div
            ref={drag}
            className="cursor-move text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <GripVertical size={20} strokeWidth={2} />
          </div>
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCategories([...selectedCategories, category.id]);
              } else {
                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
              }
            }}
            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3] flex-shrink-0"
          />
          {category.icon ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={category.icon}
                alt={category.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Grid3x3 size={18} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                {category.nameEn}
              </p>
              <span className="text-[12px] text-gray-400 font-['Poppins',sans-serif]">
                {category.nameAr}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                category.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                {categoryItems[category.id]?.length || 0} assets
              </span>
            </div>
          </div>
          <button
            onClick={() => handleConfigureCategory(category)}
            className="px-3 py-1.5 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors flex items-center gap-1.5 font-['Poppins',sans-serif] text-[13px] font-medium flex-shrink-0"
          >
            <Settings2 size={14} strokeWidth={2} />
            Configure
          </button>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Grid3x3 size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Engagement Hub
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage left-panel patient experience content and its visibility
          </p>
        </div>
        <button
          onClick={() => setShowManageCategoriesModal(true)}
          className="px-4 py-2.5 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
        >
          <Sliders size={18} strokeWidth={2} />
          Manage Categories
        </button>
      </div>

      {/* Tabs and Content - Merged Container */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {/* Tabs */}
        <PillTabs
          tabs={allCategories.map(category => ({
            id: category.id,
            label: category.nameEn,
            disabled: !category.isActive,
            icon: !category.isActive ? (
              <Pause 
                size={14} 
                className={activeTab === category.id ? 'text-white/70' : 'text-gray-400'} 
                strokeWidth={2}
              />
            ) : undefined
          }))}
          activeTab={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId);
            setSearchQuery('');
            setSelectedItems([]);
          }}
        />

        {/* Content Area */}
        {!currentCategory ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Grid3x3 size={40} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-[18px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              No categories found
            </h3>
            <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif] mb-6">
              Please create categories from Manage Categories
            </p>
            <button
              onClick={() => setShowManageCategoriesModal(true)}
              className="px-6 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
            >
              Manage Categories
            </button>
          </div>
        ) : filteredAssets.length === 0 && !searchQuery ? (
          // Empty State
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Grid3x3 size={40} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-[18px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              No items in this category
            </h3>
            <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif] mb-6">
              Add items from Content Library to this category
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={openConfigureModal}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-[#0f1729] rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                <Settings2 size={18} strokeWidth={2} />
                Configure Category
              </button>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                <Plus size={18} strokeWidth={2} />
                Add Item
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkVisibilityModal(true)}
                    className="px-4 py-2 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    <Eye size={18} strokeWidth={2} />
                    Set Visibility ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleBulkDeleteItems}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                    Delete ({selectedItems.length})
                  </button>
                </>
              )}
              <button
                onClick={() => setShowAddItemModal(true)}
                className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                <Plus size={18} strokeWidth={2} />
                Add Asset
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      <input
                        type="checkbox"
                        checked={selectedItems.length > 0 && selectedItems.length === (categoryItems[activeTab] || []).length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Name (EN)
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Name (AR)
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Type
                    </th>
                    <th className="px-6 py-3 text-center text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                          No items found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset) => {
                      const categoryItem = (categoryItems[activeTab] || []).find(item => item.assetId === asset.id);
                      if (!categoryItem) return null;

                      return (
                        <tr key={categoryItem.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(categoryItem.id)}
                              onChange={() => toggleSelection(categoryItem.id)}
                              className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#4EBEE3]/20 to-[#4EBEE3]/5 flex items-center justify-center">
                              {asset.icon ? (
                                <img
                                  src={asset.icon}
                                  alt={asset.nameEn}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className="text-[#4EBEE3] text-[14px] font-semibold font-['Poppins',sans-serif]">
                                {asset.nameEn.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                              {asset.nameEn}
                            </span>
                          </td>
                          <td className="px-6 py-4" dir="rtl">
                            <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                              {asset.nameAr}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(asset.type)}
                              <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                                {asset.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setVisibilityModalItemId(categoryItem.id)}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 transition-all font-['Poppins',sans-serif] text-[13px] font-medium"
                            >
                              Set ({categoryItem.visibleTerminals?.length || 0})
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRemoveItem(categoryItem.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from category"
                            >
                              <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="assets"
              showRowsPerPage={true}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </>
        )}
      </div>

      {/* Manage Categories Modal */}
      {showManageCategoriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif] mb-1">
                  Manage Categories
                </h2>
                <div className="flex items-center gap-6 text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                  <span>Total: <span className="font-medium text-[#4EBEE3]">{categories.length}</span></span>
                  <span>Active: <span className="font-medium text-green-600">{getActiveCategoryCount()}</span></span>
                  <span>Inactive: <span className="font-medium text-gray-600">{categories.length - getActiveCategoryCount()}</span></span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowManageCategoriesModal(false);
                  setSelectedCategories([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Select All / Bulk Actions Row */}
                {categories.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories(categories.map(c => c.id));
                          } else {
                            setSelectedCategories([]);
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                      <span className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                        {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'Select All'}
                      </span>
                    </div>

                    {/* Action Buttons - Only show when items selected */}
                    {selectedCategories.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Activate button clicked');
                            handleBulkActivate();
                          }}
                          disabled={!canBulkActivate()}
                          title={getBulkActivateTooltip()}
                          className={`px-3 py-1.5 rounded-md transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-1.5 ${
                            canBulkActivate()
                              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Eye size={14} strokeWidth={2} />
                          Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Deactivate button clicked');
                            handleBulkDeactivate();
                          }}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-1.5"
                        >
                          <EyeOff size={14} strokeWidth={2} />
                          Deactivate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Delete button clicked');
                            handleBulkDeleteCategories();
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-['Poppins',sans-serif] text-[13px] font-medium flex items-center gap-1.5"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories List - Drag to Reorder */}
                <div className="space-y-2">
                  <div className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mb-2">
                    Drag and drop categories to reorder them
                  </div>
                  {categories.sort((a, b) => a.order - b.order).map((category, index) => (
                    <DraggableCategory
                      key={category.id}
                      category={category}
                      index={index}
                      moveCategory={moveCategory}
                    />
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                Create New Category
              </h2>
              <button
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategoryForm({ nameEn: '', nameAr: '', icon: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                  Category Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryForm.nameEn}
                  onChange={(e) => setNewCategoryForm(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="e.g., Entertainment"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                  Category Name (Arabic) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryForm.nameAr}
                  onChange={(e) => setNewCategoryForm(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="مثال: الترفيه"
                  dir="rtl"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                  Category Icon
                </label>
                {newCategoryForm.icon ? (
                  <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={newCategoryForm.icon}
                          alt="Category icon"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          Icon uploaded
                        </p>
                      </div>
                      <button
                        onClick={() => setNewCategoryForm(prev => ({ ...prev, icon: '' }))}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={20} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewCategoryIconUpload}
                      className="hidden"
                      id="new-category-icon-upload"
                    />
                    <label htmlFor="new-category-icon-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                        <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategoryForm({ nameEn: '', nameAr: '', icon: '' });
                }}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                  Add Items to {currentCategory?.nameEn}
                </h2>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                  Select items from Content Library
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setTempSelectedAssets([]);
                  setTempGlobalVisibility([]);
                  setModalSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {getAvailableAssets().filter(asset => {
                  if (!modalSearchQuery) return true;
                  const query = modalSearchQuery.toLowerCase();
                  return asset.nameEn.toLowerCase().includes(query) || 
                         asset.nameAr.includes(modalSearchQuery);
                }).length === 0 ? (
                  <div className="py-12 text-center">
                    <Grid3x3 size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                      {modalSearchQuery ? 'No assets found matching your search' : 'No assets available in Content Library'}
                    </p>
                  </div>
                ) : (
                  getAvailableAssets().filter(asset => {
                    if (!modalSearchQuery) return true;
                    const query = modalSearchQuery.toLowerCase();
                    return asset.nameEn.toLowerCase().includes(query) || 
                           asset.nameAr.includes(modalSearchQuery);
                  }).map((asset) => {
                    const isAdded = isAssetInCategory(asset.id);
                    const isInPatientServices = isAssetInPatientServices(asset.id);
                    const isSelected = tempSelectedAssets.includes(asset.id);
                    const isDisabled = isAdded || isInPatientServices;

                    return (
                      <div
                        key={asset.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-[#4EBEE3] bg-[#4EBEE3]/5'
                            : 'border-gray-200 hover:border-[#4EBEE3]/50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isDisabled && !isSelected) {
                            setTempSelectedAssets([...tempSelectedAssets, asset.id]);
                          } else if (isSelected && !isDisabled) {
                            setTempSelectedAssets(tempSelectedAssets.filter(id => id !== asset.id));
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {!isDisabled && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                            />
                          )}
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#4EBEE3]/20 to-[#4EBEE3]/5 flex items-center justify-center">
                            {asset.icon ? (
                              <img
                                src={asset.icon}
                                alt={asset.nameEn}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="text-[#4EBEE3] text-[18px] font-semibold font-['Poppins',sans-serif]">
                              {asset.nameEn.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                                {asset.nameEn}
                              </p>
                              <span className="text-[13px] text-gray-400 font-['Poppins',sans-serif]" dir="rtl">
                                • {asset.nameAr}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {getTypeIcon(asset.type)}
                                <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                                  {asset.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isAdded ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[12px] font-medium font-['Poppins',sans-serif]">
                              Already in Engagement
                            </span>
                          ) : isInPatientServices ? (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[11px] font-medium font-['Poppins',sans-serif]">
                              In Patient Services
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {tempSelectedAssets.length > 0 && (
                  <button
                    onClick={() => setShowAddModalVisibility(true)}
                    className="px-4 py-2 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    <Eye size={18} strokeWidth={2} />
                    Set Visibility ({tempGlobalVisibility.length})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                  {tempSelectedAssets.length} item(s) selected
                </p>
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setTempSelectedAssets([]);
                    setTempGlobalVisibility([]);
                    setModalSearchQuery('');
                  }}
                  className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif] border-2 border-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItems}
                  disabled={tempSelectedAssets.length === 0}
                  className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent"
                >
                  Add {tempSelectedAssets.length > 0 ? `(${tempSelectedAssets.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure Category Modal */}
      {showConfigureModal && tempConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                  Configure {tempConfig.nameEn}
                </h2>
                <button
                  onClick={() => {
                    setShowConfigureModal(false);
                    setTempConfig(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Configure Tabs - Removed, only Category Settings now */}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {configureTab === 'settings' && (
                <div className="space-y-6">
                  {/* Activation Toggle */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                            Category Status
                          </h3>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                            tempConfig.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {tempConfig.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                          {tempConfig.isActive 
                            ? 'Category is visible on terminals based on visibility settings below' 
                            : 'Category is hidden from all terminals. Activate to make it visible.'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTempConfig({ ...tempConfig, isActive: !tempConfig.isActive });
                        }}
                        className={`px-4 py-2 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors ${
                          tempConfig.isActive
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white'
                        }`}
                      >
                        {tempConfig.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Category Name (English)
                    </label>
                    <input
                      type="text"
                      value={tempConfig.nameEn}
                      onChange={(e) => setTempConfig({ ...tempConfig, nameEn: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Category Name (Arabic)
                    </label>
                    <input
                      type="text"
                      value={tempConfig.nameAr}
                      onChange={(e) => setTempConfig({ ...tempConfig, nameAr: e.target.value })}
                      dir="rtl"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Category Icon
                    </label>
                    {tempConfig.icon ? (
                      <div className="border-2 border-[#4EBEE3] bg-[#4EBEE3]/5 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={tempConfig.icon}
                              alt="Category icon"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                              Icon uploaded
                            </p>
                          </div>
                          <button
                            onClick={() => setTempConfig({ ...tempConfig, icon: '' })}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleConfigIconUpload}
                          className="hidden"
                          id="config-icon-upload"
                        />
                        <label htmlFor="config-icon-upload" className="cursor-pointer flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                            <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              {/* Visibility Button on Left */}
              <button
                onClick={() => {
                  if (tempConfig) {
                    setVisibilityModalCategoryId(tempConfig.id);
                  }
                }}
                className="px-4 py-2 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                <Eye size={18} strokeWidth={2} />
                Set Visibility ({getCurrentCategory()?.visibleTerminals?.length || 0})
              </button>
              
              {/* Action Buttons on Right */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConfigureModal(false);
                    setTempConfig(null);
                  }}
                  className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif] border-2 border-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfiguration}
                  className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium border-2 border-transparent"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Modal */}
      {visibilityModalCategoryId && (() => {
        const category = categories.find(c => c.id === visibilityModalCategoryId);
        return (
          <UnifiedVisibilityModal
            isOpen={true}
            onClose={() => setVisibilityModalCategoryId(null)}
            itemName={category?.nameEn || 'Category'}
            terminals={terminals}
            currentSelection={category?.visibleTerminals || []}
            onSave={(selectedTerminals) => handleSaveCategoryVisibility(visibilityModalCategoryId, selectedTerminals)}
          />
        );
      })()}

      {/* Item Visibility Modal */}
      {visibilityModalItemId && (() => {
        const item = (categoryItems[activeTab] || []).find(i => i.id === visibilityModalItemId);
        const asset = contentLibraryAssets.find(a => a.id === item?.assetId);
        return (
          <UnifiedVisibilityModal
            isOpen={true}
            onClose={() => setVisibilityModalItemId(null)}
            itemName={asset?.nameEn || 'Item'}
            terminals={terminals}
            currentSelection={item?.visibleTerminals || []}
            onSave={(selectedTerminals) => handleSaveItemVisibility(visibilityModalItemId, selectedTerminals)}
          />
        );
      })()}

      {/* Bulk Visibility Modal for table selection */}
      <UnifiedVisibilityModal
        isOpen={showBulkVisibilityModal}
        onClose={() => setShowBulkVisibilityModal(false)}
        title={`Set Visibility for ${selectedItems.length} Asset${selectedItems.length > 1 ? 's' : ''}`}
        terminals={terminals}
        currentSelection={[]}
        onSave={handleBulkSetVisibility}
      />

      {/* Add Modal Visibility - for setting visibility before adding items */}
      <UnifiedVisibilityModal
        isOpen={showAddModalVisibility}
        onClose={() => setShowAddModalVisibility(false)}
        title="Set Visibility for New Items"
        terminals={terminals}
        currentSelection={tempGlobalVisibility}
        onSave={handleSaveAddModalVisibility}
      />
    </div>
    </DndProvider>
  );
}

// Bulk Items Visibility Modal Component (for table selection)
interface BulkItemsVisibilityModalProps {
  onClose: () => void;
  itemCount: number;
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
}

type TerminalSortField = 'deviceId' | 'mrn' | 'roomNo' | 'bedNo' | 'building' | 'floor' | 'poc' | 'group' | 'isConnected';
type SortDirection = 'asc' | 'desc';

function BulkItemsVisibilityModal({ onClose, itemCount, terminals, onSave }: BulkItemsVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
    toast.success(`Visibility updated for ${itemCount} item(s)`);
    onClose();
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {itemCount} Item{itemCount !== 1 ? 's' : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
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
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
            >
              {filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id)) && filteredAndSortedTerminals.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredAndSortedTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('deviceId')}
                      >
                        Device ID<SortIcon field="deviceId" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('mrn')}
                      >
                        MRN<SortIcon field="mrn" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('roomNo')}
                      >
                        Room<SortIcon field="roomNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('bedNo')}
                      >
                        Bed<SortIcon field="bedNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('building')}
                      >
                        Building<SortIcon field="building" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('floor')}
                      >
                        Floor<SortIcon field="floor" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('poc')}
                      >
                        POC<SortIcon field="poc" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('isConnected')}
                      >
                        Connection<SortIcon field="isConnected" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredAndSortedTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            {terminal.deviceId}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.mrn}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.roomNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.bedNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.building}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.floor}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.poc}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                            terminal.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {terminal.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Apply to {itemCount} Item{itemCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Modal Visibility Component (for setting visibility before adding)
interface AddModalVisibilityModalProps {
  onClose: () => void;
  itemCount: number;
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
  currentSelection: string[];
}

function AddModalVisibilityModal({ onClose, itemCount, terminals, onSave, currentSelection }: AddModalVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>(currentSelection);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {itemCount} Selected Item{itemCount !== 1 ? 's' : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
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
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
            >
              {filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id)) && filteredAndSortedTerminals.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredAndSortedTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('deviceId')}
                      >
                        Device ID<SortIcon field="deviceId" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('mrn')}
                      >
                        MRN<SortIcon field="mrn" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('roomNo')}
                      >
                        Room<SortIcon field="roomNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('bedNo')}
                      >
                        Bed<SortIcon field="bedNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('building')}
                      >
                        Building<SortIcon field="building" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('floor')}
                      >
                        Floor<SortIcon field="floor" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('poc')}
                      >
                        POC<SortIcon field="poc" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('isConnected')}
                      >
                        Connection<SortIcon field="isConnected" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredAndSortedTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            {terminal.deviceId}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.mrn}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.roomNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.bedNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.building}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.floor}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.poc}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                            terminal.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {terminal.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
}

// Category Visibility Modal Component
interface CategoryVisibilityModalProps {
  onClose: () => void;
  categoryId: string;
  currentCategories: CategoryConfig[];
  terminals: Terminal[];
  onSave: (categoryId: string, selectedTerminals: string[]) => void;
}

function CategoryVisibilityModal({ onClose, categoryId, currentCategories, terminals, onSave }: CategoryVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Load selected terminals for the category
  useEffect(() => {
    const category = currentCategories.find(c => c.id === categoryId);
    if (category) {
      setSelectedTerminals(category.visibleTerminals);
    }
  }, [categoryId, currentCategories]);

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      // Deselect all filtered terminals
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      // Select all filtered terminals
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(categoryId, selectedTerminals);
    toast.success(`Visibility updated for ${selectedTerminals.length} terminal(s)`);
    onClose();
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const category = currentCategories.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {category?.nameEn}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
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
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
            >
              {filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id)) && filteredAndSortedTerminals.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredAndSortedTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('deviceId')}
                      >
                        Device ID<SortIcon field="deviceId" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('mrn')}
                      >
                        MRN<SortIcon field="mrn" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('roomNo')}
                      >
                        Room<SortIcon field="roomNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('bedNo')}
                      >
                        Bed<SortIcon field="bedNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('building')}
                      >
                        Building<SortIcon field="building" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('floor')}
                      >
                        Floor<SortIcon field="floor" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('poc')}
                      >
                        POC<SortIcon field="poc" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('isConnected')}
                      >
                        Connection<SortIcon field="isConnected" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredAndSortedTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                            {terminal.deviceId}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.mrn}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.roomNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.bedNo}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.building}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.floor}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                            {terminal.poc}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                            terminal.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {terminal.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#d1d5dc] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Visibility Modal Component
interface ItemVisibilityModalProps {
  onClose: () => void;
  itemId: string;
  currentItems: CategoryItem[];
  terminals: Terminal[];
  onSave: (itemId: string, selectedTerminals: string[]) => void;
}

function ItemVisibilityModal({ onClose, itemId, currentItems, terminals, onSave }: ItemVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');

  // Load selected terminals for the item
  useEffect(() => {
    const item = currentItems.find(i => i.id === itemId);
    if (item) {
      setSelectedTerminals(item.visibleTerminals);
    }
  }, [itemId, currentItems]);

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      // Deselect all filtered terminals
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      // Select all filtered terminals
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSave = () => {
    onSave(itemId, selectedTerminals);
    toast.success(`Visibility updated for ${selectedTerminals.length} terminal(s)`);
    onClose();
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Filter terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Asset Visibility
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
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
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Filter by Group:
              </label>
              <div className="w-[160px]">
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
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredTerminals.length > 0 && filteredTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Device ID
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        MRN
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Group
                      </th>
                      <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                        Connection
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#0f1729] font-['Poppins',sans-serif]">
                          {terminal.deviceId}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#0f1729] font-['Poppins',sans-serif]">
                          {terminal.mrn}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-[#4EBEE3]/10 text-[#4EBEE3] font-['Poppins',sans-serif]">
                            {terminal.group}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                            terminal.isConnected 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              terminal.isConnected ? 'bg-green-600' : 'bg-gray-400'
                            }`}></span>
                            {terminal.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Selected Count */}
          <div className="mt-4 text-center">
            <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
              {selectedTerminals.length} of {totalTerminals} terminal(s) selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
