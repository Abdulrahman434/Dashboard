import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Bell, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, Users, X, Edit3, Repeat, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';

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
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringDays?: string[];
  recurringDayOfMonth?: number;
  recurringEndDate?: string;
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
    bodyAr: '🌙 نتمنى لكم رمضان مباركاً. نسأل الله أن يحمل لكم هذا الشهر الراحة والطمأنينة خلال إامتكم.',
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
    timestamp: '2025-12-15 20:00',
    scheduleDate: '2025-12-15',
    scheduleTime: '20:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    recurringFrequency: 'daily',
    targeted: 45,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '5',
    titleEn: 'New Game Added',
    titleAr: 'لعبة جديدة متاحة',
    bodyEn: '🎮 Candy Crush has been added to your entertainment system. Enjoy playing!',
    bodyAr: '🎮 تمت إضافة لعبة Candy Crush إلى نظام الترفيه. استمتع باللعب!',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Sent',
    timestamp: '2025-12-10 12:00',
    scheduleDate: '2025-12-10',
    scheduleTime: '12:00',
    scheduleType: 'custom',
    sendOption: 'now',
    targeted: 230,
    delivered: 228,
    acknowledged: 195
  },
  {
    id: '6',
    titleEn: 'Ramadan Visit Hours Update',
    titleAr: 'تحديث ساعات الزيارة في رمضان',
    bodyEn: '🌙 During Ramadan, visiting hours are adjusted to 4:00 PM - 9:00 PM. Thank you for your understanding.',
    bodyAr: '🌙 خلال شهر رمضان، تم تعديل ساعات الزيارة لتكون من 4:00 م - 9:00 م. شكراً لتفهمكم.',
    audience: ['Adults', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'VIP'],
    status: 'Sent',
    timestamp: '2025-12-09 14:00',
    scheduleDate: '2025-12-09',
    scheduleTime: '14:00',
    scheduleType: 'custom',
    sendOption: 'now',
    targeted: 120,
    delivered: 118,
    acknowledged: 103
  },
  {
    id: '7',
    titleEn: 'Morning Greeting',
    titleAr: 'تحية الصباح',
    bodyEn: '☀️ Good morning! We wish you a comfortable and pleasant day.',
    bodyAr: '☀️ صباح الخير! نتمنى لك يوماً مريحاً وممتعاً.',
    audience: ['Adults', 'Kids', 'VIP'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults', 'Kids', 'VIP'],
    status: 'Scheduled',
    timestamp: '2025-12-20 08:00',
    scheduleDate: '2025-12-20',
    scheduleTime: '08:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    recurringFrequency: 'daily',
    targeted: 200,
    delivered: 0,
    acknowledged: 0
  },
  {
    id: '8',
    titleEn: 'Post-Surgery Care Instructions',
    titleAr: 'تعليمات الرعاية بعد الجراحة',
    bodyEn: 'Please follow the post-operative care guidelines provided by your surgeon. Contact us if you experience any unusual symptoms.',
    bodyAr: 'يرجى اتباع إرشادات الرعاية بعد العملية المقدمة من الجراح. اتصل بنا إذا واجهت أي أعراض غير عادية.',
    audience: ['Adults'],
    recipientType: 'patient-groups',
    selectedGroups: ['Adults'],
    status: 'Scheduled',
    timestamp: '2025-12-14 10:00',
    scheduleDate: '2025-12-14',
    scheduleTime: '10:00',
    scheduleType: 'custom',
    sendOption: 'schedule',
    targeted: 28,
    delivered: 0,
    acknowledged: 0
  }
];

