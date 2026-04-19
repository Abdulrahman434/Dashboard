import { useState, useEffect, useRef, ReactNode } from 'react';

interface ChartContainerProps {
  children: ReactNode;
  className?: string;
  minHeight?: number;
}

export function ChartContainer({ children, className = '', minHeight = 140 }: ChartContainerProps) {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure container has proper dimensions before rendering charts
    const checkDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setIsReady(true);
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (!checkDimensions()) {
      // If not ready, try after a short delay
      const timer = setTimeout(() => {
        if (!checkDimensions()) {
          // Force ready after timeout to prevent infinite loading
          setIsReady(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ minHeight: `${minHeight}px`, width: '100%' }}
    >
      {isReady ? children : null}
    </div>
  );
}