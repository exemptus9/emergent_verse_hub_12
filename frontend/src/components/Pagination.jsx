import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <nav className="flex items-center gap-1" data-testid="pagination">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-l-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First page"
          data-testid="pagination-first"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-white border-y border-r border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
          data-testid="pagination-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center">
          {pageNumbers.map((page, idx) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${idx}`} 
                className="px-2 py-2 text-gray-400 select-none"
              >
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] px-3 py-2 text-sm font-medium transition-colors border-y border-r border-gray-300 ${
                  currentPage === page
                    ? 'bg-[#1e73be] text-white border-[#1e73be]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                data-testid={`pagination-page-${page}`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border-y border-r border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
          data-testid="pagination-next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border-y border-r border-gray-300 text-gray-600 hover:bg-gray-50 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last page"
          data-testid="pagination-last"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
      
      {/* Page Info & Quick Jump */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          Page <strong className="text-gray-700">{currentPage}</strong> of <strong className="text-gray-700">{totalPages}</strong>
        </span>
        <span className="text-gray-300">|</span>
        <span>{totalItems} poems</span>
        
        {/* Quick Jump Input */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-gray-400">Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="#"
            className="w-14 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1e73be] focus:border-[#1e73be]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  onPageChange(val);
                  e.target.value = '';
                }
              }
            }}
            data-testid="pagination-jump"
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
