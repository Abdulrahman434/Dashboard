import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Plus, X, Trash2, Search, AlertTriangle, Rss, Settings, Upload, Minus, FileText, Link2, Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import InlineTextarea from './InlineTextarea';
import { SingleSelectDropdown } from './UnifiedDropdown';

interface NewsFeed {
  id: string;
  type: 'manual' | 'rss';
  title: string;
  englishDescription?: string;
  arabicDescription?: string;
  feedUrlEn?: string;
  feedUrlAr?: string;
  siteNews?: boolean;
  selected: boolean;
}

interface NewsConfiguration {
  width: string;
  alignment: 'left' | 'center' | 'right';
  activate: boolean;
  breakerIcon: string | null;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-[#EF4444]" strokeWidth={2} />
          </div>
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {title}
          </h3>
        </div>

        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6 ml-15">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddNewsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: 'manual' | 'rss', title: string, englishDescription: string, arabicDescription: string, feedUrlEn: string, feedUrlAr: string, siteNews: boolean) => void;
}

function AddNewsFeedModal({ isOpen, onClose, onSave }: AddNewsFeedModalProps) {
  const [newsType, setNewsType] = useState<'manual' | 'rss'>('manual');
  const [title, setTitle] = useState('');
  const [englishDescription, setEnglishDescription] = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  const [feedUrlEn, setFeedUrlEn] = useState('');
  const [feedUrlAr, setFeedUrlAr] = useState('');
  const [siteNews, setSiteNews] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (newsType === 'manual') {
      if (title.trim() && englishDescription.trim() && arabicDescription.trim()) {
        onSave(newsType, title, englishDescription, arabicDescription, '', '', false);
        resetForm();
      } else {
        toast.error('Please fill in all fields');
      }
    } else {
      if (title.trim() && feedUrlEn.trim() && feedUrlAr.trim()) {
        onSave(newsType, title, '', '', feedUrlEn, feedUrlAr, siteNews);
        resetForm();
      } else {
        toast.error('Please fill in feed name and URL');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setEnglishDescription('');
    setArabicDescription('');
    setFeedUrlEn('');
    setFeedUrlAr('');
    setSiteNews(false);
    setNewsType('manual');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Add News Feed
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            News Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setNewsType('manual')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-['Poppins',sans-serif] text-[14px] font-medium flex items-center justify-center gap-2 ${
                newsType === 'manual'
                  ? 'bg-[#4EBEE3]/10 border-[#4EBEE3] text-[#4EBEE3]'
                  : 'bg-white border-gray-200 text-[#16274D] hover:border-gray-300'
              }`}
            >
              <FileText size={18} strokeWidth={2} />
              Manual News
            </button>
            <button
              onClick={() => setNewsType('rss')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-['Poppins',sans-serif] text-[14px] font-medium flex items-center justify-center gap-2 ${
                newsType === 'rss'
                  ? 'bg-[#4EBEE3]/10 border-[#4EBEE3] text-[#4EBEE3]'
                  : 'bg-white border-gray-200 text-[#16274D] hover:border-gray-300'
              }`}
            >
              <Rss size={18} strokeWidth={2} />
              RSS Feed
            </button>
          </div>
        </div>

        {/* Conditional Fields Based on Type */}
        {newsType === 'manual' ? (
          <>
            {/* Title Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>

            {/* English Description Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Content (EN)
              </label>
              <textarea
                value={englishDescription}
                onChange={(e) => setEnglishDescription(e.target.value)}
                placeholder="Enter English content..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
              />
            </div>

            {/* Arabic Description Field */}
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Content (AR)
              </label>
              <textarea
                value={arabicDescription}
                onChange={(e) => setArabicDescription(e.target.value)}
                placeholder="أدخل المحتوى العربي..."
                rows={4}
                dir="rtl"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
              />
            </div>
          </>
        ) : (
          <>
            {/* Feed Name Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Feed Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., BBC Arabic News"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>

            {/* Feed URL Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Feed URL (EN)
              </label>
              <input
                type="url"
                value={feedUrlEn}
                onChange={(e) => setFeedUrlEn(e.target.value)}
                placeholder="https://www.bbc.co.uk/arabic/index.xml"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>

            {/* Feed URL Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Feed URL (AR)
              </label>
              <input
                type="url"
                value={feedUrlAr}
                onChange={(e) => setFeedUrlAr(e.target.value)}
                placeholder="https://www.bbc.co.uk/arabic/index.xml"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>

            {/* Site News Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                    <Globe size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Site News
                    </p>
                    <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Display this feed on bedside screen
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSiteNews(!siteNews)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    siteNews ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                      siteNews ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const defaultNewsFeeds: NewsFeed[] = [
  {
    id: '1',
    type: 'manual',
    title: 'Official Visit Today',
    englishDescription: 'An official delegation from the Ministry of Health visited CareInn Hospital today to review service quality and ongoing improvement initiatives.',
    arabicDescription: 'زار وفد رسمي من وزارة الصحة مستشفى كيرإن اليوم للاطلاع على جودة الخدمات ومبادرات التحسين المستمرة.',
    selected: false,
  },
  {
    id: '2',
    type: 'manual',
    title: 'Participation in Today\'s Healthcare Forum',
    englishDescription: 'CareInn Hospital took part in the Healthcare Forum today, contributing to discussions on enhancing patient experience across the sector.',
    arabicDescription: 'شارك مستشفى كيرإن اليوم في المنتدى الصحي، مسهمًا في مناقشات تطوير تجربة المرضى على مستوى القطاع.',
    selected: false,
  },
  {
    id: '3',
    type: 'rss',
    title: 'BBC Arabic News',
    feedUrlEn: 'https://www.bbc.co.uk/arabic/index.xml',
    feedUrlAr: 'https://www.bbc.co.uk/arabic/index.xml',
    siteNews: true,
    selected: false,
  },
];

export default function NewsFeedPage() {
  const [newsFeeds, setNewsFeeds] = useState<NewsFeed[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_news_feeds');
      const dataVersion = localStorage.getItem('careinn_news_feeds_version');
      const currentVersion = '2025-rss-support';
      
      // If version is outdated or missing, use fresh data
      if (dataVersion !== currentVersion) {
        localStorage.setItem('careinn_news_feeds_version', currentVersion);
        return defaultNewsFeeds;
      }
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // If saved data is empty, return default news feeds
          if (parsed.length === 0) {
            return defaultNewsFeeds;
          }
          return parsed;
        } catch (e) {
          return defaultNewsFeeds;
        }
      }
    }
    return defaultNewsFeeds;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<ConfirmDeleteModalProps>({
    isOpen: false,
    onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
    onConfirm: () => {},
    title: '',
    message: ''
  });

  // Configuration state
  const [config, setConfig] = useState<NewsConfiguration>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_news_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return { width: '100', alignment: 'center', activate: true, breakerIcon: null };
        }
      }
    }
    return { width: '100', alignment: 'center', activate: true, breakerIcon: null };
  });
  const [breakerIconFile, setBreakerIconFile] = useState<File | null>(null);

  // Save to localStorage whenever newsFeeds change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_news_feeds', JSON.stringify(newsFeeds));
    }
  }, [newsFeeds]);

  const handleInlineEdit = (id: string, field: keyof NewsFeed, newValue: any) => {
    setNewsFeeds(newsFeeds.map(news => 
      news.id === id ? { ...news, [field]: newValue } : news
    ));
  };

  const handleToggleSiteNews = (id: string) => {
    setNewsFeeds(newsFeeds.map(news => 
      news.id === id && news.type === 'rss' ? { ...news, siteNews: !news.siteNews } : news
    ));
    const feed = newsFeeds.find(f => f.id === id);
    const newStatus = !feed?.siteNews;
    toast.success(newStatus ? 'Site News Enabled' : 'Site News Disabled', {
      description: newStatus ? 'Feed will be displayed on bedside screen' : 'Feed will not be displayed on bedside screen',
      duration: 2000,
    });
  };

  const handleAddNewsFeed = (type: 'manual' | 'rss', title: string, englishDescription: string, arabicDescription: string, feedUrlEn: string, feedUrlAr: string, siteNews: boolean) => {
    const newNewsFeed: NewsFeed = {
      id: Date.now().toString(),
      type,
      title,
      englishDescription: type === 'manual' ? englishDescription : undefined,
      arabicDescription: type === 'manual' ? arabicDescription : undefined,
      feedUrlEn: type === 'rss' ? feedUrlEn : undefined,
      feedUrlAr: type === 'rss' ? feedUrlAr : undefined,
      siteNews: type === 'rss' ? siteNews : undefined,
      selected: false
    };

    setNewsFeeds(prev => [...prev, newNewsFeed]);
    setIsModalOpen(false);
    toast.success('News Feed Added', {
      description: `${title} has been added successfully`,
      duration: 2000,
    });
  };

  const handleToggleSelect = (id: string) => {
    setNewsFeeds(prev => prev.map(feed => 
      feed.id === id ? { ...feed, selected: !feed.selected } : feed
    ));
  };

  const handleToggleSelectAll = () => {
    const allSelected = filteredFeeds.every(feed => feed.selected);
    setNewsFeeds(prev => prev.map(feed => {
      // Only toggle feeds that are in the filtered results
      if (filteredFeeds.find(ff => ff.id === feed.id)) {
        return { ...feed, selected: !allSelected };
      }
      return feed;
    }));
  };

  const handleDeleteSelected = () => {
    const selectedCount = newsFeeds.filter(feed => feed.selected).length;
    setNewsFeeds(prev => prev.filter(feed => !feed.selected));
    toast.success('News Feeds Deleted', {
      description: `${selectedCount} feed${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const handleDeleteSingle = (id: string) => {
    const feedToDelete = newsFeeds.find(feed => feed.id === id);
    setNewsFeeds(prev => prev.filter(feed => feed.id !== id));
    toast.success('News Feed Deleted', {
      description: `${feedToDelete?.title} has been deleted successfully`,
      duration: 2000,
    });
  };

  const filteredFeeds = newsFeeds.filter(feed => {
    const searchLower = searchQuery.toLowerCase();
    return (
      feed.title.toLowerCase().includes(searchLower) ||
      (feed.englishDescription && feed.englishDescription.toLowerCase().includes(searchLower)) ||
      (feed.arabicDescription && feed.arabicDescription.includes(searchQuery)) ||
      (feed.feedUrlEn && feed.feedUrlEn.toLowerCase().includes(searchLower)) ||
      (feed.feedUrlAr && feed.feedUrlAr.toLowerCase().includes(searchLower))
    );
  }).filter(feed => {
    if (filterType === 'all') return true;
    return feed.type === filterType;
  });

  const hasSelectedFeeds = newsFeeds.some(feed => feed.selected);

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Rss size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                News Feed
              </h2>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Create and manage news feeds for patients
              </p>
            </div>
          </div>
          {newsFeeds.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfigureOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors shadow-sm"
              >
                <Settings size={18} strokeWidth={2} />
                <span className="text-[14px] font-medium font-['Poppins',sans-serif]">Configure</span>
              </button>
              {hasSelectedFeeds && (
                <button
                  onClick={() => {
                    const selectedCount = newsFeeds.filter(feed => feed.selected).length;
                    setConfirmDeleteModal({
                      isOpen: true,
                      onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
                      onConfirm: handleDeleteSelected,
                      title: 'Delete News Feeds',
                      message: `Are you sure you want to delete ${selectedCount} news feed${selectedCount > 1 ? 's' : ''}?`
                    });
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Delete ({newsFeeds.filter(feed => feed.selected).length})
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                Add News Feed
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Empty State */}
      {newsFeeds.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl border-2 border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Newspaper size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No News Feeds
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  No news feeds have been added yet. Create your first news feed to get started.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Add News Feed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Search Bar and Filter */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news feeds..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>
              
              <SingleSelectDropdown
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'manual', label: 'Manual' },
                  { value: 'rss', label: 'RSS Feed' }
                ]}
                value={filterType}
                onChange={(value) => setFilterType(value)}
                className="min-w-[160px]"
              />
            </div>
          </motion.div>

          {/* News Feeds Table */}
          <motion.div 
            className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredFeeds.length > 0 && filteredFeeds.every(feed => feed.selected)}
                        onChange={handleToggleSelectAll}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-24">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-48">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                      Content (EN)
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                      Content (AR)
                    </th>
                    <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-32">
                      Site News
                    </th>
                    <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeds.map((feed, index) => (
                    <tr 
                      key={feed.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === filteredFeeds.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={feed.selected}
                          onChange={() => handleToggleSelect(feed.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {feed.type === 'manual' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                            <FileText size={14} strokeWidth={2} />
                            <span className="text-[12px] font-medium font-['Poppins',sans-serif]">Manual</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md">
                            <Rss size={14} strokeWidth={2} />
                            <span className="text-[12px] font-medium font-['Poppins',sans-serif]">RSS</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <InlineInput
                          value={feed.title}
                          onChange={(value) => handleInlineEdit(feed.id, 'title', value)}
                          className="font-medium"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {feed.type === 'manual' ? (
                          <InlineTextarea
                            value={feed.englishDescription || ''}
                            onChange={(value) => handleInlineEdit(feed.id, 'englishDescription', value)}
                            rows={2}
                            placeholder="English description"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link2 size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2} />
                            <InlineInput
                              value={feed.feedUrlEn || ''}
                              onChange={(value) => handleInlineEdit(feed.id, 'feedUrlEn', value)}
                              className="text-[#4EBEE3] text-[13px]"
                              placeholder="English Feed URL"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {feed.type === 'manual' ? (
                          <InlineTextarea
                            value={feed.arabicDescription || ''}
                            onChange={(value) => handleInlineEdit(feed.id, 'arabicDescription', value)}
                            dir="rtl"
                            rows={2}
                            placeholder="الوصف العربي"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link2 size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2} />
                            <InlineInput
                              value={feed.feedUrlAr || ''}
                              onChange={(value) => handleInlineEdit(feed.id, 'feedUrlAr', value)}
                              className="text-[#4EBEE3] text-[13px]"
                              placeholder="Arabic Feed URL"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {feed.type === 'rss' ? (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleSiteNews(feed.id)}
                              className={`relative w-14 h-7 rounded-full transition-colors ${
                                feed.siteNews ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                                  feed.siteNews ? 'translate-x-7' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="text-[12px] text-gray-400 font-['Poppins',sans-serif]">N/A</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setConfirmDeleteModal({
                              isOpen: true,
                              onClose: () => setConfirmDeleteModal({ isOpen: false, onClose: () => {}, onConfirm: () => {}, title: '', message: '' }),
                              onConfirm: () => handleDeleteSingle(feed.id),
                              title: 'Delete News Feed',
                              message: `Are you sure you want to delete the news feed "${feed.title}"?`
                            })}
                            className="p-2 text-[#EF4444] hover:text-[#DC2626] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Add News Feed Modal */}
      <AddNewsFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddNewsFeed}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.onClose}
        onConfirm={confirmDeleteModal.onConfirm}
        title={confirmDeleteModal.title}
        message={confirmDeleteModal.message}
      />

      {/* Configure Modal - keeping existing implementation */}
      {isConfigureOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                News Feed Configuration
              </h3>
              <button
                onClick={() => setIsConfigureOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Width Field with Stepper */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Width
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const currentWidth = parseInt(config.width) || 100;
                      const newWidth = Math.max(0, currentWidth - 5);
                      setConfig({ ...config, width: newWidth.toString() });
                    }}
                    className="w-10 h-10 border-2 border-gray-200 hover:border-[#4EBEE3] text-[#16274D] rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Minus size={16} strokeWidth={2} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={config.width}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                          setConfig({ ...config, width: value });
                        }
                      }}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                      %
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const currentWidth = parseInt(config.width) || 100;
                      const newWidth = Math.min(100, currentWidth + 5);
                      setConfig({ ...config, width: newWidth.toString() });
                    }}
                    className="w-10 h-10 border-2 border-gray-200 hover:border-[#4EBEE3] text-[#16274D] rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Plus size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Alignment Dropdown */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Alignment
                </label>
                <SingleSelectDropdown
                  value={config.alignment}
                  onChange={(value) => setConfig({ ...config, alignment: value as 'left' | 'center' | 'right' })}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                  className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors appearance-none bg-white cursor-pointer"
                />
              </div>

              {/* Activate Toggle */}
              <div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div>
                    <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      Activate News Feed
                    </p>
                    <p className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                      Enable or disable news feed display
                    </p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, activate: !config.activate })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      config.activate ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                        config.activate ? 'translate-x-7' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Breaker Icon Upload */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Breaker Icon
                </label>
                {!config.breakerIcon ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBreakerIconFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setConfig({ ...config, breakerIcon: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#4EBEE3] transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-gray-400" strokeWidth={2} />
                        <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Upload Icon
                        </p>
                        <p className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={config.breakerIcon} 
                      alt="Breaker icon" 
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {breakerIconFile?.name || 'Breaker icon'}
                      </p>
                      <p className="text-[11px] text-[#6B7280] font-['Poppins',sans-serif]">
                        Icon uploaded
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setConfig({ ...config, breakerIcon: null });
                        setBreakerIconFile(null);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setIsConfigureOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('careinn_news_config', JSON.stringify(config));
                  }
                  setIsConfigureOpen(false);
                  toast.success('Configuration Saved', {
                    description: 'News feed settings updated successfully',
                    duration: 2000,
                  });
                }}
                className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}