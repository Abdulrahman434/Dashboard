import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

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

const sampleAssets: Asset[] = [
  // GAMES
  {
    id: 'game-5',
    nameEn: 'Puzzle Games',
    nameAr: 'ألعاب الألغاز',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1612385763901-68857dd4c43c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBwaWVjZXMlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjQ4ODI4MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'puzzle-games.apk',
    apkFileName: 'puzzle-games.apk'
  },

  // QURAN & ISLAMIC
  {
    id: 'quran-1',
    nameEn: 'Quran Kareem',
    nameAr: 'القرآن الكريم',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1597505495109-7fc35bb64d8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdXJhbiUyMGlzbGFtaWMlMjBib29rfGVufDF8fHx8MTc2NDg2MzY4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'quran-kareem.apk',
    apkFileName: 'quran-kareem.apk'
  },

  // BROWSERS
  {
    id: 'browser-1',
    nameEn: 'Google Chrome',
    nameAr: 'جوجل كروم',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1497829352618-8528e15d7ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBjaHJvbWUlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjQ5NTA1MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'chrome.apk',
    apkFileName: 'chrome.apk'
  },

  // UTILITIES
  {
    id: 'util-1',
    nameEn: 'Mirror',
    nameAr: 'مرآة',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1619378396319-64fbecaf72ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXJyb3IlMjByZWZsZWN0aW9uJTIwcm91bmR8ZW58MXx8fHwxNzY0OTUwNTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'mirror.apk',
    apkFileName: 'mirror.apk'
  },
  {
    id: 'util-2',
    nameEn: 'Calculator',
    nameAr: 'آلة حاسبة',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1653361860636-36f2fb89eab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yJTIwbnVtYmVyc3xlbnwxfHx8fDE3NjQ5NTA1MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'calculator.apk',
    apkFileName: 'calculator.apk'
  },
  {
    id: 'util-4',
    nameEn: 'Google Translate',
    nameAr: 'مترجم جوجل',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1613662265610-051b02ce6630?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFuc2xhdGUlMjBsYW5ndWFnZSUyMGdsb2JlfGVufDF8fHx8MTc2NDk1MDUyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'google-translate.apk',
    apkFileName: 'google-translate.apk'
  },

  // STREAMING SERVICES
  {
    id: 'stream-1',
    nameEn: 'Netflix',
    nameAr: 'نتفليكس',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1643208589889-0735ad7218f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRmbGl4JTIwcmVkfGVufDF8fHx8MTc2NDk1MDUyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'netflix.apk',
    apkFileName: 'netflix.apk'
  },
  {
    id: 'stream-3',
    nameEn: 'YouTube',
    nameAr: 'يوتيوب',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1762340273439-53837fb95727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0dWJlJTIwcmVkJTIwcGxheXxlbnwxfHx8fDE3NjQ5NTA1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'youtube.apk',
    apkFileName: 'youtube.apk'
  },

  // SOCIAL MEDIA
  {
    id: 'social-6',
    nameEn: 'TikTok',
    nameAr: 'تيك توك',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1594322267233-53535f9879c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aWt0b2slMjBtdXNpY3xlbnwxfHx8fDE3NjQ5NTA1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'tiktok.apk',
    apkFileName: 'tiktok.apk'
  },
  {
    id: 'social-7',
    nameEn: 'Snapchat',
    nameAr: 'سناب شات',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1648321681738-36015892ec16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmFwY2hhdCUyMHllbGxvdyUyMGdob3N0fGVufDF8fHx8MTc2NDk1MDUyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'snapchat.apk',
    apkFileName: 'snapchat.apk'
  },

  // VIDEO CONFERENCING
  {
    id: 'video-1',
    nameEn: 'Microsoft Teams',
    nameAr: 'مايكروسوفت تيمز',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1649180564403-db28d5673f48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3NvZnQlMjB0ZWFtcyUyMHB1cnBsZXxlbnwxfHx8fDE3NjQ5NTA1MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'teams.apk',
    apkFileName: 'teams.apk'
  },
  {
    id: 'video-2',
    nameEn: 'Zoom',
    nameAr: 'زووم',
    type: 'APK',
    icon: 'https://images.unsplash.com/photo-1705083951318-e6dc20e36110?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b29tJTIwYmx1ZSUyMHZpZGVvfGVufDF8fHx8MTc2NDk1MDUyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: ['Engagement Hub'],
    apkFile: 'zoom.apk',
    apkFileName: 'zoom.apk'
  },

  // PATIENT SERVICES (Service type)
  {
    id: 'service-3',
    nameEn: 'Nurse Call',
    nameAr: 'استدعاء الممرضة',
    type: 'URL',
    icon: 'https://images.unsplash.com/photo-1648224394449-d10dbff84b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMG1lZGljYWwlMjBjYWxsfGVufDF8fHx8MTc2NDk1MDUyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: [],
    url: '/api/services/nurse-call'
  },
  {
    id: 'service-5',
    nameEn: 'Doctor Consultation',
    nameAr: 'استشارة طبية',
    type: 'URL',
    icon: 'https://images.unsplash.com/photo-1655913197756-fbcf99b273cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBzdGV0aG9zY29wZXxlbnwxfHx8fDE3NjQ5NTA1MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    skipClearCache: false,
    assignedCategories: [],
    url: '/api/services/doctor-consultation'
  },
];

export default function PopulateContentLibrary() {
  useEffect(() => {
    const currentAssets = localStorage.getItem('content-library-assets');
    const currentVersion = localStorage.getItem('content-library-version');
    const LATEST_VERSION = '2025-icon-update'; // Update version to force icon refresh
    
    if (!currentAssets || currentVersion !== LATEST_VERSION) {
      // First time OR version mismatch - populate/update with sample data
      localStorage.setItem('content-library-assets', JSON.stringify(sampleAssets));
      localStorage.setItem('content-library-version', LATEST_VERSION);
      
      if (!currentAssets) {
        toast.success('Content Library populated with sample assets!', {
          description: `Added ${sampleAssets.length} assets including games, apps, and services`,
          duration: 4000
        });
      } else {
        toast.success('Content Library icons updated!', {
          description: 'All asset icons have been refreshed with new designs',
          duration: 4000
        });
      }
    } else {
      // Already has latest data - check if we need to merge new assets
      const existing = JSON.parse(currentAssets);
      
      // Merge: Add new assets that don't exist
      const existingIds = existing.map((a: Asset) => a.id);
      const newAssets = sampleAssets.filter(asset => !existingIds.includes(asset.id));
      
      if (newAssets.length > 0) {
        const merged = [...existing, ...newAssets];
        localStorage.setItem('content-library-assets', JSON.stringify(merged));
        toast.success(`Added ${newAssets.length} new assets to Content Library!`, {
          description: 'Existing assets were preserved',
          duration: 4000
        });
      }
    }
  }, []);

  return null;
}