export default function NotificationsPageCalendar() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_notifications_calendar');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return getInitialNotifications();
        }
      }
    }
    return getInitialNotifications();
  });

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Sent' | 'Scheduled'>('All');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [showDatePopup, setShowDatePopup] = useState(false);
  const [popupDate, setPopupDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    bodyEn: '',
    bodyAr: '',
    selectedGroups: [] as string[],
    scheduleDate: '',
    scheduleTime: '',
    status: 'Scheduled' as 'Send Now' | 'Scheduled',
    isRecurring: false,
    recurringType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringDays: [] as string[], // For weekly: ['Mon', 'Wed', 'Fri']
    recurringDayOfMonth: 1, // For monthly: 1-31
    recurringEndDate: '', // Optional end date for recurring
  });

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_notifications_calendar', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.bodyEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.titleAr.includes(searchQuery) ||
      n.bodyAr.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'All' || n.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // For calendar view, only show scheduled notifications (not "Send Now" ones)
  const calendarNotifications = notifications.filter(n => 
    n.status === 'Scheduled' && n.scheduleDate && n.scheduleTime
  );

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Check if a recurring notification occurs on a given date
  const notificationOccursOnDate = (notification: Notification, date: Date): boolean => {
    if (!notification.scheduleDate || !notification.recurringFrequency) {
      return false;
    }

    const startDate = new Date(notification.scheduleDate);
    startDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Check if date is before start date
    if (checkDate < startDate) {
      return false;
    }

    // Check if date is after end date (if specified)
    if (notification.recurringEndDate) {
      const endDate = new Date(notification.recurringEndDate);
      endDate.setHours(0, 0, 0, 0);
      if (checkDate > endDate) {
        return false;
      }
    }

    // Check based on frequency type
    switch (notification.recurringFrequency) {
      case 'daily':
        return true;

      case 'weekly':
        if (!notification.recurringDays || notification.recurringDays.length === 0) {
          return false;
        }
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[checkDate.getDay()];
        return notification.recurringDays.includes(dayName);

      case 'monthly':
        if (!notification.recurringDayOfMonth) {
          return false;
        }
        return checkDate.getDate() === notification.recurringDayOfMonth;

      case 'yearly':
        return checkDate.getMonth() === startDate.getMonth() && 
               checkDate.getDate() === startDate.getDate();

      default:
        return false;
    }
  };

  const getNotificationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return filteredNotifications.filter(n => {
      // Direct match
      if (n.scheduleDate === dateStr) {
        return true;
      }
      
      // Recurring match
      if (n.recurringFrequency && notificationOccursOnDate(n, date)) {
        return true;
      }
      
      return false;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  // Calculate metrics
  const totalScheduled = notifications.filter(n => n.status === 'Scheduled').length;
  const totalSent = notifications.filter(n => n.status === 'Sent').length;
  const upcomingThisMonth = notifications.filter(n => {
    if (n.status !== 'Scheduled' || !n.scheduleDate) return false;
    const notifDate = new Date(n.scheduleDate);
    return notifDate.getMonth() === month && notifDate.getFullYear() === year;
  }).length;
  const sentThisMonth = notifications.filter(n => {
    if (n.status !== 'Sent' || !n.scheduleDate) return false;
    const notifDate = new Date(n.scheduleDate);
    return notifDate.getMonth() === month && notifDate.getFullYear() === year;
  }).length;

  // Modal handlers
  const openAddModal = () => {
    setEditingNotification(null);
    setFormData({
      titleEn: '',
      titleAr: '',
      bodyEn: '',
      bodyAr: '',
      selectedGroups: [],
      scheduleDate: '',
      scheduleTime: '',
      status: 'Scheduled',
      isRecurring: false,
      recurringType: 'daily',
      recurringDays: [],
      recurringDayOfMonth: 1,
      recurringEndDate: '',
    });
    setShowAddEditModal(true);
  };

  const openAddModalForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setEditingNotification(null);
    setFormData({
      titleEn: '',
      titleAr: '',
      bodyEn: '',
      bodyAr: '',
      selectedGroups: [],
      scheduleDate: dateStr,
      scheduleTime: '09:00',
      status: 'Scheduled',
      isRecurring: false,
      recurringType: 'daily',
      recurringDays: [],
      recurringDayOfMonth: 1,
      recurringEndDate: '',
    });
    setShowAddEditModal(true);
  };

  const openEditModal = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      titleEn: notification.titleEn,
      titleAr: notification.titleAr,
      bodyEn: notification.bodyEn,
      bodyAr: notification.bodyAr,
      selectedGroups: notification.selectedGroups || [],
      scheduleDate: notification.scheduleDate || '',
      scheduleTime: notification.scheduleTime || '',
      status: notification.status,
      isRecurring: !!notification.recurringFrequency,
      recurringType: notification.recurringFrequency || 'daily',
      recurringDays: notification.recurringDays || [],
      recurringDayOfMonth: notification.recurringDayOfMonth || 1,
      recurringEndDate: notification.recurringEndDate || '',
    });
    setShowAddEditModal(true);
  };

  const handleSaveNotification = () => {
    // Validation
    if (!formData.titleEn.trim() || !formData.titleAr.trim()) {
      toast.error('Please provide both English and Arabic titles');
      return;
    }
    if (!formData.bodyEn.trim() || !formData.bodyAr.trim()) {
      toast.error('Please provide both English and Arabic messages');
      return;
    }
    if (formData.selectedGroups.length === 0) {
      toast.error('Please select at least one audience group');
      return;
    }
    
    // Only validate date/time if not "Send Now"
    if (formData.status === 'Scheduled') {
      if (!formData.scheduleDate || !formData.scheduleTime) {
        toast.error('Please provide schedule date and time');
        return;
      }
      
      // Validate recurring settings
      if (formData.isRecurring) {
        if (formData.recurringType === 'weekly' && formData.recurringDays.length === 0) {
          toast.error('Please select at least one day for weekly recurrence');
          return;
        }
      }
    }

    if (editingNotification) {
      // Update existing
      setNotifications(notifications.map(n => 
        n.id === editingNotification.id
          ? {
              ...n,
              titleEn: formData.titleEn,
              titleAr: formData.titleAr,
              bodyEn: formData.bodyEn,
              bodyAr: formData.bodyAr,
              audience: formData.selectedGroups,
              selectedGroups: formData.selectedGroups,
              scheduleDate: formData.scheduleDate,
              scheduleTime: formData.scheduleTime,
              timestamp: `${formData.scheduleDate} ${formData.scheduleTime}`,
              status: formData.status,
              recurringFrequency: formData.isRecurring ? formData.recurringType : undefined,
              recurringDays: formData.isRecurring && formData.recurringType === 'weekly' ? formData.recurringDays : undefined,
              recurringDayOfMonth: formData.isRecurring && formData.recurringType === 'monthly' ? formData.recurringDayOfMonth : undefined,
              recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
            }
          : n
      ));
      toast.success('Notification updated successfully');
    } else {
      // Add new
      const newNotification: Notification = {
        id: Date.now().toString(),
        titleEn: formData.titleEn,
        titleAr: formData.titleAr,
        bodyEn: formData.bodyEn,
        bodyAr: formData.bodyAr,
        audience: formData.selectedGroups,
        selectedGroups: formData.selectedGroups,
        recipientType: 'patient-groups',
        status: formData.status,
        timestamp: `${formData.scheduleDate} ${formData.scheduleTime}`,
        scheduleDate: formData.scheduleDate,
        scheduleTime: formData.scheduleTime,
        scheduleType: 'custom',
        sendOption: formData.status === 'Scheduled' ? 'schedule' : 'now',
        recurringFrequency: formData.isRecurring ? formData.recurringType : undefined,
        recurringDays: formData.isRecurring && formData.recurringType === 'weekly' ? formData.recurringDays : undefined,
        recurringDayOfMonth: formData.isRecurring && formData.recurringType === 'monthly' ? formData.recurringDayOfMonth : undefined,
        recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
        targeted: formData.selectedGroups.length * 50, // Mock data
        delivered: formData.status === 'Sent' ? formData.selectedGroups.length * 48 : 0,
        acknowledged: formData.status === 'Sent' ? formData.selectedGroups.length * 40 : 0,
      };
      setNotifications([...notifications, newNotification]);
      toast.success(formData.isRecurring ? 'Recurring notification created successfully' : 'Notification created successfully');
    }

    setShowAddEditModal(false);
    setEditingNotification(null);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleSendAgain = (notification: Notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      status: 'Sent',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduleDate: new Date().toISOString().split('T')[0],
      scheduleTime: new Date().toTimeString().slice(0, 5),
    };
    setNotifications([...notifications, newNotification]);
    toast.success('Notification sent again successfully');
  };

  const handleSendNow = (notification: Notification) => {
    setNotifications(notifications.map(n => 
      n.id === notification.id 
        ? {
            ...n,
            status: 'Sent' as const,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            scheduleDate: new Date().toISOString().split('T')[0],
            scheduleTime: new Date().toTimeString().slice(0, 5),
            delivered: n.targeted,
            acknowledged: Math.floor(n.targeted * 0.8),
          }
        : n
    ));
    toast.success('Notification sent successfully');
  };

  const toggleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter(g => g !== group)
        : [...prev.selectedGroups, group]
    }));
  };

  const patientGroups = ['Adults', 'Kids', 'VIP'];

  // Handle date click - Google Calendar style
  const handleDateClick = (date: Date) => {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    
    const dayNotifications = getNotificationsForDate(date);
    
    if (dayNotifications.length === 0) {
      // Empty date - check if it's past
      if (clickedDate < today) {
        toast.error('Cannot add notifications to past dates');
        return;
      }
      // Open add modal for future/today dates
      openAddModalForDate(date);
    } else {
      // Has notifications - show in side panel (works for past and future)
      setSelectedDate(date);
    }
  };

  // Get today's date string for min date validation
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Toggle recurring day
  const toggleRecurringDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Notifications
              </h2>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Visualize and manage scheduled notifications
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-['Poppins',sans-serif] text-[13px] font-medium ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#4EBEE3] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={16} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-['Poppins',sans-serif] text-[13px] font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-[#4EBEE3] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Total Scheduled</span>
            <Clock size={16} className="text-[#4EBEE3]" />
          </div>
          <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {totalScheduled}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Total Sent</span>
            <Bell size={16} className="text-green-500" />
          </div>
          <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {totalSent}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">This Month ({monthNames[month]})</span>
            <CalendarIcon size={16} className="text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-[28px] font-semibold text-[#4EBEE3] font-['Poppins',sans-serif]">
              {upcomingThisMonth}
            </div>
            <div className="text-[16px] text-gray-400 font-['Poppins',sans-serif]">/</div>
            <div className="text-[28px] font-semibold text-green-600 font-['Poppins',sans-serif]">
              {sentThisMonth}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-[#4EBEE3] font-['Poppins',sans-serif]">Scheduled</span>
            <span className="text-[11px] text-green-600 font-['Poppins',sans-serif]">Sent</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
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
        </div>

        <button
          onClick={() => {
            // Check if selected date is in the past
            if (selectedDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selected = new Date(selectedDate);
              selected.setHours(0, 0, 0, 0);
              
              if (selected < today) {
                toast.error('Cannot add notifications to past dates');
                return;
              }
            }
            openAddModal();
          }}
          disabled={(() => {
            if (!selectedDate) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDate);
            selected.setHours(0, 0, 0, 0);
            return selected < today;
          })()}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium ${
            (() => {
              if (!selectedDate) return 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white shadow-sm';
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selected = new Date(selectedDate);
              selected.setHours(0, 0, 0, 0);
              return selected < today
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white shadow-sm';
            })()
          }`}
        >
          <Plus size={18} strokeWidth={2} />
          Add Notification
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-[#F8FAFC] border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    {monthNames[month]} {year}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToToday}
                      className="px-3 py-1.5 text-[13px] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors font-['Poppins',sans-serif] font-medium"
                    >
                      Today
                    </button>
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[12px] font-semibold text-gray-600 font-['Poppins',sans-serif] py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(year, month, day);
                    const dayNotifications = getNotificationsForDate(date);
                    const scheduledCount = dayNotifications.filter(n => n.status === 'Scheduled').length;
                    const sentCount = dayNotifications.filter(n => n.status === 'Sent').length;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(date)}
                        className={`aspect-square p-2 rounded-lg transition-all relative group ${
                          isToday(day)
                            ? 'bg-[#4EBEE3] text-white shadow-md'
                            : isSelectedDate(day)
                            ? 'bg-[#4EBEE3]/20 border-2 border-[#4EBEE3]'
                            : dayNotifications.length > 0
                            ? 'bg-[#4EBEE3]/5 hover:bg-[#4EBEE3]/10 border border-[#4EBEE3]/20'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className={`text-[14px] font-medium font-['Poppins',sans-serif] ${
                          isToday(day) ? 'text-white' : 'text-[#16274D]'
                        }`}>
                          {day}
                        </div>

                        {/* Notification indicators */}
                        {dayNotifications.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                            {scheduledCount > 0 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isToday(day) ? 'bg-white' : 'bg-[#4EBEE3]'
                              }`} />
                            )}
                            {sentCount > 0 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isToday(day) ? 'bg-white/70' : 'bg-green-500'
                              }`} />
                            )}
                          </div>
                        )}

                        {/* Hover tooltip */}
                        {dayNotifications.length > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 bg-[#0f1729] text-white text-[11px] px-2 py-1 rounded font-['Poppins',sans-serif] whitespace-nowrap">
                            {dayNotifications.length} notification{dayNotifications.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4EBEE3]" />
                    <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4EBEE3] ring-2 ring-[#4EBEE3] ring-offset-1" />
                    <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel - Selected Date Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-8">
              <div className="bg-[#F8FAFC] border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    {selectedDate 
                      ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                      : 'Select a date'
                    }
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {selectedDate ? (
                  <>
                    {/* Add button for selected date */}
                    <button
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selected = new Date(selectedDate);
                        selected.setHours(0, 0, 0, 0);
                        
                        if (selected < today) {
                          toast.error('Cannot add notifications to past dates');
                          return;
                        }
                        openAddModalForDate(selectedDate);
                      }}
                      disabled={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selected = new Date(selectedDate);
                        selected.setHours(0, 0, 0, 0);
                        return selected < today;
                      })()}
                      className={`w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium ${
                        (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selected = new Date(selectedDate);
                          selected.setHours(0, 0, 0, 0);
                          return selected < today;
                        })()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white shadow-sm'
                      }`}
                    >
                      <Plus size={16} strokeWidth={2} />
                      Add Notification to this Date
                    </button>

                    {getNotificationsForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-8">
                        <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                          No notifications on this date
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getNotificationsForDate(selectedDate).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              notification.status === 'Scheduled'
                                ? 'bg-[#4EBEE3]/5 border-[#4EBEE3]/30 hover:border-[#4EBEE3]'
                                : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                                  {notification.titleEn}
                                </h4>
                                <h4 className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1" dir="rtl">
                                  {notification.titleAr}
                                </h4>
                                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] line-clamp-2 mb-1">
                                  {notification.bodyEn}
                                </p>
                                <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] line-clamp-1" dir="rtl">
                                  {notification.bodyAr}
                                </p>
                              </div>
                              <span className={`text-[10px] px-2 py-1 rounded-full font-['Poppins',sans-serif] font-medium ${
                                notification.status === 'Scheduled'
                                  ? 'bg-[#4EBEE3]/20 text-[#4EBEE3]'
                                  : 'bg-green-200 text-green-800'
                              }`}>
                                {notification.status}
                              </span>
                            </div>

                            {/* Time & Audience */}
                            <div className="flex items-center gap-3 text-[11px] text-gray-600 font-['Poppins',sans-serif] mb-2">
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {notification.scheduleTime}
                              </div>
                              {notification.recurringFrequency && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <Repeat size={12} />
                                  <span className="capitalize">{notification.recurringFrequency}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users size={12} />
                                {notification.audience.join(', ')}
                              </div>
                            </div>

                            {/* Metrics for sent notifications */}
                            {notification.status === 'Sent' && (
                              <div className="flex items-center gap-3 text-[11px] font-['Poppins',sans-serif] pt-2 border-t border-gray-200">
                                <div>
                                  <span className="text-gray-500">Targeted:</span>{' '}
                                  <span className="font-semibold text-[#16274D]">{notification.targeted}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Delivered:</span>{' '}
                                  <span className="font-semibold text-green-600">{notification.delivered}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Ack:</span>{' '}
                                  <span className="font-semibold text-[#4EBEE3]">{notification.acknowledged}</span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-2">
                              {notification.status === 'Sent' ? (
                                <button
                                  onClick={() => handleSendAgain(notification)}
                                  className="flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors font-['Poppins',sans-serif] text-[#4EBEE3] hover:bg-[#4EBEE3]/10"
                                >
                                  <RefreshCw size={12} />
                                  Send Again
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSendNow(notification)}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors font-['Poppins',sans-serif] text-green-600 hover:bg-green-50"
                                  >
                                    <Send size={12} />
                                    Send Now
                                  </button>
                                  {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const selected = selectedDate ? new Date(selectedDate) : null;
                                    if (selected) selected.setHours(0, 0, 0, 0);
                                    const isPast = selected && selected < today;
                                    
                                    return (
                                      <button
                                        onClick={() => {
                                          if (isPast) {
                                            toast.error('Cannot edit past notifications');
                                            return;
                                          }
                                          openEditModal(notification);
                                        }}
                                        disabled={isPast}
                                        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors font-['Poppins',sans-serif] ${
                                          isPast
                                            ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                      >
                                        <Edit3 size={12} />
                                        Edit
                                      </button>
                                    );
                                  })()}
                                  {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const selected = selectedDate ? new Date(selectedDate) : null;
                                    if (selected) selected.setHours(0, 0, 0, 0);
                                    const isPast = selected && selected < today;
                                    
                                    return (
                                      <button
                                        onClick={() => {
                                          if (isPast) {
                                            toast.error('Cannot delete past notifications');
                                            return;
                                          }
                                          handleDeleteNotification(notification.id);
                                        }}
                                        disabled={isPast}
                                        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors font-['Poppins',sans-serif] ${
                                          isPast
                                            ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                            : 'text-red-600 hover:bg-red-50'
                                        }`}
                                      >
                                        <Trash2 size={12} />
                                        Delete
                                      </button>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mb-1">
                      Click on a date
                    </p>
                    <p className="text-[12px] text-gray-400 font-['Poppins',sans-serif]">
                      to view notifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
                    No notifications found
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      notification.status === 'Scheduled'
                        ? 'bg-[#4EBEE3]/5 border-[#4EBEE3]/30 hover:border-[#4EBEE3] hover:shadow-md'
                        : 'bg-green-50 border-green-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
                              {notification.titleEn}
                            </h4>
                            <h4 className="text-[14px] font-semibold text-[#16274D]/80 font-['Poppins',sans-serif]" dir="rtl">
                              {notification.titleAr}
                            </h4>
                          </div>
                          <span className={`text-[11px] px-2 py-1 rounded-full font-['Poppins',sans-serif] font-medium shrink-0 ${
                            notification.status === 'Scheduled'
                              ? 'bg-[#4EBEE3]/20 text-[#4EBEE3]'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">
                          {notification.bodyEn}
                        </p>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-3" dir="rtl">
                          {notification.bodyAr}
                        </p>

                        <div className="flex items-center gap-4 text-[12px] text-gray-600 font-['Poppins',sans-serif]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {notification.scheduleDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {notification.scheduleTime}
                          </div>
                          {notification.recurringFrequency && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Repeat size={14} />
                              <span className="capitalize">{notification.recurringFrequency}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {notification.audience.join(', ')}
                          </div>
                        </div>

                        {notification.status === 'Sent' && (
                          <div className="flex items-center gap-4 text-[12px] font-['Poppins',sans-serif] mt-2 pt-2 border-t border-gray-200">
                            <div>
                              <span className="text-gray-500">Targeted:</span>{' '}
                              <span className="font-semibold text-[#16274D]">{notification.targeted}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Delivered:</span>{' '}
                              <span className="font-semibold text-green-600">{notification.delivered}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Acknowledged:</span>{' '}
                              <span className="font-semibold text-[#4EBEE3]">{notification.acknowledged}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {notification.status === 'Sent' ? (
                          <button
                            onClick={() => handleSendAgain(notification)}
                            className="flex items-center gap-2 px-3 py-2 text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                          >
                            <RefreshCw size={16} />
                            Send Again
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSendNow(notification)}
                              className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                            >
                              <Send size={16} />
                              Send Now
                            </button>
                            <button
                              onClick={() => openEditModal(notification)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-[#F8FAFC] border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                {editingNotification ? 'Edit Notification' : 'Add New Notification'}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* English Title */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Enter notification title in English"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif]"
                  />
                </div>

                {/* Arabic Title */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="أدخل عنوان الإشعار بالعربية"
                    dir="rtl"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif]"
                  />
                </div>

                {/* English Message */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                    Message (English)
                  </label>
                  <textarea
                    value={formData.bodyEn}
                    onChange={(e) => setFormData({ ...formData, bodyEn: e.target.value })}
                    placeholder="Enter notification message in English"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] resize-none"
                  />
                </div>

                {/* Arabic Message */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                    Message (Arabic)
                  </label>
                  <textarea
                    value={formData.bodyAr}
                    onChange={(e) => setFormData({ ...formData, bodyAr: e.target.value })}
                    placeholder="أدخل رسالة الإشعار بالعربية"
                    dir="rtl"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] resize-none"
                  />
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                    Audience
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {patientGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => toggleGroup(group)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                          formData.selectedGroups.includes(group)
                            ? 'bg-[#4EBEE3] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send Option Selection */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                    When to Send
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Scheduled' })}
                      className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                        formData.status === 'Scheduled'
                          ? 'bg-[#4EBEE3] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Schedule for Later
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Send Now' })}
                      className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                        formData.status === 'Send Now'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Send Now
                    </button>
                  </div>
                  
                  {/* Send Now notification */}
                  {formData.status === 'Send Now' && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-[12px] text-green-800 font-['Poppins',sans-serif]">
                        ✓ This notification will be sent immediately to all selected patients
                      </p>
                    </div>
                  )}
                </div>

                {/* Date and Time - Only show when Scheduled */}
                {formData.status === 'Scheduled' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                        Schedule Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                        min={getTodayDateString()}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                        Schedule Time
                      </label>
                      <input
                        type="time"
                        value={formData.scheduleTime}
                        onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif]"
                      />
                    </div>
                  </div>

                  {/* Recurring Checkbox */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                      <span className="text-[13px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                        Repeat this notification
                      </span>
                    </label>
                  </div>

                  {/* Recurring Settings */}
                  {formData.isRecurring && (
                    <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-4 border border-gray-200">
                      {/* Frequency Selector */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                          Repeat Frequency
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({ ...formData, recurringType: type })}
                              className={`px-3 py-2 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all capitalize ${
                                formData.recurringType === type
                                  ? 'bg-[#4EBEE3] text-white shadow-sm'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Weekly - Day Selection */}
                      {formData.recurringType === 'weekly' && (
                        <div>
                          <label className="block text-[13px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                            Repeat On
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleRecurringDay(day)}
                                className={`w-10 h-10 rounded-lg text-[12px] font-medium font-['Poppins',sans-serif] transition-all ${
                                  formData.recurringDays.includes(day)
                                    ? 'bg-[#4EBEE3] text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                          {formData.recurringDays.length > 0 && (
                            <p className="text-[11px] text-gray-600 mt-2 font-['Poppins',sans-serif]">
                              Repeats every {formData.recurringDays.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Monthly - Day of Month */}
                      {formData.recurringType === 'monthly' && (
                        <div>
                          <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                            Day of Month
                          </label>
                          <select
                            value={formData.recurringDayOfMonth}
                            onChange={(e) => setFormData({ ...formData, recurringDayOfMonth: parseInt(e.target.value) })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] bg-white"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <option key={day} value={day}>
                                Day {day} of every month
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Yearly description */}
                      {formData.recurringType === 'yearly' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                            Will repeat every year on {formData.scheduleDate ? new Date(formData.scheduleDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'the selected date'}
                          </p>
                        </div>
                      )}

                      {/* Daily description */}
                      {formData.recurringType === 'daily' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-[12px] text-purple-800 font-['Poppins',sans-serif]">
                            Will repeat every day at {formData.scheduleTime || '09:00'}
                          </p>
                        </div>
                      )}

                      {/* End Date */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                          min={formData.scheduleDate || getTodayDateString()}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] text-[14px] font-['Poppins',sans-serif] bg-white"
                        />
                        <p className="text-[11px] text-gray-500 mt-1 font-['Poppins',sans-serif]">
                          Leave empty to repeat indefinitely
                        </p>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddEditModal(false)}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotification}
                className="px-4 py-2 text-[14px] font-medium bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] shadow-sm"
              >
                {editingNotification ? 'Update Notification' : 'Create Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}