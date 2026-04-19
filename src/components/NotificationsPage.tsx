import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Send, Edit3, X, Calendar, Clock, Bell, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown, MultiSelectDropdown } from './UnifiedDropdown';
import CustomRadio from './CustomRadio';
import InlineInput from './InlineInput';
import InlineTextarea from './InlineTextarea';
import TablePagination from './TablePagination';
import TableSortIcon from './TableSortIcon';

type SortField = 'titleEn' | 'titleAr' | 'bodyEn' | 'bodyAr' | 'status' | 'timestamp' | 'targeted' | 'delivered' | 'acknowledged';
type SortDirection = 'asc' | 'desc';

interface Notification {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  audience: string[];
  recipientType?: 'patient-groups' | 'hospital-wards';
  selectedGroups?: string[];
  selectedWards?: string[];
  status: 'Sent' | 'Scheduled';
  timestamp: string;
  scheduleDate?: string;
  scheduleTime?: string;
  scheduleType?: 'custom' | 'admission' | 'discharge';
  sendOption?: 'now' | 'schedule' | 'recurring';
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  selectedDays?: string[];
  monthInterval?: string;
  monthDay?: string;
  targeted?: number;
  delivered?: number;
  acknowledged?: number;
}

const getInitialNotifications = (): Notification[] => [
  {
    id: '1',
    titleEn: 'Ramadan Mubarak',
    titleAr: 'رمضان مبارك',
    bodyEn: '🌙 We wish you a blessed Ramadan. May this month bring you comfort and peace during your stay.',
    bodyAr: '🌙 نتمنى لكم رمضان مباركاً. نسأل الله أن يحمل لكم هذا الشهر الراحة والطمأنينة خلال إقامتكم.',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Scheduled',
    timestamp: '2025-03-01 09:00',
    scheduleDate: '2025-03-01',
    scheduleTime: '09:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    targeted: 150,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '2',
    titleEn: 'Eid Al-Fitr Greetings',
    titleAr: 'تهاني عيد الفطر',
    bodyEn: '🌙 Warm wishes of Happy Eid. May your day be filled with comfort and happiness.',
    bodyAr: '🌙 أطيب الأمنيات لكم بعيد فطر سعيد. نتمنى لكم يوماً مليئاً بالراحة والفرح.',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Scheduled',
    timestamp: '2025-03-31 08:00',
    scheduleDate: '2025-03-31',
    scheduleTime: '08:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    targeted: 150,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '3',
    titleEn: 'Happy Saudi National Day',
    titleAr: 'اليوم الوطني السعودي',
    bodyEn: '🇸🇦 Celebrating the spirit of unity and progress. Wishing everyone a wonderful National Day.',
    bodyAr: '🇸🇦 نحتفل بروح الوحدة والتقدم. نتمنى للجميع يومًا وطنيًا سعيدًا.',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Scheduled',
    timestamp: '2025-09-23 10:00',
    scheduleDate: '2025-09-23',
    scheduleTime: '10:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    targeted: 150,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '4',
    titleEn: 'Good Night, Little Hero',
    titleAr: 'تصبح على خير أيها البطل الصغير',
    bodyEn: '⭐ Rest well… tomorrow is a new day full of magic and adventures.',
    bodyAr: '⭐ نم قرير العين… غدًا يوم جديد مليء بالسحر والمغامرات.',
    audience: ['Kids'],
    recipientType: 'patient-groups',
    selectedGroups: ['Kids'],
    status: 'Scheduled',
    timestamp: 'Daily',
    scheduleDate: '2024-12-02',
    scheduleTime: '20:00',
    sendOption: 'recurring',
    recurringFrequency: 'daily',
    targeted: 25,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '5',
    titleEn: 'Welcome',
    titleAr: 'أهلًا بك',
    bodyEn: '💛 Welcome to CareInn Hospital. We wish you a speedy recovery.',
    bodyAr: '💛 مرحبًا بك في مستشفى كيرإن. نتمنى لك دوام الصحة والعافية.',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Scheduled',
    timestamp: 'Upon Admission',
    scheduleType: 'admission',
    sendOption: 'schedule',
    targeted: 0,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '6',
    titleEn: 'Alhamdulillah for Your Safe Discharge',
    titleAr: 'الحمد لله على السلامة',
    bodyEn: '🙏 We hope the care you received met your expectations. You\'ll find the feedback button on the home screen.',
    bodyAr: '🙏 نتمنى أن تكون رعايتنا قد نالت رضاكم. يسعدنا الاطلاع على آرائكم—ستجدون زر التقييم في الشاشة الرئيسية.',
    audience: ['Adults', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'VIP'],
    status: 'Scheduled',
    timestamp: 'Upon Discharge',
    scheduleType: 'discharge',
    sendOption: 'schedule',
    targeted: 0,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '7',
    titleEn: 'New Game Added',
    titleAr: 'تمت إضافة لعبة جديدة',
    bodyEn: '🎮 A new game has been added to the Games folder. Check it out and have fun!',
    bodyAr: '🎮 تمت إضافة لعبة جديدة في مجلد الألعاب. استمتع بتجربتها!',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'hospital-wards',
    selectedWards: ['2B', '3C'],
    status: 'Sent',
    timestamp: new Date().toISOString(),
    sendOption: 'now',
    targeted: 52,
    delivered: 49,
    acknowledged: 42
  },
  {
    id: '8',
    titleEn: 'New Sports Channel',
    titleAr: 'ق��اة رياضية جديدة',
    bodyEn: '⚽ You can now watch today\'s match. Enjoy the game!',
    bodyAr: '⚽ أصبح بإمكانك متابعة مباراة اليوم. نتمنى لك مشاهدة ممتعة.',
    audience: ['Adults'],
    recipientType: 'hospital-wards',
    selectedWards: ['1A', '4A', '5B'],
    status: 'Sent',
    timestamp: new Date().toISOString(),
    sendOption: 'now',
    targeted: 76,
    delivered: 72,
    acknowledged: 61
  },
  {
    id: '9',
    titleEn: 'Fun Activity Soon',
    titleAr: 'نشاط ممتع قريبًا',
    bodyEn: '🎈 A fun activity is happening soon. Get ready!',
    bodyAr: '🎈 سيكون هناك نشاط ممتع بعد قليل. كن مستعدًا!',
    audience: ['Kids'],
    recipientType: 'patient-groups',
    selectedGroups: ['Kids'],
    status: 'Scheduled',
    timestamp: '2024-12-05 10:00',
    scheduleDate: '2024-12-05',
    scheduleTime: '10:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    targeted: 25,
    delivered: 0,
    acknowledged: 0
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // If saved data is empty or doesn't have sendOption field (old format), return initial notifications
          if (parsed.length === 0 || (parsed.length > 0 && !parsed[0].sendOption)) {
            return getInitialNotifications();
          }
          return parsed;
        } catch (e) {
          return getInitialNotifications();
        }
      }
    }
    return getInitialNotifications();
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Sent' | 'Scheduled'>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // "To" filters
  const [filterRecipientType, setFilterRecipientType] = useState<'all' | 'patient-groups' | 'hospital-wards'>('all');
  const [filterSelectedGroups, setFilterSelectedGroups] = useState<string[]>([]);
  const [filterSelectedWards, setFilterSelectedWards] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Fixed at 4 notifications per page

  // Sorting
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  // Form fields
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [audience, setAudience] = useState<string[]>([]);
  const [sendOption, setSendOption] = useState<'now' | 'schedule' | 'recurring'>('now');
  const [scheduleType, setScheduleType] = useState<'custom' | 'admission' | 'discharge'>('custom');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [monthInterval, setMonthInterval] = useState('1');
  const [monthDay, setMonthDay] = useState('1');

  // Recipient type state
  const [recipientType, setRecipientType] = useState<'patient-groups' | 'hospital-wards'>('patient-groups');
  const [selectedPatientGroups, setSelectedPatientGroups] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [isPatientGroupDropdownOpen, setIsPatientGroupDropdownOpen] = useState(false);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);

  // Options
  const groupOptions = ['Kids', 'Adults', 'VIP'];
  const wardOptions = ['1A', '2B', '3C', '4A', '5B', '6C'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const resetForm = () => {
    setTitleEn('');
    setTitleAr('');
    setBodyEn('');
    setBodyAr('');
    setAudience([]);
    setSendOption('now');
    setScheduleType('custom');
    setScheduleDate('');
    setScheduleTime('');
    setRecurringFrequency('daily');
    setSelectedDays([]);
    setMonthInterval('1');
    setMonthDay('1');
    setRecipientType('patient-groups');
    setSelectedPatientGroups([]);
    setSelectedWards([]);
    setIsPatientGroupDropdownOpen(false);
    setIsWardDropdownOpen(false);
  };

  // Handle patient group toggle
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

  // Handle ward toggle
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

  // Handle filter group toggle
  const handleFilterGroupToggle = (group: string) => {
    if (group === 'Select All') {
      if (filterSelectedGroups.length === groupOptions.length) {
        setFilterSelectedGroups([]);
      } else {
        setFilterSelectedGroups([...groupOptions]);
      }
    } else {
      if (filterSelectedGroups.includes(group)) {
        setFilterSelectedGroups(filterSelectedGroups.filter(g => g !== group));
      } else {
        setFilterSelectedGroups([...filterSelectedGroups, group]);
      }
    }
  };

  // Handle filter ward toggle
  const handleFilterWardToggle = (ward: string) => {
    if (ward === 'Select All') {
      if (filterSelectedWards.length === wardOptions.length) {
        setFilterSelectedWards([]);
      } else {
        setFilterSelectedWards([...wardOptions]);
      }
    } else {
      if (filterSelectedWards.includes(ward)) {
        setFilterSelectedWards(filterSelectedWards.filter(w => w !== ward));
      } else {
        setFilterSelectedWards([...filterSelectedWards, ward]);
      }
    }
  };

  // Calculate targeted number based on recipient type and selections
  const calculateTargeted = () => {
    if (scheduleType === 'admission' || scheduleType === 'discharge') {
      return 0; // For admission/discharge, we don't know the count yet
    }

    if (recipientType === 'hospital-wards') {
      // Each ward has approximately 20-30 terminals
      const wardsToCount = selectedWards.length > 0 ? selectedWards.length : wardOptions.length;
      return wardsToCount * (Math.floor(Math.random() * 11) + 20); // 20-30 per ward
    } else {
      // Patient groups
      const groupsToCount = selectedPatientGroups.length > 0 ? selectedPatientGroups : groupOptions;
      let total = 0;
      groupsToCount.forEach(group => {
        if (group === 'Kids') total += Math.floor(Math.random() * 21) + 20; // 20-40
        if (group === 'Adults') total += Math.floor(Math.random() * 51) + 50; // 50-100
        if (group === 'VIP') total += Math.floor(Math.random() * 16) + 10; // 10-25
      });
      return total;
    }
  };

  const handleAddNotification = () => {
    let timestamp = '';
    if (sendOption === 'now') {
      timestamp = new Date().toISOString();
    } else if (sendOption === 'schedule') {
      if (scheduleType === 'admission') {
        timestamp = 'Upon Admission';
      } else if (scheduleType === 'discharge') {
        timestamp = 'Upon Discharge';
      } else {
        timestamp = `${scheduleDate} ${scheduleTime}`;
      }
    } else if (sendOption === 'recurring') {
      if (recurringFrequency === 'daily') {
        timestamp = 'Daily';
      } else if (recurringFrequency === 'weekly') {
        timestamp = 'Weekly';
      } else if (recurringFrequency === 'monthly') {
        timestamp = 'Monthly';
      }
    }

    const targeted = calculateTargeted();
    const delivered = sendOption === 'now' ? Math.floor(targeted * 0.95) : 0; // 95% delivery rate
    const acknowledged = sendOption === 'now' ? Math.floor(delivered * 0.85) : 0; // 85% acknowledgment rate

    const newNotification: Notification = {
      id: Date.now().toString(),
      titleEn,
      titleAr,
      bodyEn,
      bodyAr,
      audience: audience.length > 0 ? audience : ['Adults', 'Kids', 'VIP'],
      recipientType,
      selectedGroups: recipientType === 'patient-groups' ? selectedPatientGroups : undefined,
      selectedWards: recipientType === 'hospital-wards' ? selectedWards : undefined,
      status: sendOption === 'now' ? 'Sent' : 'Scheduled',
      timestamp,
      scheduleDate: sendOption === 'schedule' ? scheduleDate : undefined,
      scheduleTime: sendOption === 'schedule' || sendOption === 'recurring' ? scheduleTime : undefined,
      scheduleType: sendOption === 'schedule' ? scheduleType : undefined,
      sendOption,
      recurringFrequency: sendOption === 'recurring' ? recurringFrequency : undefined,
      selectedDays: sendOption === 'recurring' && recurringFrequency === 'weekly' ? selectedDays : undefined,
      monthInterval: sendOption === 'recurring' && recurringFrequency === 'monthly' ? monthInterval : undefined,
      monthDay: sendOption === 'recurring' && recurringFrequency === 'monthly' ? monthDay : undefined,
      targeted,
      delivered,
      acknowledged,
    };

    setNotifications([...notifications, newNotification]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(sendOption === 'now' ? 'Notification Sent' : 'Notification Scheduled', {
      description: sendOption === 'now' ? 'Notification sent successfully' : 'Notification scheduled successfully',
      duration: 2000,
    });
  };

  const handleEditNotification = () => {
    if (!editingNotification) return;

    let timestamp = '';
    if (sendOption === 'now') {
      timestamp = new Date().toISOString();
    } else if (sendOption === 'schedule') {
      if (scheduleType === 'admission') {
        timestamp = 'Upon Admission';
      } else if (scheduleType === 'discharge') {
        timestamp = 'Upon Discharge';
      } else {
        timestamp = `${scheduleDate} ${scheduleTime}`;
      }
    } else if (sendOption === 'recurring') {
      if (recurringFrequency === 'daily') {
        timestamp = 'Daily';
      } else if (recurringFrequency === 'weekly') {
        timestamp = 'Weekly';
      } else if (recurringFrequency === 'monthly') {
        timestamp = 'Monthly';
      }
    }

    setNotifications(notifications.map(n => 
      n.id === editingNotification.id
        ? {
            ...n,
            titleEn,
            titleAr,
            bodyEn,
            bodyAr,
            audience: audience.length > 0 ? audience : ['Adults', 'Kids', 'VIP'],
            status: sendOption === 'now' ? 'Sent' : 'Scheduled',
            scheduleDate: sendOption === 'schedule' ? scheduleDate : undefined,
            scheduleTime: sendOption === 'schedule' || sendOption === 'recurring' ? scheduleTime : undefined,
            timestamp,
            scheduleType: sendOption === 'schedule' ? scheduleType : undefined,
            sendOption,
            recurringFrequency: sendOption === 'recurring' ? recurringFrequency : undefined,
            selectedDays: sendOption === 'recurring' && recurringFrequency === 'weekly' ? selectedDays : undefined,
            monthInterval: sendOption === 'recurring' && recurringFrequency === 'monthly' ? monthInterval : undefined,
            monthDay: sendOption === 'recurring' && recurringFrequency === 'monthly' ? monthDay : undefined,
          }
        : n
    ));

    setIsEditModalOpen(false);
    setEditingNotification(null);
    resetForm();
    toast.success('Notification Updated', {
      description: 'Schedule updated successfully',
      duration: 2000,
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    setDeleteConfirmId(null);
    toast.success('Notification Deleted', {
      description: 'Notification deleted successfully',
      duration: 2000,
    });
  };

  const handleSendAgain = (notification: Notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      status: 'Sent',
      timestamp: new Date().toISOString(),
      scheduleDate: undefined,
      scheduleTime: undefined,
      scheduleType: undefined,
    };

    setNotifications([...notifications, newNotification]);
    toast.success('Notification Sent Again', {
      description: 'Notification sent successfully',
      duration: 2000,
    });
  };

  const handleSendNow = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id
        ? { ...n, status: 'Sent' as const, timestamp: new Date().toISOString(), scheduleDate: undefined, scheduleTime: undefined, scheduleType: undefined }
        : n
    ));
    toast.success('Notification Sent', {
      description: 'Notification sent successfully',
      duration: 2000,
    });
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setTitleEn(notification.titleEn);
    setTitleAr(notification.titleAr);
    setBodyEn(notification.bodyEn);
    setBodyAr(notification.bodyAr);
    setAudience(notification.audience);
    setScheduleDate(notification.scheduleDate || '');
    setScheduleTime(notification.scheduleTime || '');
    setScheduleType(notification.scheduleType || 'custom');
    // Set sendOption from the notification
    setSendOption(notification.sendOption || 'now');
    // Set recurring options
    setRecurringFrequency(notification.recurringFrequency || 'daily');
    setSelectedDays(notification.selectedDays || []);
    setMonthInterval(notification.monthInterval || '1');
    setMonthDay(notification.monthDay || '1');
    setIsEditModalOpen(true);
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredNotifications.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredNotifications.map(n => n.id));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedRows.length;
    setNotifications(notifications.filter(n => !selectedRows.includes(n.id)));
    setSelectedRows([]);
    toast.success('Notifications Deleted', {
      description: `${selectedCount} notification${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  // Inline editing handlers
  const handleInlineEdit = (id: string, field: keyof Notification, value: string | number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, [field]: value } : n
    ));
  };

  const handleInlineEditAudience = (id: string, newAudience: string[]) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, audience: newAudience } : n
    ));
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

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.titleAr.includes(searchQuery) ||
      notification.bodyEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.bodyAr.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'All' || notification.status === filterStatus;
    
    // "To" filter logic
    let matchesToFilter = true;
    if (filterRecipientType !== 'all') {
      if (filterRecipientType === 'patient-groups') {
        matchesToFilter = notification.recipientType === 'patient-groups' || !notification.recipientType;
        // If specific groups are selected, check if notification includes any of them
        if (matchesToFilter && filterSelectedGroups.length > 0) {
          const notificationGroups = notification.selectedGroups || notification.audience || [];
          matchesToFilter = filterSelectedGroups.some(group => notificationGroups.includes(group));
        }
      } else if (filterRecipientType === 'hospital-wards') {
        matchesToFilter = notification.recipientType === 'hospital-wards';
        // If specific wards are selected, check if notification includes any of them
        if (matchesToFilter && filterSelectedWards.length > 0) {
          const notificationWards = notification.selectedWards || [];
          matchesToFilter = filterSelectedWards.some(ward => notificationWards.includes(ward));
        }
      }
    }
    
    return matchesSearch && matchesFilter && matchesToFilter;
  }).sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * direction;
    }
    
    return 0;
  });

  const formatTimestamp = (timestamp: string) => {
    // If it's already a frequency label, return it as-is
    if (timestamp === 'Daily' || timestamp === 'Weekly' || timestamp === 'Monthly' || 
        timestamp === 'Upon Admission' || timestamp === 'Upon Discharge') {
      return timestamp;
    }
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasSelectedRows = selectedRows.length > 0;

  const currentNotifications = filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate totals
  const totalTargeted = filteredNotifications.reduce((sum, n) => sum + (n.targeted || 0), 0);
  const totalDelivered = filteredNotifications.reduce((sum, n) => sum + (n.delivered || 0), 0);
  const totalAcknowledged = filteredNotifications.reduce((sum, n) => sum + (n.acknowledged || 0), 0);

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Notifications
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Send and manage terminal notifications
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Notifications Yet
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  Start creating notifications to keep patients informed and engaged.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
                />
              </div>

              {/* Status Filter */}
              <div className="shrink-0 w-[140px]">
                <SingleSelectDropdown
                  options={['All', 'Sent', 'Scheduled']}
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value as 'All' | 'Sent' | 'Scheduled')}
                  placeholder="Status"
                />
              </div>

              {/* To Type Filter */}
              <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white shrink-0">
                <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif] whitespace-nowrap">To:</span>
                <div className="flex gap-4">
                  <CustomRadio
                    name="recipientType"
                    checked={filterRecipientType === 'all'}
                    onChange={() => {
                      setFilterRecipientType('all');
                      setFilterSelectedGroups([]);
                      setFilterSelectedWards([]);
                    }}
                    label="All"
                  />
                  <CustomRadio
                    name="recipientType"
                    checked={filterRecipientType === 'patient-groups'}
                    onChange={() => {
                      setFilterRecipientType('patient-groups');
                      setFilterSelectedWards([]);
                    }}
                    label="Groups"
                  />
                  <CustomRadio
                    name="recipientType"
                    checked={filterRecipientType === 'hospital-wards'}
                    onChange={() => {
                      setFilterRecipientType('hospital-wards');
                      setFilterSelectedGroups([]);
                    }}
                    label="Wards"
                  />
                </div>
              </div>

              {/* Patient Groups Multi-Select Filter */}
              {filterRecipientType === 'patient-groups' && (
                <div className="w-[180px] shrink-0">
                  <MultiSelectDropdown
                    options={groupOptions}
                    selectedValues={filterSelectedGroups}
                    onChange={setFilterSelectedGroups}
                    placeholder="Filter by groups"
                  />
                </div>
              )}

              {/* Hospital Wards Multi-Select Filter */}
              {filterRecipientType === 'hospital-wards' && (
                <div className="w-[180px] shrink-0">
                  <MultiSelectDropdown
                    options={wardOptions}
                    selectedValues={filterSelectedWards}
                    onChange={setFilterSelectedWards}
                    placeholder="Filter by wards"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasSelectedRows && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <Plus size={18} strokeWidth={2} />
                Add Notification
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredNotifications.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="notifications"
              showRowsPerPage={false}
            />
            
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={filteredNotifications.length > 0 && selectedRows.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th 
                    className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('titleEn')}
                  >
                    <div className="flex items-center gap-2">
                      Title (EN)
                      <TableSortIcon field="titleEn" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('bodyEn')}
                  >
                    <div className="flex items-center gap-2">
                      Desc. (EN)
                      <TableSortIcon field="bodyEn" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('titleAr')}
                  >
                    <div className="flex items-center gap-2">
                      Title (AR)
                      <TableSortIcon field="titleAr" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('bodyAr')}
                  >
                    <div className="flex items-center gap-2">
                      Desc. (AR)
                      <TableSortIcon field="bodyAr" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    To
                  </th>
                  <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    To
                  </th>
                  <th 
                    className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('targeted')}
                  >
                    <div className="flex items-center justify-center gap-1.5 group relative">
                      <span>Targeted</span>
                      <TableSortIcon field="targeted" currentField={sortField} direction={sortDirection} />
                      <Info size={13} className="text-[#6B7280] cursor-help" strokeWidth={2} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif] font-normal">
                        Number of terminals targeted based on the selected audience
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                          <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('delivered')}
                  >
                    <div className="flex items-center justify-center gap-1.5 group relative">
                      <span>Delivered</span>
                      <TableSortIcon field="delivered" currentField={sortField} direction={sortDirection} />
                      <Info size={13} className="text-[#6B7280] cursor-help" strokeWidth={2} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif] font-normal">
                        Number of terminals that received this notification successfully
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                          <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('acknowledged')}
                  >
                    <div className="flex items-center justify-center gap-1.5 group relative">
                      <span>Ack.</span>
                      <TableSortIcon field="acknowledged" currentField={sortField} direction={sortDirection} />
                      <Info size={13} className="text-[#6B7280] cursor-help" strokeWidth={2} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif] font-normal">
                        Number of terminals that opened or interacted with this notification
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                          <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Status
                      <TableSortIcon field="status" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Time
                      <TableSortIcon field="timestamp" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentNotifications.map((notification) => (
                  <tr 
                    key={notification.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(notification.id)}
                        onChange={() => handleRowSelect(notification.id)}
                        disabled={notification.status === 'Sent'}
                        className={`w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 ${
                          notification.status === 'Sent' 
                            ? 'cursor-not-allowed opacity-40' 
                            : 'cursor-pointer'
                        }`}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineInput
                        value={notification.titleEn}
                        onChange={(value) => handleInlineEdit(notification.id, 'titleEn', value)}
                        className="font-medium"
                        disabled={notification.status === 'Sent'}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineTextarea
                        value={notification.bodyEn}
                        onChange={(value) => handleInlineEdit(notification.id, 'bodyEn', value)}
                        rows={3}
                        disabled={notification.status === 'Sent'}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineInput
                        value={notification.titleAr}
                        onChange={(value) => handleInlineEdit(notification.id, 'titleAr', value)}
                        className="font-medium"
                        dir="rtl"
                        disabled={notification.status === 'Sent'}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <InlineTextarea
                        value={notification.bodyAr}
                        onChange={(value) => handleInlineEdit(notification.id, 'bodyAr', value)}
                        dir="rtl"
                        rows={3}
                        disabled={notification.status === 'Sent'}
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wide">
                          {notification.recipientType === 'hospital-wards' ? 'Wards' : 'Groups'}
                        </span>
                        <span className="text-[13px] text-[#16274D] font-['Poppins',sans-serif] font-medium">
                          {notification.recipientType === 'hospital-wards' 
                            ? (notification.selectedWards && notification.selectedWards.length > 0
                                ? notification.selectedWards.join(', ')
                                : 'All Wards')
                            : (notification.selectedGroups && notification.selectedGroups.length > 0
                                ? (() => {
                                    const order = ['Kids', 'Adults', 'VIP'];
                                    return notification.selectedGroups
                                      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
                                      .join(', ');
                                  })()
                                : 'All Groups')
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                        {notification.targeted !== undefined ? notification.targeted : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                        {notification.delivered !== undefined ? notification.delivered : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                        {notification.acknowledged !== undefined ? notification.acknowledged : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] ${
                        notification.status === 'Sent'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                        {notification.scheduleType === 'admission' ? 'Upon Admission' :
                         notification.scheduleType === 'discharge' ? 'Upon Discharge' :
                         formatTimestamp(notification.timestamp)}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        {notification.status === 'Sent' ? (
                          <div className="group relative inline-flex">
                            <button
                              onClick={() => handleSendAgain(notification)}
                              className="p-2 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                            >
                              <RefreshCw size={16} strokeWidth={2} />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                              Send Again
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                                <div className="border-4 border-transparent border-t-[#16274D]"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="group relative inline-flex">
                              <button
                                onClick={() => handleSendNow(notification.id)}
                                className="p-2 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                              >
                                <Send size={16} strokeWidth={2} />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                                Send Now
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                                  <div className="border-4 border-transparent border-t-[#16274D]"></div>
                                </div>
                              </div>
                            </div>
                            <div className="group relative inline-flex">
                              <button
                                onClick={() => handleEdit(notification)}
                                className="p-2 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                              >
                                <Edit3 size={16} strokeWidth={2} />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                                Edit
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                                  <div className="border-4 border-transparent border-t-[#16274D]"></div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => setDeleteConfirmId(notification.id)}
                            className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-[#16274D] text-white text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap font-['Poppins',sans-serif]">
                            Delete
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-px">
                              <div className="border-4 border-transparent border-t-[#16274D]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalItems={filteredNotifications.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="notifications"
              showRowsPerPage={false}
            />
          </div>
        </>
      )}

      {/* Add Notification Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Add Notification</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Title</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Enter English title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  placeholder="Enter English description (with emoji if desired)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Title</label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="أدخل العنوان بالعربية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={bodyAr}
                  onChange={(e) => setBodyAr(e.target.value)}
                  placeholder="أدخل النص بالعربية"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-3">To:</label>
                <div className="flex gap-6 mb-4">
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

                {/* Patient Groups Dropdown */}
                {recipientType === 'patient-groups' && (
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg text-[14px] font-['Poppins',sans-serif] flex items-center justify-between transition-colors ${
                        isPatientGroupDropdownOpen ? 'border-[#4EBEE3] bg-white' : 'border-gray-300 bg-white hover:border-[#4EBEE3]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPatientGroupDropdownOpen(!isPatientGroupDropdownOpen);
                      }}
                    >
                      <span className={selectedPatientGroups.length > 0 ? "text-[#16274D]" : "text-gray-400"}>
                        {selectedPatientGroups.length > 0 
                          ? selectedPatientGroups.length === groupOptions.length 
                            ? 'All groups selected'
                            : selectedPatientGroups.join(', ')
                          : 'Select patient groups'
                        }
                      </span>
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${isPatientGroupDropdownOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {isPatientGroupDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white border-2 border-[#4EBEE3] rounded-lg p-3 space-y-2.5 max-h-[200px] overflow-y-auto shadow-lg">
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
                )}

                {/* Hospital Wards Dropdown */}
                {recipientType === 'hospital-wards' && (
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg text-[14px] font-['Poppins',sans-serif] flex items-center justify-between transition-colors ${
                        isWardDropdownOpen ? 'border-[#4EBEE3] bg-white' : 'border-gray-300 bg-white hover:border-[#4EBEE3]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsWardDropdownOpen(!isWardDropdownOpen);
                      }}
                    >
                      <span className={selectedWards.length > 0 ? "text-[#16274D]" : "text-gray-400"}>
                        {selectedWards.length > 0 
                          ? selectedWards.length === wardOptions.length 
                            ? 'All wards selected'
                            : selectedWards.join(', ')
                          : 'Select wards'
                        }
                      </span>
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${isWardDropdownOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {isWardDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white border-2 border-[#4EBEE3] rounded-lg p-3 space-y-2.5 max-h-[200px] overflow-y-auto shadow-lg">
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
                )}
              </div>

              {/* Send Options */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Send Options</label>
                <select
                  value={sendOption}
                  onChange={(e) => setSendOption(e.target.value as 'now' | 'schedule' | 'recurring')}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif] bg-white text-[#16274D] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="now">Send Now</option>
                  <option value="schedule">Schedule</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              {/* Schedule Type Options (shown only when Schedule is selected) */}
              {sendOption === 'schedule' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-3">Schedule Type</label>
                  <div className="flex flex-col gap-3">
                    {/* Custom */}
                    <CustomRadio
                      checked={scheduleType === 'custom'}
                      onChange={() => setScheduleType('custom')}
                      label="Custom"
                      name="scheduleType"
                    />
                    
                    {/* Upon Admission */}
                    <div className="flex items-center gap-2 group">
                      <CustomRadio
                        checked={scheduleType === 'admission'}
                        onChange={() => setScheduleType('admission')}
                        label="Upon Admission"
                        name="scheduleType"
                      />
                      <div className="relative inline-flex">
                        <Info size={14} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors cursor-help" strokeWidth={2} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif]">
                          Sends the notification 30 minutes after the patient's admission time recorded in HIS
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                            <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upon Discharge */}
                    <div className="flex items-center gap-2 group">
                      <CustomRadio
                        checked={scheduleType === 'discharge'}
                        onChange={() => setScheduleType('discharge')}
                        label="Upon Discharge"
                        name="scheduleType"
                      />
                      <div className="relative inline-flex">
                        <Info size={14} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors cursor-help" strokeWidth={2} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif]">
                          Sends the notification 30 minutes after the HIS marks the patient as discharged
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                            <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Date/Time (shown only when Schedule → Custom is selected) */}
              {sendOption === 'schedule' && scheduleType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Clock size={14} className="inline mr-1" />
                      Schedule Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>
                </div>
              )}

              {/* Recurring Frequency (shown only when Recurring is selected) */}
              {sendOption === 'recurring' && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-3">Recurring Frequency</label>
                    <div className="flex flex-col gap-3">
                      {/* Daily */}
                      <CustomRadio
                        checked={recurringFrequency === 'daily'}
                        onChange={() => setRecurringFrequency('daily')}
                        label="Daily"
                        name="recurringFrequency"
                      />
                      
                      {/* Weekly */}
                      <CustomRadio
                        checked={recurringFrequency === 'weekly'}
                        onChange={() => setRecurringFrequency('weekly')}
                        label="Weekly"
                        name="recurringFrequency"
                      />
                      
                      {/* Monthly */}
                      <CustomRadio
                        checked={recurringFrequency === 'monthly'}
                        onChange={() => setRecurringFrequency('monthly')}
                        label="Monthly"
                        name="recurringFrequency"
                      />
                    </div>
                  </div>

                  {/* Time Picker for Recurring */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Clock size={14} className="inline mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>

                  {/* Weekly Days Selection */}
                  {recurringFrequency === 'weekly' && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#16274D] mb-2">Select Days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (selectedDays.includes(day)) {
                                setSelectedDays(selectedDays.filter(d => d !== day));
                              } else {
                                setSelectedDays([...selectedDays, day]);
                              }
                            }}
                            className={`px-2 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all border-2 ${
                              selectedDays.includes(day)
                                ? 'bg-[#4EBEE3] text-white border-[#4EBEE3]'
                                : 'bg-white text-[#16274D] border-gray-300 hover:border-[#4EBEE3]'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Configuration */}
                  {recurringFrequency === 'monthly' && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#16274D] mb-2">Recurrence Pattern</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Every</span>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={monthInterval}
                          onChange={(e) => setMonthInterval(e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                        />
                        <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Month(s) on day</span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={monthDay}
                          onChange={(e) => setMonthDay(e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNotification}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                {sendOption === 'now' ? 'Send Now' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {isEditModalOpen && editingNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Edit Notification</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Title</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Enter English title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">English Description</label>
                <textarea
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  placeholder="Enter English description (with emoji if desired)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Title</label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="أدخل العنوان بالعربية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Arabic Description</label>
                <textarea
                  value={bodyAr}
                  onChange={(e) => setBodyAr(e.target.value)}
                  placeholder="أدخل الوصف بالعربية (مع الإيموجي إن أ��دت)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D] resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Audience</label>
                <MultiSelectDropdown
                  options={['Adults', 'Kids', 'VIP']}
                  selectedValues={audience}
                  onChange={setAudience}
                  placeholder="Select audience"
                />
              </div>

              {/* Send Options */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] mb-2">Send Options</label>
                <select
                  value={sendOption}
                  onChange={(e) => setSendOption(e.target.value as 'now' | 'schedule' | 'recurring')}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif] bg-white text-[#16274D] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="now">Send Now</option>
                  <option value="schedule">Schedule</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              {/* Schedule Type Options (shown only when Schedule is selected) */}
              {sendOption === 'schedule' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#16274D] mb-3">Schedule Type</label>
                  <div className="flex flex-col gap-3">
                    {/* Custom */}
                    <CustomRadio
                      checked={scheduleType === 'custom'}
                      onChange={() => setScheduleType('custom')}
                      label="Custom"
                      name="scheduleType"
                    />
                    
                    {/* Upon Admission */}
                    <div className="flex items-center gap-2 group">
                      <CustomRadio
                        checked={scheduleType === 'admission'}
                        onChange={() => setScheduleType('admission')}
                        label="Upon Admission"
                        name="scheduleType"
                      />
                      <div className="relative inline-flex">
                        <Info size={14} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors cursor-help" strokeWidth={2} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif]">
                          Sends the notification 30 minutes after the patient's admission time recorded in HIS
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                            <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upon Discharge */}
                    <div className="flex items-center gap-2 group">
                      <CustomRadio
                        checked={scheduleType === 'discharge'}
                        onChange={() => setScheduleType('discharge')}
                        label="Upon Discharge"
                        name="scheduleType"
                      />
                      <div className="relative inline-flex">
                        <Info size={14} className="text-[#6B7280] hover:text-[#4EBEE3] transition-colors cursor-help" strokeWidth={2} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999] bg-white text-[#16274D] text-[12px] px-3 py-2 rounded-lg shadow-xl border border-gray-200 whitespace-nowrap font-['Poppins',sans-serif]">
                          Sends the notification 30 minutes after the HIS marks the patient as discharged
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                            <div className="border-4 border-transparent border-b-white" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Date/Time (shown only when Schedule → Custom is selected) */}
              {sendOption === 'schedule' && scheduleType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Clock size={14} className="inline mr-1" />
                      Schedule Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>
                </div>
              )}

              {/* Recurring Frequency (shown only when Recurring is selected) */}
              {sendOption === 'recurring' && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-3">Recurring Frequency</label>
                    <div className="flex flex-col gap-3">
                      {/* Daily */}
                      <CustomRadio
                        checked={recurringFrequency === 'daily'}
                        onChange={() => setRecurringFrequency('daily')}
                        label="Daily"
                        name="recurringFrequency"
                      />
                      
                      {/* Weekly */}
                      <CustomRadio
                        checked={recurringFrequency === 'weekly'}
                        onChange={() => setRecurringFrequency('weekly')}
                        label="Weekly"
                        name="recurringFrequency"
                      />
                      
                      {/* Monthly */}
                      <CustomRadio
                        checked={recurringFrequency === 'monthly'}
                        onChange={() => setRecurringFrequency('monthly')}
                        label="Monthly"
                        name="recurringFrequency"
                      />
                    </div>
                  </div>

                  {/* Time Picker for Recurring */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#16274D] mb-2">
                      <Clock size={14} className="inline mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                      style={{ accentColor: '#4EBEE3' }}
                    />
                  </div>

                  {/* Weekly Days Selection */}
                  {recurringFrequency === 'weekly' && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#16274D] mb-2">Select Days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (selectedDays.includes(day)) {
                                setSelectedDays(selectedDays.filter(d => d !== day));
                              } else {
                                setSelectedDays([...selectedDays, day]);
                              }
                            }}
                            className={`px-2 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all border-2 ${
                              selectedDays.includes(day)
                                ? 'bg-[#4EBEE3] text-white border-[#4EBEE3]'
                                : 'bg-white text-[#16274D] border-gray-300 hover:border-[#4EBEE3]'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Configuration */}
                  {recurringFrequency === 'monthly' && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#16274D] mb-2">Recurrence Pattern</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Every</span>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={monthInterval}
                          onChange={(e) => setMonthInterval(e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                        />
                        <span className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">Month(s) on day</span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={monthDay}
                          onChange={(e) => setMonthDay(e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] text-[#16274D]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditNotification}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-['Poppins',sans-serif]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D]">Delete Notification</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-[#6B7280]">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-all text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNotification(deleteConfirmId)}
                className="px-5 py-2.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-all text-[14px] font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}