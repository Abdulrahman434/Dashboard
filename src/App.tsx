import { useState, useEffect } from 'react';
import DashboardLogin from './imports/DashboardLogin';
import Dashboard from './components/Dashboard';
import AnalyticsPrintView from './components/AnalyticsPrintView';
import { Toaster } from './components/ui/sonner';
import { SIPProvider } from './contexts/SIPContext';
import './styles/chart-animations.css';

// Extend Window interface for our custom property
declare global {
  interface Window {
    __rechartsWarningsSuppressed?: boolean;
  }
}

// CareInn System Management Portal - Updated with inline editing
export default function App() {
  // Suppress Recharts warnings IMMEDIATELY (before any rendering)
  if (typeof window !== 'undefined' && !window.__rechartsWarningsSuppressed) {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const suppressMessage = (args: any[]) => {
      const errorString = String(args[0] || '');
      // Filter out Recharts dimension warnings
      if (
        errorString.includes('width') && 
        errorString.includes('height') && 
        errorString.includes('should be greater than 0')
      ) {
        return true;
      }
      // Filter out React DOM nesting warnings for table elements
      if (
        errorString.includes('validateDOMNesting') &&
        (errorString.includes('colgroup') || errorString.includes('Whitespace text nodes'))
      ) {
        return true;
      }
      return false;
    };
    
    console.error = (...args) => {
      if (suppressMessage(args)) return;
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      if (suppressMessage(args)) return;
      originalConsoleWarn.apply(console, args);
    };
    
    window.__rechartsWarningsSuppressed = true;
  }

  // Check if we're in print view mode
  const isPrintViewMode = typeof window !== 'undefined' && 
    window.location.search.includes('print=analytics');

  // Check localStorage for persisted login state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('careinn-logged-in') === 'true';
    }
    return false;
  });

  // User info state
  const [userInfo, setUserInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn-user-info');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Comment system state
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleCommentClick = (comment: any) => {
    setIsPanelOpen(false);
    // Scroll to comment position
    setTimeout(() => {
      window.scrollTo({
        top: comment.y - 200,
        left: comment.x - 200,
        behavior: 'smooth'
      });
    }, 100);
  };

  // Remove injected asset divs on every render
  useEffect(() => {
    // Set viewport meta tag for proper scaling
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');

    // Remove any transform/zoom - they cause text distortion
    // Use actual font-size/padding with integer px values instead

    const removeInjectedDivs = () => {
      // Target all divs with css- class names that are direct children of body
      const allDivs = document.querySelectorAll('body > div');
      allDivs.forEach(div => {
        const classes = Array.from(div.classList);
        const hasCssClass = classes.some(cls => cls.startsWith('css-'));
        
        // Remove if it has css- classes and no data-name or id
        if (hasCssClass && !div.hasAttribute('data-name') && !div.id && div.getAttribute('role') !== 'application') {
          console.log('Removing injected div:', div);
          div.remove();
        }
      });

      // Remove unwanted marketing images - these specific hashes should be removed
      const unwantedImageHashes = [
        'e9db7da',
        'd17d248',
        'cfe8b40',
        'b23d469',
        'ffc231f'
      ];

      // Also keep these legitimate CareInn images (DO NOT REMOVE)
      const legitimateImageHashes = [
        '62fb97492c2887ddd8099c87f6e585e091d75ee5', // Login left image
        '1497971121f9fe3238b7a912b02a205098173242', // Login logo
        '1527704e7ade377192f897bbb5d87c3293623da3'  // Sidebar logo
      ];

      // Find and remove all img tags with unwanted marketing images
      const allImgs = document.querySelectorAll('img');
      allImgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        const srcset = img.getAttribute('srcset') || '';
        
        // Check if this is an unwanted marketing image
        const isUnwantedImage = unwantedImageHashes.some(hash => 
          src.includes(hash) || srcset.includes(hash)
        );

        // Check if this is a legitimate image we want to keep
        const isLegitimateImage = legitimateImageHashes.some(hash =>
          src.includes(hash) || srcset.includes(hash)
        );

        // Remove if unwanted and not legitimate
        if (isUnwantedImage && !isLegitimateImage) {
          console.log('Removing unwanted marketing image:', src || srcset);
          
          // Try to remove parent containers that only contain this image
          let currentElement = img.parentElement;
          let removed = false;
          
          // Walk up the DOM tree and remove wrapper divs
          while (currentElement && !removed) {
            const parent = currentElement.parentElement;
            
            // Remove if this is a wrapper div with only this image or whitespace
            if (currentElement.tagName === 'DIV' && 
                currentElement.children.length <= 2 && 
                !currentElement.hasAttribute('data-name') &&
                !currentElement.id) {
              console.log('Removing image container:', currentElement);
              currentElement.remove();
              removed = true;
            } else {
              // If we hit a meaningful container, just remove the image itself
              img.remove();
              removed = true;
            }
            
            currentElement = parent;
          }
          
          // Fallback: just remove the image if nothing else worked
          if (!removed) {
            img.remove();
          }
        }
      });
    };

    // Run immediately
    removeInjectedDivs();

    // Run on interval to catch dynamically added images
    const interval = setInterval(removeInjectedDivs, 500);

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn]); // Re-run when page changes

  const handleLogin = (email: string, name: string) => {
    const user = { email, name };
    setIsLoggedIn(true);
    // Persist login state
    localStorage.setItem('careinn-logged-in', 'true');
    // Persist user info
    localStorage.setItem('careinn-user-info', JSON.stringify(user));
    setUserInfo(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear login state
    localStorage.removeItem('careinn-logged-in');
    // Clear user info
    localStorage.removeItem('careinn-user-info');
    setUserInfo(null);
  };

  // Show print view if in print mode (bypasses login)
  if (isPrintViewMode) {
    return (
      <SIPProvider>
        <AnalyticsPrintView />
        <Toaster />
      </SIPProvider>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <DashboardLogin onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <SIPProvider>
      <Dashboard onLogout={handleLogout} />
      <Toaster />
    </SIPProvider>
  );
}