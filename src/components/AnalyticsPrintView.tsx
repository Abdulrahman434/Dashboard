import { useEffect } from 'react';
import AnalyticsPage from './AnalyticsPage';

// Clean print-optimized view of Analytics dashboard
// This is opened in a new window/tab for PDF printing
export default function AnalyticsPrintView() {

  // DON'T Auto-trigger print - let user see the content first
  // Commented out for debugging
  /*
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Triggering print dialog...');
      window.print();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  */

  // Handle after print - offer to close window
  useEffect(() => {
    const handleAfterPrint = () => {
      // Optional: Auto-close after print
      // window.close();
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  console.log('AnalyticsPrintView rendering...');

  return (
    <div className="print-view min-h-screen bg-white">
      {/* Simple header for print view */}
      <div className="p-6 bg-white border-b border-gray-200 no-print">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div>
            <h1 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
              CareInn Analytics - Print View
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Press Ctrl+P (or Cmd+P on Mac) to print, then choose "Save as PDF"
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#4EBEE3]/90 text-white rounded-lg transition-colors text-[14px] font-medium font-['Poppins',sans-serif]"
            >
              Print Now
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#16274D] rounded-lg transition-colors text-[14px] font-medium font-['Poppins',sans-serif]"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* Analytics content - wrapped for clean printing */}
      <div className="print-content bg-white">
        <AnalyticsPage isPrintView={true} />
      </div>
    </div>
  );
}