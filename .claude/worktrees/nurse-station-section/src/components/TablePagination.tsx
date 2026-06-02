import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemLabel?: string; // e.g., "assets", "devices", "notifications"
  showRowsPerPage?: boolean;
  rowsPerPageOptions?: number[];
}

export default function TablePagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'items',
  showRowsPerPage = true,
  rowsPerPageOptions = [10, 25, 50, 100]
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't show pagination if there are no items or only one page
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  // Generate visible page numbers (smart ellipsis)
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      {/* Left side - Item count */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
          Showing {startItem} to {endItem} of {totalItems} {itemLabel}
        </span>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-6">
        {/* Rows per page selector */}
        {showRowsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
              Rows per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // Reset to first page
              }}
              className="px-3 py-1.5 pr-8 border border-gray-300 rounded-lg text-[13px] text-gray-700 font-['Poppins',sans-serif] focus:outline-none focus:border-[#4EBEE3] cursor-pointer hover:border-gray-400 transition-colors appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px'
              }}
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft size={18} className="text-gray-700" />
          </button>

          {/* Previous page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>

          {/* Page number buttons */}
          <div className="flex items-center gap-1 px-2">
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <span 
                    key={`ellipsis-${page}`} 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 font-['Poppins',sans-serif]"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors ${
                    currentPage === page
                      ? 'bg-[#4EBEE3] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>

          {/* Last page button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight size={18} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}